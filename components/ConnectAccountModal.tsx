import React, { useState } from 'react';
import { X, Building, CheckCircle, Loader2, ShieldCheck, Lock, Plus, ArrowLeft } from 'lucide-react';
import { MOCK_INSTITUTIONS } from '../constants';

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (institution: string) => void;
}

const ConnectAccountModal: React.FC<ConnectAccountModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [step, setStep] = useState<'select' | 'custom' | 'login' | 'success'>('select');
  const [selectedBank, setSelectedBank] = useState('');
  const [customBankName, setCustomBankName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelectBank = (bank: string) => {
    setSelectedBank(bank);
    setStep('login');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customBankName.trim()) {
      setSelectedBank(customBankName.trim());
      setStep('login');
    }
  };

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
    }, 1500);
  };

  const handleFinish = () => {
    onConnect(selectedBank);
    // Reset state after closing
    setTimeout(() => {
      setStep('select');
      setSelectedBank('');
      setCustomBankName('');
    }, 300);
  };

  const handleBack = () => {
      setStep('select');
      setCustomBankName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
             {step === 'custom' && (
                 <button onClick={handleBack} className="mr-2 text-slate-400 hover:text-white transition-colors">
                     <ArrowLeft size={20} />
                 </button>
             )}
             {step === 'select' && 'Conectar conta'}
             {step === 'custom' && 'Outra Instituição'}
             {step === 'login' && `Acessar ${selectedBank}`}
             {step === 'success' && 'Sucesso'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {step === 'select' && (
            <div className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-500/20 p-3 rounded-lg flex items-center gap-3">
                <ShieldCheck className="text-blue-400 shrink-0" size={24} />
                <div>
                  <p className="text-xs font-semibold text-blue-300">Ambiente Seguro</p>
                  <p className="text-[10px] text-blue-200/70">Seus dados são criptografados e protegidos (LGPD).</p>
                </div>
              </div>
              
              <p className="text-slate-400 text-sm">Selecione sua instituição financeira para sincronizar seus dados.</p>
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
                    onClick={() => setStep('custom')}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700 border border-dashed border-slate-600 hover:border-slate-500 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:scale-110 transition-all">
                      <Plus size={18} />
                    </div>
                    <span className="font-medium text-slate-400 group-hover:text-slate-200">Outra Instituição</span>
                  </button>
              </div>
            </div>
          )}

          {step === 'custom' && (
              <form onSubmit={handleCustomSubmit} className="space-y-6">
                  <div className="flex flex-col items-center mb-4">
                     <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center text-slate-400 mb-3">
                       <Building size={32} />
                     </div>
                     <p className="text-center text-slate-300 text-sm">
                       Digite o nome do banco ou corretora que você deseja conectar.
                     </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Nome da Instituição</label>
                    <input 
                        type="text" 
                        value={customBankName}
                        onChange={(e) => setCustomBankName(e.target.value)}
                        placeholder="Ex: Banco Safra, Nomad..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                        autoFocus
                        required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors"
                  >
                    Continuar
                  </button>
              </form>
          )}

          {step === 'login' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                 <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-3">
                   <Lock size={32} />
                 </div>
                 <p className="text-center text-slate-300 text-sm">
                   Insira suas credenciais do <span className="font-bold text-white">{selectedBank}</span>.
                   <br/>Conexão criptografada ponta a ponta.
                 </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">CPF / Usuário</label>
                  <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Senha eletrônica</label>
                  <input type="password" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
              </div>

              <button 
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Conectar com Segurança'}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Conta Conectada!</h3>
              <p className="text-slate-400 mb-6">
                Sua conta {selectedBank} foi sincronizada com sucesso. Estamos analisando seu histórico.
              </p>
              <button 
                onClick={handleFinish}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Ir para o Dashboard
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {step !== 'success' && step !== 'custom' && (
           <div className="bg-slate-900/50 p-3 text-center border-t border-slate-700 flex justify-center gap-4 items-center">
             <div className="flex items-center gap-1 text-[10px] text-slate-500">
               <Lock size={10} />
               <span>AES-256 Encryption</span>
             </div>
             <div className="flex items-center gap-1 text-[10px] text-slate-500">
               <ShieldCheck size={10} />
               <span>LGPD Compliant</span>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default ConnectAccountModal;