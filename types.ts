
export enum AccountType {
  CHECKING = 'Checking',
  SAVINGS = 'Savings',
  CREDIT = 'Credit Card',
  INVESTMENT = 'Investment',
  LOAN = 'Loan'
}

export type AccountOwner = 'me' | 'partner' | 'joint';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  creditLimit?: number; // Only for Credit Cards
  institution: string;
  lastUpdated: string;
  color: string;
  owner: AccountOwner;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  accountId: string;
  toAccountId?: string; // For transfers
  date: string;
  amount: number; // Negative for expense, positive for income
  merchant: string;
  category: string;
  status: 'pending' | 'completed';
  owner: AccountOwner;
  
  // Installment Logic
  installments?: {
    current: number;
    total: number;
    originalId: string;
  };

  // Recurrence
  isRecurring?: boolean;
}

export interface MonthlyMetric {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
}

export interface AISessionMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type InvestmentType = 'FII' | 'FIXED_INCOME' | 'STOCK' | 'CRYPTO';

export interface Investment {
  id: string;
  name: string; 
  type: InvestmentType;
  amountInvested: number; 
  currentValue: number; 
  startDate: string;
  
  ticker?: string;
  quantity?: number;
  averagePrice?: number;
  lastDividend?: number;
  
  index?: 'CDI' | 'IPCA' | 'PRE';
  percentage?: number; 
  liquidity?: 'daily' | 'maturity';
  maturityDate?: string;
}

// --- New Types for Advanced Features ---

export type GoalType = 'PURCHASE' | 'RETIREMENT' | 'EMERGENCY_FUND' | 'DEBT_PAYOFF';
export type KnowledgeLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // ISO Date
  monthlyContribution?: number;
  aiAnalysis?: string; // Stored strategy advice
  
  // Specifics for Retirement
  retirementDetails?: {
      currentAge: number;
      retirementAge: number;
      desiredMonthlyIncome: number;
  };
}

export interface EducationModule {
  id: string;
  level: KnowledgeLevel | 'ALL';
  title: string;
  description: string;
  readTime: string;
  isLocked: boolean;
  completed: boolean;
  recommendedFor?: GoalType; // Link to specific goals
}

export interface PartnerConfig {
  isConnected: boolean;
  partnerName?: string;
  permissions: {
    shareNetWorth: boolean;
    shareTransactions: boolean;
    shareGoals: boolean;
  };
}

export interface UserProfile {
  name: string;
  knowledgeLevel: KnowledgeLevel;
  
  // Financial Health Snapshot
  totalDebt: number;
  liquidAssets: number;
  
  partnerConfig?: PartnerConfig;
}
