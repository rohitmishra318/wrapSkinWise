import { create } from 'zustand';

export const useRoutineStore = create((set) => ({
  morningRoutine: null,
  nightRoutine: null,
  streakData: null,
  
  setRoutines: (morning, night) => set({ morningRoutine: morning, nightRoutine: night }),
  
  setStreakData: (streakData) => set({ streakData }),
  
  markStepComplete: (routineType, stepId) => set((state) => {
    const routineKey = routineType === 'morning' ? 'morningRoutine' : 'nightRoutine';
    const routine = state[routineKey];
    if (!routine) return state;
    
    return {
      [routineKey]: {
        ...routine,
        steps: routine.steps.map(s => s._id === stepId ? { ...s, isCompleted: true } : s)
      }
    };
  })
}));
