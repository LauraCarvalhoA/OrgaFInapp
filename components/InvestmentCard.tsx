import React from 'react';
import { TrendingUp, Calendar, DollarSign, Briefcase, Clock, Plus, Minus, Bitcoin, Building2, Droplets } from 'lucide-react';
import { Investment } from '../types';
import { MONTHLY_CDI_RATE } from '../constants';

interface InvestmentCardProps {
  investment: Investment;
  onAction: (type: 'CONTRIBUTE' | 'REDEEM', investment: Investment) => void;
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({ investment, onAction }) => {
  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  
  // Calculate Projections
  let monthlyIncome = 0;
  let nextPaymentDate = 'N/A';
  let profitability = 0;

  // Time elapsed calculation
  const startDate = new Date(investment.startDate || new Date());
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const diffMonths = Math.floor(diffDays / 30);

  // Profitability Calculation
  if (investment.amountInvested > 0) {
      profitability = ((investment.currentValue - investment.amountInvested) / investment.amountInvested) * 100;
  }

  // Type Specific Logic
  if (investment.type === 'FII' && investment.quantity && investment.lastDividend) {
    monthlyIncome = investment.quantity * investment.lastDividend;
    const paymentDay = 15;
    const nextDate = new Date(today.getFullYear(), today.getMonth() + (today.getDate() > 15 ? 1 : 0), paymentDay);
    nextPaymentDate = nextDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  } 
  else if (investment.type === 'FIXED_INCOME' || investment.type === 'MUTUAL_FUND') {
    if (investment.percentage && investment.index === 'CDI') {
        // Estimate monthly yield
        const effectiveMonthlyRate = MONTHLY_CDI_RATE * (investment.percentage / 100);
        monthlyIncome = investment.currentValue * effectiveMonthlyRate;
    }
    
    if (investment.liquidity === 'daily') {
        nextPaymentDate = 'Rendimento Diário';
    } else {
        nextPaymentDate = 'No Vencimento';
    }
  } else if (investment.type === 'CRYPTO') {
      nextPaymentDate = 'Valorização Capital';
  }

  // Icon Selection
  const getIcon = () => {
      switch(investment.type) {
          case 'FII': return <Briefcase size={20} />;
          case 'FIXED_INCOME': return <DollarSign size={20} />;
          case 'CRYPTO': return <Bitcoin size={20} />;
          case 'MUTUAL_FUND': return <Building2 size={20} />;
          default: return <DollarSign size={20} />;
      }
  };

  const getColor = () => {
      switch(investment.type) {
          case 'FII': return 'bg-orange-500/20 text-orange-400';
          case 'FIXED_INCOME': return 'bg-blue-500/20 text-blue-400';
          case 'CRYPTO': return 'bg-yellow-500/20 text-yellow-400';
          case 'MUTUAL_FUND': return 'bg-purple-500/20 text-purple-400';
          default: return 'bg-slate-700 text-slate-400';
      }
  };

  return (
    <div className="bg-card border border-slate-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColor()}`}>
            {getIcon()}
          </div>
          <div>
            <h4 className="text-white font-bold text-lg">{investment.ticker || investment.name}</h4>
            <p className="text-slate-400 text-xs flex items-center gap-2">
               <span>
                   {investment.quantity ? `${investment.quantity} uni.` : 
                    investment.percentage ? `${investment.percentage}% ${investment.index}` : 
                    investment.type === 'MUTUAL_FUND' ? 'Cotas' : 'Saldo'}
               </span>
               <span className="w-1 h-1 rounded-full bg-slate-600"></span>
               <span className="flex items-center gap-0.5"><Clock size={10} /> {diffMonths > 0 ? `${diffMonths} meses` : `${diffDays} dias`}</span>
               
               {investment.liquidity === 'daily' && (
                   <>
                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                    <span className="flex items-center gap-0.5 text-emerald-400"><Droplets size={10} /> Liq. Diária</span>
                   </>
               )}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-white">{formatBRL(investment.currentValue)}</p>
          <div className={`text-xs flex justify-end items-center gap-1 ${profitability >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
             <TrendingUp size={12} />
             {profitability >= 0 ? '+' : ''}{profitability.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Projection Section */}
      <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex justify-between items-center mb-4">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
              {investment.type === 'CRYPTO' ? 'Valor Investido' : 'Renda Estimada'}
          </p>
          <p className="text-emerald-400 font-semibold text-sm flex items-center gap-1">
             {investment.type === 'CRYPTO' ? formatBRL(investment.amountInvested) : `+ ${formatBRL(monthlyIncome)}`}
             {investment.type !== 'CRYPTO' && <span className="text-[10px] text-slate-500 font-normal">/mês</span>}
          </p>
        </div>
        <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                {investment.liquidity === 'daily' ? 'Disponibilidade' : 'Previsão'}
            </p>
            <p className="text-slate-300 text-sm flex items-center justify-end gap-1">
               <Calendar size={12} className="text-slate-500" /> {nextPaymentDate}
            </p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
          <button 
             onClick={() => onAction('CONTRIBUTE', investment)}
             className="flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors text-xs font-bold uppercase tracking-wider"
          >
              <Plus size={14} /> Aportar
          </button>
          <button 
             onClick={() => onAction('REDEEM', investment)}
             className="flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/20 transition-colors text-xs font-bold uppercase tracking-wider"
          >
              <Minus size={14} /> Resgatar
          </button>
      </div>
    </div>
  );
};

export default InvestmentCard;