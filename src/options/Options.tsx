import React, { useEffect, useState } from 'react';
import { Storage } from '../shared/storage';
import { AppState, Rule, EmailSettings } from '../shared/types';
import { Plus, Trash2, Edit2, Play, Square, Save } from 'lucide-react';

export default function Options() {
  const [state, setState] = useState<AppState | null>(null);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailForm, setEmailForm] = useState<EmailSettings>({
    serviceId: '',
    templateId: '',
    publicKey: '',
    toEmail: ''
  });

  const [isEditingRule, setIsEditingRule] = useState<string | null>(null);
  const [ruleForm, setRuleForm] = useState<Partial<Rule>>({});

  useEffect(() => {
    Storage.get().then((data) => {
      setState(data);
      if (data.emailSettings) setEmailForm(data.emailSettings);
    });
  }, []);

  const saveEmailSettings = async () => {
    await Storage.saveEmailSettings(emailForm);
    setIsEditingEmail(false);
    const updated = await Storage.get();
    setState(updated);
  };

  const handleToggleRule = async (rule: Rule) => {
    const updatedRule = { ...rule, active: !rule.active };
    await Storage.saveRule(updatedRule);
    
    // Update alarm
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

  const openNewRuleForm = () => {
    setRuleForm({ condition: 'exists', intervalMinutes: 5, active: true });
    setIsEditingRule('new');
  };

  if (!state) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 text-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-blue-400">PagePulse Dashboard</h1>

      {/* Email Settings Section */}
      <section className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">EmailJS Settings</h2>
          {!isEditingEmail && (
            <button onClick={() => setIsEditingEmail(true)} className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
              <Edit2 size={16} /> Edit
            </button>
          )}
        </div>
        
        {isEditingEmail ? (
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Service ID" className="bg-gray-900 p-2 rounded border border-gray-600 focus:border-blue-500 outline-none" value={emailForm.serviceId} onChange={e => setEmailForm({...emailForm, serviceId: e.target.value})} />
            <input placeholder="Template ID" className="bg-gray-900 p-2 rounded border border-gray-600 focus:border-blue-500 outline-none" value={emailForm.templateId} onChange={e => setEmailForm({...emailForm, templateId: e.target.value})} />
            <input placeholder="Public Key" className="bg-gray-900 p-2 rounded border border-gray-600 focus:border-blue-500 outline-none" value={emailForm.publicKey} onChange={e => setEmailForm({...emailForm, publicKey: e.target.value})} />
            <input placeholder="Alert To Email" className="bg-gray-900 p-2 rounded border border-gray-600 focus:border-blue-500 outline-none" value={emailForm.toEmail} onChange={e => setEmailForm({...emailForm, toEmail: e.target.value})} />
            <button onClick={saveEmailSettings} className="col-span-2 bg-blue-600 hover:bg-blue-700 p-2 rounded font-medium flex justify-center items-center gap-2">
              <Save size={18} /> Save Settings
            </button>
          </div>
        ) : (
          <div className="text-gray-400 text-sm">
            {state.emailSettings?.serviceId ? (
              <p>Email configured to send to: <span className="text-gray-200">{state.emailSettings.toEmail}</span></p>
            ) : (
              <p className="text-yellow-500">EmailJS not configured. Alerts will not be sent.</p>
            )}
          </div>
        )}
      </section>

      {/* Rules Section */}
      <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Monitoring Rules</h2>
          <button onClick={openNewRuleForm} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <Plus size={18} /> Add Rule
          </button>
        </div>

        {isEditingRule && (
          <div className="bg-gray-900 p-4 rounded-lg mb-6 border border-blue-500">
            <h3 className="font-semibold mb-4">{isEditingRule === 'new' ? 'New Rule' : 'Edit Rule'}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input placeholder="Rule Name (e.g. BookMyShow Ticket)" className="col-span-2 bg-gray-800 p-2 rounded border border-gray-700 outline-none" value={ruleForm.name || ''} onChange={e => setRuleForm({...ruleForm, name: e.target.value})} />
              <input placeholder="URL to monitor" className="col-span-2 bg-gray-800 p-2 rounded border border-gray-700 outline-none" value={ruleForm.url || ''} onChange={e => setRuleForm({...ruleForm, url: e.target.value})} />
              <input placeholder="CSS Selector (e.g. .btn-buy)" className="col-span-2 bg-gray-800 p-2 rounded border border-gray-700 outline-none" value={ruleForm.selector || ''} onChange={e => setRuleForm({...ruleForm, selector: e.target.value})} />
              
              <select className="bg-gray-800 p-2 rounded border border-gray-700 outline-none" value={ruleForm.condition || 'exists'} onChange={e => setRuleForm({...ruleForm, condition: e.target.value as any})}>
                <option value="exists">Element Exists</option>
                <option value="equals">Text Equals</option>
                <option value="contains">Text Contains</option>
                <option value="not_equals">Text Not Equals</option>
              </select>

              {ruleForm.condition !== 'exists' && (
                <input placeholder="Target Value" className="bg-gray-800 p-2 rounded border border-gray-700 outline-none" value={ruleForm.targetValue || ''} onChange={e => setRuleForm({...ruleForm, targetValue: e.target.value})} />
              )}
              
              <div className="flex items-center gap-2 col-span-2">
                <span className="text-sm">Check every</span>
                <input type="number" className="bg-gray-800 p-2 rounded border border-gray-700 outline-none w-24" value={ruleForm.intervalMinutes || 5} onChange={e => setRuleForm({...ruleForm, intervalMinutes: Number(e.target.value)})} />
                <span className="text-sm">minutes</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveRule} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-medium">Save Rule</button>
              <button onClick={() => setIsEditingRule(null)} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-white font-medium">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {state.rules.map(rule => (
            <div key={rule.id} className={`flex items-center justify-between p-4 rounded-lg border ${rule.active ? 'bg-gray-800/80 border-gray-600' : 'bg-gray-900 border-gray-800 opacity-70'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-3 h-3 rounded-full ${rule.active ? 'bg-green-500' : 'bg-gray-600'}`}></span>
                  <h3 className="font-semibold text-lg">{rule.name}</h3>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">Every {rule.intervalMinutes}m</span>
                </div>
                <div className="text-sm text-gray-400 mb-1 truncate max-w-lg">{rule.url}</div>
                <div className="text-xs font-mono text-blue-300 bg-blue-900/20 inline-block px-2 py-1 rounded">
                  {rule.selector} | {rule.condition} {rule.targetValue && `"${rule.targetValue}"`}
                </div>
                {rule.lastValue && (
                  <div className="text-xs mt-2 text-gray-400">Last seen value: <span className="text-gray-200">{rule.lastValue}</span></div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handleToggleRule(rule)} className={`p-2 rounded-full ${rule.active ? 'text-yellow-500 hover:bg-yellow-500/10' : 'text-green-500 hover:bg-green-500/10'}`} title={rule.active ? 'Pause' : 'Start'}>
                  {rule.active ? <Square size={20} /> : <Play size={20} />}
                </button>
                <button onClick={() => { setRuleForm(rule); setIsEditingRule(rule.id); }} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-full" title="Edit">
                  <Edit2 size={20} />
                </button>
                <button onClick={() => handleDeleteRule(rule.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-full" title="Delete">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
          {state.rules.length === 0 && !isEditingRule && (
            <div className="text-center py-8 text-gray-500">
              No monitoring rules created yet. Click "Add Rule" to get started.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
