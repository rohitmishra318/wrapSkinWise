// frontend/src/pages/AboutPage.jsx
import React from 'react';
import { Microscope, ShieldCheck, LineChart, Users } from 'lucide-react';
import SEO from '../components/SEO.jsx';

const teamMembers = [
  {
    name: 'Rohit Mishra',
    role: 'Founder & Full-Stack Developer',
    imageUrl: 'https://placehold.co/400x400/0d9488/ffffff?text=RM', // Updated to teal hex
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
    <>
      <SEO 
        title="About SkinWise" 
        description="Learn about the mission and approach of SkinWise, a science-first skincare platform." 
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-gray-100 font-sans selection:bg-teal-200 selection:text-teal-900 pb-12">

        {/* HERO */}
        <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24 px-4 text-center">
          {/* Ambient Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-400/10 dark:bg-teal-600/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight text-slate-900 dark:text-white leading-tight">
              Skincare, Explained — <br className="hidden sm:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-400">
                Not Marketed
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              SkinWise is a science-first platform that helps you understand your skin,
              track changes over time, and follow routines that actually make sense.
            </p>
          </div>
        </section>

        {/* MISSION / APPROACH / ETHICS */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              
              {/* Approach Card */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center">
                <div className="bg-teal-50 dark:bg-teal-900/30 p-4 rounded-2xl mb-6 text-teal-600 dark:text-teal-400">
                  <Microscope size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Our Approach</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  We use simple image processing and skin-science principles instead of black-box AI.
                  You see <em>why</em> a result is shown — not just the result.
                </p>
              </div>

              {/* Mission Card */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center">
                <div className="bg-teal-50 dark:bg-teal-900/30 p-4 rounded-2xl mb-6 text-teal-600 dark:text-teal-400">
                  <LineChart size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Our Mission</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  To help users track skin health objectively, avoid misinformation,
                  and build consistent routines that work long-term.
                </p>
              </div>

              {/* Ethics Card */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center">
                <div className="bg-rose-50 dark:bg-rose-900/30 p-4 rounded-2xl mb-6 text-rose-600 dark:text-rose-400">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Our Ethics</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  No exaggerated claims. No medical promises. 
                  SkinWise provides objective guidance and tracking, not a medical diagnosis.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">How SkinWise Works</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: '1',
                  title: 'Upload Photo',
                  desc: 'A clear image is securely processed using OpenCV-based filters.'
                },
                {
                  step: '2',
                  title: 'Detect Issues',
                  desc: 'Acne, blackheads, pigmentation, and fine lines are instantly analyzed.'
                },
                {
                  step: '3',
                  title: 'Skin Quiz',
                  desc: 'Your skin type and sensitivity baseline help contextualize the AI analysis.'
                },
                {
                  step: '4',
                  title: 'Get Routine',
                  desc: 'A tailored morning & night routine is generated for your specific profile.'
                }
              ].map((item) => (
                <div key={item.step} className="relative p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors group">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 border-2 border-teal-500 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center font-bold text-xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TEAM */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 flex flex-col items-center">
              <div className="bg-teal-100 dark:bg-teal-900/40 p-3 rounded-full mb-4 text-teal-600 dark:text-teal-400">
                <Users size={28} />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Meet the Team</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {teamMembers.map(member => (
                <div
                  key={member.name}
                  className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm text-center group hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-teal-400 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-28 h-28 rounded-full mx-auto relative z-10 border-4 border-white dark:border-slate-800 shadow-sm object-cover"
                    />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{member.name}</h4>
                  <p className="text-teal-600 dark:text-teal-400 font-semibold text-sm mt-1 mb-4 uppercase tracking-wider">
                    {member.role}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DISCLAIMER */}
        <section className="max-w-4xl mx-auto px-4 py-8 text-center border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Disclaimer: SkinWise is an educational platform and tracking tool. It does not replace professional dermatological advice, diagnosis, or treatment.
          </p>
        </section>

      </div>
    </>
  );
};

export default AboutPage;