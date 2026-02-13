
import React, { useState } from 'react';
import { User, MatchScore } from '../types';
import { Icons } from '../constants';
import { generateSwapInsight } from '../services/geminiService';
import { currentUser } from '../data/mockUsers';

interface MatchCardProps {
  user: User;
  match: MatchScore;
  onChat: (userId: string) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ user, match, onChat }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const handleGetInsight = async () => {
    if (insight) {
      setInsight(null);
      return;
    }
    setLoadingInsight(true);
    const result = await generateSwapInsight(currentUser, user);
    setInsight(result);
    setLoadingInsight(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="flex gap-5">
          <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-50 shadow-md group-hover:scale-105 transition-transform" />
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-1.5 mb-1">
              {user.name}
              {user.isVerified && <Icons.Verified />}
            </h3>
            <div className="flex items-center text-sm text-slate-500 gap-2">
              <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg font-bold">
                <Icons.Star />
                <span>{user.rating}</span>
              </div>
              <span className="opacity-50">•</span>
              <span className="font-medium">{user.location}</span>
            </div>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest ${
          match.score > 80 ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white'
        } shadow-lg shadow-indigo-100`}>
          {match.score}% Score
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">AI Analysis</p>
          <p className="text-sm text-slate-700 leading-relaxed font-medium italic">"{match.reasoning}"</p>
        </div>

        {insight && (
          <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-200/50 animate-in slide-in-from-top-4 duration-300">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <Icons.Sparkles /> AI Suggested Session Plan
            </p>
            <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-medium">
              {insight}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Expertise</p>
            <div className="text-sm text-slate-800 font-bold truncate">
              {user.skillsOffered[0]?.name}
            </div>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Needs</p>
            <div className="text-sm text-slate-800 font-bold truncate">
              {user.skillsNeeded[0]?.name}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleGetInsight}
            disabled={loadingInsight}
            className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            {loadingInsight ? (
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Icons.Sparkles /> {insight ? 'Hide Insight' : 'Get AI Insight'}
              </>
            )}
          </button>
          <button 
            onClick={() => onChat(user.id)}
            className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-100"
          >
            Request Swap
          </button>
        </div>
      </div>
      
      {/* Aesthetic background accent */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-[60px] opacity-50 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
};

export default MatchCard;
