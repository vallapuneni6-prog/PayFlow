import React from 'react';
import { PaymentItem, PaymentType } from '../types';
import { CheckCircle2, Circle, Calendar, Trash2, Edit3, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface PaymentListProps {
  items: PaymentItem[];
  completedIds: string[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (item: PaymentItem) => void;
  type: PaymentType;
}

export const PaymentList: React.FC<PaymentListProps> = ({ items, completedIds, onToggle, onDelete, onEdit, type }) => {
  const filtered = items.filter(i => i.type === type).sort((a, b) => a.dueDate - b.dueDate);

  if (filtered.length === 0) {
    return (
      <div className="py-20 text-center animate-fade-in">
        <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-5">
          {type === 'RECEIVE' ? <ArrowUpRight className="text-emerald-400" size={32} /> : <ArrowDownLeft className="text-rose-400" size={32} />}
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">No recurring {type === 'RECEIVE' ? 'income' : 'bills'} setup.</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Record your recurring flow once and track them monthly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filtered.map(item => {
        const isDone = completedIds.includes(item.id);
        const actionLabel = type === 'RECEIVE' ? (isDone ? 'Recorded' : 'Record Collection') : (isDone ? 'Paid' : 'Record Payment');
        
        return (
          <div 
            key={item.id}
            className={`group relative flex items-center p-5 bg-white dark:bg-slate-900 rounded-[2rem] border-2 transition-all active:scale-[0.98] ${
              isDone 
                ? 'opacity-60 border-transparent bg-slate-50 dark:bg-slate-900/50' 
                : 'border-slate-50 dark:border-white/5 shadow-sm hover:border-blue-100 dark:hover:border-blue-900/50'
            }`}
          >
            <button 
              onClick={() => onToggle(item.id)}
              aria-label={actionLabel}
              className={`mr-4 transition-all duration-300 transform ${
                isDone 
                  ? (type === 'RECEIVE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400') + ' scale-110' 
                  : 'text-slate-300 dark:text-slate-700 hover:text-blue-400 dark:hover:text-blue-500'
              }`}
            >
              {isDone ? <CheckCircle2 size={32} strokeWidth={2.5} /> : <Circle size={32} strokeWidth={2} />}
            </button>
            
            <div className="flex-1 min-w-0" onClick={() => onToggle(item.id)}>
              <div className="flex items-center gap-2">
                <h3 className={`font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight text-base ${isDone ? 'line-through decoration-2 opacity-50' : ''}`}>
                  {item.title}
                </h3>
                {isDone && (
                  <span className={`text-[10px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${type === 'RECEIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'}`}>
                    Recorded
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                  <Calendar size={12} /> Day {item.dueDate}
                </span>
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md uppercase">
                  {item.category}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={`text-base font-black tracking-tight ${type === 'RECEIVE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {type === 'RECEIVE' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
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