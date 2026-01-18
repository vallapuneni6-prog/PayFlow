
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { PaymentList } from './components/PaymentList';
import { PaymentModal } from './components/PaymentModal';
import { BottomNav, TabType } from './components/BottomNav';
import { AppState, PaymentItem } from './types';
import { loadState, saveState, getMonthKey } from './services/storage';
import { getFinancialAdvice } from './services/geminiService';
import { Plus, Sparkles, ChevronLeft, ChevronRight, Menu, Bell } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [activeTab, setActiveTab] = useState<TabType>('HOME');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  const [activeMonthKey, setActiveMonthKey] = useState(getMonthKey());

  // Derive current month's completions
  const currentMonthRecord = useMemo(() => {
    return state.history.find(h => h.monthKey === activeMonthKey) || { monthKey: activeMonthKey, completedIds: [] };
  }, [state.history, activeMonthKey]);

  // Sync state with local storage
  useEffect(() => {
    saveState(state);
  }, [state]);

  // AI Advice
  const fetchAdvice = useCallback(async () => {
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
      const historyIndex = prev.history.findIndex(h => h.monthKey === activeMonthKey);
      let newHistory = [...prev.history];

      if (historyIndex === -1) {
        newHistory.push({ monthKey: activeMonthKey, completedIds: [id] });
      } else {
        const record = { ...newHistory[historyIndex] };
        if (record.completedIds.includes(id)) {
          record.completedIds = record.completedIds.filter(cid => cid !== id);
        } else {
          record.completedIds = [...record.completedIds, id];
        }
        newHistory[historyIndex] = record;
      }

      return { ...prev, history: newHistory };
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
    if (!confirm('Remove this recurring payment?')) return;
    setState(prev => ({
      ...prev,
      payments: prev.payments.filter(p => p.id !== id),
      history: prev.history.map(h => ({
        ...h,
        completedIds: h.completedIds.filter(cid => cid !== id)
      }))
    }));
  };

  const currentMonthDisplay = useMemo(() => {
    const [year, month] = activeMonthKey.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [activeMonthKey]);

  const changeMonth = (offset: number) => {
    const [year, month] = activeMonthKey.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1 + offset, 1);
    setActiveMonthKey(getMonthKey(d));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'HOME':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Dashboard 
              payments={state.payments} 
              completedIds={currentMonthRecord.completedIds} 
            />

            {/* AI Insight Section */}
            <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles size={64} />
              </div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <Sparkles size={16} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Smart Insights</span>
                </div>
                <button 
                  onClick={fetchAdvice}
                  disabled={isLoadingTips}
                  className="text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/20 transition-all disabled:opacity-50"
                >
                  {isLoadingTips ? 'Analyzing...' : 'Refresh'}
                </button>
              </div>
              
              <div className="space-y-4">
                {aiTips.length > 0 ? (
                  aiTips.map((tip, i) => (
                    <div key={i} className="flex gap-3 items-start animate-in fade-in slide-in-from-right duration-500" style={{ animationDelay: `${i * 150}ms` }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/50 mt-1.5 shrink-0" />
                      <p className="text-sm font-medium leading-snug text-indigo-50">{tip}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-indigo-100/70 italic">No insights generated yet. Click refresh to analyze your data.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell size={16} className="text-blue-500" />
                This Month's Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Scheduled Income</span>
                  <span className="font-bold text-emerald-600">₹{state.payments.filter(p => p.type === 'RECEIVE').reduce((s, p) => s + p.amount, 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Scheduled Expenses</span>
                  <span className="font-bold text-rose-600">₹{state.payments.filter(p => p.type === 'PAY').reduce((s, p) => s + p.amount, 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-xs text-gray-400">Monthly reset is automatic.</span>
                  <span className="text-xs font-semibold text-blue-500 uppercase tracking-tighter">View Calendar</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'RECEIVE':
        return (
          <div className="animate-in fade-in slide-in-from-right-2 duration-300">
            <header className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Income to Receive</h2>
              <p className="text-sm text-gray-500">Mark items as received as they arrive.</p>
            </header>
            <PaymentList 
              type="RECEIVE"
              items={state.payments}
              completedIds={currentMonthRecord.completedIds}
              onToggle={togglePaymentStatus}
              onDelete={deletePayment}
            />
          </div>
        );
      case 'PAY':
        return (
          <div className="animate-in fade-in slide-in-from-right-2 duration-300">
            <header className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Payments to Do</h2>
              <p className="text-sm text-gray-500">Keep track of your monthly bills and outgoings.</p>
            </header>
            <PaymentList 
              type="PAY"
              items={state.payments}
              completedIds={currentMonthRecord.completedIds}
              onToggle={togglePaymentStatus}
              onDelete={deletePayment}
            />
          </div>
        );
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col pb-32 shadow-xl relative">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg">P</div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">PayFlow</h1>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">Finance Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
          <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 transition-all">
            <ChevronLeft size={16} />
          </button>
          <span className="px-2 text-xs font-bold text-gray-700 min-w-[100px] text-center">{currentMonthDisplay}</span>
          <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 transition-all">
            <ChevronRight size={16} />
          </button>
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
          className="w-14 h-14 bg-gray-900 text-white flex items-center justify-center rounded-2xl shadow-xl shadow-gray-300 hover:scale-110 active:scale-95 transition-all"
        >
          <Plus size={32} />
        </button>
      </div>

      {/* Bottom Navigation */}
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
