
import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { PaymentList } from './components/PaymentList.tsx';
import { PaymentModal } from './components/PaymentModal.tsx';
import { BottomNav, TabType } from './components/BottomNav.tsx';
import { AppState, PaymentItem, PaymentType, AuthUser } from './types.ts';
import { RealtimeDB } from './services/realtimeDb.ts';
import { getFinancialAdvice } from './services/geminiService.ts';
import { Plus, Sparkles, Calendar, Zap, Loader2, Globe, Sun, Moon, LogOut, User } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('HOME');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PaymentItem | null>(null);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Configuration - Replace with your real client ID from Google Cloud Console
  const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

  // Initialize Google Sign-In
  useEffect(() => {
    const handleCredentialResponse = (response: any) => {
      try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        const userData: AuthUser = {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          picture: payload.picture
        };
        
        if (state) {
          RealtimeDB.dispatch({ ...state, user: userData });
        }
      } catch (e) {
        console.error("Error decoding Google token", e);
      }
    };

    const initGsi = () => {
      if ((window as any).google && GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith("YOUR_GOOGLE_CLIENT_ID")) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: true,
            use_fedcm_for_prompt: false 
          });
          
          if (state && !state.user) {
            (window as any).google.accounts.id.prompt();
          }
        } catch (err) {
          console.error("GSI Init Error:", err);
        }
      }
    };

    const interval = setInterval(() => {
      if ((window as any).google) {
        initGsi();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state?.user === null, GOOGLE_CLIENT_ID]);

  useEffect(() => {
    const unsubscribe = RealtimeDB.subscribe((newState) => {
      setState(newState);
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 800);
      
      if (newState.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshAdvice = useCallback(async () => {
    if (!state || state.payments.length === 0) {
      setAiTips(["Add recurring items to see AI insights!"]);
      return;
    }
    const tips = await getFinancialAdvice(state.payments);
    setAiTips(tips);
  }, [state?.payments.length]);

  useEffect(() => {
    if (state && aiTips.length === 0) refreshAdvice();
  }, [state === null]);

  if (!state) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      </div>
    );
  }

  const toggleStatus = (id: string) => {
    const isDone = state.completedIds.includes(id);
    RealtimeDB.dispatch({
      ...state,
      completedIds: isDone 
        ? state.completedIds.filter(c => c !== id) 
        : [...state.completedIds, id]
    });
  };

  const handleLogout = () => {
    RealtimeDB.dispatch({ ...state, user: null });
    setShowProfileMenu(false);
  };

  const handleDemoLogin = () => {
    const demoUser: AuthUser = {
      id: "demo-user",
      name: "Demo Account",
      email: "demo@payflow.pro",
      picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
    };
    RealtimeDB.dispatch({ ...state, user: demoUser });
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

  const renderContent = () => {
    switch (activeTab) {
      case 'HOME':
        return (
          <div className="space-y-6 animate-fade-in">
            <Dashboard payments={state.payments} completedIds={state.completedIds} />
            
            {!state.user && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-[2.5rem] border border-blue-100 dark:border-blue-800/50 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
                  <Globe className="text-blue-500" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Sign in to Sync</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Save your payments to your Google Account.</p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-[200px]">
                  <button 
                    onClick={() => {
                      if (GOOGLE_CLIENT_ID.startsWith("YOUR_GOOGLE")) {
                        handleDemoLogin();
                      } else {
                        (window as any).google?.accounts.id.prompt();
                      }
                    }}
                    className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:scale-105 active:scale-95 transition-all dark:text-white"
                  >
                    <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                    {GOOGLE_CLIENT_ID.startsWith("YOUR_GOOGLE") ? "Demo Sign In" : "Google Sign In"}
                  </button>
                  {GOOGLE_CLIENT_ID.startsWith("YOUR_GOOGLE") && (
                    <p className="text-[10px] text-slate-400 italic">Google Login requires a valid Client ID</p>
                  )}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 dark:from-indigo-900 dark:via-blue-900 dark:to-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles size={100} />
              </div>
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <Sparkles size={18} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">Real-time Insights</span>
              </div>
              <div className="space-y-3 relative z-10">
                {aiTips.map((tip, i) => (
                  <p key={i} className="text-sm font-medium leading-relaxed opacity-90 border-l-2 border-white/20 pl-3">
                    {tip}
                  </p>
                ))}
              </div>
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
            <PaymentList type="RECEIVE" items={state.payments} completedIds={state.completedIds} onToggle={toggleStatus} onDelete={(id) => RealtimeDB.dispatch({ ...state, payments: state.payments.filter(p => p.id !== id) })} onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }} />
          </div>
        );
      case 'PAY':
        return (
          <div className="animate-fade-in">
            <header className="mb-6 px-1">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Monthly Bills</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Managing and recording your commitments.</p>
            </header>
            <PaymentList type="PAY" items={state.payments} completedIds={state.completedIds} onToggle={toggleStatus} onDelete={(id) => RealtimeDB.dispatch({ ...state, payments: state.payments.filter(p => p.id !== id) })} onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }} />
          </div>
        );
    }
  };

  return (
    <div className="app-container flex flex-col pb-32 overflow-hidden relative">
      <div className="fixed inset-0 -z-10 bg-[#fbfcfe] dark:bg-[#020617] transition-colors duration-500">
        <div className="absolute inset-0 noise-bg" />
      </div>

      <header className="sticky top-0 z-40 glass px-6 py-5 flex justify-between items-center border-b border-white/50 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">P</div>
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white leading-none">PayFlow</h1>
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest mt-1">
              {state.user ? 'Cloud Synced' : 'Local Mode'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2.5 bg-white/40 dark:bg-slate-800/40 rounded-full border border-white/60 dark:border-white/5 text-slate-600 dark:text-slate-300">
            {state.theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => {
                if (state.user) {
                  setShowProfileMenu(!showProfileMenu);
                } else {
                  if (GOOGLE_CLIENT_ID.startsWith("YOUR_GOOGLE")) {
                    handleDemoLogin();
                  } else {
                    (window as any).google?.accounts.id.prompt();
                  }
                }
              }}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm transition-transform active:scale-90"
            >
              {state.user ? (
                <img src={state.user.picture} alt={state.user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                  <User size={18} />
                </div>
              )}
            </button>
            
            {showProfileMenu && state.user && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-white/5 py-2 z-50 animate-scale-in">
                <div className="px-4 py-2 border-b border-slate-50 dark:border-white/5">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{state.user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{state.user.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto custom-scrollbar relative z-10">
        {renderContent()}
      </main>

      <div className="fixed bottom-28 right-6 z-50">
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className={`w-16 h-16 ${activeTab === 'RECEIVE' ? 'bg-emerald-600' : activeTab === 'PAY' ? 'bg-rose-600' : 'bg-slate-900 dark:bg-blue-600'} text-white flex items-center justify-center rounded-3xl shadow-2xl active:scale-95 transition-all border-4 border-white dark:border-slate-900`}
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <PaymentModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }} 
        onAdd={handleAddOrUpdate}
        editingItem={editingItem}
        defaultType={activeTab === 'RECEIVE' ? 'RECEIVE' : 'PAY'}
      />
    </div>
  );
};

export default App;
