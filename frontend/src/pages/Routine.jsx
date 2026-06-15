import React, { useState } from 'react';
import { useRoutine, useGenerateRoutine } from '../hooks/useRoutine';
import RoutineStepCard from '../components/RoutineStepCard';
import DailyCheckinWidget from '../components/DailyCheckinWidget';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

export default function RoutinePage() {
  const [activeTab, setActiveTab] = useState('morning');
  const location = useLocation();
  const analysisId = location.state?.analysisId;
  
  const { data: routines, isLoading } = useRoutine('all');
  const { mutate: generateRoutine, isPending: isGenerating } = useGenerateRoutine();

  const handleGenerate = () => {
    generateRoutine({ routineType: activeTab, analysisId }, {
      onSuccess: () => toast.success(`Generated new ${activeTab} routine!`),
      onError: () => toast.error('Failed to generate routine')
    });
  };

  if (isLoading) return <div className="p-8 text-center">Loading routines...</div>;

  const currentRoutine = routines?.find(r => r.routineType === activeTab);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex space-x-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('morning')}
              className={`flex items-center space-x-2 px-6 py-2 rounded-md font-medium transition-colors ${activeTab === 'morning' ? 'bg-white dark:bg-gray-800 shadow text-amber-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              <Sun size={18} /> <span>Morning</span>
            </button>
            <button
              onClick={() => setActiveTab('night')}
              className={`flex items-center space-x-2 px-6 py-2 rounded-md font-medium transition-colors ${activeTab === 'night' ? 'bg-white dark:bg-gray-800 shadow text-indigo-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              <Moon size={18} /> <span>Night</span>
            </button>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="mt-4 md:mt-0 flex items-center space-x-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors disabled:opacity-50"
          >
            {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>Regenerate Routine</span>
          </button>
        </div>

        {!currentRoutine ? (
          <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have a {activeTab} routine yet.</p>
            <button 
              onClick={handleGenerate}
              className="px-6 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-medium rounded-lg shadow-sm hover:scale-105 transition-transform"
            >
              Generate {activeTab} Routine
            </button>
          </div>
        ) : (
          <div>
            {currentRoutine.contextUsed && (
              <div className="mb-6 p-4 bg-sky-50 dark:bg-sky-900/20 text-sky-800 dark:text-sky-300 rounded-xl text-sm border border-sky-100 dark:border-sky-800 flex items-center space-x-3">
                <span className="text-xl">🌤️</span>
                <p>Routine adapted for today — Humidity {currentRoutine.contextUsed.humidity}%, UV Index {currentRoutine.contextUsed.uvIndex}</p>
              </div>
            )}
            
            {currentRoutine.ingredientConflictsResolved?.length > 0 && (
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 rounded-xl text-sm border border-emerald-100 dark:border-emerald-800">
                <p className="font-semibold mb-1">Smart Formulation</p>
                <ul className="list-disc list-inside">
                  {currentRoutine.ingredientConflictsResolved.map((conflict, i) => (
                    <li key={i}>{conflict}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="space-y-4">
              {currentRoutine.steps.map((step) => (
                <RoutineStepCard 
                  key={step._id || step.title} 
                  step={step} 
                  onComplete={(stepId) => {
                    toast.success("Step marked complete!");
                  }}
                  onReaction={(reaction) => {
                    toast.success("Reaction logged!");
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <DailyCheckinWidget />
      </div>
    </div>
  );
}
