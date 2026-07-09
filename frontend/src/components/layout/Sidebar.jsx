import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ScanFace, 
  CalendarCheck, 
  TrendingUp, 
  History, 
  Settings,
  HelpCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Analysis', href: '/analyze', icon: ScanFace },
  { name: 'Routine', href: '/routine', icon: CalendarCheck },
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'History', href: '/history', icon: History },
];

export default function Sidebar({ className }) {
  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 w-64", className)}>
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-100 dark:border-slate-800">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
            <img src="/cyanlogo-transparent.png" alt="SkinWise Logo" className="w-full h-full scale-150 object-contain dark:hidden" />
                <img src="/skinwise-dark-logo.png" alt="SkinWise Logo" className="hidden w-full h-full scale-125 object-contain dark:block" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SkinWise</span>
        </NavLink>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto pt-6 px-4 pb-4">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => cn(
                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors",
                isActive 
                  ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
              )}
            >
              <item.icon 
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  window.location.pathname.startsWith(item.href) 
                    ? "text-violet-600 dark:text-violet-400" 
                    : "text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300"
                )} 
                aria-hidden="true" 
              />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <nav className="space-y-1">
            <NavLink
              to="/profile"
              className={({ isActive }) => cn(
                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors",
                isActive 
                  ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
              )}
            >
              <Settings className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300" aria-hidden="true" />
              Settings
            </NavLink>
            <a
              href="mailto:support@skinwise.ai"
              className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
            >
              <HelpCircle className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300" aria-hidden="true" />
              Support
            </a>
          </nav>
        </div>
      </div>
    </div>
  );
}










