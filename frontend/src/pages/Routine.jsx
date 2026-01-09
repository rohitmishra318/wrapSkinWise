// frontend/src/pages/Routine.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Sun,
  Moon,
  Calendar,
  Bookmark,
  Printer,
  Share2,
  ArrowLeft,
  Sparkles,
  Heart,
} from 'lucide-react';

/**
 * Dynamic & attractive Routine page
 * - Reads quiz payload from location.state or localStorage
 * - Shows header, routine cards, ingredients, product carousel
 * - Save / Print / Share actions
 * - Stores/checklist progress in localStorage
 *
 * Save as: frontend/src/pages/Routine.jsx
 */

const DEFAULT_ROUTINES = {
  oily: {
    title: 'Oily · Acne-prone',
    subtitle: 'Control oil, clear pores, hydrate lightly',
    morning: [
      'Gentle foaming cleanser (salicylic acid optional)',
      'Niacinamide serum (2–5%)',
      'Light, non-comedogenic moisturizer',
      'Broad-spectrum SPF 30+ (gel/fluids)',
    ],
    night: [
      'Cleanse (double-cleanse if wearing sunscreen)',
      'Niacinamide or spot BHA',
      'Light moisturizer; retinol 0.25% (if tolerated)',
    ],
    weekly: ['Clay mask 1× week', 'BHA exfoliation 1× week (if tolerated)'],
    ingredients: [
      { name: 'Salicylic Acid', note: 'Penetrates pores and clears oil.' },
      { name: 'Niacinamide', note: 'Balances sebum, calms inflammation.' },
      { name: 'Hyaluronic Acid', note: 'Hydrates without oiliness.' },
    ],
    products: [
      { title: 'Salicylic Cleanser 2%', img: null, link: '#' },
      { title: 'Niacinamide Serum 5%', img: null, link: '#' },
      { title: 'Gel Moisturizer', img: null, link: '#' },
    ],
  },
  dry: {
    title: 'Dry',
    subtitle: 'Boost hydration, repair the barrier',
    morning: [
      'Hydrating cleanser (non-stripping)',
      'Hyaluronic acid serum',
      'Ceramide-rich moisturizer',
      'Hydrating SPF 30+',
    ],
    night: [
      'Gentle cleanser or balm',
      'Hyaluronic + glycerin serum',
      'Rich moisturizer with ceramides',
      'Occlusive if very dry',
    ],
    weekly: ['Hydrating mask 1–2× week', 'Avoid frequent strong exfoliation'],
    ingredients: [
      { name: 'Hyaluronic Acid', note: 'Attracts and holds moisture.' },
      { name: 'Ceramides', note: 'Repair barrier and reduce water loss.' },
      { name: 'Squalane', note: 'Light emollient, non-greasy hydration.' },
    ],
    products: [
      { title: 'Hydrating Cleanser', img: null, link: '#' },
      { title: 'Hyaluronic Serum', img: null, link: '#' },
      { title: 'Ceramide Moisturizer', img: null, link: '#' },
    ],
  },
  combination: {
    title: 'Combination',
    subtitle: 'Balance oil in T-zone, hydrate cheeks',
    morning: [
      'Gentle cleanser',
      'Niacinamide on oily zones',
      'Light moisturizer on T-zone, richer on cheeks',
      'Broad-spectrum SPF',
    ],
    night: [
      'Cleanse',
      'Targeted BHA on oily zones',
      'Retinol/niacinamide alternate nights',
      'Richer cream on cheeks',
    ],
    weekly: ['Exfoliate oily zones only', 'Hydrating masks on cheeks'],
    ingredients: [
      { name: 'Niacinamide', note: 'Balances oil and improves texture.' },
      { name: 'BHA (Salicylic)', note: 'Targets clogged pores.' },
      { name: 'Hyaluronic', note: 'Hydrates drier areas.' },
    ],
    products: [
      { title: 'Balanced Moisturizer', img: null, link: '#' },
      { title: 'Targeted BHA', img: null, link: '#' },
    ],
  },
  sensitive: {
    title: 'Sensitive',
    subtitle: 'Calm, simplify, and strengthen the barrier',
    morning: [
      'pH-balanced gentle cleanser',
      'Soothing moisturizer (ceramides, oat)',
      'Mineral sunscreen (zinc oxide)',
    ],
    night: [
      'Gentle cleanser',
      'Barrier repair moisturizer',
      'Avoid strong acids & high-retinoid strength',
    ],
    weekly: ['Calming masks (aloe/oat), patch-test new products'],
    ingredients: [
      { name: 'Ceramides', note: 'Supports barrier repair.' },
      { name: 'Aloe / Green tea', note: 'Soothes inflammation.' },
      { name: 'Zinc Oxide', note: 'Gentle physical sunscreen.' },
    ],
    products: [
      { title: 'Gentle Moisturizer', img: null, link: '#' },
      { title: 'Mineral SPF', img: null, link: '#' },
    ],
  },
  normal: {
    title: 'Normal',
    subtitle: 'Maintain balance and protect',
    morning: [
      'Gentle cleanser',
      'Vitamin C (optional)',
      'Moisturizer',
      'SPF 30+',
    ],
    night: [
      'Cleanse',
      'Niacinamide or low-retinol (alternate)',
      'Moisturizer',
    ],
    weekly: ['Mild exfoliation 1× week', 'Hydrating mask'],
    ingredients: [
      { name: 'Vitamin C', note: 'Brightening antioxidant.' },
      { name: 'Niacinamide', note: 'Supports barrier & tone.' },
    ],
    products: [
      { title: 'Gentle Cleanser', img: null, link: '#' },
      { title: 'Vitamin C Serum', img: null, link: '#' },
    ],
  },
};

function getSavedQuiz() {
  try {
    const raw = localStorage.getItem('skinwise_last_quiz');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function RoutinePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [savedMsg, setSavedMsg] = useState(null);
  const [shareText, setShareText] = useState('');
  const payload = location.state || getSavedQuiz();
  const [streak, setStreak] = useState(null);
  const [marking, setMarking] = useState(false);


  // compute type and routine
  const type = useMemo(() => {
    if (!payload) return null;
    if (payload.type) return payload.type;
    if (payload.scores) {
      const entries = Object.entries(payload.scores).sort((a, b) => b[1] - a[1]);
      return entries[0]?.[0] || 'normal';
    }
    return 'normal';
  }, [payload]);

  const routine = useMemo(() => {
    if (!type) return null;
    return DEFAULT_ROUTINES[type] || DEFAULT_ROUTINES.normal;
  }, [type]);

  // checklist state stored in localStorage keyed by quiz timestamp & type (so users can have multiple)
  const keyPrefix = useMemo(() => {
    const stamp = payload?.createdAt ? payload.createdAt : 'session';
    return `skinwise_check_${type}_${stamp}`;
  }, [payload, type]);

  const [checked, setChecked] = useState(() => {
    try {
      const raw = localStorage.getItem(keyPrefix);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(keyPrefix, JSON.stringify(checked));
    } catch {}
  }, [checked, keyPrefix]);

  useEffect(() => {
  async function fetchStreak() {
    try {
      const base = import.meta.env.VITE_API_BASE_URL || '';
      const token = localStorage.getItem('token');

      const res = await axios.get(`${base}/api/routine/streak`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStreak(res.data);
    } catch (err) {
      console.error('Failed to fetch streak');
    }
  }

  fetchStreak();
}, []);


  useEffect(() => {
    // if no payload, send back to quiz after short delay
    if (!payload) {
      const t = setTimeout(() => navigate('/quiz'), 700);
      return () => clearTimeout(t);
    }
  }, [payload, navigate]);

  if (!payload || !routine) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">No quiz data found</h2>
        <p className="text-slate-600 mb-4">Please take the skin quiz to generate a personalized routine.</p>
        <button onClick={() => navigate('/quiz')} className="bg-indigo-600 text-white px-4 py-2 rounded-md">Take Quiz</button>
      </div>
    );
  }

  function toggleCheck(section, idx) {
    const key = `${section}_${idx}`;
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setSavedMsg(null);
    try {
      const token = localStorage.getItem('token');
      const body = {
        payload,
        type,
        savedAt: new Date().toISOString(),
      };
      if (!token) {
        localStorage.setItem('skinwise_last_saved_routine', JSON.stringify(body));
        setSavedMsg({ type: 'info', text: 'Routine saved locally. Log in to save in profile.' });
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/routines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Save failed');
      setSavedMsg({ type: 'success', text: 'Saved to your profile.' });
    } catch (err) {
      console.error(err);
      localStorage.setItem('skinwise_last_saved_routine', JSON.stringify({ payload, type, savedAt: new Date().toISOString() }));
      setSavedMsg({ type: 'error', text: 'Save failed. Routine stored locally.' });
    }
  }

  function handlePrint() {
    window.print();
  }

  async function handleShare() {
    const sharePayload = {
      type,
      summary: routine.subtitle,
      morning: routine.morning,
      night: routine.night,
    };
    const text = `My SkinWise routine — ${routine.title}\n${routine.subtitle}\nMorning: ${routine.morning.join(' • ')}\nNight: ${routine.night.join(' • ')}`;
    setShareText(text);
    try {
      if (navigator.share) {
        await navigator.share({ title: `My SkinWise routine — ${routine.title}`, text });
      } else {
        await navigator.clipboard.writeText(text);
        setSavedMsg({ type: 'success', text: 'Routine copied to clipboard. Share it anywhere.' });
      }
    } catch (err) {
      setSavedMsg({ type: 'error', text: 'Could not share. Try copying manually.' });
    }
  }

  // progress calculation (percentage of checked items across morning+night+weekly)
  const totalItems = routine.morning.length + routine.night.length + routine.weekly.length;
  const checkedCount = Object.keys(checked).filter(k => checked[k]).length;
  const completion = totalItems === 0 ? 0 : Math.round((checkedCount / totalItems) * 100);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
        <div>
          <button onClick={() => navigate(-1)} className="mb-3 inline-flex items-center gap-2 text-slate-600 hover:text-slate-800">
            <ArrowLeft size={18} /> Back
          </button>

          <h1 className="text-3xl font-semibold">{routine.title}</h1>
          <p className="text-slate-600 mt-2">{routine.subtitle}</p>

          <div className="mt-4 flex items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
              <Sparkles size={16} /> Personalized Routine
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300">
              <CheckCircle size={16} className="text-green-500" /> {completion}% complete
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm flex items-center gap-2">
              <Bookmark size={16} /> Save
            </button>
            <button onClick={handlePrint} className="px-4 py-2 border rounded-md flex items-center gap-2">
              <Printer size={16} /> Print
            </button>
            <button onClick={handleShare} className="px-4 py-2 border rounded-md flex items-center gap-2">
              <Share2 size={16} /> Share
            </button>
          </div>

          {savedMsg && (
            <div className={`mt-3 p-2 rounded text-sm ${savedMsg.type === 'success' ? 'bg-green-50 text-green-700' : savedMsg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'}`}>
              {savedMsg.text}
            </div>
          )}
        </div>

        {/* Progress Card */}
        <div className="w-full md:w-72 bg-slate-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">

  {/* DAILY COMPLETION */}
  <div className="flex items-center justify-between mb-3">
    <div className="text-sm font-medium">Daily completion</div>
    <div className="text-xs text-slate-500">{checkedCount}/{totalItems}</div>
  </div>

  <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
    <div
      className="h-3 bg-indigo-600 rounded-full transition-all"
      style={{ width: `${completion}%` }}
    />
  </div>

  <div className="mt-2 text-xs text-slate-600">
    Complete all steps to maintain your streak.
  </div>

  {/* ACTION BUTTONS */}
  <div className="mt-4 flex gap-2 flex-wrap">
    <button
      onClick={() => {
        const updates = {};
        routine.morning.forEach((_, i) => updates[`morning_${i}`] = true);
        setChecked(prev => ({ ...prev, ...updates }));
      }}
      className="text-xs px-2 py-1 border rounded bg-white dark:bg-gray-700"
    >
      Mark Morning
    </button>

    <button
      onClick={() => {
        const updates = {};
        routine.night.forEach((_, i) => updates[`night_${i}`] = true);
        setChecked(prev => ({ ...prev, ...updates }));
      }}
      className="text-xs px-2 py-1 border rounded bg-white dark:bg-gray-700"
    >
      Mark Night
    </button>

    <button
      onClick={() => setChecked({})}
      className="text-xs px-2 py-1 border rounded bg-white dark:bg-gray-700"
    >
      Reset
    </button>
  </div>

  {/* 🔥 STREAK SECTION */}
  {streak && (
    <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Routine Streak</div>
        <span className="text-xs text-slate-500">
          Best: {streak.longestStreak} days
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-2xl">
          {streak.currentStreak >= 7 ? '🔥' : '✅'}
        </span>
        <div>
          <div className="text-lg font-semibold">
            {streak.currentStreak} day streak
          </div>
          <div className="text-xs text-slate-500">
            Keep your routine consistent
          </div>
        </div>
      </div>
    </div>
  )}

</div>

      </div>

      {/* Routine Cards (timeline-like) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Morning Card */}
        <section className="bg-slate-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-yellow-50 text-yellow-700 p-2 rounded-md"><Sun size={18} /></div>
            <div>
              <h3 className="font-semibold">Morning</h3>
              <div className="text-xs text-slate-600">{routine.morning.length} steps</div>
            </div>
          </div>

          <ol className="space-y-3">
            {routine.morning.map((step, i) => {
              const key = `morning_${i}`;
              return (
                <li key={i} className="flex items-start gap-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={!!checked[key]} onChange={() => toggleCheck('morning', i)} className="mt-1" />
                    <div>
                      <div className="text-sm font-medium">{step}</div>
                      <div className="text-xs text-slate-500">Simple tip: apply lightweight products first</div>
                    </div>
                  </label>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Night Card */}
        <section className="bg-slate-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-indigo-50 text-indigo-700 p-2 rounded-md"><Moon size={18} /></div>
            <div>
              <h3 className="font-semibold">Night</h3>
              <div className="text-xs text-slate-600">{routine.night.length} steps</div>
            </div>
          </div>

          <ol className="space-y-3">
            {routine.night.map((step, i) => {
              const key = `night_${i}`;
              return (
                <li key={i} className="flex items-start gap-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={!!checked[key]} onChange={() => toggleCheck('night', i)} className="mt-1" />
                    <div>
                      <div className="text-sm font-medium">{step}</div>
                      <div className="text-xs text-slate-500">Tip: introduce actives gradually and patch-test.</div>
                    </div>
                  </label>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Weekly Card */}
        <section className="bg-slate-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-50 text-green-700 p-2 rounded-md"><Calendar size={18} /></div>
            <div>
              <h3 className="font-semibold">Weekly & Extras</h3>
              <div className="text-xs text-slate-600">{routine.weekly.length} items</div>
            </div>
          </div>

          <ul className="space-y-3">
            {routine.weekly.map((item, i) => {
              const key = `weekly_${i}`;
              return (
                <li key={i} className="flex items-start gap-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={!!checked[key]} onChange={() => toggleCheck('weekly', i)} className="mt-1" />
                    <div>
                      <div className="text-sm font-medium">{item}</div>
                      <div className="text-xs text-slate-500">Schedule this on a calm evening.</div>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* Ingredients + Product suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 bg-slate-50 dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h4 className="font-semibold mb-3 flex items-center gap-2"><Sparkles size={18} /> Key Ingredients</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {routine.ingredients.map((ing, i) => (
              <div key={i} className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="font-medium">{ing.name}</div>
                <div className="text-xs text-slate-600 mt-1">{ing.note}</div>
              </div>
            ))}
          </div>
        </div>

        <aside className="bg-slate-50 dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h4 className="font-semibold mb-3 flex items-center gap-2"><Heart size={18} /> Product Suggestions</h4>

          <div className="space-y-3">
            {routine.products.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-900 rounded-md flex items-center justify-center text-sm text-slate-500">
                  IMG
                </div>
                <div>
                  <div className="font-medium text-sm"><a className="hover:underline text-indigo-600" href={p.link}>{p.title}</a></div>
                  <div className="text-xs text-slate-600">Check reviews & patch-test first.</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Footer CTA */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">
        <div className="text-sm text-slate-600">Want to improve this routine? Update your quiz answers or run an image-based analysis to refine recommendations.</div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/quiz')} className="px-4 py-2 border rounded-md">Edit Quiz</button>
          <button onClick={() => navigate('/analyze')} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Analyze with Photo</button>
        </div>
      </div>
    </div>
  );
}
