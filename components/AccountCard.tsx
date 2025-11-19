
import React, { useState } from 'react';
import { CreditCard, Landmark, TrendingUp, Wallet, Edit2, Check, X, Users, User } from 'lucide-react';
import { Account, AccountType } from '../types';

interface AccountCardProps {
  account: Account;
  onUpdateBalance: (id: string, newBalance: number) => void;
  onPayBill?: (accountId: string) => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, onUpdateBalance, onPayBill }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(account.balance.toString());

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatPercent = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 0 }).format(val);

  const handleSave = () => {
    const num = parseFloat(editValue);
    if (!isNaN(num)) {
      onUpdateBalance(account.id, num);
      setIsEditing(false);
    }
  };

  // Logic for Credit Card
  const isCredit = account.type === AccountType.CREDIT;
  const limit = account.creditLimit || 0;
  const used = Math.abs(account.balance);
  const available = limit - used;
  const usagePercent = limit > 0 ? (used / limit) : 0;

  return (
    <div className="bg-card border border-slate-700 p-5 rounded-xl flex flex-col justify-between group relative overflow-hidden h-full min-h-[160px]">
      {/* Institution Color Bar */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${account.color || 'bg-slate-500'}`}></div>
      
      {/* Header */}
      <div className="flex justify-between items-start pl-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{account.institution}</p>
            {account.owner === 'partner' && (
              <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[10px] flex items-center gap-1 font-bold">
                <Users size={8} /> Par
              </span>
            )}
            {account.owner === 'me' && (
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center gap-1 font-bold">
                <User size={8} /> Eu
              </span>
            )}
          </div>
          <p className="text-white font-semibold truncate max-w-[150px]" title={account.name}>{account.name}</p>
        </div>
        <div className="bg-slate-800 p-1.5 rounded-lg text-slate-400">
          {isCredit ? <CreditCard size={16} /> : 
           account.type === AccountType.INVESTMENT ? <TrendingUp size={16} /> : <Landmark size={16} />}
        </div>
      </div>

      {/* Balance Area */}
      <div className="pl-3 flex-1 flex flex-col justify-end">
        {isEditing ? (
           <div className="flex items-center gap-2 mb-1">
             <input 
               type="number" 
               value={editValue}
               onChange={(e) => setEditValue(e.target.value)}
               className="bg-slate-900 border border-slate-600 text-white text-lg font-bold rounded px-2 py-1 w-full outline-none focus:border-primary"
               autoFocus
             />
             <button onClick={handleSave} className="p-1.5 bg-emerald-600 rounded hover:bg-emerald-500 text-white"><Check size={14}/></button>
             <button onClick={() => setIsEditing(false)} className="p-1.5 bg-slate-700 rounded hover:bg-slate-600 text-slate-300"><X size={14}/></button>
           </div>
        ) : (
           <div className="group/balance flex items-center gap-2 cursor-pointer" onClick={() => setIsEditing(true)}>
             <p className={`text-2xl font-bold ${isCredit ? (account.balance < 0 ? 'text-rose-400' : 'text-emerald-400') : 'text-white'}`}>
               {formatBRL(account.balance)}
             </p>
             <Edit2 size={12} className="text-slate-600 opacity-0 group-hover/balance:opacity-100 transition-opacity" />
           </div>
        )}
        
        <p className="text-[10px] text-slate-500 mt-1">
          {isCredit ? 'Fatura Atual' : 'Saldo Disponível'}
        </p>
      </div>

      {/* Credit Card Specifics */}
      {isCredit && (
        <div className="pl-3 mt-4 pt-3 border-t border-slate-700/50">
           <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Usado: {formatPercent(usagePercent)}</span>
              <span>Disp: {formatBRL(available)}</span>
           </div>
           <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
             <div className={`h-full ${usagePercent > 0.9 ? 'bg-rose-500' : 'bg-primary'}`} style={{ width: `${Math.min(usagePercent * 100, 100)}%` }}></div>
           </div>
           {account.balance < 0 && onPayBill && (
             <button 
               onClick={() => onPayBill(account.id)}
               className="w-full mt-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-all"
             >
               Pagar Fatura
             </button>
           )}
        </div>
      )}
    </div>
  );
};

export default AccountCard;
