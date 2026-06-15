import React, { useState } from 'react';
import { useAnalysisHistory } from '../hooks/useAnalysisHistory';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export default function ProgressPage() {
  const { data, isLoading } = useAnalysisHistory(1, 50);
  const [timeRange, setTimeRange] = useState(30);

  if (isLoading) return <div className="p-8 text-center">Loading progress data...</div>;

  const analyses = data?.analyses || [];
  
  if (analyses.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Not Enough Data</h2>
        <p className="text-gray-500">Complete at least one skin analysis to see your progress charts.</p>
      </div>
    );
  }

  const cutoffDate = subDays(new Date(), timeRange);
  const chartData = analyses
    .filter(a => new Date(a.createdAt) >= cutoffDate)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(a => ({
      date: format(new Date(a.createdAt), 'MMM dd'),
      overall: a.overallScore,
      acne: a.severity.acne,
      hydration: a.severity.hydration,
      pigmentation: a.severity.pigmentation
    }));

  const bestDay = [...analyses].sort((a, b) => b.overallScore - a.overallScore)[0];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Progress</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your skin journey over time.</p>
        </div>
        <select 
          className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
        >
          <option value={30}>Last 30 Days</option>
          <option value={60}>Last 60 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-lg mb-6">Overall Skin Health</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="overall" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-center items-center text-center">
          <span className="text-4xl mb-4">🌟</span>
          <h3 className="font-bold text-xl mb-1">Best Skin Day</h3>
          <p className="text-indigo-100 mb-6">{format(new Date(bestDay.createdAt), 'MMMM do, yyyy')}</p>
          <div className="text-5xl font-black">{bestDay.overallScore}</div>
          <p className="text-sm mt-2 text-indigo-100 uppercase tracking-wide">Overall Score</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-lg mb-6">Conditions Breakdown</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="acne" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="pigmentation" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="hydration" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
