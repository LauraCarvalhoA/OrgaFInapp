
import React, { useEffect, useState } from 'react';
import { UserProfile, EducationModule, Investment } from '../types';
import { BookOpen, Lock, CheckCircle, PlayCircle, Newspaper } from 'lucide-react';
import { getPersonalizedNews } from '../services/geminiService';

interface EducationTabProps {
  userProfile: UserProfile;
  investments: Investment[];
  modules: EducationModule[];
}

const EducationTab: React.FC<EducationTabProps> = ({ userProfile, investments, modules }) => {
  const [news, setNews] = useState<{title: string, summary: string}[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
      const fetchNews = async () => {
          const data = await getPersonalizedNews(investments);
          setNews(data);
          setLoadingNews(false);
      };
      fetchNews();
  }, [investments]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       {/* Learning Path */}
       <div className="lg:col-span-2 space-y-6">
           <div className="bg-card border border-slate-700 rounded-2xl p-6">
               <div className="flex items-center justify-between mb-6">
                   <div>
                       <h3 className="text-xl font-bold text-white flex items-center gap-2">
                           <BookOpen className="text-primary" size={24} /> 
                           Trilha de Conhecimento
                       </h3>
                       <p className="text-slate-400 text-sm">Nível Atual: <span className="text-white font-bold">{userProfile.knowledgeLevel}</span></p>
                   </div>
                   <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-1/3"></div>
                   </div>
               </div>

               <div className="space-y-4">
                   {modules.map((module, idx) => (
                       <div key={module.id} className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all ${module.isLocked ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-slate-800 border-slate-700 hover:border-primary/50 cursor-pointer'}`}>
                           {/* Connector Line */}
                           {idx < modules.length - 1 && (
                               <div className="absolute left-[29px] top-[50px] bottom-[-20px] w-0.5 bg-slate-800 -z-10"></div>
                           )}
                           
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${module.completed ? 'bg-emerald-500 text-white' : module.isLocked ? 'bg-slate-800 text-slate-600' : 'bg-primary text-white'}`}>
                               {module.completed ? <CheckCircle size={16} /> : module.isLocked ? <Lock size={14} /> : <PlayCircle size={16} />}
                           </div>
                           
                           <div>
                               <div className="flex items-center gap-2 mb-1">
                                   {module.recommendedFor && (
                                       <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-900/30 text-yellow-400 uppercase">
                                           Recomendado
                                       </span>
                                   )}
                                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                       module.level === 'BEGINNER' ? 'bg-green-900/30 text-green-400' :
                                       module.level === 'INTERMEDIATE' ? 'bg-blue-900/30 text-blue-400' :
                                       'bg-purple-900/30 text-purple-400'
                                   }`}>
                                       {module.level === 'ALL' ? 'Todos' : module.level}
                                   </span>
                                   <span className="text-xs text-slate-500">{module.readTime}</span>
                               </div>
                               <h4 className="font-bold text-white text-base">{module.title}</h4>
                               <p className="text-sm text-slate-400 mt-1 leading-relaxed">{module.description}</p>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
       </div>

       {/* News Feed */}
       <div className="space-y-6">
           <div className="bg-card border border-slate-700 rounded-2xl p-6 sticky top-6">
               <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                   <Newspaper className="text-blue-400" size={20} />
                   Notícias da sua Carteira
               </h3>
               
               {loadingNews ? (
                   <div className="space-y-4 animate-pulse">
                       {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-800 rounded-xl"></div>)}
                   </div>
               ) : (
                   <div className="space-y-4">
                       {news.map((item, idx) => (
                           <div key={idx} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors">
                               <h4 className="font-bold text-white text-sm mb-2">{item.title}</h4>
                               <p className="text-xs text-slate-400 leading-relaxed">{item.summary}</p>
                           </div>
                       ))}
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};

export default EducationTab;
