
import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Briefcase, DollarSign, Calendar } from 'lucide-react';
import { Investment, InvestmentType } from '../types';
import { MARKET_DATA } from '../constants';

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (investment: Investment) => void;
}

const AddInvestmentModal: React.FC<AddInvestmentModalProps> = ({ isOpen, onClose, onSave }) => {
  const [type, setType] = useState<InvestmentType>('FII');
  
  // Generic Fields
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  // FII Fields
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  
  // Fixed Income Fields
  const [amount, setAmount] = useState('');
  const [percentage, setPercentage] = useState('100');
  const [index, setIndex] = useState<'CDI' | 'IPCA'>('CDI');

  // Auto-fill logic for Ticker
  useEffect(() => {
    if (type === 'FII' && ticker.length >= 5) {
      const cleanTicker = ticker.toUpperCase();
      if (MARKET_DATA[cleanTicker]) {
        setAvgPrice(MARKET_DATA[cleanTicker].price.toString());
        setName(MARKET_DATA[cleanTicker].name);
      }
    }
  }, [ticker, type]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newInv: Partial<Investment> = {
      id: `inv_${Date.now()}`,
      type,
      startDate,
    };

    if (type === 'FII') {
      const qtyNum = parseInt(quantity);
      const priceNum = parseFloat(avgPrice);
      const cleanTicker = ticker.toUpperCase();
      
      // Check if we have mock data for this ticker, otherwise use generic defaults
      const currentPrice = MARKET_DATA[cleanTicker]?.price || priceNum;
      const lastDividend = MARKET_DATA[cleanTicker]?.lastDividend || (priceNum * 0.008); // approx 0.8% if unknown

      newInv.ticker = cleanTicker;
      newInv.name = name || cleanTicker;
      newInv.quantity = qtyNum;
      newInv.averagePrice = priceNum;
      newInv.amountInvested = qtyNum * priceNum;
      newInv.currentValue = qtyNum * currentPrice; // Calculated based on "market"
      newInv.lastDividend = lastDividend;
    } else {
      const amountNum = parseFloat(amount);
      newInv.name = name;
      newInv.amountInvested = amountNum;
      // For fixed income, we assume the user updates the current value manually or we project it.
      // Here, we initiate current value as amount invested, user can edit later or we use AI to project.
      newInv.currentValue = amountNum; 
      newInv.percentage = parseFloat(percentage);
      newInv.index = index;
      newInv.liquidity = 'daily';
    }

    onSave(newInv as Investment);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTicker('');
    setQuantity('');
    setAvgPrice('');
    setAmount('');
    setName('');
    setStartDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Novo Investimento
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-900 rounded-xl mb-2">
            <button
              type="button"
              onClick={() => setType('FII')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                type === 'FII' ? 'bg-orange-500/20 text-orange-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase size={16} /> FIIs / Ações
            </button>
            <button
              type="button"
              onClick={() => setType('FIXED_INCOME')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                type === 'FIXED_INCOME' ? 'bg-blue-500/20 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign size={16} /> Renda Fixa
            </button>
          </div>

          {/* Common Date Field */}
          <div>
             <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                <Calendar size={12} /> Data da Aplicação Inicial
             </label>
             <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                required
             />
             <p className="text-[10px] text-slate-500 mt-1">Usada para calcular a rentabilidade histórica e imposto de renda regressivo.</p>
          </div>

          {type === 'FII' ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Ticker (Código)</label>
                <input 
                  type="text" 
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  placeholder="Ex: MXRF11"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white uppercase focus:ring-2 focus:ring-primary/50 outline-none"
                  required
                />
                {MARKET_DATA[ticker.toUpperCase()] && (
                    <p className="text-xs text-emerald-400 mt-1">
                        Encontrado: {MARKET_DATA[ticker.toUpperCase()].name} (R$ {MARKET_DATA[ticker.toUpperCase()].price})
                    </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Quantidade</label>
                    <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Ex: 100"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Preço Médio</label>
                    <input 
                    type="number" 
                    step="0.01"
                    value={avgPrice}
                    onChange={(e) => setAvgPrice(e.target.value)}
                    placeholder="R$ 0,00"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    required
                    />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nome do Produto</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: CDB Banco Master, LCI Caixa..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                  required
                />
              </div>

               <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Valor Inicial Aplicado</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="R$ 1.000,00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Indexador</label>
                    <select 
                        value={index} 
                        onChange={(e) => setIndex(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                        <option value="CDI">CDI</option>
                        <option value="IPCA">IPCA</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">% da Taxa</label>
                    <input 
                    type="number" 
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    placeholder="Ex: 120"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    required
                    />
                 </div>
              </div>
            </>
          )}

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg transition-colors mt-2 shadow-lg shadow-primary/20"
          >
            Adicionar Investimento
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddInvestmentModal;
