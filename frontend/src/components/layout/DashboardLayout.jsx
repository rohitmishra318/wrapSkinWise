import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, User, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ThemeToggle';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth() || { user: { email: 'user@example.com' } };

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar className="w-full" />
      </div>

      {/* Main content wrapper */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        
        {/* Topbar (Mobile mainly, but visible on desktop too) */}
        <header className="relative z-10 flex-shrink-0 h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <span className="ml-2 font-bold text-lg text-slate-900 dark:text-white">SkinWise</span>
          </div>

          {/* Desktop invisible spacer, mobile full header flex container */}
          <div className="hidden md:flex flex-1" />

          {/* Right actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button className="p-2 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 relative">
              <span className="sr-only">View notifications</span>
              <Bell size={20} />
              <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
            </button>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-medium">
                {user?.email?.charAt(0).toUpperCase() || <User size={16} />}
              </div>
            </div>
          </div>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
