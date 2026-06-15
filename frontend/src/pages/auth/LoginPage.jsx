import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase.jsx';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import SEO from '../../components/SEO.jsx';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token);

      navigate('/dashboard');
    } catch (error) {
      setMessage(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Login | SkinWise"
        description="Log in to your SkinWise account to access AI-powered skin analysis."
      />
      <div className="w-full">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Welcome Back</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Log in to continue to SkinWise.
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-xl flex items-start gap-3 text-sm font-medium bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            leftIcon={<Mail size={18} />}
            required
          />

          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <span className="text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 cursor-pointer transition-colors">Forgot password?</span>
            </div>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              leftIcon={<Lock size={18} />}
              required
            />
          </div>

          <Button type="submit" isLoading={isSubmitting} className="w-full mt-2" size="lg">
            Log In
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          Don’t have an account?
          <Link to="/register" className="text-violet-600 dark:text-violet-400 font-semibold hover:underline ml-1.5 transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </>
  );
}
