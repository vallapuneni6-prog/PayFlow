
import React from 'react';
import { Shield, Key, ExternalLink, Moon, Sun, Trash2, ShieldCheck, CheckCircle } from 'lucide-react';
import { RealtimeDB } from '../services/realtimeDb.ts';
import { AppState } from '../types.ts';

interface SettingsProps {
  state: AppState;
}

export const Settings: React.FC<SettingsProps> = ({ state }) => {
  const updateClientId = (id: string) => {
    RealtimeDB.dispatch({ ...state, googleClientId: id.trim() });
  };

  const clearData = () => {
    if (confirm("Are you sure? This will delete all your local payments and reset the app.")) {
      RealtimeDB.dispatch({
        payments: [],
        completedIds: [],
        lastResetMonth: state.lastResetMonth,
        theme: state.theme,
        user: null,
        googleClientId: state.googleClientId
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <header className="px-1">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">System Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage your personal app configuration.</p>
      </header>

      <section className="glass rounded-[2rem] p-6 border border-white dark:border-white/5 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
            <Key size={20} />
            <h3 className="font-bold text-slate-900 dark:text-white">Cloud Activation</h3>
          </div>
          {state.googleClientId && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
              <CheckCircle size={10} /> Active
            </span>
          )}
        </div>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          The <strong>Google Client ID</strong> acts as the secure bridge between your specific Vercel URL and Google's Login system.
        </p>

        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Connection Key (Client ID)</label>
          <input 
            type="text"
            placeholder="xxxx-xxxx.apps.googleusercontent.com"
            value={state.googleClientId || ''}
            onChange={(e) => updateClientId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs dark:text-white font-mono"
          />
        </div>

        <a 
          href="https://console.cloud.google.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[10px] font-bold text-blue-500 hover:underline"
        >
          Manage in Google Cloud Console <ExternalLink size={12} />
        </a>
      </section>

      <section className="glass rounded-[2rem] p-6 border border-white dark:border-white/5 space-y-4">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 mb-2">
          <Shield size={20} />
          <h3 className="font-bold text-slate-900 dark:text-white">Storage & Data</h3>
        </div>

        <button 
          onClick={clearData}
          className="w-full flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/20 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <Trash2 size={18} />
            <span className="text-sm font-bold">Wipe App Data</span>
          </div>
        </button>
      </section>

      <div className="text-center pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-white/5">
          <ShieldCheck size={14} className="text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.1em]">PayFlow Pro v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
