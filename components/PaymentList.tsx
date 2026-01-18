import React from 'react';
import { PaymentItem, PaymentType } from '../types';
import { CheckCircle2, Circle, Calendar, Trash2, Edit3, ChevronRight } from 'lucide-react';

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
        <div className="bg-slate-100 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-5">
          <Calendar className="text-slate-400" size={32} />
        </div>
        <p className="text-slate-500 font-medium">No recurring {type === 'RECEIVE' ? 'income' : 'bills'} setup.</p>
        <p className="text-xs text-slate-400 mt-2">Add recurring items once and track them monthly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filtered.map(item => {
        const isDone = completedIds.includes(item.id);
        return (
          <div 
            key={item.id}
            className={`group relative flex items-center p-5 bg-white rounded-[2rem] border-2 transition-all active:scale-[0.98] ${
              isDone ? 'opacity-50 border-transparent bg-slate-50' : 'border-slate-50 shadow-sm hover:border-blue-100'
            }`}
          >
            <button 
              onClick={() => onToggle(item.id)}
              className={`mr-4 transition-all duration-300 transform ${isDone ? 'text-blue-600 scale-110' : 'text-slate-300 hover:text-blue-400'}`}
            >
              {isDone ? <CheckCircle2 size={32} strokeWidth={2.5} /> : <Circle size={32} strokeWidth={2} />}
            </button>
            
            <div className="flex-1 min-w-0" onClick={() => onToggle(item.id)}>
              <h3 className={`font-bold text-slate-900 truncate tracking-tight text-base ${isDone ? 'line-through decoration-2' : ''}`}>
                {item.title}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                  <Calendar size={12} /> Day {item.dueDate}
                </span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase">
                  {item.category}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={`text-base font-black tracking-tight ${type === 'RECEIVE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {type === 'RECEIVE' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                  className="p-1.5 bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                  className="p-1.5 bg-slate-100 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
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