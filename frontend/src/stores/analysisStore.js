import { create } from 'zustand';

export const useAnalysisStore = create((set) => ({
  activeJobId: null,
  jobStatus: null,
  jobProgress: 0,
  
  setActiveJob: (jobId) => set({ activeJobId: jobId, jobStatus: 'queued', jobProgress: 0 }),
  
  updateJobStatus: (status, progress) => set((state) => ({ 
    jobStatus: status, 
    jobProgress: progress || state.jobProgress 
  })),
  
  clearJob: () => set({ activeJobId: null, jobStatus: null, jobProgress: 0 })
}));
