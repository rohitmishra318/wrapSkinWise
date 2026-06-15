import React, { useState } from 'react';
import { useRoutine, useGenerateRoutine } from '../../hooks/useRoutine';
import RoutineStepCard from '../../components/RoutineStepCard';
import DailyCheckinWidget from '../../components/DailyCheckinWidget';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Sparkles, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { Card, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/LoadingSkeleton';

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

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <Skeleton className="h-20 w-full rounded-2xl mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const currentRoutine = routines?.find(r => r.routineType === activeTab);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('morning')}
            className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'morning' 
                ? 'bg-white dark:bg-slate-800 shadow-sm text-amber-500' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sun size={18} /> <span>Morning</span>
          </button>
          <button
            onClick={() => setActiveTab('night')}
            className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'night' 
                ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-500' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Moon size={18} /> <span>Night</span>
          </button>
        </div>
        
        <Button 
          onClick={handleGenerate}
          isLoading={isGenerating}
          variant="outline"
          className="mt-4 md:mt-0 w-full md:w-auto flex items-center space-x-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
          leftIcon={<Sparkles size={16} />}
        >
          Regenerate Routine
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {!currentRoutine ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-16 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-700">
                  <Sparkles className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No {activeTab} routine found</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
                  Generate your first routine to start tracking your daily skincare habits.
                </p>
                <Button onClick={handleGenerate} isLoading={isGenerating}>
                  Generate {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Routine
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Context Alerts */}
              {(currentRoutine.contextUsed || currentRoutine.ingredientConflictsResolved?.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentRoutine.contextUsed && (
                    <div className="p-4 bg-sky-50 dark:bg-sky-900/20 text-sky-800 dark:text-sky-300 rounded-2xl border border-sky-100 dark:border-sky-800 flex items-start gap-3">
                      <div className="bg-sky-100 dark:bg-sky-900/50 p-2 rounded-lg">
                        <Info size={20} className="text-sky-600 dark:text-sky-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-1">Environment Context</p>
                        <p className="text-sm opacity-90 leading-relaxed">
                          Adapted for today's weather (Humidity {currentRoutine.contextUsed.humidity}%, UV {currentRoutine.contextUsed.uvIndex}).
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {currentRoutine.ingredientConflictsResolved?.length > 0 && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-start gap-3">
                      <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-lg">
                        <Sparkles size={20} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-1">Smart Formulation</p>
                        <ul className="text-sm opacity-90 space-y-1">
                          {currentRoutine.ingredientConflictsResolved.map((conflict, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="opacity-50 mt-1">•</span> {conflict}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
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
    </div>
  );
}
