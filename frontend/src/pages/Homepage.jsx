// frontend/src/pages/Home.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Image as ImageIcon,
  Zap,
  ClipboardList,
  Heart,
  Mail,
  Search
} from 'lucide-react';

/**
 * SkinWise Home Page (updated colors & styling)
 * - Muted, neutral palette
 * - Indigo accent (soft)
 * - Soft backgrounds (no harsh white)
 * - Dark mode support
 *
 * Added: Floating WhatsApp CTA that opens the channel (VITE_WHATSAPP_LINK)
 *
 * Requires Tailwind CSS and lucide-react icons.
 */

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="bg-slate-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-3 rounded-md bg-indigo-50 dark:bg-indigo-900/20">
        <Icon size={20} className="text-indigo-600 dark:text-indigo-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-gray-100">{title}</h3>
    </div>
    <p className="text-sm text-slate-600 dark:text-gray-300">{desc}</p>
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
  // If you want a direct number chat use: `https://wa.me/<number>?text=Hello%20SkinWise`

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 text-slate-800 dark:text-gray-100">
      {/* HERO */}
      <header className="pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col-reverse md:flex-row items-center gap-10">
          <div className="w-full md:w-1/2">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              SkinWise  Practical, science-backed skincare
            </h1>
            <p className="mt-4 text-slate-600 dark:text-gray-300 max-w-xl">
              Get an objective skin analysis for acne, blackheads, pigmentation and fine lines.
              Simple heuristics, transparent results and easy-to-follow recommendations — built for everyone.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/analyze')}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full font-semibold shadow-sm transition"
              >
                <ImageIcon size={16} />
                Analyze My Skin
              </button>

              <button
                onClick={() => navigate('/quiz')}
                className="inline-flex items-center gap-2 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-200 px-4 py-2 rounded-full bg-transparent hover:bg-slate-100 dark:hover:bg-gray-800 transition"
              >
                <ClipboardList size={16} />
                Skin Type Quiz
              </button>

              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-slate-700 dark:text-gray-200 px-4 py-2 rounded-full"
              >
                <Zap size={16} />
                Read Articles
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 max-w-md">
              <div className="p-3 rounded bg-slate-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-slate-500">10-day plan</div>
                <div className="font-semibold text-slate-800 dark:text-gray-100">Quick skin reset</div>
              </div>
              <div className="p-3 rounded bg-slate-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-slate-500">Ingredient guide</div>
                <div className="font-semibold text-slate-800 dark:text-gray-100">Retinol · Niacinamide · Vitamin C</div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex justify-center">
            <div className="w-[360px] h-[420px] rounded-2xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 bg-slate-50">
              <img
                src="https://www.aranca.com/assets/uploads/blogs/organicskincareban.jpg"
                alt="skincare hero"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* FEATURES */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100 mb-6">What SkinWise does</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Feature
              icon={Search}
              title="Instant Skin Analysis"
              desc="Upload a clear photo and get a quick OpenCV-based analysis for acne, blackheads, pigmentation and fine lines."
            />
            <Feature
              icon={ClipboardList}
              title="Personalized Routines"
              desc="Actionable morning & night routines based on your concerns and ingredients that work."
            />
            <Feature
              icon={Heart}
              title="Track Progress"
              desc="Save scans and compare changes over time — track improvements objectively."
            />
          </div>
        </div>
      </section>

      {/* QUIZ PREVIEW */}
      <section className="py-10 bg-slate-50 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-gray-100">Not sure about your skin type?</h3>
            <p className="mt-2 text-slate-600 dark:text-gray-300">
              Take a short quiz to learn your skin type and receive tailored suggestions.
            </p>
            <div className="mt-4">
              <button onClick={() => navigate('/quiz')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
                Start Quiz
              </button>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-slate-600 dark:text-gray-300">Quiz snapshot:</p>
            <ul className="mt-3 space-y-2 text-slate-800 dark:text-gray-100 text-sm">
              <li>• Does your skin get oily by midday?</li>
              <li>• Do products irritate your skin?</li>
              <li>• How often do you get breakouts?</li>
            </ul>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-slate-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 text-white rounded-md">
                <Mail size={18} />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-gray-100">Weekly skincare tips</div>
                <div className="text-sm text-slate-600 dark:text-gray-400">Practical, evidence-based guidance.</div>
              </div>
            </div>

            <form onSubmit={handleSubscribe} className="ml-auto flex gap-3 w-full md:w-auto">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-600"
              />
              <button
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md whitespace-nowrap"
              >
                {submitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>

          {subMsg && (
            <div className={`mt-3 text-sm ${subMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {subMsg.text}
            </div>
          )}
        </div>
      </section>

      {/* Floating WhatsApp CTA */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-6 bottom-6 z-50 group flex items-center gap-3"
        aria-label="Join our WhatsApp channel"
      >
        <div className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg flex items-center justify-center transform transition-all duration-150 group-hover:scale-105">
          <WhatsAppSVG className="w-6 h-6 text-white" />
        </div>
        {/* Label visible on larger screens */}
        <div className="hidden md:flex flex-col bg-white/90 dark:bg-gray-800/80 px-3 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <span className="text-xs font-semibold text-slate-800 dark:text-gray-100">Join our WhatsApp</span>
          <span className="text-xs text-slate-600 dark:text-gray-300">Get tips & updates</span>
        </div>
      </a>

      {/* FOOTER */}
      <footer className="py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-md bg-slate-700 p-2 text-white">
                <ImageIcon size={20} />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">SkinWise</div>
                <div className="text-sm text-slate-600 dark:text-gray-400">Objective skin analysis — not medical advice.</div>
              </div>
            </div>
            <div className="text-sm text-slate-600 dark:text-gray-400">© {new Date().getFullYear()} SkinWise</div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-gray-100 mb-2">Tools</h4>
              <ul className="text-sm text-slate-600 dark:text-gray-400 space-y-2">
                <li><Link to="/analyze" className="hover:underline">Skin Analyzer</Link></li>
                <li><Link to="/quiz" className="hover:underline">Skin Quiz</Link></li>
                <li><Link to="/blog" className="hover:underline">Articles</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 dark:text-gray-100 mb-2">Company</h4>
              <ul className="text-sm text-slate-600 dark:text-gray-400 space-y-2">
                <li><Link to="/about" className="hover:underline">About</Link></li>
                <li><Link to="/contact" className="hover:underline">Contact</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
