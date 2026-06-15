import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const SkinScoreGauge = ({ score, delta }) => {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = score / steps;
    const interval = duration / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setCurrentScore(score);
        clearInterval(timer);
      } else {
        setCurrentScore(Math.floor(current));
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [score]);

  let colorClass = 'text-rose-500';
  let strokeClass = 'stroke-rose-500';
  if (score > 30) { colorClass = 'text-amber-500'; strokeClass = 'stroke-amber-500'; }
  if (score > 60) { colorClass = 'text-emerald-500'; strokeClass = 'stroke-emerald-500'; }
  if (score > 80) { colorClass = 'text-teal-500'; strokeClass = 'stroke-teal-500'; }

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle 
            className="stroke-gray-200 dark:stroke-gray-700" 
            strokeWidth="8" 
            fill="transparent" 
            r="45" 
            cx="50" 
            cy="50" 
          />
          <motion.circle
            className={strokeClass}
            strokeWidth="8"
            strokeLinecap="round"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <span className={`text-3xl font-bold ${colorClass}`}>{currentScore}</span>
        </div>
      </div>
      
      {delta !== undefined && delta !== null && (
        <div className={`mt-2 font-semibold ${delta > 0 ? 'text-emerald-500' : delta < 0 ? 'text-rose-500' : 'text-gray-500'}`}>
          {delta > 0 ? '+' : ''}{delta} pts
        </div>
      )}
    </div>
  );
};

export default SkinScoreGauge;
