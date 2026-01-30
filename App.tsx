
import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { PaymentList } from './components/PaymentList.tsx';
import { PaymentModal } from './components/PaymentModal.tsx';
import { Settings } from './components/Settings.tsx';
import { BottomNav, TabType } from './components/BottomNav.tsx';
import { AppState, PaymentItem, AuthUser } from './types.ts';
import { RealtimeDB } from './services/realtimeDb.ts';
import { getFinancialAdvice } from './services/geminiService.ts';
import { Plus, Sparkles, Loader2, Sun, Moon, LogOut, Shield, Wallet, Mail, Facebook, PlusCircle, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('HOME');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PaymentItem | null>(null);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Login UI states
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

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
  }, [state?.user, aiTips.length, refreshAdvice]);

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

  const loginWithAccount = (user: AuthUser) => {
    const accounts = state.savedAccounts || [];
    const exists = accounts.find(a => a.email === user.email);
    const updatedAccounts = exists ? accounts : [user, ...accounts];
    
    RealtimeDB.dispatch({ 
      ...state, 
      user, 
      savedAccounts: updatedAccounts 
    });
    setShowAccountPicker(false);
    setShowAddAccount(false);
  };

  const handleAddNewAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    
    const newUser: AuthUser = {
      id: crypto.randomUUID(),
      name: newUserName,
      email: newUserEmail,
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUserEmail}`
    };
    
    loginWithAccount(newUser);
    setNewUserName('');
    setNewUserEmail('');
  };

  const renderLoginScreen = () => (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center animate-fade-in">
      {/* Brand Header */}
      <div className="w-full h-1/3 bg-[#00c853] dark:bg-emerald-600 flex items-center justify-center relative overflow-hidden">
        <div className="relative z-10 p-8 bg-white/20 rounded-[2.5rem] backdrop-blur-sm border border-white/30 shadow-2xl animate-float">
          <div className="relative">
            <Shield className="text-white w-24 h-24" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Wallet className="text-orange-500 w-10 h-10 mt-1" fill="currentColor" />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
      </div>

      <div className="flex-1 w-full max-w-sm px-8 pt-20 pb-12 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white text-center leading-snug mb-12">
          Sign in below to create a <br /> secure account.
        </h1>

        <div className="w-full space-y-4">
          <button 
            onClick={() => setShowAccountPicker(true)}
            className="w-full bg-[#2196f3] text-white py-4 rounded-full flex items-center justify-center relative shadow-lg active:scale-95 transition-all overflow-hidden"
          >
            <div className="absolute left-2 bg-white w-12 h-12 rounded-full flex items-center justify-center">
              <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="G" />
            </div>
            <span className="font-bold text-xs tracking-wider uppercase pl-6">Connect with Google</span>
          </button>

          <button 
            onClick={() => setShowAccountPicker(true)}
            className="w-full bg-[#1877f2] text-white py-4 rounded-full flex items-center justify-center relative shadow-lg active:scale-95 transition-all overflow-hidden"
          >
            <div className="absolute left-2 bg-white w-12 h-12 rounded-full flex items-center justify-center">
              <Facebook className="text-[#1877f2] w-7 h-7" fill="currentColor" />
            </div>
            <span className="font-bold text-xs tracking-wider uppercase pl-6">Connect with Facebook</span>
          </button>

          <button 
            onClick={() => {
              setShowAccountPicker(true);
              setShowAddAccount(true);
            }}
            className="w-full bg-[#00c853] text-white py-4 rounded-full flex items-center justify-center relative shadow-lg active:scale-95 transition-all overflow-hidden"
          >
            <div className="absolute left-2 bg-white w-12 h-12 rounded-full flex items-center justify-center">
              <Mail className="text-[#00c853] w-6 h-6" />
            </div>
            <span className="font-bold text-xs tracking-wider uppercase pl-6">Sign in using Email</span>
          </button>
        </div>

        <div className="mt-auto pt-12 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-600 leading-relaxed max-w-[280px] mx-auto">
            By signing up or connecting with the services above you agree to our <a href="#" className="text-blue-500 underline">Terms of Services</a> and acknowledge our <a href="#" className="text-blue-500 underline">Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* Choose an account dialog simulator */}
      {showAccountPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
            {showAddAccount ? (
              <div className="p-8">
                <div className="flex items-center gap-2 mb-6 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => setShowAddAccount(false)}>
                  <ArrowLeft size={16} />
                  <span className="text-xs font-bold">Back</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">New Account</h2>
                <form onSubmit={handleAddNewAccount} className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    required
                  />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm dark:text-white"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="w-full py-3 bg-[#00c853] text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all">
                    Sign In
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-0">
                <div className="p-8 flex flex-col items-center">
                  <div className="w-12 h-12 bg-[#00c853] rounded-xl flex items-center justify-center text-white mb-4 shadow-lg">
                    <Wallet size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Choose an account</h2>
                  <p className="text-xs text-slate-500 mb-6">to continue to PayFlow</p>

                  <div className="w-full space-y-1">
                    {(state.savedAccounts || []).map(acc => (
                      <button 
                        key={acc.id}
                        onClick={() => loginWithAccount(acc)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border-b border-slate-50 dark:border-white/5 last:border-0"
                      >
                        <img src={acc.picture} className="w-8 h-8 rounded-full border border-slate-100 dark:border-slate-700" alt="" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{acc.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{acc.email}</p>
                        </div>
                      </button>
                    ))}

                    <button 
                      onClick={() => setShowAddAccount(true)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <PlusCircle size={20} />
                      </div>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Add another account</span>
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAccountPicker(false)}
                  className="w-full py-4 text-xs font-bold text-slate-300 hover:text-slate-500 transition-colors border-t border-slate-50 dark:border-white/5"
                >
                  CANCEL
                </button>
              </div>
            )}
          </div>
        </div>
      )}
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
    return renderLoginScreen();
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
