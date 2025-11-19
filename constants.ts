
import { Account, AccountType, Transaction, Budget, Investment, EducationModule, Goal } from './types';

export const MOCK_INSTITUTIONS = ['Nubank', 'Itaú', 'Bradesco', 'Banco do Brasil', 'Santander', 'Inter', 'C6 Bank', 'XP Investimentos', 'BTG Pactual', 'PagBank', 'Mercado Pago', 'Banco Pan'];

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc_1',
    name: 'Conta Principal',
    type: AccountType.CHECKING,
    balance: 3450.50,
    institution: 'PagBank',
    lastUpdated: new Date().toISOString(),
    color: 'bg-green-600',
    owner: 'me',
    isDefault: true
  },
  {
    id: 'acc_2',
    name: 'Investimentos',
    type: AccountType.INVESTMENT,
    balance: 15400.00,
    institution: 'Inter',
    lastUpdated: new Date().toISOString(),
    color: 'bg-orange-600',
    owner: 'me'
  },
  {
    id: 'acc_3',
    name: 'Cartão Black',
    type: AccountType.CREDIT,
    balance: -1840.30,
    creditLimit: 8000,
    institution: 'Nubank',
    lastUpdated: new Date().toISOString(),
    color: 'bg-purple-600',
    owner: 'me'
  },
  {
    id: 'acc_4',
    name: 'Conta Conjunta/Parceiro',
    type: AccountType.CHECKING,
    balance: 2100.00,
    institution: 'Itaú',
    lastUpdated: new Date().toISOString(),
    color: 'bg-blue-600',
    owner: 'partner'
  }
];

export const CATEGORIES = ['Alimentação', 'Compras', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Renda', 'Investimentos', 'Contas', 'Educação', 'Transferência'];

export const INITIAL_BUDGETS: Budget[] = [
  { id: 'b1', category: 'Alimentação', limit: 1200 },
  { id: 'b2', category: 'Transporte', limit: 600 },
  { id: 'b3', category: 'Lazer', limit: 500 },
];

export const generateRandomTransactions = (accountId: string, count: number = 50): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  // Generate transactions for the last 365 days to support Annual View
  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - Math.floor(Math.random() * 365)); 
    
    const isIncome = Math.random() > 0.85;
    const isInvestment = !isIncome && Math.random() > 0.9;

    let amount = 0;
    let merchant = '';
    let category = '';
    let isRecurring = false;

    if (isIncome) {
      amount = Math.floor(Math.random() * 4000) + 1500;
      merchant = 'PIX Recebido / Salário';
      category = 'Renda';
    } else if (isInvestment) {
       amount = -(Math.floor(Math.random() * 1000) + 200);
       merchant = 'Aporte Mensal';
       category = 'Investimentos';
    } else {
      amount = -(Math.floor(Math.random() * 300) + 15);
      const merchants = ['iFood', 'Uber', 'Mercado Livre', 'Drogasil', 'Netflix', 'Posto Ipiranga', 'Pão de Açúcar', 'Faculdade', 'Claro Celular', 'Zara', 'Amazon'];
      merchant = merchants[Math.floor(Math.random() * merchants.length)];
      
      if (['iFood', 'Pão de Açúcar'].includes(merchant)) category = 'Alimentação';
      else if (['Uber', 'Posto Ipiranga'].includes(merchant)) category = 'Transporte';
      else if (['Netflix'].includes(merchant)) { category = 'Lazer'; isRecurring = true; }
      else if (['Faculdade'].includes(merchant)) { category = 'Educação'; isRecurring = true; }
      else if (['Claro Celular'].includes(merchant)) { category = 'Contas'; isRecurring = true; }
      else if (['Drogasil'].includes(merchant)) category = 'Saúde';
      else category = 'Compras';
    }

    transactions.push({
      id: `txn_${Math.random().toString(36).substr(2, 9)}`,
      accountId,
      date: date.toISOString().split('T')[0],
      amount: parseFloat(amount.toFixed(2)),
      merchant,
      category,
      status: 'completed',
      owner: 'me', // Default for mock
      isRecurring
    });
  }
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const INITIAL_TRANSACTIONS = INITIAL_ACCOUNTS.flatMap(acc => generateRandomTransactions(acc.id, 40)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// --- Investment Data ---

export const CURRENT_CDI_RATE = 0.1125; // 11.25% per year
export const MONTHLY_CDI_RATE = Math.pow(1 + CURRENT_CDI_RATE, 1/12) - 1; 

export const MARKET_DATA: Record<string, { price: number; lastDividend: number; name: string }> = {
  'MXRF11': { price: 10.45, lastDividend: 0.11, name: 'Maxi Renda' },
  'HGLG11': { price: 162.30, lastDividend: 1.10, name: 'CSHG Logística' },
  'XPML11': { price: 115.50, lastDividend: 0.92, name: 'XP Malls' },
  'KNRI11': { price: 158.20, lastDividend: 1.00, name: 'Kinea Renda' },
  'VISC11': { price: 118.90, lastDividend: 0.85, name: 'Vinci Shopping' },
  'BTLG11': { price: 101.15, lastDividend: 0.76, name: 'BTG Logística' },
};

export const INITIAL_INVESTMENTS: Investment[] = [
  {
    id: 'inv_1',
    name: 'Reserva de Emergência',
    type: 'FIXED_INCOME',
    amountInvested: 10000,
    currentValue: 10850.50, // 8.5% yield simulated
    index: 'CDI',
    percentage: 100,
    liquidity: 'daily',
    startDate: '2024-01-15'
  },
  {
    id: 'inv_2',
    name: 'MXRF11',
    type: 'FII',
    amountInvested: 1500,
    currentValue: 1620.50,
    ticker: 'MXRF11',
    quantity: 150,
    averagePrice: 10.00,
    lastDividend: 0.11,
    startDate: '2024-02-20'
  }
];

// --- Education & Goals Mocks ---

export const MOCK_EDUCATION_MODULES: EducationModule[] = [
    { id: 'edu_1', level: 'BEGINNER', title: 'Tríade Financeira', description: 'Entenda a base: Ganhar, Poupular e Investir.', readTime: '5 min', isLocked: false, completed: true },
    { id: 'edu_2', level: 'BEGINNER', title: 'Reserva de Emergência', description: 'Onde guardar e quanto você precisa ter.', readTime: '7 min', isLocked: false, completed: false },
    { id: 'edu_3', level: 'INTERMEDIATE', title: 'O que é o CDI?', description: 'Entenda o benchmark da Renda Fixa brasileira.', readTime: '6 min', isLocked: true, completed: false },
    { id: 'edu_4', level: 'INTERMEDIATE', title: 'Fundos Imobiliários (FIIs)', description: 'Como gerar renda passiva mensal isenta de IR.', readTime: '10 min', isLocked: true, completed: false },
    { id: 'edu_5', level: 'ADVANCED', title: 'Alocação de Ativos', description: 'Balanceamento de carteira e correlação.', readTime: '15 min', isLocked: true, completed: false },
];

export const INITIAL_GOALS: Goal[] = [];
