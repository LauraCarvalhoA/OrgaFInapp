
import { Account, AccountType, Transaction, Budget, Investment, EducationModule, Goal } from './types';

export const MOCK_INSTITUTIONS = ['Nubank', 'Itaú', 'Bradesco', 'Banco do Brasil', 'Santander', 'Inter', 'C6 Bank', 'XP Investimentos', 'BTG Pactual', 'PagBank', 'Mercado Pago', 'Banco Pan', 'Nomad', 'Wise', 'Caixa'];

export const CATEGORIES = ['Alimentação', 'Compras', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Renda', 'Investimentos', 'Contas', 'Educação', 'Transferência', 'Outros'];

// Start with EMPTY data for a real manual tracking app
export const INITIAL_ACCOUNTS: Account[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_BUDGETS: Budget[] = [];
export const INITIAL_INVESTMENTS: Investment[] = [];
export const INITIAL_GOALS: Goal[] = [];

// Market Data dictionary for auto-fill features (keep this as utility)
export const MARKET_DATA: Record<string, { price: number; lastDividend: number; name: string }> = {
  'MXRF11': { price: 10.45, lastDividend: 0.11, name: 'Maxi Renda' },
  'HGLG11': { price: 162.30, lastDividend: 1.10, name: 'CSHG Logística' },
  'XPML11': { price: 115.50, lastDividend: 0.92, name: 'XP Malls' },
  'KNRI11': { price: 158.20, lastDividend: 1.00, name: 'Kinea Renda' },
  'VISC11': { price: 118.90, lastDividend: 0.85, name: 'Vinci Shopping' },
  'BTLG11': { price: 101.15, lastDividend: 0.76, name: 'BTG Logística' },
  'PETR4':  { price: 36.50, lastDividend: 0.00, name: 'Petrobras PN' },
  'VALE3':  { price: 60.20, lastDividend: 0.00, name: 'Vale ON' },
  'BBAS3':  { price: 27.10, lastDividend: 0.00, name: 'Banco do Brasil ON' },
};

export const CURRENT_CDI_RATE = 0.1125; // 11.25% per year
export const MONTHLY_CDI_RATE = Math.pow(1 + CURRENT_CDI_RATE, 1/12) - 1; 

export const MOCK_EDUCATION_MODULES: EducationModule[] = [
    { id: 'edu_1', level: 'BEGINNER', title: 'Tríade Financeira', description: 'Entenda a base: Ganhar, Poupular e Investir.', readTime: '5 min', isLocked: false, completed: false },
    { id: 'edu_2', level: 'BEGINNER', title: 'Reserva de Emergência', description: 'Onde guardar e quanto você precisa ter.', readTime: '7 min', isLocked: false, completed: false },
    { id: 'edu_3', level: 'INTERMEDIATE', title: 'O que é o CDI?', description: 'Entenda o benchmark da Renda Fixa brasileira.', readTime: '6 min', isLocked: true, completed: false },
    { id: 'edu_4', level: 'INTERMEDIATE', title: 'Fundos Imobiliários (FIIs)', description: 'Como gerar renda passiva mensal isenta de IR.', readTime: '10 min', isLocked: true, completed: false },
];
