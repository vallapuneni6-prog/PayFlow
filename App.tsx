
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { PaymentList } from './components/PaymentList';
import { PaymentModal } from './components/PaymentModal';
import { BottomNav, TabType } from './components/BottomNav';
import { AppState, PaymentItem } from './types';
import { loadState, saveState, getMonthKey } from './services/storage';
import { getFinancialAdvice } from './services/geminiService';
import { Plus, Sparkles, Bell, RefreshCw, Calendar } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [activeTab, setActiveTab] = useState<TabType>('HOME');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [isLoadingTips, setIsLoadingTips] = useState(false);

  // Automatic Monthly Reset Logic
  useEffect(() => {
    const currentMonthKey = getMonthKey();
    if (state.lastResetMonth !== currentMonthKey) {
      console.log("New month detected! Resetting payment progress...");
      setState(prev => ({
        ...prev,
        lastResetMonth: currentMonthKey,
        completedIds: [] // Clear all checkmarks for the new month
      }));
    }
  }, [state.lastResetMonth]);

  // Save state to local storage whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // AI Advice based on recurring payments
  const fetchAdvice = useCallback(async () => {
    if (state.payments.length === 0) {
      setAiTips(["Add your recurring income or expenses to get AI-powered insights!"]);
      return;
    }
    setIsLoadingTips(true);
    const tips = await getFinancialAdvice(state.payments);
    setAiTips(tips);
    setIsLoadingTips(false);
  }, [state.payments]);

  useEffect(() => {
    fetchAdvice();
  }, []);

  const togglePaymentStatus = (id: string) => {
    setState(prev => {
      const isAlreadyCompleted = prev.completedIds.includes(id);
      return {
        ...prev,
        completedIds: isAlreadyCompleted
          ? prev.completedIds.filter(cid => cid !== id)
          : [...prev.completedIds, id]
      };
    });
  };

  const addPayment = (newItem: Omit<PaymentItem, 'id'>) => {
    const id = crypto.randomUUID();
    setState(prev => ({
      ...prev,
      payments: [...prev.payments, { ...newItem, id }]
    }));
  };

  const deletePayment = (id: string) => {
    if (!confirm('Remove this recurring item?')) return;
    setState(prev => ({
      ...prev,
      payments: prev.payments.filter(p => p.id !== id),
      completedIds: prev.completedIds.filter(cid => cid !== id)
    }));
  };

  const currentMonthDisplay = useMemo(() => {
    return new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'HOME':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Dashboard 
              payments={state.payments} 
              completedIds={state.completedIds} 
            />

            <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles size={64} />
              </div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <Sparkles size={16} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">AI Strategy</span>
                </div>
                <button 
                  onClick={fetchAdvice}
                  disabled={isLoadingTips}
                  className="text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/20 transition-all disabled:opacity-50 flex items-center gap-1"
                >
                  <RefreshCw size={10} className={isLoadingTips ? 'animate-spin' : ''} />
                  {isLoadingTips ? 'Analyzing...' : 'Refresh'}
                </button>
              </div>
              
              <div className="space-y-4">
                {aiTips.map((tip, i) => (
                  <div key={i} className="flex gap-3 items-start animate-in fade-in slide-in-from-right duration-500" style={{ animationDelay: `${i * 150}ms` }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/50 mt-1.5 shrink-0" />
                    <p className="text-sm font-medium leading-snug text-indigo-50">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell size={16} className="text-blue-500" />
                Monthly Cycle
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Recurring Income</span>
                  <span className="font-bold text-emerald-600">₹{state.payments.filter(p => p.type === 'RECEIVE').reduce((s, p) => s + p.amount, 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Recurring Expenses</span>
                  <span className="font-bold text-rose-600">₹{state.payments.filter(p => p.type === 'PAY').reduce((s, p) => s + p.amount, 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-medium">Auto-reset occurs on the 1st of every month.</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'RECEIVE':
        return (
          <div className="animate-in fade-in slide-in-from-right-2 duration-300">
            <header className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Monthly Income</h2>
              <p className="text-sm text-gray-500">Track incoming payments for {new Date().toLocaleString('default', { month: 'long' })}.</p>
            </header>
            <PaymentList 
              type="RECEIVE"
              items={state.payments}
              completedIds={state.completedIds}
              onToggle={togglePaymentStatus}
              onDelete={deletePayment}
            />
          </div>
        );
      case 'PAY':
        return (
          <div className="animate-in fade-in slide-in-from-right-2 duration-300">
            <header className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Monthly Expenses</h2>
              <p className="text-sm text-gray-500">Mark your bills as they are paid.</p>
            </header>
            <PaymentList 
              type="PAY"
              items={state.payments}
              completedIds={state.completedIds}
              onToggle={togglePaymentStatus}
              onDelete={deletePayment}
            />
          </div>
        );
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col pb-32 shadow-xl relative overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-100">P</div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">PayFlow</h1>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">Smart Tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
          <Calendar size={14} className="text-blue-500" />
          <span className="text-xs font-bold text-gray-700">{currentMonthDisplay}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pt-6 overflow-y-auto custom-scrollbar">
        {renderContent()}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-14 h-14 bg-gray-900 text-white flex items-center justify-center rounded-2xl shadow-xl shadow-gray-300 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={32} />
        </button>
      </div>

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      <PaymentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={addPayment} 
      />
    </div>
  );
};

export default App;
