import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAnalysis } from '../hooks/useAnalysis';
import SkinScoreGauge from '../components/SkinScoreGauge';
import ConditionCard from '../components/ConditionCard';
import FaceZoneMap from '../components/FaceZoneMap';
import { AlertTriangle, ArrowLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';

export default function AnalysisResultPage() {
  const { id } = useParams();
  const { data: analysis, isLoading, error } = useAnalysis(id);

  if (isLoading) return <div className="p-8 text-center">Loading analysis results...</div>;
  if (error) return <div className="p-8 text-center text-rose-500">Failed to load results.</div>;
  if (!analysis) return null;

  const { severity, raw, zonalSeverity, overallScore, delta, imageMetadata, igaGrade } = analysis;

  const getImageUrl = (type) => {
    return `${api.defaults.baseURL}/analyze/${id}/image/${type}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      <Link to="/history" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <ArrowLeft size={16} className="mr-1" /> Back to History
      </Link>

      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-4 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Skin Health Results</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-lg">
            Based on our advanced dermatological analysis, here is the breakdown of your current skin condition.
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
              IGA Grade: {igaGrade}
            </span>
            {imageMetadata?.srApplied && (
              <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium flex items-center">
                ✨ Enhanced with AI
              </span>
            )}
            {imageMetadata?.qualityFlags?.length > 0 && (
              <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium flex items-center">
                <AlertTriangle size={14} className="mr-1" /> {imageMetadata.qualityFlags[0]}
              </span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl">
          <SkinScoreGauge score={overallScore} delta={delta?.overall} />
          <div className="text-center mt-2 text-sm font-medium text-gray-500">Overall Score</div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Condition Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <ConditionCard condition="acne" severity={severity.acne} delta={delta?.acne} />
          <ConditionCard condition="blackheads" severity={severity.blackheads} delta={delta?.blackheads} />
          <ConditionCard condition="wrinkles" severity={severity.wrinkles} delta={delta?.wrinkles} />
          <ConditionCard condition="pigmentation" severity={severity.pigmentation} delta={delta?.pigmentation} />
          <ConditionCard condition="hydration" severity={severity.hydration} delta={delta?.hydration} />
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white text-center">Facial Zonal Analysis</h2>
        <FaceZoneMap zones={zonalSeverity} />
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Visual Detection</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden aspect-[3/4]">
            <img src={getImageUrl('original')} alt="Original" className="w-full h-full object-cover" 
                 onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Original'; }} />
          </div>
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden aspect-[3/4]">
            <img src={getImageUrl('annotated')} alt="Annotated" className="w-full h-full object-cover" 
                 onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Annotated'; }} />
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
        <div className="mb-6 md:mb-0 max-w-xl">
          <h2 className="text-2xl font-bold mb-2">Get Your Action Plan</h2>
          <p className="text-emerald-50">
            Generate a hyper-personalized skincare routine tailored specifically to these analysis results, your environment, and lifestyle.
          </p>
        </div>
        <Link 
          to="/routine" 
          state={{ analysisId: id }}
          className="px-8 py-3 bg-white text-emerald-600 font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center"
        >
          Generate Routine <ChevronRight size={20} className="ml-1" />
        </Link>
      </section>
    </div>
  );
}
