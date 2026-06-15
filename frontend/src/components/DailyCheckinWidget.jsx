import React, { useState } from 'react';
import { useSubmitCheckin } from '../hooks/useCheckin';
import { toast } from 'react-toastify';

const DailyCheckinWidget = () => {
  const { mutate: submitCheckin, isPending } = useSubmitCheckin();
  const [completed, setCompleted] = useState(false);
  
  const [form, setForm] = useState({
    sleepQuality: 3,
    stressLevel: 3,
    waterIntake: 'standard',
    skinFeel: 'normal'
  });

  const handleSubmit = () => {
    submitCheckin({ ...form, date: new Date().toISOString() }, {
      onSuccess: () => {
        setCompleted(true);
        toast.success("Check-in saved! Routine will adapt.");
      }
    });
  };

  if (completed) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 text-center">
        <span className="text-2xl mb-2 block">✨</span>
        <h4 className="font-semibold text-emerald-800 dark:text-emerald-400">Check-in Complete</h4>
        <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">Your routine has been updated for today.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Daily Context Check-in</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">How did you sleep?</label>
          <div className="flex space-x-2">
            {[1,2,3,4,5].map(v => (
              <button 
                key={`sleep-${v}`}
                onClick={() => setForm({...form, sleepQuality: v})}
                className={`flex-1 py-2 text-center rounded-md border ${form.sleepQuality === v ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
              >
                {v}★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Stress Level (1=Low, 5=High)</label>
          <div className="flex space-x-2">
            {[1,2,3,4,5].map(v => (
              <button 
                key={`stress-${v}`}
                onClick={() => setForm({...form, stressLevel: v})}
                className={`flex-1 py-2 text-center rounded-md border ${form.stressLevel === v ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Water Intake</label>
          <div className="flex space-x-2">
            {['low', 'standard', 'high'].map(v => (
              <button 
                key={`water-${v}`}
                onClick={() => setForm({...form, waterIntake: v})}
                className={`flex-1 py-2 text-sm text-center rounded-md border capitalize ${form.waterIntake === v ? 'bg-cyan-50 border-cyan-300 text-cyan-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Skin Feel Today</label>
          <select 
            className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-md bg-transparent dark:text-white"
            value={form.skinFeel}
            onChange={(e) => setForm({...form, skinFeel: e.target.value})}
          >
            <option value="great">Feeling Great</option>
            <option value="normal">Normal</option>
            <option value="oily">Extra Oily</option>
            <option value="dry">Extra Dry/Tight</option>
            <option value="sensitive">Sensitive/Irritated</option>
            <option value="breaking_out">Breaking Out</option>
          </select>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2"
        >
          {isPending ? 'Saving...' : 'Update Context'}
        </button>
      </div>
    </div>
  );
};

export default DailyCheckinWidget;
