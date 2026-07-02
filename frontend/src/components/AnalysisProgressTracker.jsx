import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { useAnalysisStore } from '../stores/analysisStore';
import { useNavigate } from 'react-router-dom';

const AnalysisProgressTracker = ({ jobId }) => {
  const { jobStatus, jobProgress, updateJobStatus, clearJob } = useAnalysisStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!jobId || !token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token }
    });
    
    socket.on('connect', () => {
      socket.emit('subscribe:job', { jobId });
    });

    socket.on('job:status', (data) => {
      if (data.jobId === jobId) {
        updateJobStatus(data.status, data.progress);
      }
    });

    socket.on('job:complete', (data) => {
      if (data.jobId === jobId) {
        updateJobStatus('complete', 100);
        setTimeout(() => {
          clearJob();
          navigate(`/analysis/${data.analysisId}`);
        }, 1500);
      }
    });

    socket.on('job:failed', (data) => {
      if (data.jobId === jobId) {
        updateJobStatus('failed', 0);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [jobId, navigate, updateJobStatus, clearJob]);

  const stages = [
    { id: 'queued', label: 'Queued' },
    { id: 'sr_processing', label: 'Enhancing image' },
    { id: 'analyzing', label: 'Analyzing conditions' },
    { id: 'complete', label: 'Complete' }
  ];

  const currentIndex = stages.findIndex(s => s.id === jobStatus);

  if (jobStatus === 'failed') {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl">
        <h3 className="font-semibold text-lg mb-2">Analysis Failed</h3>
        <p>There was an error processing your image. Please try again with a clearer photo.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold mb-6 text-center dark:text-white">Analyzing Your Skin</h3>
      
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-200">
              {jobProgress}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
          <motion.div 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${jobProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      
      <ul className="mt-8 space-y-4">
        {stages.map((stage, i) => {
          const isPast = currentIndex > i;
          const isCurrent = currentIndex === i;
          
          return (
            <li key={stage.id} className={`flex items-center ${isPast ? 'text-emerald-500' : isCurrent ? 'text-blue-500 font-semibold' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${isPast ? 'bg-emerald-100 text-emerald-600' : isCurrent ? 'bg-blue-100 text-blue-600 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                {isPast ? '✓' : i + 1}
              </div>
              {stage.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AnalysisProgressTracker;
