import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, TrendingUp, TrendingDown, Target, Brain, Award, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';

const AIEvaluationModal = ({ isOpen, onClose, user }) => {
  const { aiEvaluation, aiEvaluationLoading } = useSelector((state) => state.team);

  if (!isOpen) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-emerald-400 to-teal-500';
    if (score >= 60) return 'from-amber-400 to-orange-500';
    return 'from-rose-400 to-red-500';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className="bg-slate-900 border border-slate-700/50 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative"
        >
          {/* Top Decorative Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-500/20 blur-[100px] pointer-events-none" />

          <div className="p-8 relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Sparkles className="text-indigo-400" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">AI Productivity Report</h2>
                  <p className="text-slate-400 font-medium text-sm">Analysis for {user?.username}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {aiEvaluationLoading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-indigo-400 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Gemini AI is analyzing...</p>
              </div>
            ) : aiEvaluation ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Score Card */}
                  <div className="col-span-1 bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Target className="text-slate-400 mb-2" size={20} />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Productivity Score</h3>
                    <div className="relative flex items-center justify-center w-24 h-24 mb-2">
                       {/* SVG Circular Progress */}
                       <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                         <circle cx="50" cy="50" r="45" fill="none" className="stroke-slate-700" strokeWidth="8" />
                         <motion.circle 
                           initial={{ strokeDashoffset: 283 }}
                           animate={{ strokeDashoffset: 283 - (283 * aiEvaluation.productivityScore) / 100 }}
                           transition={{ duration: 1.5, ease: "easeOut" }}
                           cx="50" cy="50" r="45" fill="none" 
                           className={`stroke-current ${getScoreColor(aiEvaluation.productivityScore)}`} 
                           strokeWidth="8" 
                           strokeDasharray="283" 
                           strokeLinecap="round" 
                         />
                       </svg>
                       <span className="absolute text-2xl font-black text-white">{aiEvaluation.productivityScore}</span>
                    </div>
                  </div>

                  {/* Work Style & Impact */}
                  <div className="col-span-2 space-y-4 flex flex-col justify-between">
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <Brain size={24} />
                      </div>
                      <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Identified Work Style</h3>
                        <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                          {aiEvaluation.workStyle}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        {aiEvaluation.incrementImpact.includes("-") || aiEvaluation.incrementImpact.toLowerCase().includes("warning") ? (
                           <TrendingDown size={24} className="text-rose-400" />
                        ) : (
                           <TrendingUp size={24} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Recommended Action</h3>
                        <p className="text-lg font-black text-white">
                          {aiEvaluation.incrementImpact}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Summary Conclusion */}
                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="text-indigo-400" size={18} />
                    <h3 className="text-xs font-black text-indigo-300 uppercase tracking-widest">AI Conclusion for Manager</h3>
                  </div>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">
                    {aiEvaluation.summary}
                  </p>
                </div>
                
                {aiEvaluation.lastEvaluatedAt && (
                   <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold flex items-center justify-center gap-1 mt-4">
                      <AlertCircle size={10} />
                      Last Evaluated: {new Date(aiEvaluation.lastEvaluatedAt).toLocaleString()}
                   </p>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">No evaluation data available. Please try again.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIEvaluationModal;
