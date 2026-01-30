
import React from 'react';
import { PaymentItem, PaymentType } from '../types';
import { CheckCircle2, Circle, Calendar, Trash2, Edit3, ArrowUpRight, ArrowDownLeft, Lock } from 'lucide-react';

interface PaymentListProps {
  items: PaymentItem[];
  completedIds: string[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (item: PaymentItem) => void;
  type: PaymentType;
}

export const PaymentList: React.FC<PaymentListProps> = ({ items, completedIds, onToggle, onDelete, onEdit, type }) => {
  // Sorting: 
  // 1. Pending (not in completedIds) items first
  // 2. Completed items at the bottom
  // 3. Within each group, sort by due date
  const filtered = items.filter(i => i.type === type).sort((a, b) => {
    const aDone = completedIds.includes(a.id);
    const bDone = completedIds.includes(b.id);
    
    if (aDone && !bDone) return 1;
    if (!aDone && bDone) return -1;
    
    return a.dueDate - b.dueDate;
  });

  if (filtered.length === 0) {
    return (
      <div className="py-20 text-center animate-fade-in">
        <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-5">
          {type === 'RECEIVE' ? <ArrowUpRight className="text-emerald-400" size={32} /> : <ArrowDownLeft className="text-rose-400" size={32} />}
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">No recurring {type === 'RECEIVE' ? 'income' : 'bills'} setup.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      {filtered.map(item => {
        const isDone = completedIds.includes(item.id);
        
        return (
          <div 
            key={item.id}
            className={`group relative flex items-center p-5 rounded-[2rem] border-2 transition-all duration-500 ${
              isDone 
                ? 'opacity-40 border-transparent bg-slate-100/50 dark:bg-slate-900/30 scale-[0.97] grayscale select-none' 
                : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-white/5 shadow-sm hover:border-blue-100 dark:hover:border-blue-900/50 active:scale-[0.98]'
            }`}
          >
            <button 
              onClick={() => onToggle(item.id)}
              className={`mr-4 transition-all duration-500 transform ${
                isDone 
                  ? (type === 'RECEIVE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400') + ' scale-100' 
                  : 'text-slate-300 dark:text-slate-700 hover:text-blue-400 dark:hover:text-blue-500'
              }`}
            >
              {isDone ? <CheckCircle2 size={32} strokeWidth={2.5} /> : <Circle size={32} strokeWidth={2} />}
            </button>
            
            <div className="flex-1 min-w-0" onClick={() => onToggle(item.id)}>
              <div className="flex items-center gap-2">
                <h3 className={`font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight text-base transition-all ${isDone ? 'line-through decoration-2' : ''}`}>
                  {item.title}
                </h3>
                {isDone && (
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500">
                    <Lock size={10} /> Settle for Month
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider ${isDone ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  <Calendar size={12} /> Day {item.dueDate}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${isDone ? 'bg-slate-200/50 text-slate-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {item.category}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={`text-base font-black tracking-tight transition-colors ${
                  isDone 
                    ? 'text-slate-400' 
                    : (type === 'RECEIVE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')
                }`}>
                  {type === 'RECEIVE' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
                </div>
              </div>
              
              <div className={`flex flex-col gap-2 ${isDone ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600"
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
