import React from 'react';

const BadgeDisplay = ({ badges = [] }) => {
  if (badges.length === 0) return null;
  
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {badges.map((badge, index) => (
        <div key={index} className="flex flex-col items-center p-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full border border-indigo-100 dark:border-indigo-800 shadow-sm min-w-[80px]">
          <span className="text-2xl mb-1">{badge.icon || '🏆'}</span>
          <span className="text-[10px] font-bold text-center text-indigo-900 dark:text-indigo-200 leading-tight">
            {badge.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default BadgeDisplay;
