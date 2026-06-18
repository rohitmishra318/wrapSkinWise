import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, User, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ThemeToggle';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth() || { user: { email: 'user@example.com' } };

  const notifications = [
    { id: 1, text: "Your daily skin analysis is ready!", time: "2h ago", unread: true },
    { id: 2, text: "You earned the 'Consistent Routine' badge!", time: "1d ago", unread: false },
    { id: 3, text: "New skincare products are available in the shop.", time: "2d ago", unread: false },
  ];

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
            <div className="relative">
              <button 
                className="p-2 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <span className="sr-only">View notifications</span>
                <Bell size={20} />
                <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-800 z-50 overflow-hidden transition-all origin-top-right animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                    <span className="text-xs bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                      {notifications.filter(n => n.unread).length} New
                    </span>
                  </div>
                  <div className="max-h-[28rem] overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className={`p-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${notif.unread ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                        <div className="flex gap-3">
                          <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notif.unread ? 'bg-indigo-500' : 'bg-transparent'}`} />
                          <div>
                            <p className={`text-sm ${notif.unread ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                              {notif.text}
                            </p>
                            <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">
                              {notif.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors bg-white dark:bg-slate-900">
                    <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">View All Notifications</span>
                  </div>
                </div>
              )}
            </div>
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
