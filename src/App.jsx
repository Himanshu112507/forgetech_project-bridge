import React, { useState, useEffect } from 'react';
import { 
  Settings, CheckCircle2, AlertTriangle, AlertCircle, Play, Square, RefreshCcw, 
  Settings2, Activity, ShieldAlert, Cpu, BookOpen, MessageSquare, Users, 
  ShoppingCart, Store, Download, Printer, Plus, Trash2, Home
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [simState, setSimState] = useState({
    isRunning: false,
    isAuto: true,
    pumpOn: false,
    tankLevel: 15,
    hasFault: false,
    faultMessage: ""
  });
  const [events, setEvents] = useState([{ time: new Date().toLocaleTimeString(), msg: "System initialized. Ready.", type: "info" }]);

  const addEvent = (msg, type = "info") => {
    setEvents(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 15));
  };

  const [bom, setBom] = useState([
    { id: 1, name: "Micro PLC (Relay Outputs)", qty: 1, price: 12500 },
    { id: 2, name: "Ultrasonic Level Sensor", qty: 1, price: 8500 },
    { id: 3, name: "Motor Contactor & Overload", qty: 1, price: 3200 },
    { id: 4, name: "Control Panel & Wiring", qty: 1, price: 15000 },
    { id: 5, name: "Engineering & Programming", qty: 1, price: 18000 }
  ]);

  const [roiParams, setRoiParams] = useState({
    powerW: 1500,
    hoursPerDay: 12,
    daysPerMonth: 25,
    tariff: 8,
    savingsPercent: 20
  });

  useEffect(() => {
    let interval;
    if (simState.isRunning) {
      interval = setInterval(() => {
        setSimState(prev => {
          let newLevel = prev.tankLevel;
          let newPumpOn = prev.pumpOn;

          if (newLevel > 0) newLevel -= 0.5; 
          if (newPumpOn) newLevel += 2.0; 

          if (newLevel > 100) newLevel = 100;
          if (newLevel < 0) newLevel = 0;

          if (newLevel >= 95) {
            if (newPumpOn) {
              addEvent("HIGH-HIGH INTERLOCK: Pump forced OFF (95%)", "error");
            }
            newPumpOn = false;
          } 
          else if (prev.isAuto) {
            if (prev.hasFault) {
               newPumpOn = false; 
            } else {
               if (newLevel <= 30 && !newPumpOn) {
                 newPumpOn = true;
                 addEvent("Auto: Low level reached (<=30%). Pump STARTED.", "info");
               }
               if (newLevel >= 90 && newPumpOn) {
                 newPumpOn = false;
                 addEvent("Auto: Target level reached (>=90%). Pump STOPPED.", "info");
               }
            }
          }

          return { ...prev, tankLevel: newLevel, pumpOn: newPumpOn };
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [simState.isRunning]);

  const handleManualPumpToggle = () => {
    if (simState.isAuto) return;
    if (simState.hasFault) {
      addEvent("Start rejected: Sensor fault is active.", "warning");
      return;
    }
    if (simState.tankLevel >= 95) {
      addEvent("Start rejected: High-High interlock active.", "warning");
      return;
    }
    const nextState = !simState.pumpOn;
    setSimState(prev => ({ ...prev, pumpOn: nextState }));
    addEvent(`Manual: Pump ${nextState ? 'STARTED' : 'STOPPED'} by operator.`, "info");
  };

  const triggerFault = () => {
    setSimState(prev => ({ ...prev, hasFault: true, pumpOn: false, faultMessage: "Level Sensor Signal Lost" }));
    addEvent("FAULT DETECTED: Level Sensor Signal Lost. Pump stopped.", "error");
  };

  const clearFault = () => {
    setSimState(prev => ({ ...prev, hasFault: false, faultMessage: "" }));
    addEvent("Fault reset. Normal operation can resume.", "info");
  };

  const resetDemo = () => {
    setSimState({ isRunning: false, isAuto: true, pumpOn: false, tankLevel: 15, hasFault: false, faultMessage: "" });
    setEvents([{ time: new Date().toLocaleTimeString(), msg: "Simulation reset to default initial state.", type: "info" }]);
  };

  const updateBomQty = (id, delta) => {
    setBom(prev => prev.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  };
  
  const totalCost = bom.reduce((acc, item) => acc + (item.qty * item.price), 0);
  
  const annualEnergyCost = (roiParams.powerW / 1000) * roiParams.hoursPerDay * roiParams.daysPerMonth * 12 * roiParams.tariff;
  const annualSavings = annualEnergyCost * (roiParams.savingsPercent / 100);
  const paybackYears = annualSavings > 0 ? (totalCost / annualSavings).toFixed(2) : null;

  const NavItem = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === id ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
      <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col print:hidden">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-blue-900 flex items-center gap-2">
            <Cpu size={24} className="text-blue-600" /> ForgeTech
          </h1>
          <p className="text-xs text-slate-500 mt-1">ProjectBridge Prototype</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <NavItem id="dashboard" icon={Home} label="Overview" />
          <NavItem id="simulator" icon={Activity} label="Simulator" />
          <NavItem id="cost" icon={ShoppingCart} label="Cost & ROI" />
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ecosystem</p>
          </div>
          <NavItem id="learning" icon={BookOpen} label="Learning Centre" />
          <NavItem id="ai" icon={MessageSquare} label="AI Assistant" />
          <NavItem id="community" icon={Users} label="Community" />
          <NavItem id="marketplace" icon={Store} label="Marketplace" />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        
        {activeTab === 'dashboard' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
            <div className="bg-blue-900 rounded-2xl p-8 text-white shadow-lg">
              <h2 className="text-3xl font-bold mb-2">Welcome to ProjectBridge</h2>
              <p className="text-blue-100 max-w-2xl mb-6">From an Industrial Problem to a Costed Automation Plan. Plan it. Simulate it. Estimate it. Prepare to build it.</p>
              <div className="flex gap-4">
                <button onClick={() => setActiveTab('simulator')} className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Open Demo Project
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('simulator')}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Activity size={24} /></div>
                  <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">Demo Ready</span>
                </div>
                <h3 className="font-bold text-lg mb-1">Smart Tank Automation</h3>
                <p className="text-sm text-slate-500 line-clamp-2">Simulates tank filling, monitors tank level, controls a virtual pump, and handles faults.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
            <div className="flex justify-between items-end border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Smart Tank Simulator</h2>
                <p className="text-sm text-slate-500 mt-1">Test the control logic virtually before implementation.</p>
              </div>
              <div className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full border border-amber-200 shadow-sm">
                SOFTWARE SIMULATION — NO PHYSICAL PLC CONNECTED
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center">
                <div className="w-full flex justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${simState.isRunning ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    <span className="text-sm font-medium">{simState.isRunning ? 'Simulation Running' : 'Simulation Paused'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setSimState(prev => ({...prev, isRunning: !prev.isRunning}))} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${simState.isRunning ? 'bg-slate-100 text-slate-700' : 'bg-blue-600 text-white'}`}>
                      {simState.isRunning ? <><Square size={16}/> Pause</> : <><Play size={16}/> Start</>}
                    </button>
                    <button onClick={resetDemo} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-2">
                      <RefreshCcw size={16}/> Reset Demo
                    </button>
                  </div>
                </div>

                <div className="relative w-64 h-80 border-4 border-slate-700 rounded-b-3xl rounded-t-sm bg-slate-50 overflow-hidden flex items-end justify-center mt-4">
                  <div className="absolute left-0 top-[5%] w-4 border-b-2 border-red-500 z-10"><span className="absolute left-6 -top-3 text-[10px] font-bold text-red-600">HH 95%</span></div>
                  <div className="absolute left-0 top-[10%] w-4 border-b-2 border-blue-400 z-10"><span className="absolute left-6 -top-3 text-[10px] font-bold text-blue-600">STOP 90%</span></div>
                  <div className="absolute left-0 top-[70%] w-4 border-b-2 border-blue-400 z-10"><span className="absolute left-6 -top-3 text-[10px] font-bold text-blue-600">START 30%</span></div>
                  
                  <div 
                    className="w-full bg-blue-400 opacity-80 transition-all duration-500 ease-linear flex items-center justify-center relative"
                    style={{ height: `${simState.tankLevel}%` }}
                  >
                    {simState.pumpOn && (
                      <div className="absolute top-0 w-full h-2 bg-white opacity-40 animate-pulse"></div>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-slate-800/50 mix-blend-overlay">{Math.round(simState.tankLevel)}%</span>
                  </div>
                </div>

                <div className="flex w-64 justify-between mt-8">
                  <div className={`p-4 rounded-xl border text-center w-full transition-colors ${simState.pumpOn ? 'bg-green-100 border-green-300 text-green-800' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                    <Activity size={24} className="mx-auto mb-1 opacity-70" />
                    <span className="font-bold text-sm block">PUMP {simState.pumpOn ? 'RUNNING' : 'STOPPED'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Settings2 size={18}/> Control Panel</h3>
                  
                  <div className="bg-slate-100 p-1 rounded-lg flex mb-6">
                    <button 
                      onClick={() => setSimState(prev => ({...prev, isAuto: true}))}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${simState.isAuto ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500'}`}
                    >Auto Mode</button>
                    <button 
                      onClick={() => setSimState(prev => ({...prev, isAuto: false}))}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${!simState.isAuto ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500'}`}
                    >Manual Mode</button>
                  </div>

                  {!simState.isAuto && (
                    <button 
                      onClick={handleManualPumpToggle}
                      className={`w-full py-3 rounded-lg font-bold text-white shadow-sm transition-colors mb-6 ${simState.pumpOn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'} ${simState.hasFault ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {simState.pumpOn ? 'STOP PUMP' : 'START PUMP'}
                    </button>
                  )}

                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Fault Injection</h4>
                    {simState.hasFault ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex gap-2 text-red-700 font-bold text-sm mb-2"><ShieldAlert size={16}/> {simState.faultMessage}</div>
                        <button onClick={clearFault} className="w-full py-1.5 bg-red-600 text-white rounded text-sm font-medium">Clear & Reset Fault</button>
                      </div>
                    ) : (
                      <button onClick={triggerFault} className="w-full py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium">
                        Simulate Sensor Failure
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900 rounded-xl shadow-sm p-4 h-64 flex flex-col">
                  <h3 className="font-bold text-white mb-2 text-sm flex items-center gap-2">Event Log</h3>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {events.map((e, i) => (
                      <div key={i} className={`text-xs p-2 rounded ${e.type === 'error' ? 'bg-red-900/50 text-red-200' : e.type === 'warning' ? 'bg-amber-900/30 text-amber-200' : 'text-slate-300'}`}>
                        <span className="opacity-50 mr-2">[{e.time}]</span>
                        {e.msg}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cost' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-4">Project Cost & ROI Estimator</h2>
            
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="font-bold text-lg">Preliminary Component List</h3>
                <p className="text-sm text-slate-500">Editable estimates for planning purposes.</p>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Component</th>
                    <th className="px-6 py-3">Qty</th>
                    <th className="px-6 py-3">Unit Price (₹)</th>
                    <th className="px-6 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bom.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium">{item.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateBomQty(item.id, -1)} className="p-1 hover:bg-slate-200 rounded"><span className="sr-only">Decrease</span>-</button>
                          <span className="w-4 text-center">{item.qty}</span>
                          <button onClick={() => updateBomQty(item.id, 1)} className="p-1 hover:bg-slate-200 rounded"><span className="sr-only">Increase</span>+</button>
                        </div>
                      </td>
                      <td className="px-6 py-4">₹{item.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-medium">₹{(item.qty * item.price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-200">
                <span className="font-bold text-lg text-slate-600">Estimated Project Cost</span>
                <span className="text-2xl font-bold text-blue-900">₹{totalCost.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Savings Assumptions</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Pump Power (Watts)</label>
                    <input type="number" className="w-full mt-1 border border-slate-300 rounded-md p-2 text-sm" value={roiParams.powerW} onChange={(e) => setRoiParams({...roiParams, powerW: Number(e.target.value)})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Hours / Day</label>
                      <input type="number" className="w-full mt-1 border border-slate-300 rounded-md p-2 text-sm" value={roiParams.hoursPerDay} onChange={(e) => setRoiParams({...roiParams, hoursPerDay: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Tariff (₹/kWh)</label>
                      <input type="number" className="w-full mt-1 border border-slate-300 rounded-md p-2 text-sm" value={roiParams.tariff} onChange={(e) => setRoiParams({...roiParams, tariff: Number(e.target.value)})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Assumed Savings (%)</label>
                    <input type="number" className="w-full mt-1 border border-slate-300 rounded-md p-2 text-sm" value={roiParams.savingsPercent} onChange={(e) => setRoiParams({...roiParams, savingsPercent: Number(e.target.value)})} />
                  </div>
                </div>
              </div>

              <div className="bg-blue-900 text-white rounded-xl p-6 shadow-sm flex flex-col justify-center">
                <h3 className="font-bold text-lg mb-6 text-blue-100">Projected Financial Impact</h3>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-blue-800 pb-2">
                    <span className="text-blue-200">Current Energy Cost</span>
                    <span className="font-medium">₹{Math.round(annualEnergyCost).toLocaleString()} / yr</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-800 pb-2">
                    <span className="text-blue-200">Assumed Annual Savings</span>
                    <span className="font-medium text-green-400">₹{Math.round(annualSavings).toLocaleString()} / yr</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-blue-200 font-bold">Estimated Payback</span>
                    <span className="text-2xl font-black">
                      {paybackYears ? `${paybackYears} Years` : <span className="text-sm font-normal text-amber-300">No positive payback</span>}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-100 border border-slate-200 p-4 rounded-lg flex items-start gap-3 mt-4">
              <AlertCircle size={20} className="text-slate-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Illustrative estimates only. Component prices, savings and payback have not been validated through supplier quotations or field measurements. Actual results depend on equipment selection, operating conditions, installation costs and measured performance.
              </p>
            </div>

          </div>
        )}

        {(activeTab === 'learning' || activeTab === 'ai' || activeTab === 'community' || activeTab === 'marketplace') && (
          <div className="max-w-2xl mx-auto text-center py-20 animate-in fade-in">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
               {activeTab === 'ai' ? <MessageSquare size={32}/> : activeTab === 'community' ? <Users size={32}/> : activeTab === 'marketplace' ? <Store size={32}/> : <BookOpen size={32}/>}
             </div>
             <h2 className="text-2xl font-bold mb-2 text-slate-800 capitalize">
               {activeTab === 'ai' ? 'AI Automation Assistant' : activeTab}
             </h2>
             
             {activeTab === 'ai' && (
               <div className="inline-block mt-2 mb-4 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
                 Demo assistant — responses are predefined
               </div>
             )}
             {activeTab === 'community' && (
               <div className="inline-block mt-2 mb-4 px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-full">
                 Demonstration content
               </div>
             )}
             {activeTab === 'marketplace' && (
               <div className="inline-block mt-2 mb-4 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200">
                 Planned — Future Module
               </div>
             )}
             
             <p className="text-slate-500">
                This section illustrates how ForgeTech will connect learning, guidance, and suppliers to the automation planning workflow. Hardware integration (connecting real PLCs, sensors, and actuators) is a future development stage.
             </p>
          </div>
        )}

      </main>
    </div>
  );
}