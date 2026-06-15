import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const ConditionCard = ({ condition, severity, delta, history }) => {
  const getSeverityLabel = (score) => {
    if (score <= 10) return 'Clear';
    if (score <= 25) return 'Almost Clear';
    if (score <= 45) return 'Mild';
    if (score <= 65) return 'Moderate';
    if (score <= 80) return 'Severe';
    return 'Very Severe';
  };

  const getSeverityColor = (score) => {
    if (score <= 25) return 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30';
    if (score <= 65) return 'text-amber-500 bg-amber-100 dark:bg-amber-900/30';
    return 'text-rose-500 bg-rose-100 dark:bg-rose-900/30';
  };

  const label = getSeverityLabel(severity);
  const colorClasses = getSeverityColor(severity);
  
  const sparklineData = history ? history.map((val, i) => ({ val, index: i })) : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800 dark:text-white capitalize">{condition}</h3>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>
          {label}
        </span>
      </div>
      
      <div className="flex items-end justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{severity}</span>
          {delta !== undefined && (
            <div className={`flex items-center text-sm font-medium ${delta < 0 ? 'text-emerald-500' : delta > 0 ? 'text-rose-500' : 'text-gray-500'}`}>
              {delta < 0 ? <ArrowDownRight size={16} /> : delta > 0 ? <ArrowUpRight size={16} /> : <Minus size={16} />}
              <span className="ml-1">{Math.abs(delta)} from last</span>
            </div>
          )}
        </div>
        
        {sparklineData.length > 0 && (
          <div className="w-16 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line type="monotone" dataKey="val" stroke={delta > 0 ? '#f43f5e' : '#10b981'} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConditionCard;
