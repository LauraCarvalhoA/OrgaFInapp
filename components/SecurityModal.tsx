import React from 'react';
import { X, ShieldCheck, Lock, Server, FileText, CheckCircle, AlertTriangle, EyeOff } from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const requirements = [
    {
      title: "Criptografia AES-256",
      desc: "Dados sensíveis criptografados em repouso no banco de dados.",
      status: "active",
      icon: <Lock size={18} />
    },
    {
      title: "Conexão mTLS",
      desc: "Autenticação mútua via certificado digital entre servidores.",
      status: "active",
      icon: <Server size={18} />
    },
    {
      title: "Conformidade LGPD",
      desc: "Os dados pertencem ao usuário e podem ser revogados a qualquer momento.",
      status: "active",
      icon: <FileText size={18} />
    },
    {
      title: "Open Finance API",
      desc: "Integração via parceiro homologado pelo Bacen (ex: Pluggy/Belvo).",
      status: "pending",
      icon: <ShieldCheck size={18} />
    },
    {
      title: "Auditoria de Acesso",
      desc: "Logs imutáveis de quem acessou quais dados e quando.",
      status: "active",
      icon: <EyeOff size={18} />
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" size={24} />
              Central de Segurança
            </h2>
            <p className="text-slate-400 text-sm mt-1">Arquitetura de conformidade com o Banco Central</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Main Status Card */}
          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-500 shrink-0">
              <CheckCircle size={24} />
            </div>
            <div>
              <h3 className="text-emerald-400 font-bold text-lg">Ambiente Seguro</h3>
              <p className="text-emerald-200/70 text-sm mt-1">
                Esta aplicação utiliza práticas de segurança de nível bancário para proteger suas informações financeiras. 
                Nenhuma senha bancária é armazenada em nossos servidores.
              </p>
            </div>
          </div>

          {/* Requirements Grid */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              Protocolos Ativos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {requirements.map((req, idx) => (
                <div key={idx} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl hover:bg-slate-800 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div className={`p-2 rounded-lg ${req.status === 'active' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {req.icon}
                    </div>
                    {req.status === 'active' ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">Ativo</span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">Simulado</span>
                    )}
                  </div>
                  <h4 className="text-slate-200 font-medium text-sm">{req.title}</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">{req.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Regulatory Note */}
          <div className="border-t border-slate-800 pt-6">
             <h4 className="text-slate-300 font-medium text-sm mb-2">Nota sobre Integração Real (Bacen)</h4>
             <div className="text-xs text-slate-500 space-y-2 bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono">
                <p>Para operar em produção no Brasil, este aplicativo se conectaria via API a um <strong>Iniciador de Transação de Pagamento (ITP)</strong> ou Agregador autorizado.</p>
                <p className="text-slate-400">Fluxo de Dados:</p>
                <p>App {'>'} API Gateway (mTLS) {'>'} Parceiro Open Finance (Pluggy/Belvo) {'>'} Instituição Financeira (Itaú/Nubank)</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SecurityModal;