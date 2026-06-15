import React from 'react';
import { useBrandOverview } from '../../hooks/useBrandOverview';
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { Users, Droplets, Target, ShieldCheck } from 'lucide-react';

export default function BrandDashboardPage() {
  const { data, isLoading, error } = useBrandOverview();

  if (isLoading) return <div className="p-8 text-center">Loading brand analytics...</div>;
  if (error) return <div className="p-8 text-center text-rose-500">Failed to load data. Please check your API key.</div>;

  const { metrics, engagementData, recentInsights } = data;

  const statCards = [
    { title: "Active Users", value: metrics.totalUsers, icon: <Users size={20} className="text-blue-500" /> },
    { title: "Analyses This Week", value: metrics.weeklyAnalyses, icon: <Target size={20} className="text-emerald-500" /> },
    { title: "Avg Routine Adherence", value: `${metrics.adherenceRate}%`, icon: <ShieldCheck size={20} className="text-purple-500" /> },
    { title: "Product Recs Sent", value: metrics.productRecs, icon: <Droplets size={20} className="text-rose-500" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Partner Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Overview of your audience and platform engagement.</p>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</h3>
              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">{stat.icon}</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Sparkline */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Daily Engagement</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementData}>
                <Line type="monotone" dataKey="activeUsers" stroke="#3b82f6" strokeWidth={3} dot={false} />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Recent Audience Insights</h3>
          <div className="space-y-4">
            {recentInsights.map((insight, i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{insight.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
