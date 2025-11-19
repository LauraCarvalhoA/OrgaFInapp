
import React, { useState, useEffect } from 'react';
import { X, PlusCircle, MinusCircle, Calendar, CreditCard, Repeat, ArrowRightLeft, Users } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Account, AccountOwner, AccountType } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: any) => void;
  accounts: Account[];
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onSave, accounts }) => {
  const [mode, setMode] = useState<'expense' | 'income' | 'transfer'>('expense');
  
  // Common
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [owner, setOwner] = useState<AccountOwner>('me');
  
  // Transaction Specific
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [accountId, setAccountId] = useState('');
  
  // Recurrence / Installments
  const [isRecurring, setIsRecurring] = useState(false);
  const [installments, setInstallments] = useState('1');

  // Transfer Specific
  const [toAccountId, setToAccountId] = useState('');

  // Set default account on load
  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
        const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];
        setAccountId(defaultAcc.id);
        // Find different account for transfer target
        const other = accounts.find(a => a.id !== defaultAcc.id);
        if (other) setToAccountId(other.id);
    }
  }, [accounts, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const numAmount = parseFloat(amount);
    const numInstallments = parseInt(installments);

    if (mode === 'transfer') {
        if (accountId === toAccountId) return; // Cannot transfer to self
        onSave({
            mode: 'transfer',
            amount: numAmount,
            fromAccountId: accountId,
            toAccountId: toAccountId,
            date,
            owner
        });
    } else {
        // Normal transaction (Expense/Income)
        const finalAmount = mode === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount);
        
        onSave({
            mode: 'transaction',
            amount: finalAmount,
            merchant: description,
            category: mode === 'income' ? 'Renda' : category,
            accountId,
            date,
            status: 'completed',
            owner,
            isRecurring: isRecurring && mode === 'expense',
            installments: mode === 'expense' && numInstallments > 1 ? numInstallments : undefined
        });
    }
      
    // Reset
    setAmount('');
    setDescription('');
    setInstallments('1');
    setIsRecurring(false);
    onClose();
  };

  const selectedAccount = accounts.find(a => a.id === accountId);
  const isCreditCard = selectedAccount?.type === AccountType.CREDIT;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            Nova Movimentação
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Mode Toggle */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('expense')}
              className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all ${
                mode === 'expense' ? 'bg-rose-500/20 text-rose-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MinusCircle size={14} /> Despesa
            </button>
            <button
              type="button"
              onClick={() => setMode('income')}
              className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all ${
                mode === 'income' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle size={14} /> Receita
            </button>
            <button
              type="button"
              onClick={() => setMode('transfer')}
              className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all ${
                mode === 'transfer' ? 'bg-blue-500/20 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowRightLeft size={14} /> Transf.
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Valor (R$)</label>
            <input 
              type="number" 
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-lg font-semibold focus:ring-2 focus:ring-primary/50 outline-none"
              required
              autoFocus
            />
          </div>

          {/* Transfer Specific UI */}
          {mode === 'transfer' ? (
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">De (Sai dinheiro)</label>
                    <select 
                        value={accountId} 
                        onChange={(e) => setAccountId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary/50 outline-none text-xs"
                    >
                        {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Para (Entra dinheiro)</label>
                    <select 
                        value={toAccountId} 
                        onChange={(e) => setToAccountId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary/50 outline-none text-xs"
                    >
                        {accounts.filter(a => a.id !== accountId).map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                    </select>
                 </div>
            </div>
          ) : (
            <>
            {/* Expense/Income Common Fields */}
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Descrição</label>
                <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={mode === 'expense' ? "Ex: Padaria, Uber..." : "Ex: Salário..."}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                required
                />
            </div>

            {mode === 'expense' && (
                <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Categoria</label>
                <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                >
                    {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                    <CreditCard size={12} /> Conta
                </label>
                <select 
                    value={accountId} 
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary/50 outline-none text-xs"
                >
                    {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                </select>
                </div>

                <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                    <Calendar size={12} /> Data
                </label>
                <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary/50 outline-none text-xs"
                />
                </div>
            </div>

            {/* Credit Card / Recurring Options */}
            {mode === 'expense' && (
                 <div className="grid grid-cols-2 gap-4 p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    {/* Installments (Only visible if credit card) */}
                    {isCreditCard ? (
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Parcelas</label>
                            <select 
                                value={installments}
                                onChange={(e) => setInstallments(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm"
                            >
                                <option value="1">À vista (1x)</option>
                                {[2,3,4,5,6,10,12,18,24].map(n => (
                                    <option key={n} value={n}>{n}x</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        /* If not credit card, can be recurring */
                        <div className="flex items-center">
                           <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isRecurring ? 'bg-primary border-primary' : 'border-slate-600 bg-slate-800'}`}>
                                    {isRecurring && <Repeat size={12} className="text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
                                <span className="text-xs text-slate-300 group-hover:text-white">Despesa Fixa Mensal</span>
                           </label>
                        </div>
                    )}

                     {/* Owner Selector */}
                     <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Responsável</label>
                        <div className="flex bg-slate-800 rounded-lg p-1">
                            <button 
                                type="button"
                                onClick={() => setOwner('me')}
                                className={`flex-1 py-1 text-xs rounded ${owner === 'me' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                            >
                                Eu
                            </button>
                            <button 
                                type="button"
                                onClick={() => setOwner('partner')}
                                className={`flex-1 py-1 text-xs rounded ${owner === 'partner' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                            >
                                Par
                            </button>
                        </div>
                     </div>
                 </div>
            )}
            </>
          )}

          <button 
            type="submit"
            className={`w-full font-medium py-3 rounded-lg transition-colors mt-2 text-white shadow-lg ${
              mode === 'expense' ? 'bg-rose-600 hover:bg-rose-700' : 
              mode === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 
              'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {mode === 'expense' ? 'Registrar Despesa' : mode === 'income' ? 'Registrar Receita' : 'Realizar Transferência'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
