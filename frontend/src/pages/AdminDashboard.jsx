// pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminStatCard from '../components/AdminStatCard';
import SEO from '../components/SEO.jsx';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/analytics/overview', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(res => setData(res.data))
    .catch(err => console.error(err));
  }, []);

  if (!data) {
    return <p className="p-6">Loading analytics...</p>;
  }

  return (

       <>
       <SEO title="Admin Dashboard" description="View analytics and manage the SkinWise platform." />
       

    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Admin Analytics Dashboard</h1>

      {/* ---------- STATS ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminStatCard title="Total Users" value={data.totalUsers} />
        <AdminStatCard title="Total Analyses" value={data.totalAnalyses} />
        <AdminStatCard
          title="Analyses (7 days)"
          value={data.analysesLast7Days}
        />
        <AdminStatCard
          title="Admins"
          value={
            data.usersByRole.find(r => r._id === 'admin')?.count || 0
          }
        />
      </div>

      {/* ---------- ISSUE DISTRIBUTION ---------- */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Skin Issue Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminStatCard title="Acne" value={data.issueDistribution.acne || 0} />
          <AdminStatCard title="Pigmentation" value={data.issueDistribution.pigmentation || 0} />
          <AdminStatCard title="Wrinkles" value={data.issueDistribution.wrinkles || 0} />
          <AdminStatCard title="Blackheads" value={data.issueDistribution.blackheads || 0} />
        </div>
      </section>
    </div>
  
  </>);
}
