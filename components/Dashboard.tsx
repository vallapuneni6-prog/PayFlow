
import React from 'react';
import { PaymentItem } from '../types';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface DashboardProps {
  payments: PaymentItem[];
  completedIds: string[];
}

export const Dashboard: React.FC<DashboardProps> = ({ payments, completedIds }) => {
  const formatCurrency = (val: number) => val.toLocaleString('en-IN');

  const totalIncome = payments
    .filter(p => p.type === 'RECEIVE')
    .reduce((sum, p) => sum + p.amount, 0);
    
  const totalExpenses = payments
    .filter(p => p.type === 'PAY')
    .reduce((sum, p) => sum + p.amount, 0);

  const received = payments
    .filter(p => p.type === 'RECEIVE' && completedIds.includes(p.id))
    .reduce((sum, p) => sum + p.amount, 0);

  const paid = payments
    .filter(p => p.type === 'PAY' && completedIds.includes(p.id))
    .reduce((sum, p) => sum + p.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="col-span-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-500 font-medium">Monthly Balance</span>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${balance >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {balance >= 0 ? 'Surplus' : 'Deficit'}
          </span>
        </div>
        <div className="text-3xl font-bold text-gray-900">₹{formatCurrency(balance)}</div>
      </div>

      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
        <div className="flex items-center gap-2 mb-2 text-emerald-600">
          <TrendingUp size={18} />
          <span className="text-xs font-semibold uppercase tracking-wider">Income</span>
        </div>
        <div className="text-xl font-bold text-emerald-700">₹{formatCurrency(totalIncome)}</div>
        <div className="mt-2 h-1.5 w-full bg-emerald-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500" 
            style={{ width: `${totalIncome ? (received / totalIncome) * 100 : 0}%` }}
          />
        </div>
        <span className="text-[10px] text-emerald-600 mt-1 block">Received: ₹{formatCurrency(received)}</span>
      </div>

      <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
        <div className="flex items-center gap-2 mb-2 text-rose-600">
          <TrendingDown size={18} />
          <span className="text-xs font-semibold uppercase tracking-wider">Expenses</span>
        </div>
        <div className="text-xl font-bold text-rose-700">₹{formatCurrency(totalExpenses)}</div>
        <div className="mt-2 h-1.5 w-full bg-rose-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-rose-500 transition-all duration-500" 
            style={{ width: `${totalExpenses ? (paid / totalExpenses) * 100 : 0}%` }}
          />
        </div>
        <span className="text-[10px] text-rose-600 mt-1 block">Paid: ₹{formatCurrency(paid)}</span>
      </div>
    </div>
  );
};
