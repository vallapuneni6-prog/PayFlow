
import React from 'react';
import { Shield, Moon, Sun, Trash2, ShieldCheck, CheckCircle, Globe } from 'lucide-react';
import { RealtimeDB } from '../services/realtimeDb.ts';
import { AppState } from '../types.ts';

interface SettingsProps {
  state: AppState;
}

export const Settings: React.FC<SettingsProps> = ({ state }) => {
  const clearData = () => {
    if (confirm("Are you sure? This will delete all your local payments and reset the app.")) {
      RealtimeDB.dispatch({
        payments: [],
        completedIds: [],
        lastResetMonth: state.lastResetMonth,
        theme: state.theme,
        user: null
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
        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-2">
          <Globe size={20} />
          <h3 className="font-bold text-slate-900 dark:text-white">Account Info</h3>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white dark:border-slate-700 overflow-hidden">
              <img src={state.user?.picture} className="w-full h-full object-cover" alt="Avatar" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{state.user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{state.user?.email}</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest shrink-0">
            <CheckCircle size={10} /> Synced
          </span>
        </div>
        
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
          Your preferences are linked to your account.
        </p>
      </section>

      <section className="glass rounded-[2rem] p-6 border border-white dark:border-white/5 space-y-4">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 mb-2">
          <Shield size={20} />
          <h3 className="font-bold text-slate-900 dark:text-white">Data Management</h3>
        </div>

        <button 
          onClick={clearData}
          className="w-full flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/20 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <Trash2 size={18} />
            <span className="text-sm font-bold">Wipe Local Data</span>
          </div>
        </button>
      </section>

      <div className="text-center pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-white/5">
          <ShieldCheck size={14} className="text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.1em]">PayFlow Pro v1.1.0</span>
        </div>
      </div>
    </div>
  );
};
