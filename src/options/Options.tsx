import React, { useEffect, useState } from 'react';
import { Storage } from '../shared/storage';
import { AppState, Rule } from '../shared/types';
import { Plus, Trash2, Edit2, Play, Square, Save, Activity, Globe, Bell, Zap, SearchCode } from 'lucide-react';

export default function Options() {
  const [state, setState] = useState<AppState | null>(null);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailForm, setEmailForm] = useState('');

  const [isEditingRule, setIsEditingRule] = useState<string | null>(null);
  const [ruleForm, setRuleForm] = useState<Partial<Rule>>({});

  useEffect(() => {
    Storage.get().then((data) => {
      setState(data);
      setEmailForm(data.toEmail || '');
    });
  }, []);

  const saveEmailSettings = async () => {
    await Storage.saveEmail(emailForm);
    setIsEditingEmail(false);
    const updated = await Storage.get();
    setState(updated);
  };

  const handleToggleRule = async (rule: Rule) => {
    const updatedRule = { ...rule, active: !rule.active };
    await Storage.saveRule(updatedRule);
    
    if (updatedRule.active) {
      chrome.alarms.create(`check-rule-${rule.id}`, { periodInMinutes: rule.intervalMinutes });
    } else {
      chrome.alarms.clear(`check-rule-${rule.id}`);
    }

    const updated = await Storage.get();
    setState(updated);
  };

  const handleDeleteRule = async (id: string) => {
    await Storage.deleteRule(id);
    chrome.alarms.clear(`check-rule-${id}`);
    const updated = await Storage.get();
    setState(updated);
  };

  const saveRule = async () => {
    if (!ruleForm.name || !ruleForm.url || !ruleForm.selector || !ruleForm.intervalMinutes) return;
    
    const rule: Rule = {
      id: ruleForm.id || Date.now().toString(),
      name: ruleForm.name,
      url: ruleForm.url,
      selector: ruleForm.selector,
      condition: ruleForm.condition || 'exists',
      targetValue: ruleForm.targetValue || '',
      intervalMinutes: Number(ruleForm.intervalMinutes),
      active: ruleForm.active ?? true,
    };

    await Storage.saveRule(rule);
    if (rule.active) {
      chrome.alarms.create(`check-rule-${rule.id}`, { periodInMinutes: rule.intervalMinutes });
    }

    setRuleForm({});
    setIsEditingRule(null);
    const updated = await Storage.get();
    setState(updated);
  };

  if (!state) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-200 relative overflow-hidden pb-20">
      {/* Background Gradients */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 pt-12 relative z-10">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
              <Activity className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">PagePulse</h1>
              <p className="text-slate-500 text-sm mt-1">Intelligent Web Monitoring</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Settings */}
          <div className="space-y-6">
            <section className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="text-violet-400" size={20} />
                <h2 className="text-lg font-semibold text-white">Alert Destination</h2>
              </div>
              
              {isEditingEmail || !state.toEmail ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email"
                      placeholder="you@example.com" 
                      className="glass-input w-full" 
                      value={emailForm} 
                      onChange={e => setEmailForm(e.target.value)} 
                    />
                  </div>
                  <button onClick={saveEmailSettings} className="w-full btn-primary flex justify-center items-center gap-2">
                    <Save size={18} /> Save Alert Email
                  </button>
                  {state.toEmail && (
                    <button onClick={() => setIsEditingEmail(false)} className="w-full text-slate-400 text-sm hover:text-white transition-colors mt-2">
                      Cancel
                    </button>
                  )}
                </div>
              ) : (
                <div className="group relative">
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Sending alerts to</p>
                    <p className="text-white font-medium break-all">{state.toEmail}</p>
                  </div>
                  <button onClick={() => setIsEditingEmail(true)} className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
            </section>
            
            <section className="glass-panel rounded-2xl p-6 bg-gradient-to-br from-indigo-900/20 to-transparent">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="text-yellow-400" size={20} />
                <h2 className="text-lg font-semibold text-white">Engine Status</h2>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                PagePulse is active. It will open background tabs temporarily to analyze Single Page Applications without interrupting your workflow.
              </p>
              <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 bg-green-500/10 text-green-400 rounded-full w-max border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Service Worker Running
              </div>
            </section>
          </div>

          {/* Right Column: Rules */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Rules Header */}
            <div className="flex justify-between items-center bg-slate-900/30 p-2 pl-4 rounded-2xl border border-white/5 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white">Monitoring Rules <span className="text-slate-500 font-normal ml-2">({state.rules.length})</span></h2>
              <button onClick={() => { setRuleForm({ condition: 'exists', intervalMinutes: 5, active: true }); setIsEditingRule('new'); }} className="btn-primary py-2 flex items-center gap-2">
                <Plus size={18} /> New Monitor
              </button>
            </div>

            {/* Rule Editor Overlay / Inline Form */}
            {isEditingRule && (
              <div className="glass-panel rounded-2xl p-6 border-cyan-500/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <SearchCode className="text-cyan-400" />
                  {isEditingRule === 'new' ? 'Create New Monitor' : 'Edit Monitor'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Monitor Name</label>
                    <input placeholder="e.g. BookMyShow Ticket Availability" className="glass-input w-full text-white" value={ruleForm.name || ''} onChange={e => setRuleForm({...ruleForm, name: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Target URL</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 text-slate-500" size={18} />
                      <input placeholder="https://..." className="glass-input w-full pl-10 text-white" value={ruleForm.url || ''} onChange={e => setRuleForm({...ruleForm, url: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">CSS / XPath Selector</label>
                    <input placeholder=".btn-buy-tickets" className="glass-input w-full font-mono text-cyan-300" value={ruleForm.selector || ''} onChange={e => setRuleForm({...ruleForm, selector: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Trigger Condition</label>
                    <select className="glass-input w-full text-white appearance-none" value={ruleForm.condition || 'exists'} onChange={e => setRuleForm({...ruleForm, condition: e.target.value as any})}>
                      <option value="exists">Trigger when Element Exists</option>
                      <option value="equals">Trigger when Text Equals</option>
                      <option value="contains">Trigger when Text Contains</option>
                      <option value="not_equals">Trigger when Text Changes From</option>
                    </select>
                  </div>

                  {ruleForm.condition !== 'exists' && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Target Value</label>
                      <input placeholder="e.g. Book Tickets" className="glass-input w-full text-white" value={ruleForm.targetValue || ''} onChange={e => setRuleForm({...ruleForm, targetValue: e.target.value})} />
                    </div>
                  )}
                  
                  <div className="md:col-span-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                       <label className="block text-sm font-medium text-white mb-1">Check Interval</label>
                       <p className="text-xs text-slate-500">How often should we scan the page?</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" min="1" className="glass-input w-20 text-center text-white" value={ruleForm.intervalMinutes || 5} onChange={e => setRuleForm({...ruleForm, intervalMinutes: Number(e.target.value)})} />
                      <span className="text-slate-400 font-medium">minutes</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                  <button onClick={() => setIsEditingRule(null)} className="btn-secondary">Cancel</button>
                  <button onClick={saveRule} className="btn-primary flex items-center gap-2"><Save size={18}/> Save Monitor</button>
                </div>
              </div>
            )}

            {/* Rules List */}
            <div className="space-y-4">
              {state.rules.map(rule => (
                <div key={rule.id} className={`glass-panel rounded-2xl p-5 transition-all duration-300 hover:border-white/20 ${rule.active ? 'opacity-100' : 'opacity-60 grayscale-[50%]'}`}>
                  <div className="flex items-start justify-between">
                    
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-2.5 h-2.5 rounded-full shadow-md ${rule.active ? 'bg-cyan-400 shadow-cyan-400/50 animate-pulse' : 'bg-slate-600'}`}></div>
                        <h3 className="font-bold text-lg text-white">{rule.name}</h3>
                        <span className="text-[10px] uppercase tracking-wider font-semibold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
                          {rule.intervalMinutes}m Interval
                        </span>
                      </div>
                      
                      <div className="text-sm text-slate-400 mb-3 flex items-center gap-2 truncate max-w-[90%]">
                        <Globe size={14} className="text-slate-500 flex-shrink-0" />
                        <span className="truncate">{rule.url}</span>
                      </div>
                      
                      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 inline-block">
                        <div className="text-xs font-mono text-cyan-300 mb-1">
                          {rule.selector}
                        </div>
                        <div className="text-xs text-slate-400 flex gap-2">
                          <span className="text-slate-500">Condition:</span>
                          <span className="text-white font-medium">{rule.condition}</span>
                          {rule.targetValue && <span className="text-violet-300 bg-violet-900/30 px-1.5 rounded">"{rule.targetValue}"</span>}
                        </div>
                      </div>

                      {rule.lastValue !== undefined && (
                        <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Last Scraped Value:</span>
                            {rule.lastValue === null ? (
                              <span className="text-slate-600 italic">Element not found</span>
                            ) : (
                              <span className="text-green-400 font-medium px-2 py-0.5 bg-green-500/10 rounded">{rule.lastValue}</span>
                            )}
                          </div>
                          <div className="text-slate-500">
                            Last checked: {rule.lastChecked ? new Date(rule.lastChecked).toLocaleString() : 'Pending'}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleToggleRule(rule)} className={`p-2.5 rounded-xl border transition-all ${rule.active ? 'border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10' : 'border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10'}`} title={rule.active ? 'Pause Monitor' : 'Start Monitor'}>
                        {rule.active ? <Square fill="currentColor" size={18} /> : <Play fill="currentColor" size={18} />}
                      </button>
                      <button onClick={() => { setRuleForm(rule); setIsEditingRule(rule.id); }} className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 rounded-xl transition-all" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDeleteRule(rule.id)} className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
              
              {state.rules.length === 0 && !isEditingRule && (
                <div className="text-center py-16 px-6 glass-panel rounded-2xl border-dashed border-2 border-slate-700">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                     <SearchCode size={32} className="text-slate-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No active monitors</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
                    Start tracking your first webpage. Set up a rule to monitor prices, ticket availability, or content changes.
                  </p>
                  <button onClick={() => { setRuleForm({ condition: 'exists', intervalMinutes: 5, active: true }); setIsEditingRule('new'); }} className="btn-primary inline-flex items-center gap-2">
                    <Plus size={18} /> Create First Monitor
                  </button>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
