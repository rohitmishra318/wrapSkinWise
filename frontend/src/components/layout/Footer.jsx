import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Github, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                <img src="/cyanlogo-transparent.png" alt="SkinWise Logo" className="w-full h-full scale-150 object-contain dark:hidden" />
                <img src="/skinwise-dark-logo.png" alt="SkinWise Logo" className="hidden w-full h-full scale-125 object-contain dark:block" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">SkinWise</span>
            </Link>
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400 max-w-xs">
              AI-powered personalized skincare tracking and routine generation. Taking the guesswork out of clear skin.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                <span className="sr-only">Instagram</span>
                <Instagram size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                <span className="sr-only">Twitter</span>
                <Twitter size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                <span className="sr-only">GitHub</span>
                <Github size={20} />
              </a>
            </div>
          </div>
          
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-slate-900 dark:text-white">Product</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><Link to="/features" className="text-sm leading-6 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">Features</Link></li>
                  <li><Link to="/analyze" className="text-sm leading-6 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">Try AI Analysis</Link></li>
                  <li><Link to="/routine" className="text-sm leading-6 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">Routines</Link></li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-slate-900 dark:text-white">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><Link to="/about" className="text-sm leading-6 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">About</Link></li>
                  <li><Link to="/blog" className="text-sm leading-6 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">Blog</Link></li>
                  <li><Link to="/contact" className="text-sm leading-6 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">Contact</Link></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-slate-900 dark:text-white">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><Link to="/privacy" className="text-sm leading-6 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-sm leading-6 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">Terms of Service</Link></li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-slate-900 dark:text-white">Partners</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><Link to="/brand/dashboard" className="text-sm leading-6 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">Brand Portal</Link></li>
                  <li><a href="#" className="text-sm leading-6 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">API Documentation</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            &copy; {currentYear} SkinWise Technologies, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}










