import React from 'react';
import { PaymentItem } from '../types';
import { Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface DashboardProps {
  payments: PaymentItem[];
  completedIds: string[];
}

export const Dashboard: React.FC<DashboardProps> = ({ payments, completedIds }) => {
  const format = (v: number) => v.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  const totalIn = payments.filter(p => p.type === 'RECEIVE').reduce((s, p) => s + p.amount, 0);
  const totalOut = payments.filter(p => p.type === 'PAY').reduce((s, p) => s + p.amount, 0);
  const doneIn = payments.filter(p => p.type === 'RECEIVE' && completedIds.includes(p.id)).reduce((s, p) => s + p.amount, 0);
  const doneOut = payments.filter(p => p.type === 'PAY' && completedIds.includes(p.id)).reduce((s, p) => s + p.amount, 0);

  const balance = totalIn - totalOut;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Monthly Surplus</span>
            <div className="text-4xl font-black text-slate-900 tracking-tighter">{format(balance)}</div>
          </div>
          <div className={`p-4 rounded-2xl ${balance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            <Wallet size={28} strokeWidth={2.5} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${balance >= 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`} />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recurring Cycle Analysis</span>
        </div>
      </div>

      <div className="bg-emerald-50/50 p-6 rounded-[2.2rem] border border-emerald-100">
        <div className="flex items-center gap-2 mb-3 text-emerald-700">
          <ArrowUpCircle size={18} />
          <span className="text-[10px] font-black uppercase tracking-wider">Revenue</span>
        </div>
        <div className="text-xl font-black text-emerald-800 tracking-tight mb-4">{format(totalIn)}</div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px] font-bold text-emerald-600 uppercase">
            <span>Collected</span>
            <span>{totalIn ? Math.round((doneIn/totalIn)*100) : 0}%</span>
          </div>
          <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${totalIn ? (doneIn/totalIn)*100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-rose-50/50 p-6 rounded-[2.2rem] border border-rose-100">
        <div className="flex items-center gap-2 mb-3 text-rose-700">
          <ArrowDownCircle size={18} />
          <span className="text-[10px] font-black uppercase tracking-wider">Spending</span>
        </div>
        <div className="text-xl font-black text-rose-800 tracking-tight mb-4">{format(totalOut)}</div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px] font-bold text-rose-600 uppercase">
            <span>Paid</span>
            <span>{totalOut ? Math.round((doneOut/totalOut)*100) : 0}%</span>
          </div>
          <div className="h-1.5 w-full bg-rose-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-rose-500 transition-all duration-700"
              style={{ width: `${totalOut ? (doneOut/totalOut)*100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};