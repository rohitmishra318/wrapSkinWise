import React from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useStreak } from '../hooks/useStreak';
import { Link } from 'react-router-dom';
import DailyCheckinWidget from '../components/DailyCheckinWidget';
import BadgeDisplay from '../components/BadgeDisplay';
import { Camera, CalendarCheck, TrendingUp, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const { data: profile, isLoading: isProfileLoading } = useUserProfile();
  const { data: streak } = useStreak();

  if (isProfileLoading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      <section className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.name || profile?.username || 'User'}! ✨</h1>
          <p className="text-emerald-50 text-lg max-w-xl">
            You're on a {streak?.currentStreak || 0}-day streak. Keep up the great work with your personalized skincare routine!
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
            <circle cx="50" cy="50" r="40" />
          </svg>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/analyze" className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all flex items-center gap-4 min-h-[124px] pt-6 pb-4">
              <div className="w-12 h-12 shrink-0 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Camera size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">New Analysis</h3>
                <p className="text-sm text-gray-500">Scan your face to update your routine.</p>
              </div>
            </Link>
            
            <Link to="/routine" className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all flex items-center gap-4 min-h-[124px] pt-6 pb-4">
              <div className="w-12 h-12 shrink-0 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <CalendarCheck size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Today's Routine</h3>
                <p className="text-sm text-gray-500">View and complete your daily steps.</p>
              </div>
            </Link>
          </div>

          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Your Achievements</h3>
              <span className="text-sm font-medium text-indigo-600">{profile?.badges?.length || 0} Badges</span>
            </div>
            {profile?.badges?.length > 0 ? (
              <BadgeDisplay badges={profile.badges} />
            ) : (
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <span className="text-3xl mb-2 block">🌱</span>
                <p className="text-sm text-gray-500">Complete routines and analyses to earn badges!</p>
              </div>
            )}
          </section>

        </div>

        <div className="space-y-8">
          <DailyCheckinWidget />
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-gray-400" /> Recent Progress
            </h3>
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-4">Check your skin health trajectory over the last 30 days.</p>
              <Link to="/progress" className="text-emerald-600 font-medium hover:underline flex items-center justify-center">
                View Full Charts <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






