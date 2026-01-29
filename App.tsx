
import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { PaymentList } from './components/PaymentList.tsx';
import { PaymentModal } from './components/PaymentModal.tsx';
import { Settings } from './components/Settings.tsx';
import { BottomNav, TabType } from './components/BottomNav.tsx';
import { AppState, PaymentItem, PaymentType, AuthUser } from './types.ts';
import { RealtimeDB } from './services/realtimeDb.ts';
import { getFinancialAdvice } from './services/geminiService.ts';
import { Plus, Sparkles, LogIn, Key, Globe, ExternalLink, Loader2, Sun, Moon, LogOut, User, ShieldCheck, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('HOME');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PaymentItem | null>(null);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);

  // Initialize Google Sign-In
  useEffect(() => {
    if (!state?.googleClientId) return;

    const handleCredentialResponse = (response: any) => {
      try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        const userData: AuthUser = {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          picture: payload.picture
        };
        
        RealtimeDB.dispatch({ ...state, user: userData });
      } catch (e) {
        console.error("Error decoding Google token", e);
      }
    };

    const initGsi = () => {
      if ((window as any).google && state.googleClientId) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: state.googleClientId,
            callback: handleCredentialResponse,
            auto_select: true,
            use_fedcm_for_prompt: false 
          });
          setIsGsiLoaded(true);
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
  }, [state?.googleClientId]);

  useEffect(() => {
    const unsubscribe = RealtimeDB.subscribe((newState) => {
      setState(newState);
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
    if (state && aiTips.length === 0 && state.user) refreshAdvice();
  }, [state === null, state?.user]);

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
    setActiveTab('HOME');
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

  const renderLoginScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 animate-fade-in relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[30%] bg-indigo-500/10 dark:bg-indigo-600/5 blur-[120px] rounded-full -z-10" />
      
      <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl mb-8 animate-float">
        P
      </div>
      
      <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter text-center mb-2">PayFlow Pro</h1>
      <p className="text-slate-500 dark:text-slate-400 text-center mb-12 max-w-xs font-semibold leading-tight">
        Your monthly expenses, <span className="text-blue-600">synced</span> and <span className="text-blue-600">automated</span>.
      </p>

      {!state.googleClientId ? (
        <div className="w-full max-w-sm glass border border-white dark:border-white/5 p-8 rounded-[3rem] shadow-2xl space-y-6 animate-slide-up">
          <div className="space-y-2">
            <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">App Activation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              To use Google Login on your personal domain, enter your Client ID from the Google Cloud Console. This connects your app to Google's Email system.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Google Client ID"
                className="w-full pl-12 pr-5 py-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white font-mono placeholder:font-sans"
                onBlur={(e) => RealtimeDB.dispatch({ ...state, googleClientId: e.target.value.trim() })}
              />
            </div>
            
            <a 
              href="https://console.cloud.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 w-full bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-2xl hover:bg-slate-800 transition-colors shadow-lg"
            >
              Get ID from Cloud Console <ExternalLink size={14} />
            </a>
          </div>

          <div className="pt-2 flex items-start gap-3 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
            <HelpCircle className="text-blue-500 shrink-0 mt-0.5" size={16} />
            <p className="text-[10px] text-blue-700 dark:text-blue-400 font-bold leading-normal">
              Note: This is a developer setting required because you are hosting the app yourself.
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-4 animate-scale-in">
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-900/30">
              <ShieldCheck size={12} /> App Activated
            </span>
          </div>
          
          <button 
            onClick={() => {
              if (isGsiLoaded) {
                (window as any).google?.accounts.id.prompt();
              }
            }}
            className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 py-4 rounded-[2rem] flex items-center justify-center gap-4 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" />
            <span className="font-black text-slate-900 dark:text-white">Sign in with Email</span>
          </button>
          
          <button 
            onClick={() => RealtimeDB.dispatch({ ...state, googleClientId: '' })}
            className="w-full text-center text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 tracking-widest hover:text-blue-500 transition-colors py-2"
          >
            Change Activation Key
          </button>
        </div>
      )}

      <div className="mt-16 text-center space-y-1">
        <p className="text-[10px] font-black uppercase text-slate-300 dark:text-slate-700 tracking-[0.2em]">Privacy First Architecture</p>
        <p className="text-[9px] text-slate-400 dark:text-slate-600 font-medium">Your financial data never leaves your personal cloud.</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'HOME':
        return (
          <div className="space-y-6 animate-fade-in">
            <Dashboard payments={state.payments} completedIds={state.completedIds} />
            
            <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 dark:from-indigo-900 dark:via-blue-900 dark:to-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles size={100} />
              </div>
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <Sparkles size={18} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">AI-Powered Advisor</span>
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
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Tracking your monthly recurring receivables.</p>
            </header>
            <PaymentList type="RECEIVE" items={state.payments} completedIds={state.completedIds} onToggle={toggleStatus} onDelete={(id) => RealtimeDB.dispatch({ ...state, payments: state.payments.filter(p => p.id !== id) })} onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }} />
          </div>
        );
      case 'PAY':
        return (
          <div className="animate-fade-in">
            <header className="mb-6 px-1">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Fixed Costs</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Managing your monthly recurring commitments.</p>
            </header>
            <PaymentList type="PAY" items={state.payments} completedIds={state.completedIds} onToggle={toggleStatus} onDelete={(id) => RealtimeDB.dispatch({ ...state, payments: state.payments.filter(p => p.id !== id) })} onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }} />
          </div>
        );
      case 'SETTINGS':
        return <Settings state={state} />;
    }
  };

  if (!state.user) {
    return (
      <div className="app-container min-h-screen bg-[#fbfcfe] dark:bg-[#020617] transition-colors duration-500">
        {renderLoginScreen()}
      </div>
    );
  }

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
              Cloud Active
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2.5 bg-white/40 dark:bg-slate-800/40 rounded-full border border-white/60 dark:border-white/5 text-slate-600 dark:text-slate-300 transition-colors">
            {state.theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm transition-transform active:scale-90"
            >
              <img src={state.user.picture} alt={state.user.name} className="w-full h-full object-cover" />
            </button>
            
            {showProfileMenu && (
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

      {activeTab !== 'SETTINGS' && (
        <div className="fixed bottom-28 right-6 z-50">
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className={`w-16 h-16 ${activeTab === 'RECEIVE' ? 'bg-emerald-600' : activeTab === 'PAY' ? 'bg-rose-600' : 'bg-slate-900 dark:bg-blue-600'} text-white flex items-center justify-center rounded-3xl shadow-2xl active:scale-95 transition-all border-4 border-white dark:border-slate-900`}
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>
      )}

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
