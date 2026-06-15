import React, { useState } from 'react';
import { useAnalysisHistory } from '../../hooks/useAnalysisHistory';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Skeleton } from '../../components/common/LoadingSkeleton';

export default function ProgressPage() {
  const { data, isLoading } = useAnalysisHistory(1, 50);
  const [timeRange, setTimeRange] = useState(30);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <Skeleton className="h-20 w-full rounded-2xl mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const analyses = data?.analyses || [];
  
  if (analyses.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border-dashed border-2">
          <CardContent className="p-16 text-center">
            <span className="text-5xl block mb-4">📈</span>
            <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Not Enough Data</h2>
            <p className="text-slate-500 dark:text-slate-400">Complete at least one skin analysis to see your progress charts.</p>
          </CardContent>
        </Card>
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Your Progress</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Track your skin journey over time.</p>
        </div>
        <select 
          className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
        >
          <option value={30}>Last 30 Days</option>
          <option value={60}>Last 60 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Overall Skin Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="overall" stroke="#7c3aed" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-8 rounded-3xl shadow-lg text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl">🌟</span>
            </div>
            <h3 className="font-bold text-xl mb-1">Best Skin Day</h3>
            <p className="text-violet-200 mb-8 font-medium">{format(new Date(bestDay.createdAt), 'MMMM do, yyyy')}</p>
            <div className="text-7xl font-black tracking-tighter mb-2">{bestDay.overallScore}</div>
            <p className="text-sm text-violet-200 uppercase tracking-widest font-semibold">Overall Score</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conditions Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Line type="monotone" dataKey="acne" stroke="#f43f5e" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="pigmentation" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="hydration" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
