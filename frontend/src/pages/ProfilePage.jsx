// frontend/src/pages/Profile.jsx
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

/* ---------------- Small UI Components ---------------- */



const RoutineItem = ({ step, note }) => (
  <li className="border-l-2 border-indigo-500 pl-4">
    <div className="font-medium">{step}</div>
    <div className="text-sm text-gray-500">{note}</div>
  </li>
);

/* ---------------- MAIN PROFILE PAGE ---------------- */

export default function Profile() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  // TEMP user info (later from auth context)
  const user = {
    username: 'roh_it',
    email: 'rohit@email.com',
    joined: 'March 2024',
  };

  useEffect(() => {
    async function fetchAnalysis() {
      try {
         const base = import.meta.env.VITE_API_BASE_URL || '';
      const endpoint = `${base}/api/analyze/latest`;
        const token = localStorage.getItem('token');
        console.log('Fetching analysis with token:', token);
        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Analysis response:', res.data);
        setAnalysis(res.data);
      } catch (err) {
        console.error('No analysis found');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
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
  
  const { detectedIssues, overallScore, notes } = analysis;
console.log('Detected Issues:', detectedIssues);

/* ---------------- Routine Logic ---------------- */
const morningRoutine = [
  'Gentle Cleanser',
  detectedIssues.acne.count > 3 && 'Niacinamide Serum',
  'Moisturizer',
  'Sunscreen SPF 50'
].filter(Boolean);

const nightRoutine = [
  'Cleanser',
  detectedIssues.wrinkles.label !== 'Low' && 'Retinol (2–3x/week)',
  'Barrier Repair Moisturizer'
].filter(Boolean);

return (
  <div className="min-h-screen bg-slate-50 dark:bg-gray-900 py-10">
    <div className="max-w-6xl mx-auto px-4 space-y-10">

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

      {/* ---------------- SKIN SUMMARY ---------------- */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          Current Skin Summary
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
  title="Acne"
  value={detectedIssues?.acne?.label ?? 'N/A'}
  sub={`Count: ${detectedIssues?.acne?.count ?? 0}`}
/>

<StatCard
  title="Blackheads"
  value={(detectedIssues?.blackheads?.count ?? 0) > 0 ? 'Present' : 'None'}
  sub={`Count: ${detectedIssues?.blackheads?.count ?? 0}`}
/>

<StatCard
  title="Pigmentation"
  value={detectedIssues?.pigmentation?.label ?? 'N/A'}
  sub={`Count: ${detectedIssues?.pigmentation?.count ?? 0}`}
/>

<StatCard
  title="Wrinkles"
  value={detectedIssues?.wrinkles?.label ?? 'N/A'}
  sub="Low visibility"
/>

        </div>
      </section>

      {/* ---------------- PROGRESS ---------------- */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="text-indigo-600" />
          <h2 className="text-lg font-semibold">Analysis Summary</h2>
        </div>

        <p className="text-sm text-gray-600 whitespace-pre-wrap">
          {notes}
        </p>
      </section>

      {/* ---------------- ROUTINE ---------------- */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          Your Personalized Routine
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Morning */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="text-yellow-500" />
              <h3 className="font-semibold">Morning</h3>
            </div>

            <ul className="space-y-3">
              {morningRoutine.map((step, i) => (
                <RoutineItem key={i} step={step} note="Daily" />
              ))}
            </ul>
          </div>

          {/* Night */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="text-indigo-500" />
              <h3 className="font-semibold">Night</h3>
            </div>

            <ul className="space-y-3">
              {nightRoutine.map((step, i) => (
                <RoutineItem key={i} step={step} note="Night care" />
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="text-xs text-gray-500 text-center">
        SkinWise provides informational guidance only. Not medical advice.
      </div>

    </div>
  </div>
);
}