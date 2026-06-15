// frontend/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  Activity,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import SEO from '../components/SEO.jsx';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // 1️⃣ Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const firebaseUser = userCredential.user;

      // 2️⃣ Get Firebase ID token
      const token = await firebaseUser.getIdToken();

      /* // 3️⃣ OPTIONAL: sync user with backend
      await fetch('http://localhost:5000/api/auth/firebase-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username
        })
      });*/

      setMessage({ type: 'success', text: 'Registration successful! Redirecting...' });
      setTimeout(() => navigate('/login'), 1500);

    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Register | SkinWise"
        description="Create a SkinWise account to unlock AI-powered skin analysis and personalized skincare recommendations."
        url="https://skinwise.ai/register"
      />

      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8 font-sans selection:bg-teal-200 selection:text-teal-900">
        
        {/* Main Card Container */}
        <div className="flex flex-col md:flex-row rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 max-w-5xl w-full bg-white dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-700/50">

          {/* Left Panel: Branded Information (Replaces the Image) */}
          <div className="hidden md:flex w-1/2 bg-gradient-to-br from-teal-800 to-teal-900 p-12 text-white flex-col justify-between relative overflow-hidden">
            
            {/* Ambient Glassmorphism Blurs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40"></div>
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-30"></div>
            </div>

            {/* Top Brand */}
            <div className="relative z-10">
              <Link to="/" className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight hover:opacity-80 transition-opacity">
                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl">
                  <Sparkles size={24} className="text-teal-300" />
                </div>
                SkinWise
              </Link>
            </div>

            {/* Value Proposition */}
            <div className="relative z-10 mt-12 mb-auto">
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-6">
                Your skin's <br/> digital baseline.
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/10 rounded-lg mt-1">
                    <Activity size={20} className="text-teal-200" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-teal-50">Clinical-Grade AI</h3>
                    <p className="text-teal-200/80 text-sm mt-1">Scan for acne, blackheads, and fine lines with high accuracy.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/10 rounded-lg mt-1">
                    <ShieldCheck size={20} className="text-teal-200" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-teal-50">Privacy First</h3>
                    <p className="text-teal-200/80 text-sm mt-1">Your facial data is securely processed and safely stored.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Proof */}
            <div className="relative z-10 border-t border-white/10 pt-6 mt-8">
              <p className="text-teal-100 text-sm">
                "SkinWise transformed how I track my skin barrier progress."
              </p>
              <div className="flex items-center gap-3 mt-3">
                <div className="w-8 h-8 rounded-full bg-teal-700 border border-teal-500 flex items-center justify-center text-xs font-bold">JD</div>
                <span className="text-xs text-teal-300 font-medium">— Jane D., Verified User</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Registration Form */}
          <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
            
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Account</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Join <span className="font-semibold text-teal-600 dark:text-teal-400">SkinWise</span> to start your personalized skincare journey.
              </p>
            </div>

            {/* Error/Success Messages */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${
                message.type === 'success' 
                  ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800' 
                  : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}>
                {message.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    name="username"
                    placeholder="e.g. skinenthusiast"
                    required
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none text-slate-900 dark:text-white transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none text-slate-900 dark:text-white transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none text-slate-900 dark:text-white transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-teal-600/20 hover:shadow-teal-600/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Setting up profile...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Footer Link */}
            <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?
              <Link to="/login" className="text-teal-600 dark:text-teal-400 font-bold hover:underline ml-1.5 transition-colors">
                Log in
              </Link>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;