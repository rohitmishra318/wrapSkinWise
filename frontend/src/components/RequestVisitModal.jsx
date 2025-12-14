// frontend/src/components/RequestVisitModal.jsx
import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';

const RequestVisitModal = ({ onClose, onSubmit }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ date, time });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Schedule a Visit</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">Preferred Date</label>
            <div className="relative">
              <Calendar size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input
                type="date" id="date" value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full pl-10 p-3 border dark:border-gray-600 rounded-md"
              />
            </div>
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium mb-1">Preferred Time</label>
            <div className="relative">
              <Clock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input
                type="time" id="time" value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full pl-10 p-3 border dark:border-gray-600 rounded-md"
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestVisitModal;