import React from 'react';
import {
  Sun,
  Droplets,
  ShieldCheck,
  Sparkles,
  Moon,
  Leaf,
  AlertTriangle
} from 'lucide-react';

const AdviceCard = ({ icon: Icon, title, desc }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition">
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
        <Icon size={22} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-800 dark:text-gray-100">
          {title}
        </h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
          {desc}
        </p>
      </div>
    </div>
  </div>
);

export default function AdvicePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-gray-100">

      {/* HERO */}
      <header className="py-14 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold">
            Everyday Skincare Advice
          </h1>
          <p className="mt-4 text-slate-600 dark:text-gray-300 max-w-2xl mx-auto">
            Simple, practical skincare habits that actually work — no hype,
            no overcomplication.
          </p>
        </div>
      </header>

      {/* IMAGE STRIP */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <img
            src="https://images.unsplash.com/photo-1580870069867-74c57ee1bb07"
            alt="clean skincare"
            className="rounded-xl object-cover h-60 w-full"
          />
          <img
            src="https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd"
            alt="skincare routine"
            className="rounded-xl object-cover h-60 w-full"
          />
          <img
            src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9"
            alt="healthy skin"
            className="rounded-xl object-cover h-60 w-full"
          />
        </div>
      </section>

      {/* CORE ADVICE */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">
            Core Skincare Principles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AdviceCard
              icon={Droplets}
              title="Cleanse Gently"
              desc="Wash your face twice daily using a mild cleanser. Over-washing or harsh scrubs damage the skin barrier."
            />
            <AdviceCard
              icon={Sun}
              title="Never Skip Sunscreen"
              desc="Daily SPF 30+ prevents pigmentation, premature aging, and acne marks — even indoors."
            />
            <AdviceCard
              icon={Sparkles}
              title="Use Actives Wisely"
              desc="Ingredients like Vitamin C, Niacinamide, and Retinol work best when used consistently and in the right strength."
            />
            <AdviceCard
              icon={ShieldCheck}
              title="Protect the Skin Barrier"
              desc="Moisturizers and ceramides help prevent irritation, breakouts, and dehydration."
            />
          </div>
        </div>
      </section>

      {/* MORNING / NIGHT */}
      <section className="py-12 bg-slate-100 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">

          <div>
            <div className="flex items-center gap-3 mb-3">
              <Sun className="text-indigo-600" />
              <h3 className="text-xl font-semibold">Morning Routine</h3>
            </div>
            <ul className="space-y-2 text-slate-600 dark:text-gray-300">
              <li>• Gentle cleanser</li>
              <li>• Vitamin C / Niacinamide serum</li>
              <li>• Moisturizer</li>
              <li>• Sunscreen (SPF 30+)</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <Moon className="text-indigo-600" />
              <h3 className="text-xl font-semibold">Night Routine</h3>
            </div>
            <ul className="space-y-2 text-slate-600 dark:text-gray-300">
              <li>• Cleanser</li>
              <li>• Treatment (Retinol / Salicylic Acid)</li>
              <li>• Moisturizer</li>
              <li>• Adequate sleep (7–8 hours)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* NATURAL & LIFESTYLE */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">
            Lifestyle & Natural Tips
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AdviceCard
              icon={Leaf}
              title="Eat for Your Skin"
              desc="Fruits, vegetables, omega-3 fats, and water directly affect skin clarity and glow."
            />
            <AdviceCard
              icon={Moon}
              title="Sleep & Stress"
              desc="Poor sleep and stress increase cortisol, triggering acne and dullness."
            />
            <AdviceCard
              icon={AlertTriangle}
              title="Avoid Overdoing"
              desc="Too many products or frequent exfoliation worsens acne and sensitivity."
            />
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <footer className="py-10 text-center text-sm text-slate-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        SkinWise provides general skincare guidance. This is not medical advice.
      </footer>
    </div>
  );
}
