import React, { useEffect, useState } from 'react';
import { Settings, Activity, Clock } from 'lucide-react';
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

  if (!state) return <div className="p-4">Loading...</div>;

  const activeRulesCount = state.rules.filter((r) => r.active).length;

  return (
    <div className="flex flex-col p-4 w-[320px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-500" size={24} />
          <h1 className="text-xl font-bold">PagePulse</h1>
        </div>
        <button
          onClick={openOptions}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="text-gray-400 text-sm">Active Monitors</div>
        <div className="text-3xl font-bold text-blue-400">{activeRulesCount}</div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recent Activity</h2>
        {state.rules.length === 0 ? (
          <p className="text-sm text-gray-500">No monitoring rules set up.</p>
        ) : (
          state.rules.slice(0, 3).map((rule) => (
            <div key={rule.id} className="flex flex-col bg-gray-800/50 p-3 rounded border border-gray-700">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm truncate pr-2">{rule.name}</span>
                <span className={`w-2 h-2 rounded-full ${rule.active ? 'bg-green-500' : 'bg-gray-500'}`} />
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                <Clock size={12} />
                <span>Last checked: {rule.lastChecked ? new Date(rule.lastChecked).toLocaleTimeString() : 'Never'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={openOptions}
        className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        Manage Rules
      </button>
    </div>
  );
}
