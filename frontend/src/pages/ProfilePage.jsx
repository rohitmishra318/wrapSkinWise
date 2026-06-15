// frontend/src/pages/Profile.jsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

import React, { useEffect, useState } from 'react';
import StatCard from '../components/Statcard';
import axios from 'axios';
import {
  Mail,
  Calendar,
  TrendingUp,
  Sun,
  Moon
} from 'lucide-react';
import SEO from '../components/SEO.jsx';

/* ---------------- Small UI Components ---------------- */

const RoutineItem = ({ step, note }) => (
  <li className="border-l-2 border-indigo-500 pl-4">
    <div className="font-medium">{step}</div>
    <div className="text-sm text-gray-500">{note}</div>
  </li>
);

/* ---------------- MAIN PROFILE PAGE ---------------- */

export default function Profile() {
  const [loading, setLoading] = useState(true);

  // TEMP user info (replace with AuthContext later)
  const user = {
    username: 'roh_it',
    email: 'rohit@email.com',
    joined: 'March 2024',
  };

  const [analysis, setAnalysis] = useState(null);
  const [delta, setDelta] = useState(null);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [streak, setStreak] = useState(null); // Added state for streak

  const trend = (value) => {
    if (value == null) return null;
    if (value < 0) return { text: 'Improved', color: 'text-green-600', icon: '▲' };
    if (value > 0) return { text: 'Worsened', color: 'text-red-600', icon: '▼' };
    return { text: 'Stable', color: 'text-gray-500', icon: '●' };
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const base = import.meta.env.VITE_API_BASE_URL || '';
        const endpoint = `${base}/api/analyze/latest-with-delta`;
        const token = localStorage.getItem('token');

        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setAnalysis(res.data.analysis);
        setDelta(res.data.delta);
        setHasPrevious(Boolean(res.data.previousAnalysis));

        // --- MOCK STREAK DATA (Replace with actual API call later) ---
        setStreak({
          currentStreak: 5,
          longestStreak: 12,
          history: Array(14).fill(0).map((_, i) => ({
            date: `Day ${i}`,
            completed: Math.random() > 0.3 // Random true/false for demo
          }))
        });

      } catch (err) {
        console.log("Error fetching profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);


  if (loading) {
    return <div className="p-10 text-center">Loading profile...</div>;
  }

  if (!analysis) {
    return (
      <div className="p-10 text-center text-gray-600">
        No analysis found. Please analyze your skin first.
      </div>
    );
  }

  const { raw, severity, overallScore, notes } = analysis;

  /* ---------------- Routine Logic ---------------- */
  const morningRoutine = [
    'Gentle Cleanser',
    raw.acne.count > 3 && 'Niacinamide Serum',
    'Moisturizer',
    'Sunscreen SPF 50'
  ].filter(Boolean);

  const nightRoutine = [
    'Cleanser',
    raw.wrinkles.label !== 'Low' && 'Retinol (2–3x/week)',
    'Barrier Repair Moisturizer'
  ].filter(Boolean);

  return (
      <> 
        <SEO title="Profile" description="View your profile and skin analysis." />

    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-8">

        {/* ---------------- PROFILE HEADER ---------------- */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
              {user.username[0].toUpperCase()}
            </div>

            <div>
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <div className="text-sm flex items-center gap-2 text-gray-500">
                <Mail size={14} /> {user.email}
              </div>
              <div className="text-sm flex items-center gap-2 text-gray-500 mt-1">
                <Calendar size={14} /> Joined {user.joined}
              </div>
            </div>

            <div className="ml-auto text-center">
              <div className="text-sm text-gray-500">Overall Skin Score</div>
              <div className="text-3xl font-bold text-indigo-600">
                {overallScore}/100
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- SKIN SUMMARY (Stat Cards) ---------------- */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Current Skin Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Acne */}
            <StatCard
              title="Acne"
              value={raw.acne.label}
              sub={`Count: ${raw.acne.count} • Severity: ${severity.acne}/100`}
            >
              {hasPrevious && (
                <div className={`text-xs mt-1 ${trend(delta.acne)?.color}`}>
                  {trend(delta.acne)?.icon} {trend(delta.acne)?.text} since last analysis
                </div>
              )}
            </StatCard>

            {/* Blackheads */}
            <StatCard
              title="Blackheads"
              value={raw.blackheads.present ? 'Present' : 'None'}
              sub={`Count: ${raw.blackheads.count} • Severity: ${severity.blackheads}/100`}
            >
              {hasPrevious && (
                <div className={`text-xs mt-1 ${trend(delta.blackheads)?.color}`}>
                  {trend(delta.blackheads)?.text}
                </div>
              )}
            </StatCard>

            {/* Pigmentation */}
            <StatCard
              title="Pigmentation"
              value={raw.pigmentation.label}
              sub={`Severity: ${severity.pigmentation}/100`}
            >
              {hasPrevious && (
                <div className={`text-xs mt-1 ${trend(delta.pigmentation)?.color}`}>
                  {trend(delta.pigmentation)?.text}
                </div>
              )}
            </StatCard>

            {/* Wrinkles */}
            <StatCard
              title="Wrinkles"
              value={raw.wrinkles.label}
              sub={`Severity: ${severity.wrinkles}/100`}
            >
              {hasPrevious && (
                <div className={`text-xs mt-1 ${trend(delta.wrinkles)?.color}`}>
                  {trend(delta.wrinkles)?.text}
                </div>
              )}
            </StatCard>
          </div>
        </section>

        {/* ---------------- NEW: IMPROVEMENT CHART ---------------- */}
        {hasPrevious && delta && (
          <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
            <h2 className="text-lg font-semibold mb-4">
              Improvement Since Last Analysis
            </h2>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Acne', delta: delta.acne },
                    { name: 'Wrinkles', delta: delta.wrinkles },
                    { name: 'Pigmentation', delta: delta.pigmentation },
                    { name: 'Blackheads', delta: delta.blackheads },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar
                    dataKey="delta"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-xs text-gray-500 mt-2 text-center">
              Negative values indicate improvement (reduction in severity).
            </p>
          </section>
        )}

      

        {/* ---------------- NEW: ROUTINE CONSISTENCY ---------------- */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
          <h2 className="text-lg font-semibold mb-4">Routine Consistency</h2>

          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">
                  {streak?.currentStreak || 0}
                </div>
                <div className="text-sm text-gray-500">Current Streak</div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {streak?.longestStreak || 0}
                </div>
                <div className="text-sm text-gray-500">Best Streak</div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
                {streak?.history?.slice(-14).map((d, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-md transition-all hover:scale-110 ${
                      d.completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    title={d.date}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center sm:text-right">
                Last 14 days activity
              </p>
            </div>
          </div>
        </section>

        

        {/* Disclaimer */}
        <div className="text-xs text-gray-500 text-center pt-4">
          SkinWise provides informational guidance only. Not medical advice.
        </div>

      </div>
    </div>
  </>
  );
}