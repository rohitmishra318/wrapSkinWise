import React, { useState } from 'react';
import { useAnalysisHistory } from '../../hooks/useAnalysisHistory';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Activity, Sparkles } from 'lucide-react';
import api from '../../utils/api';
import { Skeleton } from '../../components/common/LoadingSkeleton';
import { Button } from '../../components/common/Button';

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAnalysisHistory(page, 12);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <Skeleton className="h-16 w-1/3 rounded-xl mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const analyses = data?.analyses || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Analysis History</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Review your past skin health snapshots.</p>
      </div>

      {analyses.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center">
          <div className="w-20 h-20 bg-slate-200/50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Activity size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No history yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">Take your first skin analysis to start tracking your journey.</p>
          <Link to="/analyze">
            <Button>Start Analysis</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {analyses.map(analysis => (
              <Link 
                key={analysis._id} 
                to={`/analysis/${analysis._id}`}
                className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="aspect-square bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
                  <img 
                    src={`${api.defaults.baseURL}/analyze/${analysis._id}/image/annotated`} 
                    alt="Analysis Thumbnail" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=Result'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <span className="text-white text-sm font-medium flex items-center">
                      View Details <ChevronRight size={16} className="ml-1" />
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {format(new Date(analysis.createdAt), 'MMM dd, yyyy')}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        analysis.overallScore >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        analysis.overallScore >= 60 ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' :
                        analysis.overallScore >= 30 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                      }`}>
                        {analysis.overallScore}/100
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md">
                      IGA {analysis.igaGrade}
                    </span>
                    {analysis.imageMetadata?.srApplied && (
                      <span className="text-xs font-medium bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400 px-2 py-1 rounded-md flex items-center">
                        <Sparkles size={10} className="mr-1" /> AI Enhanced
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-8">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Page {page} of {totalPages}</span>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
