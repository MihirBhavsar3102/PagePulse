import React, { useEffect, useState } from 'react';
import { Settings, Activity, Clock, ChevronRight } from 'lucide-react';
import { Storage } from '../shared/storage';
import { AppState } from '../shared/types';

export default function Popup() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    Storage.get().then(setState);
  }, []);

  const openOptions = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  };

  if (!state) return <div className="p-4 h-[400px] flex items-center justify-center text-slate-400 animate-pulse">Initializing...</div>;

  const activeRulesCount = state.rules.filter((r) => r.active).length;

  return (
    <div className="flex flex-col w-[340px] min-h-[460px] bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 relative overflow-hidden">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-50px] left-[-50px] w-[150px] h-[150px] bg-cyan-500/20 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-[-50px] right-[-50px] w-[150px] h-[150px] bg-violet-500/20 rounded-full blur-[60px] pointer-events-none" />

      <div className="p-5 flex-1 z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
              <Activity className="text-white" size={20} />
            </div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">PagePulse</h1>
          </div>
          <button
            onClick={openOptions}
            className="p-2 hover:bg-white/10 rounded-full transition-colors group"
            title="Dashboard Settings"
          >
            <Settings size={20} className="text-slate-400 group-hover:text-white group-hover:rotate-45 transition-all duration-300" />
          </button>
        </div>

        {/* Stats Card */}
        <div className="glass-panel rounded-2xl p-5 mb-5 flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Active Monitors</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">{activeRulesCount}</span>
              <span className="text-sm text-slate-500 font-medium">/ {state.rules.length} total</span>
            </div>
          </div>
          {activeRulesCount > 0 && (
            <div className="w-12 h-12 rounded-full border border-cyan-500/30 flex items-center justify-center relative">
               <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-20"></div>
               <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                 <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
               </div>
            </div>
          )}
        </div>

        {/* Activity List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
             <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Activity</h2>
          </div>
          
          <div className="space-y-2.5">
            {state.rules.length === 0 ? (
              <div className="text-center py-6 glass-panel rounded-xl">
                <p className="text-sm text-slate-400 mb-3">No monitoring rules yet.</p>
              </div>
            ) : (
              state.rules.slice(0, 3).map((rule) => (
                <div key={rule.id} className="glass-panel hover:bg-white/10 transition-colors p-3.5 rounded-xl flex flex-col cursor-default group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium text-sm text-slate-200 truncate pr-3 group-hover:text-white transition-colors">{rule.name}</span>
                    <span className={`flex-shrink-0 w-2 h-2 rounded-full shadow-md ${rule.active ? 'bg-cyan-400 shadow-cyan-400/50' : 'bg-slate-600'}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock size={12} className="text-slate-600" />
                      <span>{rule.lastChecked ? new Date(rule.lastChecked).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Waiting for first check'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Footer */}
        <button
          onClick={openOptions}
          className="mt-6 w-full btn-primary flex items-center justify-center gap-2 group"
        >
          <span>Open Dashboard</span>
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
