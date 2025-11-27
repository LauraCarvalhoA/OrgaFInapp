import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Briefcase, DollarSign, Calendar, Bitcoin, Building2 } from 'lucide-react';
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
  
  // Ticker Based (FII/Stock/Crypto)
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  
  // Value Based (Fixed Income/Fund)
  const [amount, setAmount] = useState('');
  const [percentage, setPercentage] = useState('100');
  const [index, setIndex] = useState<'CDI' | 'IPCA'>('CDI');
  const [liquidity, setLiquidity] = useState<'daily' | 'maturity'>('maturity');

  // Auto-fill logic for Ticker
  useEffect(() => {
    if ((type === 'FII' || type === 'STOCK') && ticker.length >= 5) {
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
      liquidity
    };

    if (type === 'FII' || type === 'STOCK' || type === 'CRYPTO') {
      const qtyNum = parseFloat(quantity);
      const priceNum = parseFloat(avgPrice);
      const cleanTicker = ticker.toUpperCase();
      
      // Check if we have mock data for this ticker, otherwise use generic defaults
      const currentPrice = MARKET_DATA[cleanTicker]?.price || priceNum;
      
      newInv.ticker = cleanTicker;
      newInv.name = name || cleanTicker;
      newInv.quantity = qtyNum;
      newInv.averagePrice = priceNum;
      newInv.amountInvested = qtyNum * priceNum;
      newInv.currentValue = qtyNum * currentPrice; 
      
      if (type === 'FII') {
          newInv.lastDividend = MARKET_DATA[cleanTicker]?.lastDividend || (priceNum * 0.008);
      }
    } else {
      // Fixed Income & Funds
      const amountNum = parseFloat(amount);
      newInv.name = name;
      newInv.amountInvested = amountNum;
      newInv.currentValue = amountNum; // Init as same
      newInv.percentage = parseFloat(percentage);
      newInv.index = index;
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
    setLiquidity('maturity');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Novo Investimento
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          
          {/* Type Selector Grid */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('FII')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all border ${
                type === 'FII' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Briefcase size={16} /> FIIs / Ações
            </button>
            <button
              type="button"
              onClick={() => setType('FIXED_INCOME')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all border ${
                type === 'FIXED_INCOME' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
              }`}
            >
              <DollarSign size={16} /> Renda Fixa
            </button>
            <button
              type="button"
              onClick={() => setType('CRYPTO')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all border ${
                type === 'CRYPTO' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Bitcoin size={16} /> Cripto
            </button>
            <button
              type="button"
              onClick={() => setType('MUTUAL_FUND')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all border ${
                type === 'MUTUAL_FUND' ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Building2 size={16} /> Fundos (FIC/FIRF)
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
          </div>

          {type === 'FII' || type === 'STOCK' || type === 'CRYPTO' ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                    {type === 'CRYPTO' ? 'Símbolo (Ex: BTC)' : 'Ticker (Ex: MXRF11)'}
                </label>
                <input 
                  type="text" 
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  placeholder={type === 'CRYPTO' ? "BTC" : "MXRF11"}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white uppercase focus:ring-2 focus:ring-primary/50 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Quantidade</label>
                    <input 
                    type="number"
                    step="0.00000001" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Ex: 0.5"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Preço Médio Pago</label>
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
                <label className="block text-xs font-medium text-slate-400 mb-1">Nome do Produto / Fundo</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={type === 'MUTUAL_FUND' ? "Ex: Kinea Renda Fixa..." : "Ex: CDB Banco Master..."}
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
                 {type === 'FIXED_INCOME' && (
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
                 )}
              </div>
              
              <div>
                 <label className="block text-xs font-medium text-slate-400 mb-2">Liquidez (Resgate)</label>
                 <div className="flex gap-2">
                     <button
                        type="button"
                        onClick={() => setLiquidity('daily')}
                        className={`flex-1 py-2 text-xs rounded-lg border ${liquidity === 'daily' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-400'}`}
                     >
                         Diária (D+0/D+1)
                     </button>
                     <button
                        type="button"
                        onClick={() => setLiquidity('maturity')}
                        className={`flex-1 py-2 text-xs rounded-lg border ${liquidity === 'maturity' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'border-slate-700 text-slate-400'}`}
                     >
                         No Vencimento
                     </button>
                 </div>
              </div>
            </>
          )}

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg transition-colors mt-2 shadow-lg shadow-primary/20"
          >
            Salvar Investimento
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddInvestmentModal;