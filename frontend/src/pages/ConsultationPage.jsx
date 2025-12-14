import React, { useState } from 'react';
import {
  UserCheck,
  Calendar,
  Clock,
  Video,
  ShieldAlert,
  Stethoscope,
} from 'lucide-react';

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

const DoctorCard = ({ doctor, onBook }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
        <Stethoscope className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-800 dark:text-gray-100">
          {doctor.name}
        </h3>
        <p className="text-sm text-slate-600 dark:text-gray-300">
          {doctor.specialization}
        </p>
      </div>
    </div>

    <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-gray-300">
      <div className="flex items-center gap-2">
        <UserCheck size={14} /> Experience: {doctor.experience}
      </div>
      <div className="flex items-center gap-2">
        <Video size={14} /> {doctor.mode}
      </div>
      <div className="flex items-center gap-2">
        <Calendar size={14} /> {doctor.availability}
      </div>
    </div>

    <button
      onClick={() => onBook(doctor)}
      className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md text-sm font-medium"
    >
      Book Consultation
    </button>
  </div>
);

export default function ConsultationPage() {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-gray-100">

      {/* HERO */}
      <section className="py-14 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold">
            Consult a Certified Dermatologist
          </h1>
          <p className="mt-4 text-slate-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get expert guidance for acne, pigmentation, hair fall, and skin concerns.
            SkinWise connects you with licensed professionals for personalised advice.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
            <Clock className="text-indigo-600 mb-3" />
            <h3 className="font-semibold">Choose a Slot</h3>
            <p className="text-sm text-slate-600 dark:text-gray-300">
              Select a doctor and preferred time for consultation.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
            <Video className="text-indigo-600 mb-3" />
            <h3 className="font-semibold">Video Consultation</h3>
            <p className="text-sm text-slate-600 dark:text-gray-300">
              Connect securely via video call from anywhere.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
            <UserCheck className="text-indigo-600 mb-3" />
            <h3 className="font-semibold">Personalized Advice</h3>
            <p className="text-sm text-slate-600 dark:text-gray-300">
              Get treatment guidance and routine recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* DOCTOR LIST */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Available Doctors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-2">
              Book Consultation
            </h3>
            <p className="text-sm text-slate-600 dark:text-gray-300 mb-4">
              You are booking a session with <strong>{selectedDoctor.name}</strong>.
            </p>

            <button
              onClick={() => setSelectedDoctor(null)}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md"
            >
              Confirm Booking
            </button>

            <button
              onClick={() => setSelectedDoctor(null)}
              className="w-full mt-2 text-sm text-slate-600 dark:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* DISCLAIMER */}
      
    </div>
  );
}
