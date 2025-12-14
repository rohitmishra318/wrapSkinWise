import React from 'react';
import { User, Mail, Calendar, Droplet, Sun, Moon, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, level }) => (
  <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800">
    <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
    <div className="flex items-center justify-between mt-1">
      <span className="font-semibold text-gray-800 dark:text-gray-100">
        {value}
      </span>
      <span className={`text-xs px-2 py-1 rounded-full 
        ${level === 'None' ? 'bg-green-100 text-green-700'
        : level === 'Mild' ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-700'}`}>
        {level}
      </span>
    </div>
  </div>
);

const RoutineItem = ({ step, product, note }) => (
  <li className="border-l-2 border-indigo-500 pl-4">
    <div className="font-medium text-gray-800 dark:text-gray-100">{step}</div>
    <div className="text-sm text-gray-600 dark:text-gray-400">
      {product} — {note}
    </div>
  </li>
);

export default function Profile() {
  // TEMP static data (replace with API later)
  const user = {
    username: 'roh_it',
    email: 'rohit@email.com',
    joined: 'March 2024',
    skinType: 'Combination',
    primaryConcern: 'Acne',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-10">

        {/* PROFILE HEADER */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
              {user.username[0].toUpperCase()}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.username}
              </h1>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Mail size={14} /> {user.email}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                <Calendar size={14} /> Joined {user.joined}
              </div>
            </div>

            <div className="ml-auto flex gap-3">
              <span className="px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700">
                {user.skinType} Skin
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-rose-100 text-rose-700">
                {user.primaryConcern}
              </span>
            </div>
          </div>
        </section>

        {/* SKIN SUMMARY */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Current Skin Summary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Acne" value="Detected" level="Mild" />
            <StatCard title="Blackheads" value="Present" level="Mild" />
            <StatCard title="Pigmentation" value="Detected" level="Moderate" />
            <StatCard title="Wrinkles" value="Not Detected" level="None" />
          </div>
        </section>

        {/* PROGRESS */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Progress Overview
            </h2>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Acne reduced from <strong>Moderate → Mild</strong> in the last 3 weeks.
          </p>
        </section>

        {/* ROUTINE */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Your Personalized Routine
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* MORNING */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Sun className="text-yellow-500" />
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  Morning
                </h3>
              </div>

              <ul className="space-y-4">
                <RoutineItem step="Cleanser" product="Gentle Cleanser" note="AM only" />
                <RoutineItem step="Serum" product="Vitamin C 10%" note="Brightening" />
                <RoutineItem step="Moisturizer" product="Gel-based" note="Oil-free" />
                <RoutineItem step="Sunscreen" product="SPF 50" note="Mandatory" />
              </ul>
            </div>

            {/* NIGHT */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Moon className="text-indigo-500" />
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                  Night
                </h3>
              </div>

              <ul className="space-y-4">
                <RoutineItem step="Cleanser" product="Gentle Cleanser" note="PM only" />
                <RoutineItem step="Treatment" product="Retinol 0.25%" note="2–3x/week" />
                <RoutineItem step="Moisturizer" product="Barrier Repair" note="Ceramides" />
              </ul>
            </div>
          </div>
        </section>

        {/* DISCLAIMER */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          SkinWise provides informational guidance only. This is not medical advice.
        </div>

      </div>
    </div>
  );
}
