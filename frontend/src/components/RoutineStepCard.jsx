import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RoutineStepCard = ({ step, onComplete, onReaction }) => {
  const [expanded, setExpanded] = useState(false);
  const [reactionPromptOpen, setReactionPromptOpen] = useState(false);

  const handleComplete = () => {
    onComplete(step._id);
    if (!step.isCompleted) {
      setReactionPromptOpen(true);
    }
  };

  const handleReaction = (reactionType) => {
    onReaction({
      stepTitle: step.title,
      productType: step.productType,
      ingredients: step.recommendedIngredients,
      reaction: reactionType,
      weeksUsed: 1
    });
    setReactionPromptOpen(false);
  };

  return (
    <div className={`border rounded-xl mb-4 overflow-hidden transition-all duration-300 ${step.isCompleted ? 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700' : 'bg-white border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700'}`}>
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4 flex-1">
          <button 
            onClick={(e) => { e.stopPropagation(); handleComplete(); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${step.isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'}`}
          >
            <CheckCircle size={20} />
          </button>
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-gray-400">STEP {step.stepOrder}</span>
              <h4 className={`font-semibold text-lg ${step.isCompleted ? 'text-gray-500 line-through dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                {step.title}
              </h4>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{step.productType}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center text-sm text-gray-500">
            <Clock size={16} className="mr-1" />
            {step.estimatedTime} min
          </div>
          {expanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700"
          >
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Why this step?</h5>
                <p className="text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                  {step.rationale}
                </p>
                
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white mt-4 mb-2">How to use</h5>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {step.instructions}
                </p>
              </div>
              
              <div className="space-y-4">
                {step.recommendedIngredients?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">Look for ingredients:</h5>
                    <div className="flex flex-wrap gap-2">
                      {step.recommendedIngredients.map((ing, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {step.avoidIngredients?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-2 flex items-center">
                      <AlertTriangle size={14} className="mr-1" /> Avoid ingredients:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {step.avoidIngredients.map((ing, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded-md">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reactionPromptOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-x-0 bottom-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 shadow-lg rounded-b-xl z-10"
          >
            <p className="text-sm font-medium text-center mb-3">How did this product feel today?</p>
            <div className="flex justify-center space-x-2">
              <button onClick={() => handleReaction('positive')} className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg flex flex-col items-center flex-1">
                <span className="text-xl">👍</span><span className="text-xs mt-1">Great</span>
              </button>
              <button onClick={() => handleReaction('neutral')} className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg flex flex-col items-center flex-1">
                <span className="text-xl">😐</span><span className="text-xs mt-1">Okay</span>
              </button>
              <button onClick={() => handleReaction('irritation')} className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg flex flex-col items-center flex-1">
                <span className="text-xl">⚠️</span><span className="text-xs mt-1">Irritated</span>
              </button>
              <button onClick={() => handleReaction('breakout')} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg flex flex-col items-center flex-1">
                <span className="text-xl">❌</span><span className="text-xs mt-1">Breakout</span>
              </button>
            </div>
            <button onClick={() => setReactionPromptOpen(false)} className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 text-center">
              Skip for now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoutineStepCard;
