// frontend/src/pages/ConsultationPage.jsx
import React, { useState } from 'react';
import {
  UserCheck,
  Calendar,
  Clock,
  Video,
  Stethoscope,
  X,
  CalendarDays,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import SEO from '../components/SEO.jsx';

const doctors = [
  {
    id: 1,
    name: 'Dr. Ananya Sharma',
    specialization: 'Dermatologist',
    experience: '8+ years',
    mode: 'Video Consultation',
    availability: 'Mon – Fri',
  },
  {
    id: 2,
    name: 'Dr. Rohan Mehta',
    specialization: 'Skin & Hair Specialist',
    experience: '10+ years',
    mode: 'Video Consultation',
    availability: 'Tue – Sat',
  },
  {
    id: 3,
    name: 'Dr. Neha Kapoor',
    specialization: 'Clinical Dermatology',
    experience: '6+ years',
    mode: 'Video Consultation',
    availability: 'Mon – Thu',
  },
];

// Helper to get initials from doctor name
const getInitials = (name) => {
  return name.replace('Dr. ', '').split(' ').map(n => n[0]).join('');
};

const DoctorCard = ({ doctor, onBook }) => (
  <div className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 p-8 shadow-sm hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
    <div className="flex items-center gap-5 mb-6">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xl shrink-0 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/60 transition-colors">
        {getInitials(doctor.name)}
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {doctor.name}
        </h3>
        <p className="text-sm font-medium text-teal-600 dark:text-teal-400 mt-1">
          {doctor.specialization}
        </p>
      </div>
    </div>

    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 mb-8 flex-grow">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-md bg-slate-50 dark:bg-slate-900 text-slate-400"><UserCheck size={16} /></div>
        <span className="font-medium">Experience:</span> {doctor.experience}
      </div>
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-md bg-slate-50 dark:bg-slate-900 text-slate-400"><Video size={16} /></div>
        <span>{doctor.mode}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-md bg-slate-50 dark:bg-slate-900 text-slate-400"><Calendar size={16} /></div>
        <span>{doctor.availability}</span>
      </div>
    </div>

    <button
      onClick={() => onBook(doctor)}
      className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-teal-600 dark:hover:bg-teal-500 text-white py-3.5 rounded-xl font-bold shadow-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn"
    >
      Book Session
      <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
    </button>
  </div>
);

export default function ConsultationPage() {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  
  // Local state just for UI interactivity in the modal
  const [selectedTime, setSelectedTime] = useState('10:00 AM');

  const handleConfirmBooking = () => {
    setIsBooking(true);
    // Simulate API call delay for better UX
    setTimeout(() => {
      setIsBooking(false);
      setSelectedDoctor(null);
    }, 1500);
  };

  return (
    <>
      <SEO 
        title="Consult a Dermatologist | SkinWise" 
        description="Connect securely with certified dermatologists for personalized skincare advice, treatment guidance, and routine recommendations." 
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-gray-100 font-sans selection:bg-teal-200 selection:text-teal-900 pb-12">

        {/* HERO */}
        <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-20 border-b border-slate-200 dark:border-slate-800">
          {/* Ambient Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-teal-400/10 dark:bg-teal-600/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-semibold mb-6 border border-teal-100 dark:border-teal-800/50">
              <Stethoscope size={14} className="text-teal-600 dark:text-teal-400" />
              <span>Professional Care</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
              Consult a Certified <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-400">Dermatologist</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Get expert guidance for acne, pigmentation, hair fall, and specific skin concerns. 
              SkinWise connects you with licensed professionals for personalized advice.
            </p>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors group">
                <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CalendarDays size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Choose a Slot</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Select a specialist from our roster and pick a date and time that fits your schedule perfectly.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors group">
                <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Video size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. Video Consultation</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Connect securely face-to-face via our encrypted video platform from the comfort of your home.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors group">
                <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <UserCheck size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3. Personalized Advice</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Receive a tailored treatment plan, prescription guidance, and specific routine recommendations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DOCTOR LIST */}
        <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-10">Available Specialists</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {doctors.map((doc) => (
                <DoctorCard
                  key={doc.id}
                  doctor={doc}
                  onBook={setSelectedDoctor}
                />
              ))}
            </div>
          </div>
        </section>

        {/* BOOKING MODAL */}
        {selectedDoctor && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 relative border border-slate-200 dark:border-slate-700">
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Schedule Session
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Book your video consultation with <span className="font-bold text-teal-600 dark:text-teal-400">{selectedDoctor.name}</span>.
                </p>
              </div>

              {/* Mock Date/Time Selection UI */}
              <div className="space-y-6 mb-8">
                <div>
                  <label className="text-sm font-semibold text-slate-900 dark:text-white mb-3 block">Available Times (Today)</label>
                  <div className="flex flex-wrap gap-3">
                    {['10:00 AM', '11:30 AM', '02:00 PM', '04:15 PM'].map(time => (
                      <button 
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                          selectedTime === time 
                            ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-500/20' 
                            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-400'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800/50 flex items-start gap-3">
                  <Video size={20} className="text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-teal-800 dark:text-teal-200">
                    A secure video link will be sent to your registered email address upon confirmation.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleConfirmBooking}
                  disabled={isBooking}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-teal-600/20 hover:shadow-teal-600/40 transition-all duration-300 disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isBooking ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Confirm Booking
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  disabled={isBooking}
                  className="sm:w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 py-3.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )}

        {/* DISCLAIMER */}
        <footer className="max-w-4xl mx-auto px-4 py-8 text-center mt-8">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Disclaimer: Consultations provided through SkinWise are intended for general dermatological guidance. In case of severe allergic reactions or medical emergencies, please visit your nearest hospital immediately.
          </p>
        </footer>
        
      </div>
    </>
  );
}