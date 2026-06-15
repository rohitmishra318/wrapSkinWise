import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SEO from '../../components/SEO.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Users, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { Skeleton } from '../../components/common/LoadingSkeleton';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/analytics/overview', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(res => setData(res.data))
    .catch(err => setError(err.message || 'Failed to load analytics'));
  }, [token]);

  if (error) {
    return (
      <div className="p-8 text-center text-rose-500 font-medium">
        <AlertCircle className="mx-auto mb-2" size={32} />
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold mb-8">Platform Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      <SEO title="Admin Dashboard | SkinWise" description="View analytics and manage the SkinWise platform." />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Platform overview and global analytics.</p>
        </div>

        {/* ---------- STATS ---------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center text-violet-600 dark:text-violet-400">
                  <Users size={20} />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Users</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{data.totalUsers.toLocaleString()}</h3>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Activity size={20} />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Analyses</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{data.totalAnalyses.toLocaleString()}</h3>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center text-sky-600 dark:text-sky-400">
                  <Activity size={20} />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Analyses (Last 7 Days)</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{data.analysesLast7Days.toLocaleString()}</h3>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Admins</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                {data.usersByRole.find(r => r._id === 'admin')?.count || 0}
              </h3>
            </CardContent>
          </Card>
        </div>

        {/* ---------- ISSUE DISTRIBUTION ---------- */}
        <Card>
          <CardHeader>
            <CardTitle>Skin Issue Distribution Across Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['acne', 'pigmentation', 'wrinkles', 'blackheads'].map(issue => (
                <div key={issue} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 capitalize mb-2">{issue}</h4>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {(data.issueDistribution[issue] || 0).toFixed(1)} <span className="text-sm font-normal text-slate-500">avg severity</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
