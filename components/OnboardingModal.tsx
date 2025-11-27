
import React, { useState } from 'react';
import { ArrowRight, User, GraduationCap, Shield, Target, TrendingUp, Wallet, AlertCircle, DollarSign } from 'lucide-react';
import { UserProfile, KnowledgeLevel, Goal, GoalType } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile, goals: Goal[]) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  
  // Core Profile Data
  const [name, setName] = useState('');
  const [knowledge, setKnowledge] = useState<KnowledgeLevel>('BEGINNER');
  
  // Goal Selection
  const [selectedGoalType, setSelectedGoalType] = useState<GoalType | null>(null);
  
  // Dynamic Detail Data (depending on goal)
  const [totalDebt, setTotalDebt] = useState(''); 
  const [liquidAssets, setLiquidAssets] = useState(''); 
  
  if (!isOpen) return null;

  const handleFinish = () => {
      const profile: UserProfile = {
          name,
          knowledgeLevel: knowledge,
          monthlyIncome: 0,
          liquidAssets: liquidAssets ? parseFloat(liquidAssets) : 0,
          totalDebt: totalDebt ? parseFloat(totalDebt) : 0,
          partnerConfig: { isConnected: false, permissions: { shareGoals: false, shareNetWorth: false, shareTransactions: false } }
      };

      // Create generic initial goal based on selection
      const initialGoals: Goal[] = [];
      if (selectedGoalType) {
          let title = "Meu Objetivo Principal";
          let target = 0; // Placeholder, user can edit later

          if (selectedGoalType === 'RETIREMENT') {
              title = "Viver de Renda";
              target = 1000000; // Generic target
          } else if (selectedGoalType === 'PURCHASE') {
              title = "Realizar Sonho (Casa/Carro)";
              target = 50000;
          } else if (selectedGoalType === 'DEBT_PAYOFF') {
              title = "Sair das Dívidas";
              target = parseFloat(totalDebt) || 5000;
          } else if (selectedGoalType === 'EMERGENCY_FUND') {
              title = "Reserva de Emergência";
              target = 15000; 
          }

          initialGoals.push({
              id: `goal_init_${Date.now()}`,
              title,
              type: selectedGoalType,
              targetAmount: target,
              currentAmount: selectedGoalType === 'EMERGENCY_FUND' ? (parseFloat(liquidAssets) || 0) : 0,
          });
      }

      onComplete(profile, initialGoals);
  };

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950 p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col relative min-h-[500px]">
        
        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-800 absolute top-0 left-0">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="p-8 flex-1 flex flex-col justify-center">
          
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="animate-fade-in space-y-6">
              <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-4">
                <User size={32} />
              </div>
              <h2 className="text-3xl font-bold text-white">Olá! Bem-vindo.</h2>
              <p className="text-slate-400 text-lg">O WealthWise é seu organizador financeiro pessoal. Como devemos te chamar?</p>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full bg-transparent border-b-2 border-slate-700 text-2xl text-white py-2 focus:border-primary outline-none placeholder-slate-600 transition-colors"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && name && setStep(2)}
              />
            </div>
          )}

          {/* Step 2: Knowledge */}
          {step === 2 && (
            <div className="animate-fade-in space-y-6">
               <div className="w-16 h-16 bg-purple-500/20 text-purple-500 rounded-2xl flex items-center justify-center mb-4">
                 <GraduationCap size={32} />
               </div>
               <h2 className="text-2xl font-bold text-white">Nível de Experiência</h2>
               <p className="text-slate-400">Para adaptarmos a linguagem, como você se avalia?</p>

               <div className="grid grid-cols-1 gap-3">
                   {[
                       { id: 'BEGINNER', label: 'Iniciante', desc: 'Estou aprendendo a organizar e poupar.' },
                       { id: 'INTERMEDIATE', label: 'Intermediário', desc: 'Já conheço CDBs, FIIs e quero diversificar.' },
                       { id: 'ADVANCED', label: 'Avançado', desc: 'Invisto em ações, exterior e busco performance.' }
                   ].map((level) => (
                       <button
                         key={level.id}
                         onClick={() => setKnowledge(level.id as KnowledgeLevel)}
                         className={`p-4 rounded-xl border text-left transition-all ${
                             knowledge === level.id 
                             ? 'bg-purple-500/10 border-purple-500 ring-1 ring-purple-500' 
                             : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                         }`}
                       >
                           <h4 className="text-white font-bold">{level.label}</h4>
                           <p className="text-xs text-slate-400">{level.desc}</p>
                       </button>
                   ))}
               </div>
            </div>
          )}

          {/* Step 3: Goal Selection */}
          {step === 3 && (
            <div className="animate-fade-in space-y-6">
               <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                 <Target size={32} />
               </div>
               <h2 className="text-2xl font-bold text-white">Qual seu foco principal?</h2>
               <p className="text-slate-400">Escolha sua prioridade número 1 hoje.</p>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   <button
                     onClick={() => setSelectedGoalType('DEBT_PAYOFF')}
                     className={`p-4 rounded-xl border text-left transition-all ${selectedGoalType === 'DEBT_PAYOFF' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}`}
                   >
                       <AlertCircle className="mb-2 text-emerald-400" size={24} />
                       <h4 className="text-white font-bold text-sm">Sair das Dívidas</h4>
                       <p className="text-[10px] text-slate-400">Quitar pendências.</p>
                   </button>
                   <button
                     onClick={() => setSelectedGoalType('EMERGENCY_FUND')}
                     className={`p-4 rounded-xl border text-left transition-all ${selectedGoalType === 'EMERGENCY_FUND' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}`}
                   >
                       <Shield className="mb-2 text-emerald-400" size={24} />
                       <h4 className="text-white font-bold text-sm">Guardar Dinheiro</h4>
                       <p className="text-[10px] text-slate-400">Reserva de segurança.</p>
                   </button>
                   <button
                     onClick={() => setSelectedGoalType('RETIREMENT')}
                     className={`p-4 rounded-xl border text-left transition-all ${selectedGoalType === 'RETIREMENT' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}`}
                   >
                       <TrendingUp className="mb-2 text-emerald-400" size={24} />
                       <h4 className="text-white font-bold text-sm">Viver de Renda</h4>
                       <p className="text-[10px] text-slate-400">Investir pro futuro.</p>
                   </button>
                   <button
                     onClick={() => setSelectedGoalType('PURCHASE')}
                     className={`p-4 rounded-xl border text-left transition-all ${selectedGoalType === 'PURCHASE' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}`}
                   >
                       <Wallet className="mb-2 text-emerald-400" size={24} />
                       <h4 className="text-white font-bold text-sm">Comprar Bens</h4>
                       <p className="text-[10px] text-slate-400">Carro, Casa, Sonhos.</p>
                   </button>
               </div>
            </div>
          )}

          {/* Step 4: Financial Baseline */}
          {step === 4 && (
            <div className="animate-fade-in space-y-6">
              <div className="w-16 h-16 bg-slate-700/50 text-slate-300 rounded-2xl flex items-center justify-center mb-4">
                <DollarSign size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white">Ponto de Partida</h2>
              <p className="text-slate-400">Para traçar a rota, precisamos saber onde você está hoje.</p>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-medium text-emerald-400 mb-1">Dinheiro Guardado / Investido</label>
                    <div className="flex items-center bg-slate-800/50 rounded-xl px-4 border border-slate-700">
                        <span className="text-slate-400 mr-2">R$</span>
                        <input 
                            type="number"
                            value={liquidAssets}
                            onChange={(e) => setLiquidAssets(e.target.value)}
                            placeholder="0,00"
                            className="bg-transparent w-full text-white font-bold text-lg py-3 outline-none"
                        />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-medium text-rose-400 mb-1">Total em Dívidas (Se houver)</label>
                    <div className="flex items-center bg-slate-800/50 rounded-xl px-4 border border-slate-700">
                        <span className="text-slate-400 mr-2">R$</span>
                        <input 
                            type="number"
                            value={totalDebt}
                            onChange={(e) => setTotalDebt(e.target.value)}
                            placeholder="0,00"
                            className="bg-transparent w-full text-white font-bold text-lg py-3 outline-none"
                        />
                    </div>
                 </div>
              </div>
            </div>
          )}

        </div>

        <div className="p-6 border-t border-slate-800 flex justify-between items-center bg-slate-900">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="text-slate-400 hover:text-white text-sm font-medium">
              Voltar
            </button>
          ) : <div></div>}
          
          <button 
            onClick={() => step < totalSteps ? setStep(step + 1) : handleFinish()}
            disabled={(step === 1 && !name) || (step === 3 && !selectedGoalType)}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
          >
            {step === totalSteps ? 'Finalizar' : 'Próximo'} <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default OnboardingModal;