import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface BudgetCardProps {
  category: string;
  spent: number;
  limit: number;
  onDelete?: () => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ category, spent, limit, onDelete }) => {
  const percentage = Math.min((spent / limit) * 100, 100);
  const isExceeded = spent > limit;
  const isWarning = !isExceeded && percentage >= 80;
  const remaining = limit - spent;

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  let colorClass = 'bg-emerald-500';
  let textColorClass = 'text-emerald-400';
  let icon = <CheckCircle size={16} className="text-emerald-500" />;

  if (isExceeded) {
    colorClass = 'bg-rose-500';
    textColorClass = 'text-rose-400';
    icon = <AlertCircle size={16} className="text-rose-500" />;
  } else if (isWarning) {
    colorClass = 'bg-amber-500';
    textColorClass = 'text-amber-400';
    icon = <AlertTriangle size={16} className="text-amber-500" />;
  }

  return (
    <div className="bg-card border border-slate-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 relative group">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-white font-medium text-lg">{category}</h4>
          <p className="text-slate-400 text-sm mt-1">
            {isExceeded ? (
              <span className="text-rose-400 font-medium">Excedido por {formatCurrency(Math.abs(remaining))}</span>
            ) : (
              <span>{formatCurrency(remaining)} restante</span>
            )}
          </p>
        </div>
        <div className="bg-slate-800 p-2 rounded-lg">
          {icon}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden mb-3">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-300 font-mono font-medium">{formatCurrency(spent)} gasto</span>
        <span className="text-slate-500 font-mono">Limite: {formatCurrency(limit)}</span>
      </div>
      
      {onDelete && (
        <button 
          onClick={onDelete}
          className="absolute top-4 right-12 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
          title="Delete Budget"
        >
          Remover
        </button>
      )}
    </div>
  );
};

export default BudgetCard;
