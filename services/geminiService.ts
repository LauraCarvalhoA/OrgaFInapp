import { GoogleGenAI, Chat, GenerateContentResponse, Part } from "@google/genai";
import { Account, Transaction, Investment, UserProfile, Goal, Budget, StatementItem } from "../types";
import { CURRENT_CDI_RATE } from "../constants";

// Helper to lazily get the AI instance. 
const getAI = () => {
    let apiKey = '';
    try {
        // Check local storage override first (set via SettingsModal)
        const localKey = localStorage.getItem('user_api_key');
        if (localKey) return new GoogleGenAI({ apiKey: localKey });

        // Check import.meta.env (Vite / Vercel standard)
        if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.API_KEY) {
             apiKey = (import.meta as any).env.API_KEY;
        }
        // Fallback to process.env (Node / Webpack polyfill)
        else if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            apiKey = process.env.API_KEY;
        }
    } catch (e) {
        console.warn("Failed to read API Key from environment.");
    }

    return new GoogleGenAI({ apiKey: apiKey || 'dummy_key_for_safe_init' });
};

/**
 * Starts a chat session with context about the user's finances.
 */
export const createFinancialAdvisorChat = (
  accounts: Account[], 
  transactions: Transaction[], 
  investments: Investment[] = [],
  userProfile?: UserProfile
): Chat => {
  const totalNetWorth = accounts.reduce((acc, curr) => acc + curr.balance, 0) + investments.reduce((acc, curr) => acc + curr.currentValue, 0);
  
  const recentTransactions = transactions.slice(0, 30).map(t => 
    `- ${t.date}: ${t.merchant} (R$ ${t.amount}) [${t.category}]`
  ).join('\n');

  const systemInstruction = `
    You are WealthWise AI, an advanced financial planner.
    Language: ENGLISH ONLY.
    
    User Profile:
    - Name: ${userProfile?.name}
    - Level: ${userProfile?.knowledgeLevel || 'BEGINNER'}
    - Monthly Income: R$ ${userProfile?.monthlyIncome || 0}
    - Debt: R$ ${userProfile?.totalDebt || 0}
    - Assets: R$ ${userProfile?.liquidAssets || 0}
    - Total Net Worth: R$ ${totalNetWorth.toFixed(2)}
    
    Context:
    - Brazil Market CDI: ${(CURRENT_CDI_RATE * 100).toFixed(2)}%
    
    Recent Transactions:
    ${recentTransactions}

    Tasks:
    1. Answer questions based on their specific context.
    2. If they are beginner, explain simple concepts.
    3. Provide actionable advice to help them save more or invest better.
  `;

  try {
      const ai = getAI();
      return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction,
          temperature: 0.5,
        },
      });
  } catch (e) {
      console.error("Failed to create chat session", e);
      return {
          sendMessage: async () => ({ text: "Error connecting to AI. Please check your API Key in Settings." })
      } as any;
  }
};

export const generateMonthlyInsight = async (accounts: Account[], transactions: Transaction[], userProfile?: UserProfile): Promise<string> => {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const prompt = `
    Context: User level is ${userProfile?.knowledgeLevel || 'Beginner'}. Balance: R$ ${totalBalance}.
    Task: Give 1 short, motivating financial tip in Portuguese based on general financial wisdom. Max 15 words.
  `;

  try {
    const ai = getAI();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Analise seus gastos mensais.";
  } catch (error) {
    return "Mantenha o foco nos objetivos.";
  }
};

export const analyzeGoalStrategy = async (goal: Goal, userProfile: UserProfile, investments: Investment[]): Promise<string> => {
  let specifics = "";
  if (goal.type === 'RETIREMENT' && goal.retirementDetails) {
      specifics = `
      RETIREMENT SPECIFICS:
      Current Age: ${goal.retirementDetails.currentAge}
      Retirement Age: ${goal.retirementDetails.retirementAge}
      Desired Monthly Income: ${goal.retirementDetails.desiredMonthlyIncome}
      `;
  }

  const prompt = `
    I am ${userProfile.name}, my income is R$ ${userProfile.monthlyIncome}.
    I have a goal: "${goal.title}"
    Target: R$ ${goal.targetAmount}
    Current Saved: R$ ${goal.currentAmount}
    Type: ${goal.type}
    ${specifics}

    My Total Liquid Assets: R$ ${userProfile.liquidAssets}
    My Total Debt: R$ ${userProfile.totalDebt}
    Brazil Market CDI: ${(CURRENT_CDI_RATE * 100).toFixed(2)}%.

    Task:
    Analyze the best strategy for this goal. Language: ENGLISH.
    If it's retirement, calculate if the current pace is enough considering my income and age. Suggest aggressive vs conservative allocation.
    If it's a purchase, suggest if I should finance or save.
    
    Return a concise, markdown formatted strategy advice (max 200 words).
  `;

  try {
    const ai = getAI();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Unable to generate analysis.";
  } catch (error) {
    return "Error connecting to financial strategist.";
  }
};

export const getPersonalizedNews = async (investments: Investment[]): Promise<{title: string, summary: string}[]> => {
    if (investments.length === 0) return [{ title: "Start Investing", summary: "Add assets to receive personalized market news." }];
    
    const tickers = investments.map(i => i.ticker || i.name).join(', ');
    const prompt = `
        Generate 3 realistic financial news headlines relevant to these assets: ${tickers}.
        Context: Brazil Market. Language: Portuguese.
        Format: JSON Array [{ "title": "...", "summary": "..." }]
    `;

    try {
        const ai = getAI();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) {
        return [{ title: "Mercado Financeiro", summary: "Acompanhe a volatilidade do Ibovespa." }];
    }
};

/**
 * Analyzes a Bank Statement Image and returns structured transactions.
 */
export const analyzeBankStatement = async (imageBase64: string): Promise<StatementItem[]> => {
    const prompt = `
        Analyze this bank statement image. Extract all transactions.
        Return a JSON Array where each object has:
        - date (YYYY-MM-DD format)
        - description (string, merchant name)
        - amount (number, negative for expense, positive for income)
        - category (Best guess category: Alimentação, Transporte, Moradia, Lazer, Saúde, Renda, Outros)

        Ignore header/footer text. Just transactions.
    `;

    try {
        const ai = getAI();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
                    { text: prompt }
                ]
            },
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) {
        console.error(e);
        throw new Error("Failed to analyze statement");
    }
};

/**
 * Suggests budgets based on Income and Goals.
 */
export const suggestSmartBudgets = async (userProfile: UserProfile, goals: Goal[]): Promise<Budget[]> => {
    const mainGoal = goals[0]; // Prioritize main goal
    const prompt = `
        User Income: R$ ${userProfile.monthlyIncome}
        Main Goal: ${mainGoal ? mainGoal.title + ' (' + mainGoal.type + ')' : 'Save Money'}
        Goal Target: ${mainGoal ? 'R$ ' + mainGoal.targetAmount : 'General Savings'}
        
        Task:
        Create a monthly budget plan (JSON Array).
        Categories to include: Moradia, Alimentação, Transporte, Lazer, Investimentos (Savings).
        
        Logic:
        - If goal is Aggressive (e.g. Early Retirement), maximize Investimentos.
        - Ensure total sum <= Income.
        - Use Brazilian Real cost of living standards.
        
        Output JSON Format:
        [ { "category": "String", "limit": Number } ]
    `;

    try {
        const ai = getAI();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        const budgets = JSON.parse(response.text || "[]");
        return budgets.map((b: any, i: number) => ({ id: `bud_ai_${Date.now()}_${i}`, category: b.category, limit: b.limit }));
    } catch (e) {
        console.error(e);
        return [];
    }
};
