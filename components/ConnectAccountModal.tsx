
import React, { useState } from 'react';
import { X, Building, CheckCircle, Wallet, ArrowLeft, DollarSign, CreditCard, Landmark } from 'lucide-react';
import { MOCK_INSTITUTIONS } from '../constants';
import { AccountType } from '../types';

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (institution: string, initialBalance: number, type: AccountType, name: string) => void;
}

const ConnectAccountModal: React.FC<ConnectAccountModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [step, setStep] = useState<'select' | 'details'>('select');
  const [selectedBank, setSelectedBank] = useState('');
  
  // Form State
  const [customName, setCustomName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>(AccountType.CHECKING);
  const [initialBalance, setInitialBalance] = useState('');

  if (!isOpen) return null;

  const handleSelectBank = (bank: string) => {
    setSelectedBank(bank);
    setCustomName(bank); // Default name
    setStep('details');
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceValue = initialBalance ? parseFloat(initialBalance) : 0;
    onConnect(selectedBank, balanceValue, accountType, customName);
    
    // Reset state after closing
    setTimeout(() => {
      setStep('select');
      setSelectedBank('');
      setCustomName('');
      setInitialBalance('');
      setAccountType(AccountType.CHECKING);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
             {step === 'details' && (
                 <button onClick={() => setStep('select')} className="mr-2 text-slate-400 hover:text-white transition-colors">
                     <ArrowLeft size={20} />
                 </button>
             )}
             {step === 'select' ? 'Adicionar Conta' : 'Detalhes da Conta'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {step === 'select' && (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">Escolha a instituição ou crie uma personalizada.</p>
              <div className="grid grid-cols-1 gap-2">
                {MOCK_INSTITUTIONS.map(bank => (
                  <button 
                    key={bank}
                    onClick={() => handleSelectBank(bank)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-300 group-hover:text-white group-hover:scale-110 transition-all">
                      <Building size={18} />
                    </div>
                    <span className="font-medium text-slate-200">{bank}</span>
                  </button>
                ))}
                <button 
                    onClick={() => handleSelectBank('Outro')}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 border border-dashed border-slate-600 hover:border-slate-500 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:scale-110 transition-all">
                      <Wallet size={18} />
                    </div>
                    <span className="font-medium text-slate-400 group-hover:text-slate-200">Outra Instituição / Carteira</span>
                  </button>
              </div>
            </div>
          )}

          {step === 'details' && (
            <form onSubmit={handleFinish} className="space-y-6">
               <div className="flex flex-col items-center mb-6">
                 <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-3">
                   <Building size={32} />
                 </div>
                 <p className="text-center text-slate-300 text-sm">
                   Configurando conta em <b>{selectedBank}</b>
                 </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nome da Conta (Apelido)</label>
                <input 
                    type="text" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    required
                />
              </div>

              <div>
                 <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Conta</label>
                 <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => setAccountType(AccountType.CHECKING)} className={`p-2 rounded-lg border text-xs ${accountType === AccountType.CHECKING ? 'bg-primary/20 border-primary text-white' : 'border-slate-700 text-slate-400'}`}>Corrente</button>
                    <button type="button" onClick={() => setAccountType(AccountType.SAVINGS)} className={`p-2 rounded-lg border text-xs ${accountType === AccountType.SAVINGS ? 'bg-primary/20 border-primary text-white' : 'border-slate-700 text-slate-400'}`}>Poupança</button>
                    <button type="button" onClick={() => setAccountType(AccountType.CREDIT)} className={`p-2 rounded-lg border text-xs ${accountType === AccountType.CREDIT ? 'bg-primary/20 border-primary text-white' : 'border-slate-700 text-slate-400'}`}>Crédito</button>
                 </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                    {accountType === AccountType.CREDIT ? 'Fatura Atual (Valor gasto)' : 'Saldo Inicial (R$)'}
                </label>
                <input 
                    type="number" 
                    step="0.01"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-white text-xl font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none"
                    required
                />
                {accountType === AccountType.CREDIT && (
                     <p className="text-[10px] text-slate-500 mt-1">Para cartões de crédito, insira o valor negativo se houver dívida, ou o valor da fatura atual.</p>
                )}
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
              >
                Salvar Conta
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectAccountModal;
