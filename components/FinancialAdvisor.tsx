import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { AISessionMessage, Account, Transaction } from '../types';
import { createFinancialAdvisorChat } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';

interface FinancialAdvisorProps {
  accounts: Account[];
  transactions: Transaction[];
}

const FinancialAdvisor: React.FC<FinancialAdvisorProps> = ({ accounts, transactions }) => {
  const [messages, setMessages] = useState<AISessionMessage[]>([
    { role: 'model', text: "Hello! I'm your WealthWise AI advisor. I've analyzed your connected accounts. Ask me about your spending trends, investment allocation, or how to save more money this month.", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session with current data context
    chatSessionRef.current = createFinancialAdvisorChat(accounts, transactions);
  }, [accounts, transactions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: AISessionMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result: GenerateContentResponse = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      const modelMsg: AISessionMessage = { role: 'model', text: result.text || "I couldn't process that request.", timestamp: Date.now() };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting to the AI service right now.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-card rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex items-center gap-3">
        <div className="p-2 bg-primary/20 rounded-lg text-primary">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-white">WealthWise Advisor</h3>
          <p className="text-xs text-slate-400">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary' : 'bg-emerald-600'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
            }`}>
              {/* Simple markdown rendering for bold text */}
              {msg.text.split('**').map((part, i) => 
                i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
               <Bot size={16} />
             </div>
             <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700">
               <div className="flex gap-1 h-4 items-center">
                 <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                 <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                 <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-card border-t border-slate-700">
        <div className="flex items-end gap-2 bg-slate-900/50 border border-slate-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your finances..."
            className="flex-1 bg-transparent border-none text-white placeholder-slate-500 text-sm resize-none focus:ring-0 max-h-24 py-2 px-2"
            rows={1}
            style={{ minHeight: '40px' }}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-primary hover:bg-primary/90 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-600 mt-2">AI can make mistakes. Review transaction history for accuracy.</p>
      </div>
    </div>
  );
};

export default FinancialAdvisor;