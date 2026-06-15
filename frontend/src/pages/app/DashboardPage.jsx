import React from 'react';
import { Link } from 'react-router-dom';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useStreak } from '../../hooks/useStreak';
import DailyCheckinWidget from '../../components/DailyCheckinWidget';
import BadgeDisplay from '../../components/BadgeDisplay';
import { Camera, CalendarCheck, TrendingUp, ChevronRight, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Skeleton } from '../../components/common/LoadingSkeleton';

export default function DashboardPage() {
  const { data: profile, isLoading: isProfileLoading } = useUserProfile();
  const { data: streak } = useStreak();

  if (isProfileLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-violet-600 rounded-3xl p-8 sm:p-10 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Welcome back, {profile?.name?.split(' ')[0] || profile?.username || 'User'}! 👋
          </h1>
          <p className="text-violet-200 text-lg max-w-xl">
            You're on a <span className="font-bold text-white">{streak?.currentStreak || 0}-day</span> streak. Keep up the great work with your personalized skincare routine!
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none transform translate-x-1/3">
          <Zap size={256} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/analyze" className="group block">
              <Card className="h-full hover:border-violet-300 dark:hover:border-violet-700 transition-colors cursor-pointer">
                <CardContent className="p-6 flex items-start space-x-4">
                  <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                    <Camera size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">New Analysis</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Scan your face to update your routine.</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/routine" className="group block">
              <Card className="h-full hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer">
                <CardContent className="p-6 flex items-start space-x-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <CalendarCheck size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Today's Routine</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View and complete your daily steps.</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Gamification / Badges */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Achievements</CardTitle>
              <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">{profile?.badges?.length || 0} Badges</span>
            </CardHeader>
            <CardContent>
              {profile?.badges?.length > 0 ? (
                <BadgeDisplay badges={profile.badges} />
              ) : (
                <div className="text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-4xl mb-3 block">🌱</span>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Complete routines and analyses to earn badges!</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <DailyCheckinWidget />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={18} className="text-slate-400" /> Recent Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Check your skin health trajectory over the last 30 days.</p>
                <Link to="/progress" className="inline-flex items-center justify-center text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">
                  View Full Charts <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
