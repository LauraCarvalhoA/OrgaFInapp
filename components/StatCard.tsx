import React from 'react';

interface StatCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  trend?: number; // Percentage change
  type?: 'neutral' | 'positive' | 'negative';
}

const StatCard: React.FC<StatCardProps> = ({ title, amount, icon, trend, type = 'neutral' }) => {
  const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  
  const trendColor = trend && trend > 0 ? 'text-emerald-400' : 'text-rose-400';
  const trendIcon = trend && trend > 0 ? '↑' : '↓';

  return (
    <div className="bg-card border border-slate-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{formattedAmount}</h3>
        </div>
        <div className="p-3 bg-slate-700/50 rounded-xl text-primary">
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center text-sm">
          <span className={`${trendColor} font-semibold flex items-center gap-1`}>
            {trendIcon} {Math.abs(trend)}%
          </span>
          <span className="text-slate-500 ml-2">vs mês anterior</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
