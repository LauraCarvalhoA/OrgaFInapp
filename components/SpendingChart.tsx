
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { Transaction } from '../types';

interface SpendingChartProps {
  transactions: Transaction[];
  viewPeriod?: 'monthly' | 'yearly';
}

const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl z-50">
        <p className="text-slate-300 text-sm mb-2 font-semibold border-b border-slate-700 pb-1">{label}</p>
        <div className="space-y-1">
            <p className="text-emerald-400 text-xs flex justify-between gap-4">
            <span>Entrada:</span>
            <span className="font-bold">{formatBRL(payload[0].value as number)}</span>
            </p>
            <p className="text-rose-400 text-xs flex justify-between gap-4">
            <span>Saída:</span>
            <span className="font-bold">{formatBRL(payload[1].value as number)}</span>
            </p>
        </div>
      </div>
    );
  }
  return null;
};

const SpendingChart: React.FC<SpendingChartProps> = ({ transactions, viewPeriod = 'monthly' }) => {
  const data = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Initialize structure based on view mode
    let chartData: { name: string; income: number; expense: number; sortIndex: number }[] = [];

    if (viewPeriod === 'monthly') {
        // Generate all days for current month
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentYear, currentMonth, i);
            chartData.push({
                name: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                income: 0,
                expense: 0,
                sortIndex: i
            });
        }

        // Fill data
        transactions.forEach(t => {
            const tDate = new Date(t.date);
            // Filter: Must be current month and year
            if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
                const day = tDate.getDate();
                const entry = chartData[day - 1]; // Array is 0-indexed, days are 1-indexed
                if (entry) {
                    if (t.amount > 0) entry.income += t.amount;
                    else entry.expense += Math.abs(t.amount);
                }
            }
        });

    } else {
        // YEARLY VIEW: Generate all 12 months
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentYear, i, 1);
            // Don't show future months if strict, but for "Year View" usually nice to see empty future
            chartData.push({
                name: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
                income: 0,
                expense: 0,
                sortIndex: i
            });
        }

        // Fill data
        transactions.forEach(t => {
            const tDate = new Date(t.date);
            // Filter: Must be current year
            if (tDate.getFullYear() === currentYear) {
                const monthIndex = tDate.getMonth();
                const entry = chartData[monthIndex];
                if (entry) {
                    if (t.amount > 0) entry.income += t.amount;
                    else entry.expense += Math.abs(t.amount);
                }
            }
        });
    }

    return chartData;
  }, [transactions, viewPeriod]);

  return (
    <div className="w-full h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 11 }} 
            dy={10}
            interval={viewPeriod === 'monthly' ? 2 : 0} // Skip labels in dense monthly view
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 11 }} 
            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area 
            type="monotone" 
            dataKey="income" 
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorIncome)" 
            name="Receita"
            animationDuration={1000}
          />
          <Area 
            type="monotone" 
            dataKey="expense" 
            stroke="#f43f5e" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorExpense)" 
            name="Despesa"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingChart;
