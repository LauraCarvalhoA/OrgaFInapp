
import React, { useState } from 'react';
import { X, Upload, FileText, Check, Loader2, AlertCircle } from 'lucide-react';
import { analyzeBankStatement } from '../services/geminiService';
import { StatementItem } from '../types';

interface StatementUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (transactions: StatementItem[]) => void;
}

const StatementUploadModal: React.FC<StatementUploadModalProps> = ({ isOpen, onClose, onImport }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewData, setPreviewData] = useState<StatementItem[]>([]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError('');
    setPreviewData([]);

    try {
      // Convert to Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        try {
            const data = await analyzeBankStatement(base64String);
            setPreviewData(data);
        } catch (err) {
            setError("Não foi possível ler o extrato. Tente uma imagem mais clara.");
        } finally {
            setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Erro ao processar arquivo.");
      setIsAnalyzing(false);
    }
  };

  const handleConfirmImport = () => {
      onImport(previewData);
      onClose();
      setPreviewData([]);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-800/50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            Importar Extrato (IA)
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {!previewData.length ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-2xl p-10 bg-slate-800/20">
               {isAnalyzing ? (
                   <div className="text-center">
                       <Loader2 size={48} className="text-primary animate-spin mx-auto mb-4" />
                       <p className="text-slate-300 font-medium">Analisando transações...</p>
                       <p className="text-xs text-slate-500 mt-2">A IA está lendo datas, valores e categorias.</p>
                   </div>
               ) : (
                   <label className="cursor-pointer text-center group">
                       <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-700 transition-colors">
                           <Upload size={32} className="text-slate-400 group-hover:text-white" />
                       </div>
                       <h3 className="text-lg font-bold text-white mb-2">Envie seu Extrato</h3>
                       <p className="text-slate-400 text-sm max-w-xs mx-auto mb-4">
                           Faça upload de uma <b>imagem (Print/Foto)</b> do seu extrato bancário.
                       </p>
                       <span className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                           Selecionar Imagem
                       </span>
                       <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                   </label>
               )}
               {error && (
                   <div className="mt-4 flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg">
                       <AlertCircle size={16} /> {error}
                   </div>
               )}
            </div>
          ) : (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <p className="text-slate-400 text-sm">Foram encontradas <b>{previewData.length}</b> transações.</p>
                    <button onClick={() => setPreviewData([])} className="text-xs text-rose-400 hover:text-rose-300">Descartar</button>
                </div>
                
                <div className="border border-slate-700 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800 text-slate-400">
                            <tr>
                                <th className="p-3">Data</th>
                                <th className="p-3">Descrição</th>
                                <th className="p-3">Categoria</th>
                                <th className="p-3 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {previewData.map((item, i) => (
                                <tr key={i} className="hover:bg-slate-800/30">
                                    <td className="p-3 text-slate-300 whitespace-nowrap">{item.date}</td>
                                    <td className="p-3 text-white font-medium">{item.description}</td>
                                    <td className="p-3 text-slate-400 text-xs">{item.category}</td>
                                    <td className={`p-3 text-right font-bold ${item.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {item.amount > 0 ? '+' : ''}{item.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button 
                    onClick={handleConfirmImport}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg"
                >
                    <Check size={20} /> Confirmar Importação
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatementUploadModal;
