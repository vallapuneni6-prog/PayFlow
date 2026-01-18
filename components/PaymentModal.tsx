
import React, { useState, useEffect } from 'react';
import { PaymentType, PaymentItem } from '../types';
import { X } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<PaymentItem, 'id'>) => void;
  editingItem?: PaymentItem | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onAdd, editingItem }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<PaymentType>('PAY');
  const [dueDate, setDueDate] = useState('1');
  const [category, setCategory] = useState('General');

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setAmount(editingItem.amount.toString());
      setType(editingItem.type);
      setDueDate(editingItem.dueDate.toString());
      setCategory(editingItem.category);
    } else {
      setTitle('');
      setAmount('');
      setType('PAY');
      setDueDate('1');
      setCategory('General');
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    
    onAdd({
      title,
      amount: parseFloat(amount),
      type,
      dueDate: parseInt(dueDate),
      category
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 transform transition-transform animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {editingItem ? 'Edit Recurring Item' : 'Add Recurring Item'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('PAY')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'PAY' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('RECEIVE')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'RECEIVE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title</label>
            <input
              autoFocus
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rent, Salary, Internet"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Amount (₹)</label>
              <input
                required
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Due Day</label>
              <select
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              >
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
            >
              <option value="Housing">Housing</option>
              <option value="Utilities">Utilities</option>
              <option value="Food">Food</option>
              <option value="Subscription">Subscription</option>
              <option value="Work">Work</option>
              <option value="Transport">Transport</option>
              <option value="Leisure">Leisure</option>
              <option value="General">General</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 mt-4"
          >
            {editingItem ? 'Update Item' : 'Save Recurring Item'}
          </button>
        </form>
      </div>
    </div>
  );
};
