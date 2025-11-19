
import React, { useState } from 'react';
import { Goal, UserProfile, Investment, GoalType } from '../types';
import { Target, Zap, BrainCircuit, ChevronRight, Plus, Calculator, X, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { analyzeGoalStrategy } from '../services/geminiService';

interface GoalsTabProps {
  goals: Goal[];
  userProfile: UserProfile;
  investments: Investment[];
  onAddGoal: (goal: Goal) => void;
}

const GoalsTab: React.FC<GoalsTabProps> = ({ goals, userProfile, investments, onAddGoal }) => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Record<string, string>>({});
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoalType, setNewGoalType] = useState<GoalType>('PURCHASE');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  
  // Purchase Fields
  const [purchaseAmount, setPurchaseAmount] = useState('');
  
  // Retirement Fields
  const [currentAge, setCurrentAge] = useState('');
  const [retirementAge, setRetirementAge] = useState('');
  const [desiredIncome, setDesiredIncome] = useState('');

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleAnalyze = async (goal: Goal) => {
      if (analysis[goal.id]) {
          setSelectedGoal(selectedGoal === goal.id ? null : goal.id);
          return;
      }
      
      setLoadingAnalysis(true);
      setSelectedGoal(goal.id);
      const result = await analyzeGoalStrategy(goal, userProfile, investments);
      setAnalysis(prev => ({...prev, [goal.id]: result}));
      setLoadingAnalysis(false);
  };

  const handleSaveGoal = () => {
      let targetAmount = 0;
      let details = undefined;

      if (newGoalType === 'RETIREMENT') {
          // Simple "Rule of 300" (Safe Withdrawal Rate 4% rule adjusted or just 0.5% monthly)
          // To get R$ X per month at 0.5% real yield: X / 0.005
          const income = parseFloat(desiredIncome);
          targetAmount = income / 0.005; // Magic Number calculation
          details = {
              currentAge: parseInt(currentAge),
              retirementAge: parseInt(retirementAge),
              desiredMonthlyIncome: income
          };
      } else {
          targetAmount = parseFloat(purchaseAmount);
      }

      const newGoal: Goal = {
          id: `goal_${Date.now()}`,
          title: newGoalTitle,
          type: newGoalType,
          targetAmount: targetAmount,
          currentAmount: 0,
          retirementDetails: details
      };

      onAddGoal(newGoal);
      setIsModalOpen(false);
      // Reset Form
      setNewGoalTitle('');
      setPurchaseAmount('');
      setCurrentAge('');
      setRetirementAge('');
      setDesiredIncome('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Action */}
      <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
          <div>
             <h3 className="text-white font-semibold">Painel de Objetivos</h3>
             <p className="text-slate-400 text-xs">Defina sonhos e deixe a IA traçar a rota.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-lg shadow-primary/20 transition-all"
          >
              <Plus size={16} /> Novo Objetivo
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map(goal => {
           const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
           
           return (
             <div key={goal.id} className="bg-card border border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full border border-slate-600 flex items-center justify-center text-white ${goal.type === 'RETIREMENT' ? 'bg-blue-900/50 text-blue-400' : 'bg-slate-800'}`}>
                        {goal.type === 'RETIREMENT' ? <TrendingUp size={20} /> : <Target size={20} />}
                      </div>
                      <div>
                         <h3 className="font-bold text-white text-lg">{goal.title}</h3>
                         <p className="text-xs text-slate-400 uppercase tracking-wider">
                             {goal.type === 'RETIREMENT' ? 'Longo Prazo' : 'Aquisição'}
                         </p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-400">{formatBRL(goal.currentAmount)}</p>
                      <p className="text-xs text-slate-500">Meta: {formatBRL(goal.targetAmount)}</p>
                   </div>
                </div>

                {/* Retirement Specific Info */}
                {goal.type === 'RETIREMENT' && goal.retirementDetails && (
                    <div className="bg-slate-900/50 p-3 rounded-lg mb-4 flex justify-between text-xs text-slate-300">
                        <span>Idade Atual: <b>{goal.retirementDetails.currentAge}</b></span>
                        <span>Aposentar aos: <b>{goal.retirementDetails.retirementAge}</b></span>
                        <span>Renda: <b>{formatBRL(goal.retirementDetails.desiredMonthlyIncome)}/mês</b></span>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
                   <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700" style={{ width: `${percentage}%` }}></div>
                </div>

                <div className="flex justify-between items-center">
                    <button 
                        onClick={() => handleAnalyze(goal)}
                        className="flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20"
                    >
                        {loadingAnalysis && selectedGoal === goal.id ? <BrainCircuit className="animate-pulse" size={14} /> : <BrainCircuit size={14} />}
                        {goal.type === 'RETIREMENT' ? 'Analisar Aposentadoria' : 'Estratégia de Compra'}
                    </button>
                </div>

                {/* Analysis Result Panel */}
                {selectedGoal === goal.id && (
                    <div className="mt-4 p-4 bg-slate-900/80 rounded-xl border border-purple-500/30 animate-fade-in">
                        {loadingAnalysis ? (
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Zap size={16} className="text-yellow-400 animate-bounce" /> Analisando {goal.type === 'RETIREMENT' ? 'juros compostos e aportes' : 'fluxo de caixa'}...
                            </div>
                        ) : (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <h4 className="text-purple-400 font-bold mb-2 flex items-center gap-2"><BrainCircuit size={16}/> WealthWise Strategy</h4>
                                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {analysis[goal.id]}
                                </div>
                            </div>
                        )}
                    </div>
                )}
             </div>
           );
        })}

        {goals.length === 0 && (
            <div className="col-span-2 bg-slate-800/30 border border-dashed border-slate-700 rounded-2xl p-10 text-center">
                <Target size={48} className="mx-auto text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-white">Nenhum objetivo traçado</h3>
                <p className="text-slate-400 mb-4">Adicione objetivos para receber conteúdos educativos personalizados e análises.</p>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
                >
                    Começar agora
                </button>
            </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                  <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Target size={20} className="text-primary" />
                        Novo Objetivo
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                      {/* Goal Type Selector */}
                      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl">
                        <button
                        onClick={() => setNewGoalType('PURCHASE')}
                        className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all ${
                            newGoalType === 'PURCHASE' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                        >
                        <Target size={14} /> Compra / Bem
                        </button>
                        <button
                        onClick={() => setNewGoalType('RETIREMENT')}
                        className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all ${
                            newGoalType === 'RETIREMENT' ? 'bg-blue-500/20 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                        >
                        <TrendingUp size={14} /> Aposentadoria
                        </button>
                      </div>

                      <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Nome do Objetivo</label>
                          <input 
                            type="text" 
                            value={newGoalTitle}
                            onChange={(e) => setNewGoalTitle(e.target.value)}
                            placeholder={newGoalType === 'RETIREMENT' ? "Minha Liberdade Financeira" : "Carro Novo, Casa Própria..."}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                      </div>

                      {newGoalType === 'PURCHASE' ? (
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Valor do Bem (R$)</label>
                            <input 
                                type="number" 
                                value={purchaseAmount}
                                onChange={(e) => setPurchaseAmount(e.target.value)}
                                placeholder="Ex: 50000"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                          </div>
                      ) : (
                          <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Idade Atual</label>
                                    <input 
                                        type="number" 
                                        value={currentAge}
                                        onChange={(e) => setCurrentAge(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Idade Aposentadoria</label>
                                    <input 
                                        type="number" 
                                        value={retirementAge}
                                        onChange={(e) => setRetirementAge(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                    />
                                  </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Renda Mensal Desejada (Hoje)</label>
                                <div className="relative">
                                    <DollarSign size={16} className="absolute left-3 top-3.5 text-slate-500" />
                                    <input 
                                        type="number" 
                                        value={desiredIncome}
                                        onChange={(e) => setDesiredIncome(e.target.value)}
                                        placeholder="Ex: 5000"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-9 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1">Calcularemos quanto você precisa acumular para gerar essa renda passiva.</p>
                              </div>
                          </div>
                      )}

                      <button 
                        onClick={handleSaveGoal}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg transition-colors mt-2 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                      >
                          <Calculator size={18} /> Criar Plano & Gerar Guia Educativo
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default GoalsTab;
