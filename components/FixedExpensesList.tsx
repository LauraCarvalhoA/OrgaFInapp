
import React from 'react';
import { Transaction } from '../types';
import { Calendar, CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface FixedExpensesListProps {
  transactions: Transaction[];
}

const FixedExpensesList: React.FC<FixedExpensesListProps> = ({ transactions }) => {
  // Filter recurring transactions
  // Logic: Find unique recurring categories/merchants that usually happen this month
  const currentMonth = new Date().getMonth();
  const recurring = transactions.filter(t => t.isRecurring && t.amount < 0);
  
  // Group by Merchant/Category to show "Bills"
  // In a real app, we would have a separate "Subscriptions" table. 
  // Here we infer from "isRecurring" flag in recent history.
  const uniqueBills = Array.from(new Set(recurring.map(t => t.merchant))).map(merchant => {
    const lastTxn = recurring.find(t => t.merchant === merchant);
    
    // Check if paid this month
    const paidThisMonth = recurring.some(t => {
        const d = new Date(t.date);
        return t.merchant === merchant && d.getMonth() === currentMonth;
    });

    return {
        name: merchant,
        amount: lastTxn ? Math.abs(lastTxn.amount) : 0,
        category: lastTxn?.category,
        paid: paidThisMonth
    };
  });

  if (uniqueBills.length === 0) return null;

  return (
    <div className="bg-card border border-slate-700 rounded-2xl p-5 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="text-primary" size={20} />
        <h3 className="font-semibold text-white">Despesas Fixas</h3>
      </div>

      <div className="space-y-3">
        {uniqueBills.map((bill, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className={`text-slate-400 ${bill.paid ? 'text-emerald-500' : ''}`}>
                        {bill.paid ? <CheckCircle size={18} /> : <Circle size={18} />}
                    </div>
                    <div>
                        <p className={`text-sm font-medium ${bill.paid ? 'text-slate-500 line-through' : 'text-white'}`}>
                            {bill.name}
                        </p>
                        <p className="text-[10px] text-slate-500">{bill.category}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-slate-300">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bill.amount)}
                    </p>
                    {!bill.paid && <span className="text-[10px] text-rose-400 flex items-center justify-end gap-1"><AlertCircle size={8} /> Pendente</span>}
                </div>
            </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between text-xs text-slate-400">
        <span>Total Fixo</span>
        <span className="text-white font-bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(uniqueBills.reduce((acc, curr) => acc + curr.amount, 0))}
        </span>
      </div>
    </div>
  );
};

export default FixedExpensesList;
