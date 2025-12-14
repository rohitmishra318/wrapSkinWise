import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Registration successful! Redirecting...");
        setTimeout(() => navigate('/login'), 1800);
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">

      {/* Card */}
      <div className="flex rounded-2xl shadow-xl max-w-4xl w-full bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">

        {/* Left Image Panel */}
        <div
          className="hidden md:block w-1/2 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=900&q=80')"
          }}
        ></div>

        {/* Form Panel */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create Account</h1>
          <p className="text-slate-600 dark:text-gray-400 mb-8">
            Join <span className="font-semibold text-indigo-600">SkinWise</span> for personalized routines and tracking.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="username"
                placeholder="Username"
                required
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-gray-100"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                required
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-gray-100"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-gray-100"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold shadow-sm transition disabled:bg-gray-400"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Message */}
          {message && (
            <p className={`mt-4 text-center text-sm ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          {/* Footer Link */}
          <div className="mt-8 text-center text-slate-600 dark:text-gray-400">
            Already have an account?
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline ml-1">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
