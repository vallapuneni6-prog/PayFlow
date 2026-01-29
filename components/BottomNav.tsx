import React from 'react';
import { Home, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export type TabType = 'HOME' | 'RECEIVE' | 'PAY';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'HOME' as TabType, label: 'Home', Icon: Home },
    { id: 'RECEIVE' as TabType, label: 'Income', Icon: ArrowUpRight },
    { id: 'PAY' as TabType, label: 'Expenses', Icon: ArrowDownLeft },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-white/5 px-6 pb-6 pt-3 flex justify-between items-center max-w-md mx-auto shadow-[0_-4px_20px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex flex-col items-center gap-1 min-w-[64px] transition-all ${
            activeTab === id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-600'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === id ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-transparent'}`}>
            <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </button>
      ))}
    </nav>
  );
};
