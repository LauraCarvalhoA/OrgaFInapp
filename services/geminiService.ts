
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Account, Transaction, Investment, UserProfile, Goal } from "../types";
import { CURRENT_CDI_RATE } from "../constants";

// Safely attempt to access API KEY. 
// In some browser environments, accessing 'process' directly might throw if not polyfilled.
let apiKey = '';
try {
  // @ts-ignore
  apiKey = process.env.API_KEY || '';
} catch (e) {
  console.warn("API Key could not be loaded from process.env. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey });

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

  const investmentSummary = investments.length > 0 ? investments.map(i => {
     if (i.type === 'FII') return `- FII ${i.ticker} (${i.quantity} cotas): R$ ${i.currentValue.toFixed(2)} (Div: ${i.lastDividend}) - Início: ${i.startDate}`;
     return `- Renda Fixa ${i.name} (${i.percentage}% ${i.index}): R$ ${i.currentValue.toFixed(2)} - Início: ${i.startDate}`;
  }).join('\n') : "No specific investments tracked yet.";

  const systemInstruction = `
    You are WealthWise AI, an advanced financial planner for Brazil.
    User Level: ${userProfile?.knowledgeLevel || 'BEGINNER'}
    User Debt: R$ ${userProfile?.totalDebt || 0}
    User Assets: R$ ${userProfile?.liquidAssets || 0}
    
    Context (BRL):
    - Total Net Worth: R$ ${totalNetWorth.toFixed(2)}
    - CDI: ${(CURRENT_CDI_RATE * 100).toFixed(2)}%
    
    Investments:
    ${investmentSummary}

    Recent Txns:
    ${recentTransactions}

    Tasks:
    1. Answer questions based on their specific context.
    2. If they are beginner, explain simple concepts. If advanced, go deep into technicals.
    3. Always respect Brazilian tax laws (IR, IOF).
  `;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
      temperature: 0.5,
    },
  });
};

export const generateMonthlyInsight = async (accounts: Account[], transactions: Transaction[], userProfile?: UserProfile): Promise<string> => {
  if (!apiKey) return "Organize suas finanças para crescer.";
  
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const prompt = `
    Context: User level is ${userProfile?.knowledgeLevel || 'Beginner'}.
    Based on balance R$ ${totalBalance} and recent activity, give 1 short financial tip in Portuguese.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Analise seus gastos mensais.";
  } catch (error) {
    return "Mantenha o foco nos objetivos.";
  }
};

/**
 * Analyzes a specific financial goal (e.g., Buy Car) and suggests a strategy (Cash vs Finance).
 */
export const analyzeGoalStrategy = async (goal: Goal, userProfile: UserProfile, investments: Investment[]): Promise<string> => {
  if (!apiKey) return "Configuração de IA necessária para análise detalhada.";

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
    I am ${userProfile.name}, my knowledge level is ${userProfile.knowledgeLevel}.
    I have a goal: "${goal.title}"
    Target: R$ ${goal.targetAmount}
    Current Saved: R$ ${goal.currentAmount}
    Type: ${goal.type}
    Deadline: ${goal.deadline || 'Undefined'}
    ${specifics}

    My Total Liquid Assets: R$ ${userProfile.liquidAssets}
    My Total Debt: R$ ${userProfile.totalDebt}

    Current Brazil Market: CDI is ${(CURRENT_CDI_RATE * 100).toFixed(2)}%.

    Task:
    Analyze the best strategy for this goal. 
    If it's a purchase (e.g., car/house), compare paying cash vs financing and keeping money invested.
    If it's retirement, calculate if the current pace is enough, suggest asset allocation (e.g., % in IPCA+ bonds vs Stocks) based on the time horizon.
    
    Return a concise, markdown formatted strategy advice (max 200 words). Use bullet points.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar análise no momento.";
  } catch (error) {
    return "Erro ao conectar com o estrategista financeiro.";
  }
};

export const getPersonalizedNews = async (investments: Investment[]): Promise<{title: string, summary: string}[]> => {
    if (investments.length === 0) return [{ title: "Comece a investir", summary: "Adicione ativos para receber notícias personalizadas." }];
    if (!apiKey) return [{ title: "Mercado Financeiro", summary: "Acompanhe os indicadores econômicos." }];

    const tickers = investments.map(i => i.ticker || i.name).join(', ');
    const prompt = `
        Generate 3 fictional but realistic financial news headlines and one-sentence summaries relevant to these assets: ${tickers}.
        Context: Brazil Market, recent trends.
        Format: JSON Array [{ "title": "...", "summary": "..." }]
    `;

    try {
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
