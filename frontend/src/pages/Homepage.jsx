// frontend/src/pages/Home.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Image as ImageIcon,
  Zap,
  ClipboardList,
  Heart,
  Mail,
  Search,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import SEO from '../components/SEO.jsx';

/**
 * SkinWise Home Page (Modern Clinical Wellness Theme)
 * - Teal/Aqua primary palette for clinical trust
 * - Soft slate/pearl backgrounds
 * - Elegant glassmorphism and smooth transition effects
 * - Fully responsive & Dark mode optimized
 */

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="group bg-white dark:bg-slate-800/80 p-8 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-900/30 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors duration-300">
        <Icon size={24} className="text-teal-600 dark:text-teal-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
    </div>
    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{desc}</p>
  </div>
);

// Inline WhatsApp SVG (keeps dependency-free)
const WhatsAppSVG = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
    <path d="M16.01 3C9.925 3 5 7.925 5 14c0 2.452.807 4.712 2.172 6.595L6 29l8.67-2.29A11.94 11.94 0 0 0 16.01 27C22.095 27 27 22.075 27 16S22.095 3 16.01 3zm0 22.5c-1.2 0-2.374-.2-3.488-.59l-.248-.09-5.2 1.37 1.37-4.98-.14-.25A9.003 9.003 0 0 1 7 14c0-4.97 4.04-9 9.01-9S25 9.03 25 14s-4.04 11.5-8.99 11.5z" />
    <path d="M22.1 19.04c-.37-.18-2.18-1.08-2.52-1.2-.34-.12-.59-.18-.84.18-.24.36-.92 1.2-1.13 1.45-.21.24-.42.27-.79.09-.37-.18-1.57-.58-2.99-1.84-1.1-.98-1.84-2.19-2.06-2.56-.22-.37-.02-.57.16-.75.16-.16.37-.42.55-.63.18-.21.24-.36.36-.59.12-.24.06-.43-.03-.6-.09-.18-.84-2.02-1.15-2.77-.3-.72-.61-.62-.84-.63l-.72-.01c-.24 0-.62.09-.95.43-.33.34-1.25 1.22-1.25 2.97 0 1.76 1.28 3.46 1.46 3.7.18.24 2.53 3.87 6.14 5.43 3.61 1.56 3.61 1.04 4.26.98.65-.06 2.06-.84 2.35-1.65.29-.82.29-1.52.21-1.65-.08-.13-.3-.18-.67-.36z" fill="#fff" />
  </svg>
);

export default function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subMsg, setSubMsg] = useState(null);

  async function handleSubscribe(e) {
    e.preventDefault();
    setSubMsg(null);
    if (!email || !email.includes('@')) {
      setSubMsg({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    setSubmitting(true);
    try {
      // Demo delay - replace with real API call
      await new Promise((r) => setTimeout(r, 700));
      setSubMsg({ type: 'success', text: 'Thanks — you are subscribed!' });
      setEmail('');
    } catch {
      setSubMsg({ type: 'error', text: 'Subscription failed. Please try again later.' });
    } finally {
      setSubmitting(false);
    }
  }

  const whatsappLink = import.meta.env.VITE_WHATSAPP_LINK || 'https://chat.whatsapp.com/your-invite-link';

  return (
    <>
      <SEO
        title="Homepage | SkinWise"
        description="Access AI-powered skin analysis and personalized skincare routines built on medical-grade computer vision."
        url="https://skinwise.ai"
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 selection:bg-teal-200 selection:text-teal-900 font-sans">
        
        {/* HERO SECTION */}
        <header className="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-400/10 dark:bg-teal-600/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-8">
            
            {/* Hero Text */}
            <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-semibold mb-6 border border-teal-100 dark:border-teal-800/50">
                <Zap size={14} className="text-teal-600 dark:text-teal-400" />
                <span>AI-Powered Skin Diagnostics</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-400">SkinWise.</span><br />
                Practical, science-backed skincare.
              </h1>
              
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                Get an objective, clinical-grade skin analysis for acne, blackheads, pigmentation, and fine lines. Transparent results and personalized routines—built for everyone.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/analyze')}
                  className="inline-flex justify-center items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all duration-300"
                >
                  <ImageIcon size={20} />
                  Analyze My Skin
                </button>

                <button
                  onClick={() => navigate('/quiz')}
                  className="inline-flex justify-center items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 px-6 py-3 rounded-xl font-semibold shadow-sm transition-all duration-300"
                >
                  <ClipboardList size={20} className="text-teal-600 dark:text-teal-400" />
                  Skin Type Quiz
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 grid grid-cols-2 gap-4 max-w-md w-full">
                <div className="flex flex-col p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">10-Day Plan</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">Quick skin reset</span>
                </div>
                <div className="flex flex-col p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Derm-Approved</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">Retinol · Niacinamide</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-100 to-rose-100 dark:from-teal-900/20 dark:to-rose-900/20 rounded-[2.5rem] transform rotate-3 scale-105 -z-10"></div>
              <div className="w-full max-w-[440px] aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 relative group">
                <div className="absolute inset-0 bg-teal-900/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                <img
                  src="https://www.aranca.com/assets/uploads/blogs/organicskincareban.jpg"
                  alt="Modern minimalist skincare routine"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
            </div>
            
          </div>
        </header>

        {/* FEATURES SECTION */}
        <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Intelligence for your skin</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300">Stop guessing. We utilize advanced computer vision to decode what your skin actually needs right now.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Feature
                icon={Search}
                title="Instant Analysis"
                desc="Upload a clear photo and get a rapid, AI-driven analysis for acne, blackheads, pigmentation, and fine lines."
              />
              <Feature
                icon={ClipboardList}
                title="Smart Routines"
                desc="Actionable morning & night routines tailored to your specific severity scores with ingredients that provenly work."
              />
              <Feature
                icon={Heart}
                title="Track Progress"
                desc="Save scans, build streaks, and compare your delta changes over time to see what products are actually working."
              />
            </div>
          </div>
        </section>

        {/* QUIZ PROMO SECTION */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl">
              {/* Decorative shapes */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-teal-500/20 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-rose-500/20 blur-3xl"></div>
              
              <div className="relative p-10 sm:p-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-bold mb-4 tracking-tight">Not sure about your skin type?</h3>
                  <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                    Dry, oily, combination, or sensitive? Take our quick 2-minute clinical quiz to baseline your profile before scanning.
                  </p>
                  <button 
                    onClick={() => navigate('/quiz')} 
                    className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors duration-300"
                  >
                    Start the Quiz <ArrowRight size={18} />
                  </button>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 size={20} className="text-teal-400" />
                    <span className="font-semibold text-teal-50">Quiz Snapshot</span>
                  </div>
                  <ul className="space-y-4 text-slate-200">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2"></div>
                      <p>Does your skin get visibly oily by midday?</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2"></div>
                      <p>Do active ingredients tend to irritate your barrier?</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2"></div>
                      <p>How frequently do you experience breakouts?</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center gap-8">
              
              <div className="flex items-center gap-5 w-full md:w-1/2">
                <div className="p-4 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-2xl">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">Weekly Skincare Intel</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Practical, evidence-based guidance directly to your inbox.</p>
                </div>
              </div>

              <div className="w-full md:w-1/2">
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:focus:ring-teal-500/50 transition-shadow"
                  />
                  <button
                    disabled={submitting}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Joining...' : 'Subscribe'}
                  </button>
                </form>
                {subMsg && (
                  <div className={`mt-3 text-sm font-medium flex items-center gap-2 ${subMsg.type === 'success' ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    <CheckCircle2 size={16} />
                    {subMsg.text}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FLOATING WHATSAPP CTA */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed right-6 bottom-6 z-50 group flex items-center gap-4"
          aria-label="Join our WhatsApp channel"
        >
          {/* Tooltip Label (Desktop only) */}
          <div className="hidden md:flex flex-col items-end opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700">
              <span className="block text-sm font-bold text-slate-800 dark:text-white">Ask an Expert</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">Join our WhatsApp</span>
            </div>
          </div>

          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl shadow-[#25D366]/30 transform transition-all duration-300 group-hover:scale-110">
            {/* Subtle ping animation underneath */}
            <div className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-20"></div>
            <WhatsAppSVG className="w-8 h-8 relative z-10" />
          </div>
        </a>

        {/* FOOTER */}
        <footer className="py-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start gap-10">
            
            <div className="max-w-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl bg-teal-600 p-2.5 text-white shadow-sm">
                  <ImageIcon size={22} />
                </div>
                <div className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">SkinWise</div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Objective, AI-driven skin analysis. Information provided is for educational purposes and not a substitute for professional medical advice.
              </p>
              <div className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                © {new Date().getFullYear()} SkinWise Technologies.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 sm:gap-24">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4 uppercase text-xs tracking-wider">Platform</h4>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <li><Link to="/analyze" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">AI Skin Analyzer</Link></li>
                  <li><Link to="/quiz" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Skin Assessment Quiz</Link></li>
                  <li><Link to="/blog" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Science & Articles</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4 uppercase text-xs tracking-wider">Company</h4>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <li><Link to="/about" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Our Story</Link></li>
                  <li><Link to="/contact" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Contact Support</Link></li>
                  <li><Link to="/privacy" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
            
          </div>
        </footer>
      </div>
    </>
  );
}