// frontend/src/pages/AdvicePage.jsx
import React from 'react';
import {
  Sun,
  Droplets,
  ShieldCheck,
  Sparkles,
  Moon,
  Leaf,
  AlertTriangle,
  Check
} from 'lucide-react';
import SEO from '../components/SEO.jsx';

const AdviceCard = ({ icon: Icon, title, desc }) => (
  <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 p-8 shadow-sm hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300">
    <div className="flex flex-col sm:flex-row items-start gap-5">
      <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-900/30 shrink-0">
        <Icon size={24} className="text-teal-600 dark:text-teal-400" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  </div>
);

export default function AdvicePage() {
  return (
    <>
      <SEO 
        title="Skincare Advice | SkinWise" 
        description="Practical, science-backed skincare advice, routines, and lifestyle tips for your everyday skin health." 
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-gray-100 font-sans selection:bg-teal-200 selection:text-teal-900 pb-12">

        {/* HERO */}
        <header className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-20 border-b border-slate-200 dark:border-slate-800 text-center px-4">
          {/* Ambient Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-400/10 dark:bg-teal-600/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
              Everyday <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-400">Skincare Advice</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Simple, practical skincare habits that actually work — no hype, no overcomplication.
            </p>
          </div>
        </header>

        {/* IMAGE STRIP */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 group">
              <div className="overflow-hidden rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1580870069867-74c57ee1bb07"
                  alt="Clean skincare aesthetic"
                  className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="overflow-hidden rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd"
                  alt="Organized skincare routine"
                  className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="overflow-hidden rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9"
                  alt="Healthy glowing skin"
                  className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CORE ADVICE */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-10 text-center">
              Core Skincare Principles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AdviceCard
                icon={Droplets}
                title="Cleanse Gently"
                desc="Wash your face twice daily using a mild cleanser. Over-washing or harsh physical scrubs can severely damage your protective skin barrier."
              />
              <AdviceCard
                icon={Sun}
                title="Never Skip Sunscreen"
                desc="Daily SPF 30+ is non-negotiable. It prevents pigmentation, premature aging, and protects healing acne marks — even when you are indoors."
              />
              <AdviceCard
                icon={Sparkles}
                title="Use Actives Wisely"
                desc="Potent ingredients like Vitamin C, Niacinamide, and Retinol work best when introduced slowly, used consistently, and in the right concentrations."
              />
              <AdviceCard
                icon={ShieldCheck}
                title="Protect the Skin Barrier"
                desc="A compromised barrier leads to breakouts. Moisturizers and ceramides are essential to prevent irritation, redness, and severe dehydration."
              />
            </div>
          </div>
        </section>

        {/* MORNING / NIGHT ROUTINES */}
        <section className="py-20 mt-12 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">The Foundational Routines</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300">Start here before adding complex serums or treatments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              
              {/* Morning Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200/50 dark:border-amber-700/30 p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sun size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400">
                      <Sun size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Morning Routine</h3>
                  </div>
                  <ul className="space-y-4">
                    {['Gentle, non-stripping cleanser (or just water)', 'Vitamin C / Niacinamide serum (optional)', 'Lightweight moisturizer', 'Broad-spectrum Sunscreen (SPF 30+)'].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 font-medium">
                        <Check size={20} className="text-amber-500 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Night Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 border border-indigo-200/50 dark:border-indigo-700/30 p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Moon size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                      <Moon size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Night Routine</h3>
                  </div>
                  <ul className="space-y-4">
                    {['Double cleanse (Oil cleanser followed by water-based)', 'Targeted treatment (Retinol or Salicylic Acid)', 'Barrier-repairing, thicker moisturizer', 'Adequate rest (7–8 hours of sleep)'].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 font-medium">
                        <Check size={20} className="text-indigo-500 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* NATURAL & LIFESTYLE */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-10 text-center">
              Lifestyle & Holistic Care
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AdviceCard
                icon={Leaf}
                title="Eat for Your Skin"
                desc="Your diet reflects on your face. High intake of water, omega-3 fats, and antioxidant-rich greens directly affect skin clarity and natural glow."
              />
              <AdviceCard
                icon={Moon}
                title="Sleep & Stress"
                desc="Poor sleep and chronic stress increase cortisol levels in your body, which triggers excess oil production, severe acne, and dullness."
              />
              <AdviceCard
                icon={AlertTriangle}
                title="Avoid Overdoing"
                desc="More is not better. Layering too many harsh active products or engaging in frequent exfoliation severely worsens acne and skin sensitivity."
              />
            </div>
          </div>
        </section>

        {/* DISCLAIMER */}
        <footer className="max-w-4xl mx-auto px-4 py-8 text-center border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Disclaimer: SkinWise provides general skincare guidance and lifestyle tips. This information is not intended to serve as professional medical advice.
          </p>
        </footer>

      </div>
    </>
  );
}