import React from 'react';
import { Link, Outlet } from 'react-router-dom';

/**
 * Clean, distraction-free layout for Authentication (Login, Register).
 * Half screen branding, half screen form on desktop.
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Left Side: Branding / Marketing */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-violet-600 text-white p-12">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
              <img src="/cyanlogo.png" alt="SkinWise Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight">SkinWise</span>
          </Link>
        </div>
        
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6 leading-tight">Your intelligent skincare companion.</h1>
          <p className="text-violet-200 text-lg">
            Join thousands of users discovering personalized routines, tracking their skin health over time, and getting AI-powered insights.
          </p>
        </div>

        <div className="text-sm text-violet-300">
          © {new Date().getFullYear()} SkinWise Technologies
        </div>
      </div>

      {/* Right Side: Form Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 bg-white dark:bg-slate-900 shadow-xl z-10 md:rounded-l-3xl">
        <div className="md:hidden mb-8">
          <Link to="/" className="flex items-center gap-2 justify-center">
            <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center p-1">
              <img src="/cyanlogo.png" alt="SkinWise Logo" className="w-full h-full object-contain brightness-0 invert" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">SkinWise</span>
          </Link>
        </div>
        <div className="w-full max-w-md mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
