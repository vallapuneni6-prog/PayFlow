import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { PaymentList } from './components/PaymentList';
import { PaymentModal } from './components/PaymentModal';
import { BottomNav, TabType } from './components/BottomNav';
import { AppState, PaymentItem } from './types';
import { loadState, saveState, getMonthKey } from './services/storage';
import { getFinancialAdvice } from './services/geminiService';
import { Plus, Sparkles, Calendar, Settings, Bell, RefreshCcw } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [activeTab, setActiveTab] = useState<TabType>('HOME');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PaymentItem | null>(null);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [isRefreshingTips, setIsRefreshingTips] = useState(false);

  // Auto-reset logic: Runs when the component mounts or when state.lastResetMonth changes.
  // Clears monthly checkmarks if we've entered a new month.
  useEffect(() => {
    const todayKey = getMonthKey();
    if (state.lastResetMonth !== todayKey) {
      setState(prev => ({
        ...prev,
        lastResetMonth: todayKey,
        completedIds: [] 
      }));
    }
  }, [state.lastResetMonth]);

  // Persist state
  useEffect(() => {
    saveState(state);
  }, [state]);

  const refreshAdvice = useCallback(async () => {
    if (state.payments.length === 0) {
      setAiTips(["Add your recurring bills to get personalized tips!"]);
      return;
    }
    setIsRefreshingTips(true);
    const tips = await getFinancialAdvice(state.payments);
    setAiTips(tips);
    setIsRefreshingTips(false);
  }, [state.payments]);

  useEffect(() => {
    refreshAdvice();
  }, []);

  const toggleStatus = (id: string) => {
    setState(prev => {
      const isDone = prev.completedIds.includes(id);
      return {
        ...prev,
        completedIds: isDone ? prev.completedIds.filter(c => c !== id) : [...prev.completedIds, id]
      };
    });
  };

  const handleAddOrUpdate = (itemData: Omit<PaymentItem, 'id'>) => {
    if (editingItem) {
      setState(prev => ({
        ...prev,
        payments: prev.payments.map(p => p.id === editingItem.id ? { ...itemData, id: editingItem.id } : p)
      }));
    } else {
      setState(prev => ({
        ...prev,
        payments: [...prev.payments, { ...itemData, id: crypto.randomUUID() }]
      }));
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this recurring entry?')) {
      setState(prev => ({
        ...prev,
        payments: prev.payments.filter(p => p.id !== id),
        completedIds: prev.completedIds.filter(c => c !== id)
      }));
    }
  };

  const handleEdit = (item: PaymentItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const currentMonthLabel = useMemo(() => {
    return new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'HOME':
        return (
          <div className="space-y-6 animate-fade-in">
            <Dashboard payments={state.payments} completedIds={state.completedIds} />
            
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles size={80} />
              </div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                    <Sparkles size={18} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">AI Financial Health</span>
                </div>
                <button 
                  onClick={refreshAdvice}
                  disabled={isRefreshingTips}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all disabled:opacity-50"
                >
                  <RefreshCcw size={14} className={isRefreshingTips ? 'animate-spin' : ''} />
                </button>
              </div>
              <div className="space-y-3">
                {aiTips.map((tip, i) => (
                  <p key={i} className="text-sm font-medium leading-relaxed opacity-90 border-l-2 border-white/20 pl-3">
                    {tip}
                  </p>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={16} className="text-blue-500" />
                <h3 className="text-sm font-bold text-slate-800">Monthly Cycle Info</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your payment statuses are reset automatically on the 1st of every month. 
                Recurring income and expenses are preserved so you can mark them again in the new cycle.
              </p>
            </div>
          </div>
        );
      case 'RECEIVE':
        return (
          <div className="animate-fade-in">
            <header className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Expected Income</h2>
              <p className="text-sm text-slate-500">Managing {state.payments.filter(p => p.type === 'RECEIVE').length} recurring sources.</p>
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
            <header className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Monthly Bills</h2>
              <p className="text-sm text-slate-500">Tracking {state.payments.filter(p => p.type === 'PAY').length} recurring payments.</p>
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
    <div className="app-container flex flex-col pb-32">
      <header className="sticky top-0 z-40 glass px-6 py-5 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100 ring-4 ring-white">P</div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-none">PayFlow</h1>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Recurrent Tracker</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
          <Calendar size={12} className="text-blue-600" />
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{currentMonthLabel}</span>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {renderContent()}
      </main>

      <div className="fixed bottom-28 right-6 z-50">
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center rounded-[2rem] shadow-2xl hover:scale-105 active:scale-90 transition-all border-4 border-white"
        >
          <Plus size={32} strokeWidth={2.5} />
        </button>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <PaymentModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }} 
        onAdd={handleAddOrUpdate}
        editingItem={editingItem}
      />
    </div>
  );
};

export default App;