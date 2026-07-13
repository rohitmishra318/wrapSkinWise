import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Menu as MenuIcon, X, User } from 'lucide-react';
import ThemeToggle from '../ThemeToggle'; // Adjust path or recreate ThemeToggle

export default function Navbar() {
  const { user, logout } = useAuth() || { user: null, logout: () => {} };
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const navLinks = [
    { name: 'Shop', path: '/shop' },
    { name: 'Features', path: '/features' },
    { name: 'Blog', path: '/blog' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-11 h-11 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                <img src="/cyanlogo-transparent.png" alt="SkinWise Logo" className="w-full h-full scale-150 object-contain dark:hidden" />
                <img src="/skinwise-dark-logo.png" alt="SkinWise Logo" className="hidden w-full h-full scale-125 object-contain dark:block" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">SkinWise</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link 
                key={link.name} 
                to={link.path}
                className="text-sm font-medium text-slate-600 hover:text-violet-600 dark:text-slate-300 dark:hover:text-violet-400 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
                    <User size={16} />
                  </Menu.Button>
                  <Transition
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-slate-100 dark:divide-slate-700">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <Link to="/profile" className={`block px-4 py-2 text-sm ${active ? 'bg-slate-50 dark:bg-slate-700 text-violet-600 dark:text-violet-400' : 'text-slate-700 dark:text-slate-200'}`}>
                              Profile Settings
                            </Link>
                          )}
                        </Menu.Item>
                      </div>
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button onClick={handleLogout} className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>
                              Log out
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-violet-600 dark:text-slate-300 dark:hover:text-violet-400">
                  Log in
                </Link>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -mr-2 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <Transition
        show={mobileMenuOpen}
        enter="transition duration-150 ease-out"
        enterFrom="opacity-0 -translate-y-4"
        enterTo="opacity-100 translate-y-0"
        leave="transition duration-100 ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-4"
      >
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-violet-600 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {link.name}
            </Link>
          ))}
          {!user ? (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
              <Link to="/login" className="flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800">
                Log in
              </Link>
              <Link to="/register" className="flex items-center justify-center px-4 py-2 border border-transparent rounded-xl text-base font-medium text-white bg-violet-600 hover:bg-violet-700">
                Sign up
              </Link>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-violet-600 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20">
                Log out
              </button>
            </div>
          )}
        </div>
      </Transition>
    </header>
  );
}










