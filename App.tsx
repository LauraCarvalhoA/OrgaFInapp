
import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  LayoutDashboard, 
  Settings, 
  Plus,
  Landmark,
  PieChart,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  LineChart,
  Users,
  Repeat,
  Target,
  BookOpen,
  Calendar,
  Percent,
  Menu
} from 'lucide-react';

import { Account, Transaction, AccountType, Budget, Investment, UserProfile, AccountOwner, Goal, PartnerConfig, EducationModule } from './types';
import { MONTHLY_CDI_RATE, INITIAL_GOALS, MOCK_EDUCATION_MODULES } from './constants';
import StatCard from './components/StatCard';
import SpendingChart from './components/SpendingChart';
import ConnectAccountModal from './components/ConnectAccountModal';
import FinancialAdvisor from './components/FinancialAdvisor';
import BudgetCard from './components/BudgetCard';
import AddBudgetModal from './components/AddBudgetModal';
import AddTransactionModal from './components/AddTransactionModal';
import SecurityModal from './components/SecurityModal';
import AddInvestmentModal from './components/AddInvestmentModal';
import InvestmentCard from './components/InvestmentCard';
import OnboardingModal from './components/OnboardingModal';
import AccountCard from './components/AccountCard';
import FixedExpensesList from './components/FixedExpensesList';
import GoalsTab from './components/GoalsTab';
import EducationTab from './components/EducationTab';
import PartnerConnectModal from './components/PartnerConnectModal';
import InvestmentActionModal from './components/InvestmentActionModal';
import { generateMonthlyInsight } from './services/geminiService';

const App = () => {
  // Global State - Start EMPTY for manual tracking
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [educationModules, setEducationModules] = useState<EducationModule[]>(MOCK_EDUCATION_MODULES);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'investments' | 'advisor' | 'budgets' | 'goals' | 'education'>('dashboard');
  const [viewMode, setViewMode] = useState<AccountOwner | 'joint'>('me'); // Couple view toggle
  const [dashboardPeriod, setDashboardPeriod] = useState<'monthly' | 'yearly'>('monthly');
  
  // UI State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isAddInvestmentOpen, setIsAddInvestmentOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [dailyInsight, setDailyInsight] = useState<string>('Acompanhe seus gastos para gerar insights.');
  
  // Investment Actions State
  const [investmentAction, setInvestmentAction] = useState<{type: 'CONTRIBUTE' | 'REDEEM', investment: Investment} | null>(null);


  // Filter Data based on View Mode
  const filteredAccounts = accounts.filter(a => viewMode === 'joint' || a.owner === viewMode || a.owner === 'joint');
  const filteredTransactions = transactions.filter(t => viewMode === 'joint' || t.owner === viewMode || t.owner === 'joint');

  // Helper: Format Currency BRL
  const formatBRL = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

  // Derived Metrics
  const bankBalance = filteredAccounts.filter(a => a.type !== AccountType.INVESTMENT).reduce((sum, acc) => sum + acc.balance, 0);
  const investmentBalance = investments.reduce((sum, inv) => sum + inv.currentValue, 0); 
  const totalNetWorth = bankBalance + investmentBalance;
  
  // --- Dashboard Stats Calculation (Period Sensitive) ---
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Filter transactions by Period (Month vs Year)
  const statsTransactions = filteredTransactions.filter(t => {
      const d = new Date(t.date);
      if (dashboardPeriod === 'monthly') {
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      } else {
          // Yearly View = Current Year (YTD)
          return d.getFullYear() === currentYear;
      }
  });

  const periodIncome = statsTransactions
    .filter(t => t.amount > 0 && t.category !== 'Investimentos' && t.category !== 'Resgate de Investimento') 
    .reduce((sum, t) => sum + t.amount, 0);
  
  const periodExpense = statsTransactions
    .filter(t => t.amount < 0 && t.category !== 'Investimentos') 
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const periodInvested = filteredTransactions // Use main list to check investment outflows
    .filter(t => {
        const d = new Date(t.date);
        const matchesPeriod = dashboardPeriod === 'monthly' 
            ? (d.getMonth() === currentMonth && d.getFullYear() === currentYear)
            : (d.getFullYear() === currentYear);
        return matchesPeriod && t.category === 'Investimentos' && t.amount < 0;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Calculate Investment Yield (Approximate for Dashboard)
  const totalInvestedPrincipal = investments.reduce((sum, inv) => sum + inv.amountInvested, 0);
  const totalInvestedValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const absoluteYield = totalInvestedValue - totalInvestedPrincipal;
  const yieldPercentage = totalInvestedPrincipal > 0 ? (absoluteYield / totalInvestedPrincipal) * 100 : 0;

  // Budget Calculations
  const getCategorySpending = (category: string) => {
    return filteredTransactions
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && 
               d.getFullYear() === currentYear && 
               t.category === category && 
               t.amount < 0;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  // Load AI Insight on Mount (only if user has data)
  useEffect(() => {
    const fetchInsight = async () => {
      if (process.env.API_KEY && transactions.length > 0) {
        const insight = await generateMonthlyInsight(filteredAccounts, filteredTransactions, userProfile || undefined);
        setDailyInsight(insight);
      }
    };
    if (userProfile && transactions.length > 0) {
        fetchInsight();
    }
  }, [transactions.length, userProfile, viewMode]);

  // Handlers
  const handleConnectAccount = (institution: string, initialBalance: number, type: AccountType, name: string) => {
    const newAccount: Account = {
      id: `acc_${Date.now()}`,
      name: name || institution,
      type: type,
      balance: initialBalance,
      institution: institution,
      lastUpdated: new Date().toISOString(),
      color: 'bg-slate-600',
      owner: 'me',
      creditLimit: type === AccountType.CREDIT ? 5000 : undefined // Default limit placeholder
    };
    // Do NOT generate random transactions. Manual only.
    setAccounts(prev => [...prev, newAccount]);
    setIsConnectModalOpen(false);
  };

  const handleAddBudget = (category: string, limit: number) => {
    setBudgets([...budgets, { id: `bud_${Date.now()}`, category, limit }]);
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  const handleUpdateBalance = (id: string, newBalance: number) => {
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, balance: newBalance, lastUpdated: new Date().toISOString() } : a));
  };

  const handlePayBill = (accountId: string) => {
      const account = accounts.find(a => a.id === accountId);
      if (!account || account.balance >= 0) return; // Only pay if negative

      const amountToPay = Math.abs(account.balance);
      const payingAccount = accounts.find(a => a.type === AccountType.CHECKING && a.isDefault) || accounts.find(a => a.type === AccountType.CHECKING);
      
      if (!payingAccount) {
          alert("Você precisa ter uma conta corrente cadastrada para pagar a fatura.");
          return;
      }

      // Create Transaction Record (Payment)
      const paymentTxn: Transaction = {
          id: `txn_${Date.now()}`,
          accountId: payingAccount.id,
          date: new Date().toISOString().split('T')[0],
          amount: -amountToPay,
          merchant: `Pagamento Fatura ${account.name}`,
          category: 'Contas',
          status: 'completed',
          owner: account.owner
      };

      setTransactions(prev => [paymentTxn, ...prev]);
      
      // Update both balances
      setAccounts(prev => prev.map(a => {
          if (a.id === accountId) return { ...a, balance: 0, lastUpdated: new Date().toISOString() }; // Reset CC debt
          if (a.id === payingAccount.id) return { ...a, balance: a.balance - amountToPay }; // Deduct from Checking
          return a;
      }));
  };

  const handleAddTransaction = (data: any) => {
    if (data.mode === 'transfer') {
        setAccounts(prev => prev.map(a => {
            if (a.id === data.fromAccountId) return { ...a, balance: a.balance - data.amount };
            if (a.id === data.toAccountId) return { ...a, balance: a.balance + data.amount };
            return a;
        }));
        const txn: Transaction = {
            id: `txn_tr_${Date.now()}`,
            accountId: data.fromAccountId,
            toAccountId: data.toAccountId,
            date: data.date,
            amount: -data.amount,
            merchant: 'Transferência',
            category: 'Transferência',
            status: 'completed',
            owner: data.owner
        };
        setTransactions(prev => [txn, ...prev]);
        return;
    }

    // Normal Transaction Logic (Expense/Income)
    const newTxns: Transaction[] = [];
    const baseDate = new Date(data.date);
    const totalInstallments = data.installments || 1;
    const installmentAmount = data.amount / totalInstallments;

    // For balances, we update immediately for current expense
    // Logic choice: If it's credit, we increase debt (balance goes negative)
    // If it's debit/cash, we decrease balance
    
    for (let i = 0; i < totalInstallments; i++) {
        const txnDate = new Date(baseDate);
        txnDate.setMonth(baseDate.getMonth() + i);
        
        newTxns.push({
            id: `txn_${Date.now()}_${i}`,
            accountId: data.accountId,
            date: txnDate.toISOString().split('T')[0],
            amount: parseFloat(installmentAmount.toFixed(2)),
            merchant: data.merchant + (totalInstallments > 1 ? ` (${i+1}/${totalInstallments})` : ''),
            category: data.category,
            status: 'completed',
            owner: data.owner,
            isRecurring: data.isRecurring,
            installments: totalInstallments > 1 ? { current: i+1, total: totalInstallments, originalId: `origin_${Date.now()}` } : undefined
        });
    }

    setTransactions(prev => [...newTxns, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    // Update Balance Logic
    setAccounts(prevAccounts => prevAccounts.map(acc => {
      if (acc.id === data.accountId) {
        // If credit card, expenses make balance more negative
        // If checking, expenses reduce balance
        // Our 'data.amount' is already signed (negative for expense, positive for income)
        return { ...acc, balance: acc.balance + data.amount };
      }
      return acc;
    }));
  };

  const handleAddInvestment = (investment: Investment) => {
    setInvestments([...investments, investment]);
  };

  const handleOnboardingComplete = (profile: UserProfile, newGoals: Goal[]) => {
    setUserProfile(profile);
    setGoals(newGoals);
  };

  const handlePartnerConnect = (config: PartnerConfig) => {
      if (userProfile) {
          setUserProfile({ ...userProfile, partnerConfig: config });
      }
  };

  const handleAddGoal = (newGoal: Goal) => {
      setGoals([...goals, newGoal]);
  };

  const handleInvestmentActionConfirm = (data: any) => {
      const { investmentId, type, amount, accountId, date, quantity, price } = data;

      if (type === 'CONTRIBUTE') {
          // 1. Create Transaction (Expense) from Source Account (if selected)
          if (accountId) {
             const txn: Transaction = {
                id: `txn_inv_${Date.now()}`,
                accountId: accountId,
                date: date,
                amount: -amount, // Negative because money leaves account
                merchant: 'Aporte Investimento',
                category: 'Investimentos',
                status: 'completed',
                owner: 'me'
             };
             setTransactions(prev => [txn, ...prev]);
             setAccounts(prev => prev.map(a => a.id === accountId ? {...a, balance: a.balance - amount} : a));
          }

          // 2. Update Investment Data
          setInvestments(prev => prev.map(inv => {
              if (inv.id === investmentId) {
                  let updatedInv = { ...inv };
                  
                  if (inv.type === 'FII' && quantity && price) {
                      // Weighted Average Price Calculation
                      const totalOld = inv.amountInvested;
                      const totalNew = quantity * price;
                      const totalQty = (inv.quantity || 0) + quantity;
                      
                      updatedInv.quantity = totalQty;
                      updatedInv.averagePrice = (totalOld + totalNew) / totalQty;
                      updatedInv.amountInvested = totalOld + totalNew;
                      // For currentValue, we assume market price is roughly the price paid or existing market price
                      // Simplification: just add the value
                      updatedInv.currentValue = inv.currentValue + (quantity * price); 
                  } else {
                      // Fixed Income
                      updatedInv.amountInvested += amount;
                      updatedInv.currentValue += amount;
                  }
                  return updatedInv;
              }
              return inv;
          }));
      } else if (type === 'REDEEM') {
           // 1. Update Investment Data
           setInvestments(prev => prev.map(inv => {
               if (inv.id === investmentId) {
                   // Decrease current value
                   const newValue = Math.max(0, inv.currentValue - amount);
                   // Decrease invested amount proportionally (optional, but keeps profit % sane)
                   // Ratio: amount / currentValue
                   const ratio = amount / inv.currentValue;
                   const deductionInvested = inv.amountInvested * ratio;

                   return {
                       ...inv,
                       currentValue: newValue,
                       amountInvested: inv.amountInvested - deductionInvested
                   };
               }
               return inv;
           }));

           // 2. Add to Destination Account
           if (accountId) {
               setAccounts(prev => prev.map(a => a.id === accountId ? {...a, balance: a.balance + amount} : a));
               
               const txn: Transaction = {
                id: `txn_red_${Date.now()}`,
                accountId: accountId,
                date: date,
                amount: amount, // Positive income
                merchant: 'Resgate Investimento',
                category: 'Renda', // Or special category
                status: 'completed',
                owner: 'me'
             };
             setTransactions(prev => [txn, ...prev]);
           }
      }
  };

  return (
    <div className="flex flex-col h-full bg-dark text-slate-200 overflow-hidden selection:bg-primary selection:text-white">
      
      <OnboardingModal isOpen={!userProfile} onComplete={handleOnboardingComplete} />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 hidden md:flex flex-col pt-safe-top">
            <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Wallet size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">WealthWise</span>
            </div>

            {userProfile && (
                <div className="px-6 mb-2">
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                        <p className="font-semibold text-white truncate">{userProfile.name}</p>
                        <p className="text-xs text-primary truncate font-bold">{userProfile.knowledgeLevel === 'BEGINNER' ? 'Iniciante' : userProfile.knowledgeLevel === 'INTERMEDIATE' ? 'Intermediário' : 'Avançado'}</p>
                    </div>
                </div>
            )}

            <nav className="flex-1 px-4 space-y-1 mt-4">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                <LayoutDashboard size={18} /> Visão Geral
            </button>
            <button onClick={() => setActiveTab('goals')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'goals' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                <Target size={18} /> Objetivos
            </button>
            <button onClick={() => setActiveTab('budgets')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'budgets' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                <PieChart size={18} /> Orçamentos
            </button>
            <button onClick={() => setActiveTab('investments')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'investments' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                <LineChart size={18} /> Investimentos
            </button>
            <button onClick={() => setActiveTab('education')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'education' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                <BookOpen size={18} /> Educação
            </button>
            <button onClick={() => setActiveTab('advisor')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'advisor' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                <div className="relative">
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                    <Landmark size={18} />
                </div>
                AI Advisor
            </button>
            </nav>

            <div className="p-4 mb-safe-bottom">
            <button onClick={() => setIsAddTransactionOpen(true)} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-medium mb-2">
                <PlusCircle size={16} /> Lançar
            </button>
            <button onClick={() => setIsConnectModalOpen(true)} className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-500 hover:to-indigo-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 transition-all text-sm font-medium">
                <Plus size={16} /> Conta
            </button>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-dark pb-24 md:pb-0">
            <div className="max-w-6xl mx-auto p-6 md:p-8 pt-safe-top">
            
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <div>
                <div className="flex items-center gap-3 mb-1">
                    {/* Mobile Logo (only visible on mobile) */}
                    <div className="md:hidden w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Wallet size={16} />
                    </div>

                    <h1 className="text-xl md:text-2xl font-bold text-white truncate max-w-[200px] md:max-w-none">
                    {activeTab === 'dashboard' && 'Visão Geral'}
                    {activeTab === 'investments' && 'Investimentos'}
                    {activeTab === 'advisor' && 'AI Advisor'}
                    {activeTab === 'budgets' && 'Orçamentos'}
                    {activeTab === 'goals' && 'Objetivos'}
                    {activeTab === 'education' && 'Educação'}
                    </h1>
                    
                    {/* Couple Toggle */}
                    {accounts.length > 0 && (
                        <div className="hidden md:flex bg-slate-800 rounded-lg p-1 ml-4">
                            <button onClick={() => setViewMode('me')} className={`px-3 py-1 rounded text-xs font-medium transition-all ${viewMode === 'me' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>Eu</button>
                            <button onClick={() => setViewMode('joint')} className={`px-3 py-1 rounded text-xs font-medium transition-all ${viewMode === 'joint' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}>Casal</button>
                            <button onClick={() => setViewMode('partner')} className={`px-3 py-1 rounded text-xs font-medium transition-all ${viewMode === 'partner' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Parceiro</button>
                        </div>
                    )}
                </div>
                <p className="text-slate-400 text-xs md:text-sm truncate max-w-[300px] md:max-w-none">
                    {activeTab === 'dashboard' && dailyInsight}
                    {activeTab === 'investments' && 'Gestão inteligente de ativos.'}
                    {activeTab === 'education' && 'Aprenda com a IA.'}
                </p>
                </div>
                <div className="text-right">
                    <div className="hidden md:flex items-center justify-end gap-2 mb-1">
                        {!userProfile?.partnerConfig?.isConnected && accounts.length > 0 && (
                            <button 
                                onClick={() => setIsPartnerModalOpen(true)}
                                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 border border-blue-500/30 rounded px-2 py-0.5 bg-blue-500/10"
                            >
                                <Users size={12} /> Conectar
                            </button>
                        )}
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Patrimônio</p>
                    <p className="text-base md:text-xl font-bold text-white">{formatBRL(totalNetWorth)}</p>
                </div>
            </header>

            {/* Empty State / Zero State Handling */}
            {activeTab === 'dashboard' && accounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6 animate-fade-in">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-2 shadow-xl border border-slate-700">
                        <Wallet size={40} className="text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Vamos começar?</h2>
                        <p className="text-slate-400 max-w-md mx-auto">Adicione sua primeira conta bancária, cartão ou carteira para começar a controlar suas finanças manualmente.</p>
                    </div>
                    <button 
                        onClick={() => setIsConnectModalOpen(true)}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-900/20 transition-all transform hover:scale-105 flex items-center gap-3"
                    >
                        <PlusCircle size={24} /> Adicionar Primeira Conta
                    </button>
                </div>
            ) : (
                /* Standard Dashboard Content */
                <>
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        <StatCard 
                            title={dashboardPeriod === 'monthly' ? 'Receitas' : 'Receitas (Ano)'} 
                            amount={periodIncome} 
                            icon={<Wallet size={18} />} 
                            type="positive" 
                        />
                        <StatCard 
                            title={dashboardPeriod === 'monthly' ? 'Despesas' : 'Despesas (Ano)'} 
                            amount={periodExpense} 
                            icon={<ArrowDownRight size={18} />} 
                            type="negative" 
                        />
                        <StatCard 
                            title={'Investido (Mês)'} 
                            amount={periodInvested} 
                            icon={<TrendingUp size={18} />} 
                            type="positive" 
                        />
                        <div className="bg-card border border-slate-700 p-4 md:p-6 rounded-2xl shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                <p className="text-slate-400 text-xs md:text-sm font-medium">Rentabilidade</p>
                                <h3 className={`text-lg md:text-2xl font-bold mt-1 ${yieldPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {yieldPercentage >= 0 ? '+' : ''}{yieldPercentage.toFixed(2)}%
                                </h3>
                                </div>
                                <div className="p-2 md:p-3 bg-slate-700/50 rounded-xl text-primary">
                                    <Percent size={18} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts & Fixed Expenses */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Chart */}
                            <div className="bg-card border border-slate-700 p-4 md:p-6 rounded-2xl shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-base md:text-lg font-semibold text-white">
                                        {dashboardPeriod === 'monthly' ? 'Fluxo Diário' : 'Evolução Mensal'}
                                    </h3>
                                     <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                                        <button 
                                            onClick={() => setDashboardPeriod('monthly')}
                                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${dashboardPeriod === 'monthly' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            Mês
                                        </button>
                                        <button 
                                            onClick={() => setDashboardPeriod('yearly')}
                                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${dashboardPeriod === 'yearly' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            Ano
                                        </button>
                                    </div>
                                </div>
                                <SpendingChart transactions={filteredTransactions} viewPeriod={dashboardPeriod} />
                            </div>
                            
                            {/* Accounts Area */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                <h3 className="text-base md:text-lg font-semibold text-white">Minhas Contas</h3>
                                <button onClick={() => setIsConnectModalOpen(true)} className="text-sm text-primary hover:text-primary/80 font-medium">+ Add</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredAccounts.map(account => (
                                    <AccountCard 
                                        key={account.id} 
                                        account={account} 
                                        onUpdateBalance={handleUpdateBalance} 
                                        onPayBill={handlePayBill}
                                    />
                                ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar: Recent Txns & Fixed Expenses */}
                        <div className="space-y-6">
                            {/* Fixed Expenses */}
                            <FixedExpensesList transactions={filteredTransactions} />
                            
                            {/* Recent Txns */}
                            <div className="bg-card border border-slate-700 p-4 md:p-6 rounded-2xl shadow-sm pb-20 md:pb-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Últimas</h3>
                            {filteredTransactions.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">Nenhuma movimentação recente.</p>
                            ) : (
                                <div className="space-y-2">
                                    {filteredTransactions.slice(0, 6).map(t => (
                                        <div key={t.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                    {t.amount > 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white truncate max-w-[100px]">{t.merchant}</p>
                                                    <p className="text-[10px] text-slate-500">{t.category}</p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-bold ${t.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                                                {t.amount > 0 ? '+' : ''}{formatBRL(t.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            </div>
                        </div>
                    </div>
                    </div>
                )}

                {activeTab === 'budgets' && (
                    <div className="space-y-6 pb-20 md:pb-0">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-white">Orçamentos</h3>
                        <button onClick={() => setIsAddBudgetOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Plus size={16} /> Novo
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {budgets.length > 0 ? budgets.map(budget => (
                        <BudgetCard key={budget.id} category={budget.category} limit={budget.limit} spent={getCategorySpending(budget.category)} onDelete={() => handleDeleteBudget(budget.id)} />
                        )) : (
                            <p className="text-slate-500 text-sm col-span-full text-center py-10 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">Nenhum orçamento definido.</p>
                        )}
                    </div>
                    </div>
                )}

                {activeTab === 'goals' && userProfile && (
                    <div className="pb-20 md:pb-0">
                        <GoalsTab goals={goals} userProfile={userProfile} investments={investments} onAddGoal={handleAddGoal} />
                    </div>
                )}

                {activeTab === 'education' && userProfile && (
                    <div className="pb-20 md:pb-0">
                        <EducationTab userProfile={userProfile} investments={investments} modules={educationModules} />
                    </div>
                )}

                {activeTab === 'advisor' && (
                    <div className="pb-20 md:pb-0">
                        <FinancialAdvisor accounts={filteredAccounts} transactions={filteredTransactions} />
                    </div>
                )}

                {activeTab === 'investments' && (
                    <div className="space-y-6 pb-20 md:pb-0">
                    {/* Investment Portfolio Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-2xl">
                            <p className="text-slate-400 text-sm font-medium mb-1">Total Investido</p>
                            <h3 className="text-3xl font-bold text-white">{formatBRL(investmentBalance)}</h3>
                        </div>
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-2xl">
                            <p className="text-slate-400 text-sm font-medium mb-1">Rentabilidade Geral</p>
                            <div className="flex items-end gap-2">
                                <h3 className={`text-3xl font-bold ${yieldPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {yieldPercentage >= 0 ? '+' : ''}{yieldPercentage.toFixed(2)}%
                                </h3>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-primary/10 to-slate-900 border border-primary/20 p-6 rounded-2xl flex flex-col justify-center items-start">
                            <button onClick={() => setIsAddInvestmentOpen(true)} className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-sm font-medium">
                            <Plus size={18} /> Novo Ativo
                            </button>
                        </div>
                    </div>
                    
                    {/* List of Assets */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Minha Carteira</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {investments.length > 0 ? investments.map(inv => (
                                <InvestmentCard 
                                    key={inv.id} 
                                    investment={inv} 
                                    onAction={(type, inv) => setInvestmentAction({type, investment: inv})}
                                />
                            )) : (
                                <p className="text-slate-500 text-sm col-span-full text-center py-10 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">Nenhum investimento cadastrado.</p>
                            )}
                        </div>
                    </div>
                    </div>
                )}
                </>
            )}
            </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {userProfile && accounts.length > 0 && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe-bottom z-40">
            <div className="flex justify-around items-center p-3">
                <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-primary' : 'text-slate-500'}`}>
                    <LayoutDashboard size={20} />
                    <span className="text-[10px] font-medium">Início</span>
                </button>
                <button onClick={() => setActiveTab('goals')} className={`flex flex-col items-center gap-1 ${activeTab === 'goals' ? 'text-primary' : 'text-slate-500'}`}>
                    <Target size={20} />
                    <span className="text-[10px] font-medium">Metas</span>
                </button>
                <div className="relative -top-6">
                    <button 
                    onClick={() => setIsAddTransactionOpen(true)}
                    className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 border-4 border-slate-900"
                    >
                        <Plus size={28} />
                    </button>
                </div>
                <button onClick={() => setActiveTab('investments')} className={`flex flex-col items-center gap-1 ${activeTab === 'investments' ? 'text-primary' : 'text-slate-500'}`}>
                    <TrendingUp size={20} />
                    <span className="text-[10px] font-medium">Investir</span>
                </button>
                <button onClick={() => setActiveTab('advisor')} className={`flex flex-col items-center gap-1 ${activeTab === 'advisor' ? 'text-primary' : 'text-slate-500'}`}>
                    <Landmark size={20} />
                    <span className="text-[10px] font-medium">AI</span>
                </button>
            </div>
        </div>
      )}

      {/* Modals */}
      <ConnectAccountModal isOpen={isConnectModalOpen} onClose={() => setIsConnectModalOpen(false)} onConnect={handleConnectAccount} />
      <AddBudgetModal isOpen={isAddBudgetOpen} onClose={() => setIsAddBudgetOpen(false)} onSave={handleAddBudget} existingCategories={budgets.map(b => b.category)} />
      <AddTransactionModal isOpen={isAddTransactionOpen} onClose={() => setIsAddTransactionOpen(false)} onSave={handleAddTransaction} accounts={filteredAccounts} />
      <AddInvestmentModal isOpen={isAddInvestmentOpen} onClose={() => setIsAddInvestmentOpen(false)} onSave={handleAddInvestment} />
      <SecurityModal isOpen={isSecurityModalOpen} onClose={() => setIsSecurityModalOpen(false)} />
      <PartnerConnectModal isOpen={isPartnerModalOpen} onClose={() => setIsPartnerModalOpen(false)} onConnect={handlePartnerConnect} />
      <InvestmentActionModal 
        isOpen={!!investmentAction} 
        onClose={() => setInvestmentAction(null)} 
        investment={investmentAction?.investment || null}
        actionType={investmentAction?.type || null}
        accounts={filteredAccounts}
        onConfirm={handleInvestmentActionConfirm}
      />
    </div>
  );
};

export default App;
