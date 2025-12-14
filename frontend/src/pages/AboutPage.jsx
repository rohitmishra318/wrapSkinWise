import React from 'react';
import { Microscope, ShieldCheck, LineChart, Users } from 'lucide-react';

const teamMembers = [
  {
    name: 'Rohit Mishra',
    role: 'Founder & Full-Stack Developer',
    imageUrl: 'https://placehold.co/400x400/6366f1/ffffff?text=RM',
    bio: 'Built SkinWise to combine computer vision, simple heuristics, and practical skincare advice into a single platform.'
  },
  {
    name: 'Design Contributor',
    role: 'UI / UX',
    imageUrl: 'https://placehold.co/400x400/94a3b8/ffffff?text=UI',
    bio: 'Focused on building a calm, accessible interface that works equally well for all genders.'
  },
  {
    name: 'Research Advisor',
    role: 'Skincare Research',
    imageUrl: 'https://placehold.co/400x400/f59e0b/ffffff?text=SR',
    bio: 'Ensures ingredient guidance and routines are aligned with dermatology-approved principles.'
  }
];

const AboutPage = () => {
  return (
    <div className="bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-gray-100">

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Skincare, Explained — Not Marketed
        </h1>
        <p className="text-lg text-slate-600 dark:text-gray-300 max-w-3xl mx-auto">
          SkinWise is a science-first skincare platform that helps you understand your skin,
          track changes over time, and follow routines that actually make sense.
        </p>
      </section>

      {/* MISSION / APPROACH / ETHICS */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">

          <div className="flex flex-col items-center">
            <div className="bg-indigo-100 dark:bg-indigo-900/40 p-4 rounded-full mb-4">
              <Microscope size={32} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Our Approach</h3>
            <p className="text-slate-600 dark:text-gray-300">
              We use simple image processing and skin-science principles instead of black-box AI.
              You see *why* a result is shown — not just the result.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-green-100 dark:bg-green-900/40 p-4 rounded-full mb-4">
              <LineChart size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Our Mission</h3>
            <p className="text-slate-600 dark:text-gray-300">
              To help users track skin health objectively, avoid misinformation,
              and build routines that work long-term.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-rose-100 dark:bg-rose-900/40 p-4 rounded-full mb-4">
              <ShieldCheck size={32} className="text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Our Ethics</h3>
            <p className="text-slate-600 dark:text-gray-300">
              No exaggerated claims. No medical promises.
              SkinWise provides guidance, not diagnosis.
            </p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-8">How SkinWise Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-2">1. Upload Photo</h4>
              <p className="text-sm text-slate-600 dark:text-gray-300">
                A clear image is analyzed using OpenCV-based filters.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-2">2. Detect Issues</h4>
              <p className="text-sm text-slate-600 dark:text-gray-300">
                Acne, blackheads, pigmentation, and fine lines are detected.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-2">3. Skin Quiz</h4>
              <p className="text-sm text-slate-600 dark:text-gray-300">
                Your skin type and sensitivity help contextualize the analysis.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-2">4. Get Routine</h4>
              <p className="text-sm text-slate-600 dark:text-gray-300">
                A simple morning & night routine is generated for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="py-16 bg-slate-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-12">Meet the Team</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map(member => (
              <div
                key={member.name}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="w-28 h-28 rounded-full mx-auto mb-4"
                />
                <h4 className="text-lg font-bold">{member.name}</h4>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-sm text-slate-600 dark:text-gray-300">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="py-8 text-center text-sm text-slate-500 dark:text-gray-400">
        SkinWise is an educational platform and does not replace professional dermatological advice.
      </section>

    </div>
  );
};

export default AboutPage;
