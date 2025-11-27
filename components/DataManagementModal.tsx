
import React, { useRef, useState } from 'react';
import { X, Download, Upload, Database, AlertTriangle, CheckCircle } from 'lucide-react';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: any;
  onImport: (data: any) => void;
}

const DataManagementModal: React.FC<DataManagementModalProps> = ({ isOpen, onClose, currentData, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleExport = () => {
    const dataStr = JSON.stringify(currentData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `wealthwise_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation
        if (json.accounts || json.userProfile) {
            onImport(json);
            setImportStatus('success');
            setTimeout(() => {
                setImportStatus('idle');
                onClose();
            }, 1500);
        } else {
            setImportStatus('error');
        }
      } catch (err) {
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database size={20} className="text-primary" />
            Gerenciar Dados
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
           <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
               <h4 className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2">
                   <AlertTriangle size={16} /> Sincronização Manual
               </h4>
               <p className="text-xs text-slate-300 leading-relaxed">
                   Como este app roda no seu navegador (sem servidor central para privacidade), para mover seus dados do <b>Computador</b> para o <b>Celular</b> (ou vice-versa), você precisa exportar o arquivo e importar no outro dispositivo.
               </p>
           </div>

           <div className="grid grid-cols-1 gap-4">
               <button 
                   onClick={handleExport}
                   className="flex items-center justify-between p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all group"
               >
                   <div className="text-left">
                       <h4 className="text-white font-bold">Exportar Backup</h4>
                       <p className="text-xs text-slate-400">Baixar arquivo .json com tudo.</p>
                   </div>
                   <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                       <Download size={20} />
                   </div>
               </button>

               <button 
                   onClick={handleImportClick}
                   className="flex items-center justify-between p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all group"
               >
                   <div className="text-left">
                       <h4 className="text-white font-bold">Restaurar Dados</h4>
                       <p className="text-xs text-slate-400">Carregar arquivo .json de backup.</p>
                   </div>
                   <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                       <Upload size={20} />
                   </div>
               </button>
               <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleFileChange} 
                   accept=".json" 
                   className="hidden" 
                />
           </div>

           {importStatus === 'success' && (
               <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold bg-emerald-500/20 p-3 rounded-lg">
                   <CheckCircle size={18} /> Dados restaurados com sucesso!
               </div>
           )}
           {importStatus === 'error' && (
               <div className="flex items-center justify-center gap-2 text-rose-400 font-bold bg-rose-500/20 p-3 rounded-lg">
                   <AlertTriangle size={18} /> Arquivo inválido.
               </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default DataManagementModal;
