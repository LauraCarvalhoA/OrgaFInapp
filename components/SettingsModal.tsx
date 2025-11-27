
import React, { useState, useEffect } from 'react';
import { X, Key, Save, ShieldCheck, Database } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDataManagement: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onOpenDataManagement }) => {
  const [apiKey, setApiKey] = useState('');
  
  useEffect(() => {
      if(isOpen) {
          const stored = localStorage.getItem('user_api_key');
          if(stored) setApiKey(stored);
      }
  }, [isOpen]);

  const handleSave = () => {
      if(apiKey.trim()) {
          localStorage.setItem('user_api_key', apiKey.trim());
          alert("Chave salva! Recarregue a página para aplicar.");
          onClose();
          window.location.reload();
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <SettingsIcon size={20} className="text-slate-400" />
            Configurações
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
           
           {/* API Key Section */}
           <div>
               <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                   <Key size={16} className="text-primary" /> Google Gemini API Key
               </label>
               <div className="relative">
                   <input 
                       type="password" 
                       value={apiKey}
                       onChange={(e) => setApiKey(e.target.value)}
                       placeholder="Cole sua chave AI Studio aqui..."
                       className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary/50 outline-none pr-10"
                   />
               </div>
               <p className="text-xs text-slate-500 mt-2">
                   Necessário para AI Advisor, Análise de Extratos e Objetivos. 
                   <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline ml-1">Obter chave grátis.</a>
               </p>
               <button 
                onClick={handleSave}
                className="mt-3 w-full bg-slate-700 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
               >
                   <Save size={16} /> Salvar Chave
               </button>
           </div>

           <div className="border-t border-slate-700 pt-6">
                <h3 className="text-sm font-medium text-white mb-3">Dados & Sincronização</h3>
                <button 
                    onClick={() => { onClose(); onOpenDataManagement(); }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                >
                    <Database size={18} /> Backup & Restaurar
                </button>
                <p className="text-[10px] text-slate-500 mt-2 text-center">Use para transferir dados entre Computador e Celular.</p>
           </div>

        </div>
      </div>
    </div>
  );
};

const SettingsIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

export default SettingsModal;
