
import React, { useState } from 'react';
import { X, Users, Copy, Link, CheckCircle, Lock } from 'lucide-react';
import { PartnerConfig } from '../types';

interface PartnerConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (config: PartnerConfig) => void;
}

const PartnerConnectModal: React.FC<PartnerConnectModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [tab, setTab] = useState<'generate' | 'enter'>('generate');
  const [myCode] = useState('WLS-' + Math.random().toString(36).substr(2, 6).toUpperCase());
  const [inputCode, setInputCode] = useState('');
  
  const [permissions, setPermissions] = useState({
      shareNetWorth: true,
      shareTransactions: false,
      shareGoals: true
  });

  if (!isOpen) return null;

  const handleConfirm = () => {
      onConnect({
          isConnected: true,
          partnerName: "Parceiro (Simulado)",
          permissions
      });
      onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users size={20} className="text-blue-400" />
            Conexão de Casal
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
            <div className="flex bg-slate-900 rounded-lg p-1 mb-6">
                <button 
                    onClick={() => setTab('generate')}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === 'generate' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Meu Código
                </button>
                <button 
                    onClick={() => setTab('enter')}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === 'enter' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Inserir Código
                </button>
            </div>

            {tab === 'generate' ? (
                <div className="text-center space-y-4">
                    <p className="text-slate-400 text-sm">Compartilhe este código com seu parceiro(a) para unificar as visões financeiras.</p>
                    <div className="bg-slate-900 border border-dashed border-slate-600 p-4 rounded-xl flex justify-between items-center">
                        <span className="text-2xl font-mono font-bold text-white tracking-widest">{myCode}</span>
                        <button className="text-blue-400 hover:text-blue-300 transition-colors">
                            <Copy size={20} />
                        </button>
                    </div>
                    <div className="bg-blue-500/10 p-3 rounded-lg flex items-center gap-2 text-xs text-blue-300 text-left">
                        <Lock size={14} />
                        O código expira em 24 horas.
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                     <div>
                         <label className="text-xs font-medium text-slate-400">Código do Parceiro</label>
                         <input 
                            type="text"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                            placeholder="WLS-XXXXXX"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white font-mono focus:ring-2 focus:ring-blue-500/50 outline-none mt-1"
                         />
                     </div>
                </div>
            )}

            {/* Permissions Section */}
            <div className="mt-8 pt-6 border-t border-slate-700">
                <h3 className="text-sm font-semibold text-white mb-3">Permissões de Visualização</h3>
                <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-900 transition-colors">
                        <span className="text-sm text-slate-300">Compartilhar Patrimônio Total</span>
                        <input 
                            type="checkbox" 
                            checked={permissions.shareNetWorth} 
                            onChange={(e) => setPermissions({...permissions, shareNetWorth: e.target.checked})}
                            className="accent-blue-500" 
                        />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-900 transition-colors">
                        <span className="text-sm text-slate-300">Compartilhar Objetivos</span>
                        <input 
                            type="checkbox" 
                            checked={permissions.shareGoals} 
                            onChange={(e) => setPermissions({...permissions, shareGoals: e.target.checked})}
                            className="accent-blue-500" 
                        />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-900 transition-colors">
                        <span className="text-sm text-slate-300">Ver Transações Detalhadas</span>
                        <input 
                            type="checkbox" 
                            checked={permissions.shareTransactions} 
                            onChange={(e) => setPermissions({...permissions, shareTransactions: e.target.checked})}
                            className="accent-blue-500" 
                        />
                    </label>
                </div>
            </div>

            <button 
                onClick={handleConfirm}
                disabled={tab === 'enter' && inputCode.length < 5}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Link size={18} /> Conectar Perfis
            </button>

        </div>
      </div>
    </div>
  );
};

export default PartnerConnectModal;
