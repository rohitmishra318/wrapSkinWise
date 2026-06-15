import React, { useState } from 'react';
import { useAnalysisHistory } from '../hooks/useAnalysisHistory';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import api from '../utils/api';

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAnalysisHistory(page, 12);

  if (isLoading) return <div className="p-8 text-center">Loading history...</div>;

  const analyses = data?.analyses || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analysis History</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Review your past skin health snapshots.</p>
        </div>
      </div>

      {analyses.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-12 text-center">
          <Activity size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No history yet</h3>
          <p className="text-gray-500 mb-6">Take your first skin analysis to start tracking your journey.</p>
          <Link to="/analyze" className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600">
            Start Analysis
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {analyses.map(analysis => (
              <Link 
                key={analysis._id} 
                to={`/analysis/${analysis._id}`}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden transition-all hover:-translate-y-1"
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-900 overflow-hidden">
                  <img 
                    src={`${api.defaults.baseURL}/analyze/${analysis._id}/image/annotated`} 
                    alt="Analysis Thumbnail" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=Result'; }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      {format(new Date(analysis.createdAt), 'MMM dd, yyyy')}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      analysis.overallScore >= 80 ? 'bg-teal-100 text-teal-700' :
                      analysis.overallScore >= 60 ? 'bg-emerald-100 text-emerald-700' :
                      analysis.overallScore >= 30 ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {analysis.overallScore}/100
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                      IGA {analysis.igaGrade}
                    </span>
                    {analysis.imageMetadata?.srApplied && (
                      <span className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-2 py-1 rounded">
                        AI Enhanced
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-6">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium">Page {page} of {totalPages}</span>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
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
