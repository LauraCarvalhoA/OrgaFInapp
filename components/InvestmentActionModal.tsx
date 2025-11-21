
import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Account, Investment } from '../types';

interface InvestmentActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'CONTRIBUTE' | 'REDEEM' | null;
  investment: Investment | null;
  accounts: Account[];
  onConfirm: (data: any) => void;
}

const InvestmentActionModal: React.FC<InvestmentActionModalProps> = ({ isOpen, onClose, actionType, investment, accounts, onConfirm }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAccount, setSelectedAccount] = useState('');
  
  // FII Specific
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  if (!isOpen || !investment || !actionType) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onConfirm({
        investmentId: investment.id,
        type: actionType,
        amount: parseFloat(amount) || 0,
        date,
        accountId: selectedAccount,
        quantity: quantity ? parseInt(quantity) : undefined,
        price: price ? parseFloat(price) : undefined
    });

    // Reset
    setAmount('');
    setSelectedAccount('');
    setQuantity('');
    setPrice('');
    onClose();
  };

  const isFII = investment.type === 'FII';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            {actionType === 'CONTRIBUTE' ? <TrendingUp className="text-emerald-500" size={20} /> : <TrendingDown className="text-rose-500" size={20} />}
            {actionType === 'CONTRIBUTE' ? 'Novo Aporte' : 'Resgatar Investimento'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 bg-slate-900/50 border-b border-slate-700">
            <p className="text-xs text-slate-400 uppercase font-bold">Ativo Selecionado</p>
            <p className="text-white font-bold text-lg">{investment.ticker || investment.name}</p>
            <p className="text-sm text-slate-400">Saldo Atual: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(investment.currentValue)}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {isFII && actionType === 'CONTRIBUTE' ? (
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Quantidade</label>
                      <input 
                        type="number" 
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                        required
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Preço Pago (Unit.)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
                        required
                      />
                  </div>
              </div>
          ) : (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Valor {actionType === 'CONTRIBUTE' ? 'do Aporte' : 'do Resgate'} (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-xl font-bold focus:ring-2 focus:ring-primary/50 outline-none"
                  required
                />
              </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
                {actionType === 'CONTRIBUTE' ? 'Origem do Dinheiro (Opcional)' : 'Conta de Destino (Obrigatório)'}
            </label>
            <select 
                value={selectedAccount} 
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary/50 outline-none text-sm"
                required={actionType === 'REDEEM'}
            >
                <option value="">{actionType === 'CONTRIBUTE' ? 'Sem conta vinculada' : 'Selecione uma conta...'}</option>
                {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} (Saldo: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.balance)})</option>
                ))}
            </select>
            {actionType === 'REDEEM' && <p className="text-[10px] text-emerald-400 mt-1">O valor será somado ao saldo desta conta.</p>}
            {actionType === 'CONTRIBUTE' && selectedAccount && <p className="text-[10px] text-rose-400 mt-1">O valor será descontado desta conta.</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Data</label>
            <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary/50 outline-none text-sm"
            />
          </div>

          <button 
            type="submit"
            className={`w-full font-medium py-3 rounded-lg transition-colors mt-2 shadow-lg text-white flex items-center justify-center gap-2 ${
                actionType === 'CONTRIBUTE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            Confirmar {actionType === 'CONTRIBUTE' ? 'Aporte' : 'Resgate'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default InvestmentActionModal;
