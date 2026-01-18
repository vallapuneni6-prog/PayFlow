
import React from 'react';
import { PaymentItem, PaymentType } from '../types';
import { CheckCircle2, Circle, Calendar, Trash2 } from 'lucide-react';

interface PaymentListProps {
  items: PaymentItem[];
  completedIds: string[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  type: PaymentType;
}

export const PaymentList: React.FC<PaymentListProps> = ({ items, completedIds, onToggle, onDelete, type }) => {
  const filtered = items.filter(i => i.type === type).sort((a, b) => a.dueDate - b.dueDate);

  if (filtered.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="text-gray-400" size={24} />
        </div>
        <p className="text-gray-500">No {type === 'RECEIVE' ? 'receivables' : 'payables'} found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map(item => {
        const isCompleted = completedIds.includes(item.id);
        return (
          <div 
            key={item.id}
            className={`flex items-center p-4 bg-white rounded-2xl shadow-sm border transition-all ${
              isCompleted ? 'opacity-60 border-gray-100 bg-gray-50' : 'border-gray-100'
            }`}
          >
            <button 
              onClick={() => onToggle(item.id)}
              className={`mr-4 transition-colors ${isCompleted ? 'text-blue-500' : 'text-gray-300 hover:text-blue-400'}`}
            >
              {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </button>
            
            <div className="flex-1" onClick={() => onToggle(item.id)}>
              <h3 className={`font-semibold text-gray-900 ${isCompleted ? 'line-through' : ''}`}>
                {item.title}
              </h3>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar size={12} /> Day {item.dueDate}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                  {item.category}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className={`font-bold ${type === 'RECEIVE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {type === 'RECEIVE' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className="text-gray-300 hover:text-red-400 transition-colors p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
