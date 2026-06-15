import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase.jsx';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import SEO from '../../components/SEO.jsx';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(userCredential.user, {
        displayName: formData.name
      });

      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token);

      // Usually redirect to quiz/onboarding after register
      navigate('/quiz');
    } catch (error) {
      setMessage(error.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Sign Up | SkinWise"
        description="Create your SkinWise account to start your personalized skincare journey."
      />
      <div className="w-full">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Create an Account</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Start your AI-powered skincare journey today.
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
            label="Full Name"
            type="text"
            name="name"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={handleChange}
            leftIcon={<User size={18} />}
            required
          />

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

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            leftIcon={<Lock size={18} />}
            required
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full mt-2" size="lg">
            Create Account
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?
          <Link to="/login" className="text-violet-600 dark:text-violet-400 font-semibold hover:underline ml-1.5 transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </>
  );
}
