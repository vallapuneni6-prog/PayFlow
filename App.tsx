import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { PaymentList } from './components/PaymentList';
import { PaymentModal } from './components/PaymentModal';
import { BottomNav, TabType } from './components/BottomNav';
import { AppState, PaymentItem, PaymentType } from './types';
import { RealtimeDB, getMonthKey } from './services/realtimeDb';
import { getFinancialAdvice } from './services/geminiService';
import { Plus, Sparkles, Calendar, Zap, Loader2, Globe, Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('HOME');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PaymentItem | null>(null);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [isRefreshingTips, setIsRefreshingTips] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = RealtimeDB.subscribe((newState) => {
      setState(newState);
      setIsSyncing(true);
      const timer = setTimeout(() => setIsSyncing(false), 800);
      
      if (newState.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const refreshAdvice = useCallback(async () => {
    if (!state || state.payments.length === 0) {
      setAiTips(["Add recurring items to see AI insights!"]);
      return;
    }
    setIsRefreshingTips(true);
    const tips = await getFinancialAdvice(state.payments);
    setAiTips(tips);
    setIsRefreshingTips(false);
  }, [state?.payments.length]);

  useEffect(() => {
    if (state && aiTips.length === 0) refreshAdvice();
  }, [state === null]);

  if (!state) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-slate-950 relative overflow-hidden transition-colors">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />
        <Loader2 className="animate-spin text-blue-600 mb-4 z-10" size={48} />
        <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs z-10">Connecting to Realtime DB...</p>
      </div>
    );
  }

  const toggleStatus = (id: string) => {
    const isDone = state.completedIds.includes(id);
    const newState = {
      ...state,
      completedIds: isDone 
        ? state.completedIds.filter(c => c !== id) 
        : [...state.completedIds, id]
    };
    RealtimeDB.dispatch(newState);
  };

  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    RealtimeDB.dispatch({ ...state, theme: newTheme });
  };

  const handleAddOrUpdate = (itemData: Omit<PaymentItem, 'id'>) => {
    let newPayments = [...state.payments];
    if (editingItem) {
      newPayments = newPayments.map(p => p.id === editingItem.id ? { ...itemData, id: editingItem.id } : p);
    } else {
      newPayments.push({ ...itemData, id: crypto.randomUUID() });
    }
    
    RealtimeDB.dispatch({ ...state, payments: newPayments });
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Permanently delete this recurring item?')) {
      const newState = {
        ...state,
        payments: state.payments.filter(p => p.id !== id),
        completedIds: state.completedIds.filter(c => c !== id)
      };
      RealtimeDB.dispatch(newState);
    }
  };

  const handleEdit = (item: PaymentItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const currentMonthLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  // Determine modal default type based on current tab
  const modalDefaultType: PaymentType = activeTab === 'RECEIVE' ? 'RECEIVE' : 'PAY';

  // Determine FAB color based on context
  const getFabColorClass = () => {
    if (activeTab === 'RECEIVE') return 'bg-emerald-600 dark:bg-emerald-600';
    if (activeTab === 'PAY') return 'bg-rose-600 dark:bg-rose-600';
    return 'bg-slate-900 dark:bg-blue-600';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'HOME':
        return (
          <div className="space-y-6 animate-fade-in">
            <Dashboard payments={state.payments} completedIds={state.completedIds} />
            <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 dark:from-indigo-900 dark:via-blue-900 dark:to-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl shadow-blue-200/50 dark:shadow-none relative overflow-hidden group border border-white/10">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles size={100} />
              </div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                    <Sparkles size={18} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">Real-time Insights</span>
                </div>
              </div>
              <div className="space-y-3 relative z-10">
                {aiTips.map((tip, i) => (
                  <p key={i} className="text-sm font-medium leading-relaxed opacity-90 border-l-2 border-white/20 pl-3">
                    {tip}
                  </p>
                ))}
              </div>
            </div>
            <div className="glass border border-white dark:border-white/5 rounded-[2.5rem] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-blue-500" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Global Sync</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">Live</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Your data is synchronized in real-time across all your devices.
              </p>
            </div>
          </div>
        );
      case 'RECEIVE':
        return (
          <div className="animate-fade-in">
            <header className="mb-6 px-1">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Income Flow</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Recording and tracking your receivables.</p>
            </header>
            <PaymentList 
              type="RECEIVE" 
              items={state.payments} 
              completedIds={state.completedIds} 
              onToggle={toggleStatus} 
              onDelete={handleDelete} 
              onEdit={handleEdit} 
            />
          </div>
        );
      case 'PAY':
        return (
          <div className="animate-fade-in">
            <header className="mb-6 px-1">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Monthly Bills</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Managing and recording your commitments.</p>
            </header>
            <PaymentList 
              type="PAY" 
              items={state.payments} 
              completedIds={state.completedIds} 
              onToggle={toggleStatus} 
              onDelete={handleDelete} 
              onEdit={handleEdit} 
            />
          </div>
        );
    }
  };

  return (
    <div className="app-container flex flex-col pb-32 overflow-hidden relative">
      <div className="fixed inset-0 -z-10 bg-[#fbfcfe] dark:bg-[#020617] transition-colors duration-500">
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[50%] bg-blue-50 dark:bg-blue-900/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[10%] left-[-10%] w-[60%] h-[40%] bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '5s' }} />
        <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '10s' }} />
        <div className="absolute inset-0 noise-bg" />
      </div>

      <header className="sticky top-0 z-40 glass px-6 py-5 flex justify-between items-center border-b border-white/50 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transition-all duration-500 ${isSyncing ? 'scale-110 rotate-3 shadow-blue-300 dark:shadow-blue-900/50' : 'shadow-blue-200/50 dark:shadow-none'}`}>
            {isSyncing ? <Zap size={20} fill="currentColor" /> : 'P'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black text-slate-900 dark:text-white leading-none">PayFlow</h1>
              {isSyncing && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />}
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest mt-1">Cloud Sync Active</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2.5 bg-white/40 dark:bg-slate-800/40 rounded-full border border-white/60 dark:border-white/5 shadow-inner backdrop-blur-md text-slate-600 dark:text-slate-300 hover:scale-110 active:scale-95 transition-all"
          >
            {state.theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/40 dark:bg-slate-800/40 rounded-full border border-white/60 dark:border-white/5 shadow-inner backdrop-blur-md">
            <Calendar size={12} className="text-blue-600 dark:text-blue-400" />
            <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tighter">{currentMonthLabel}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto custom-scrollbar relative z-10">
        {renderContent()}
      </main>

      <div className="fixed bottom-28 right-6 z-50">
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className={`w-16 h-16 ${getFabColorClass()} text-white flex items-center justify-center rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all border-4 border-white dark:border-slate-900 group`}
        >
          <Plus size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <PaymentModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }} 
        onAdd={handleAddOrUpdate}
        editingItem={editingItem}
        defaultType={modalDefaultType}
      />
    </div>
  );
};

export default App;