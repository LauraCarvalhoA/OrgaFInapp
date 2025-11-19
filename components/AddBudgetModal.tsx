import React, { useState } from 'react';
import { X, PieChart } from 'lucide-react';
import { CATEGORIES } from '../constants';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: string, limit: number) => void;
  existingCategories: string[];
}

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ isOpen, onClose, onSave, existingCategories }) => {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [limit, setLimit] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category && limit) {
      onSave(category, parseFloat(limit));
      setLimit('');
      setCategory(CATEGORIES[0]);
      onClose();
    }
  };

  // Filter out categories that already have a budget
  const availableCategories = CATEGORIES.filter(c => !existingCategories.includes(c) && c !== 'Income' && c !== 'Investment');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <PieChart size={20} className="text-primary" />
            New Budget
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary/50 outline-none"
            >
              {availableCategories.length > 0 ? (
                availableCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))
              ) : (
                <option disabled>All categories tracked</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Monthly Limit ($)</label>
            <input 
              type="number" 
              min="1"
              step="10"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="e.g. 500"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary/50 outline-none"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={availableCategories.length === 0}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Set Budget
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBudgetModal;