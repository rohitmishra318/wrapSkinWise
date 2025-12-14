// frontend/src/pages/Quiz.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Quiz.jsx
 * - Single-question-per-screen quiz (tailwind styling)
 * - Heuristic scoring to determine skin type
 * - After finishing: shows result + CTA to view personalized routine (navigates with state)
 *
 * Place in: frontend/src/pages/Quiz.jsx
 */

const QUESTIONS = [
  {
    id: 'oiliness',
    q: 'How oily does your skin feel by midday?',
    options: [
      { label: 'Very oily / shiny', scores: { oily: 2 } },
      { label: 'A bit oily (mainly T-zone)', scores: { combination: 2 } },
      { label: 'Not oily', scores: { dry: 1, normal: 1 } },
      { label: 'I don’t notice oiliness', scores: { normal: 2 } },
    ],
  },
  {
    id: 'breakouts',
    q: 'How often do you get pimples / breakouts?',
    options: [
      { label: 'Very frequently (weekly)', scores: { oily: 2, sensitive: 1 } },
      { label: 'Occasionally (monthly)', scores: { combination: 1 } },
      { label: 'Rarely', scores: { normal: 1, dry: 1 } },
      { label: 'Never', scores: { normal: 2 } },
    ],
  },
  {
    id: 'dryness',
    q: 'Do you experience flaky or tight patches?',
    options: [
      { label: 'Yes, often (tight/flaky)', scores: { dry: 2 } },
      { label: 'Sometimes, seasonal', scores: { combination: 1 } },
      { label: 'Rarely', scores: { normal: 1 } },
      { label: 'No', scores: { oily: 1, normal: 1 } },
    ],
  },
  {
    id: 'sensitivity',
    q: 'How does your skin react to new products?',
    options: [
      { label: 'Red, stings, or burns easily', scores: { sensitive: 2 } },
      { label: 'Mild irritation sometimes', scores: { sensitive: 1, dry: 1 } },
      { label: 'Usually fine', scores: { normal: 1 } },
      { label: 'No reaction ever', scores: { normal: 2 } },
    ],
  },
  {
    id: 'pores',
    q: 'How visible are your pores (esp. nose & cheeks)?',
    options: [
      { label: 'Very noticeable / enlarged', scores: { oily: 2 } },
      { label: 'Moderately visible (T-zone)', scores: { combination: 1 } },
      { label: 'Small/inconspicuous', scores: { normal: 1, dry: 1 } },
      { label: 'I don’t notice pores', scores: { normal: 2 } },
    ],
  },
  {
    id: 'tolerance',
    q: 'Can you tolerate active ingredients (AHA, BHA, Retinol)?',
    options: [
      { label: 'Yes, with gradual introduction', scores: { normal: 1, oily: 1 } },
      { label: 'Sometimes they irritate', scores: { sensitive: 2 } },
      { label: 'I avoid strong actives', scores: { dry: 1, sensitive: 1 } },
      { label: 'I use them regularly without issues', scores: { oily: 1, normal: 1 } },
    ],
  },
];

const DEFAULT_SCORES = { oily: 0, dry: 0, combination: 0, sensitive: 0, normal: 0 };

function pickSkinType(scores) {
  // pick top scoring type; break ties with simple rules
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = entries[0];
  const second = entries[1];
  if (!top) return 'normal';
  if (top[1] === second?.[1]) {
    // prefer combination if tied and present
    if (scores.combination === top[1]) return 'combination';
    return top[0];
  }
  return top[0];
}

// Helpful meta for the UI: short label & explanation for each type
const TYPE_META = {
  oily: { label: 'Oily / Acne-prone', short: 'Tends to get shiny and breakouts.' },
  dry: { label: 'Dry', short: 'Tight, flaky areas and needs hydration.' },
  combination: { label: 'Combination', short: 'Oily T-zone, drier cheeks.' },
  sensitive: { label: 'Sensitive', short: 'Prone to irritation; patch-test products.' },
  normal: { label: 'Normal', short: 'Balanced, few issues.' },
};

export default function Quiz() {
  const navigate = useNavigate();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: optionIndex }
  const [scores, setScores] = useState({ ...DEFAULT_SCORES });
  const [showResult, setShowResult] = useState(false);
  const [savedMsg, setSavedMsg] = useState(null);

  const current = QUESTIONS[index];
  const progress = Math.round(((index + 1) / QUESTIONS.length) * 100);

  // Select option for current question
  function selectOption(optIndex) {
    // Save answer
    const newAnswers = { ...answers, [current.id]: optIndex };
    setAnswers(newAnswers);

    // Recompute scores from scratch to avoid duplication
    const newScores = { ...DEFAULT_SCORES };
    Object.entries(newAnswers).forEach(([qid, chosenIdx]) => {
      const q = QUESTIONS.find(x => x.id === qid);
      if (!q) return;
      const opt = q.options[chosenIdx];
      if (!opt || !opt.scores) return;
      Object.entries(opt.scores).forEach(([k, v]) => {
        newScores[k] = (newScores[k] || 0) + v;
      });
    });
    setScores(newScores);

    // If last question, show result; else advance (tiny delay for UX)
    const isLast = index === QUESTIONS.length - 1;
    setTimeout(() => {
      if (isLast) {
        setShowResult(true);
      } else {
        setIndex(i => Math.min(QUESTIONS.length - 1, i + 1));
      }
    }, 180);
  }

  function goBack() {
    if (index === 0) return;
    setIndex(i => i - 1);
  }

  function restart() {
    setIndex(0);
    setAnswers({});
    setScores({ ...DEFAULT_SCORES });
    setShowResult(false);
    setSavedMsg(null);
  }

  async function handleSaveResults() {
    setSavedMsg(null);
    try {
      const payload = {
        type: pickSkinType(scores),
        scores,
        answers,
        createdAt: new Date().toISOString(),
      };

      const token = localStorage.getItem('token'); // adapt if different auth
      if (!token) {
        // save locally
        localStorage.setItem('skinwise_last_quiz', JSON.stringify(payload));
        setSavedMsg({ type: 'info', text: 'Saved locally. Log in to save to your profile.' });
        return;
      }

      // send to backend (if you have /api/quiz implemented)
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save');
      setSavedMsg({ type: 'success', text: 'Quiz saved to your profile.' });
    } catch (err) {
      console.error(err);
      // fallback local save
      localStorage.setItem('skinwise_last_quiz', JSON.stringify({
        type: pickSkinType(scores),
        scores, answers, createdAt: new Date().toISOString()
      }));
      setSavedMsg({ type: 'error', text: 'Could not save to server — saved locally.' });
    }
  }

  // Navigate to routine page with quiz payload
  function viewRoutine() {
    const payload = {
      type: pickSkinType(scores),
      scores,
      answers,
      createdAt: new Date().toISOString(),
    };
    // Save to localStorage as a fallback
    localStorage.setItem('skinwise_last_quiz', JSON.stringify(payload));
    navigate('/routine', { state: payload });
  }

  // compute current chosen index for rendering selected state
  const chosenIndex = answers[current?.id];

  // Render result screen
  if (showResult) {
    const type = pickSkinType(scores);
    const meta = TYPE_META[type] || TYPE_META.normal;
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-slate-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-700">
          <h1 className="text-2xl font-semibold mb-2">Your Skin Type</h1>
          <div className="flex items-center gap-4 mb-3">
            <div className="px-3 py-2 rounded-md bg-indigo-50 text-indigo-700 font-semibold">{meta.label}</div>
            <div className="text-sm text-slate-600 dark:text-gray-300">{meta.short}</div>
          </div>

          <div className="mt-4">
            <h3 className="font-medium mb-2">Why we classified this way</h3>
            <div className="text-sm text-slate-700 dark:text-gray-300">
              Scores: {Object.entries(scores).map(([k, v]) => `${k}: ${v}`).join(' · ')}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={viewRoutine} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm">
              View Personalized Routine
            </button>

            <button onClick={handleSaveResults} className="px-4 py-2 rounded-md border bg-slate-100 dark:bg-gray-700">
              Save Results
            </button>

            <button onClick={restart} className="px-4 py-2 rounded-md border">
              Retake Quiz
            </button>
          </div>

          {savedMsg && (
            <div className={`mt-4 p-2 rounded text-sm ${savedMsg.type === 'success' ? 'bg-green-50 text-green-700' : savedMsg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'}`}>
              {savedMsg.text}
            </div>
          )}

          <div className="mt-4 text-xs text-slate-500">
            Note: This quiz provides a heuristic classification and routine suggestions. For medical issues or severe acne, consult a dermatologist.
          </div>
        </div>
      </div>
    );
  }

  // Quiz view (question card)
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-slate-600 dark:text-gray-400">Question {index + 1} / {QUESTIONS.length}</div>
          <div className="text-xs text-slate-500 dark:text-gray-400">Tip: answer honestly</div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
          <div className="h-2 bg-indigo-600 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">{current.q}</h2>

        <div className="grid gap-3">
          {current.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => selectOption(idx)}
              className={`text-left p-3 rounded-md border transition flex items-center justify-between ${
                chosenIndex === idx
                  ? 'bg-indigo-50 border-indigo-300'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="text-sm text-slate-800 dark:text-gray-100">{opt.label}</div>
              {chosenIndex === idx && <div className="text-xs text-indigo-600">Selected</div>}
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <button onClick={goBack} disabled={index === 0} className="px-4 py-2 rounded-md border bg-slate-100 dark:bg-gray-700 text-sm">
            Back
          </button>

          <div className="text-sm text-slate-600 dark:text-gray-400">{/* placeholder for extra tips */}</div>
        </div>
      </div>
    </div>
  );
}
