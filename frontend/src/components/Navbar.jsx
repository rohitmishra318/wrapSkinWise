import React, { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  UploadCloud,
  User,
  LogIn,
  LogOut,
  Clock,
  ChevronDown,
  Search,
  Heart,
  ShoppingBag,
  Menu as MenuIcon,
  X as XIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';


/**
 * Navbar — centered logo layout
 * - Equal left / center / right columns
 * - Logo stays centered
 * - Logo never overflows navbar
 * - Mobile menu preserved
 */

const Navbar = () => {
  const { user, logout } = useAuth() || { user: null, logout: () => {} };
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  console.log('Navbar user:', user);
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50">
      <nav className="backdrop-blur bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* NAVBAR ROW */}
          <div className="flex items-center h-[68px]">

            {/* LEFT COLUMN */}
            <div className="w-1/3 flex items-center gap-4">
              <button
                onClick={() => setMobileOpen(v => !v)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
              </button>

              <div className="hidden md:flex items-center gap-4">
                <Link to="/advice" className="text-sm text-slate-700 dark:text-gray-200 hover:text-indigo-600">
                  Advices
                </Link>
                <Link to="/shop" className="text-sm text-slate-700 dark:text-gray-200 hover:text-indigo-600 flex items-center gap-1">
                  <ShoppingBag size={14} /> Shop
                </Link>
                <Link to="/brands" className="text-sm text-slate-700 dark:text-gray-200 hover:text-indigo-600">
                  Brands
                </Link>
              </div>
            </div>

            {/* CENTER COLUMN — LOGO */}
            <div className="w-1/3 flex justify-center items-center">
              <Link to="/" className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-transparent shadow-sm dark:shadow-none flex items-center justify-center overflow-hidden">
  <img
    src="/cyanlogo-transparent.png"
    alt="SkinWise Logo"
    className="w-full h-full object-contain dark:hidden"
  />
  <img
    src="/skinwise-dark-logo.png"
    alt="SkinWise Logo"
    className="hidden w-full h-full scale-90 object-contain dark:block"
  />
</div>
              </Link>
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-1/3 flex justify-end items-center gap-4">
              <div className="hidden md:flex items-center gap-4">
                <Link to="/consultation" className="text-sm text-slate-700 dark:text-gray-200 hover:text-indigo-600">
                  Consultation
                </Link>
                <Link to="/blog" className="text-sm text-slate-700 dark:text-gray-200 hover:text-indigo-600">
                  Blog
                </Link>
                
                <Link to="/about" className="text-sm text-slate-700 dark:text-gray-200 hover:text-indigo-600">
                  About
                </Link>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <Link to="/cart" className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ShoppingBag size={18} />
                </Link>
              </div>

              <ThemeToggle />
              
              {/* AUTH */}
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/analyze"
                    className="hidden sm:inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-2 rounded-full"
                  >
                    <UploadCloud size={16} />
                    Analyze
                  </Link>

                  <Menu as="div" className="relative">
                    <Menu.Button className="inline-flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm">
                      <User size={16} />
                      <span className="hidden sm:inline">{user.email || 'You'}</span>
                      <ChevronDown size={14} />
                    </Menu.Button>

                    <Transition as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-44 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 divide-y">
                        <Menu.Item>
                          {({ active }) => (
                            <Link to="/profile" className={`block px-4 py-2 text-sm ${active && 'bg-gray-100 dark:bg-gray-700'}`}>
                              Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link to="/history" className={`block px-4 py-2 text-sm ${active && 'bg-gray-100 dark:bg-gray-700'}`}>
                              My Analyses
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={`w-full text-left px-4 py-2 text-sm text-red-600 ${active && 'bg-red-50'}`}
                            >
                              Logout
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link to="/routine" className={`block px-4 py-2 text-sm ${active && 'bg-gray-100 dark:bg-gray-700'}`}>
                              My Routine
                            </Link>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/register" className="text-sm hover:text-indigo-600">Register</Link>
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-full text-sm"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-white dark:bg-gray-900 px-4 py-4 space-y-2">
            <Link to="/advice" onClick={() => setMobileOpen(false)}>Advice</Link>
            <Link to="/shop" onClick={() => setMobileOpen(false)}>Shop</Link>
            <Link to="/blog" onClick={() => setMobileOpen(false)}>Blog</Link>
            <Link to="/about" onClick={() => setMobileOpen(false)}>About</Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;











