import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAnalysis } from '../../hooks/useAnalysis';
import SkinScoreGauge from '../../components/SkinScoreGauge';
import ConditionCard from '../../components/ConditionCard';
import FaceZoneMap from '../../components/FaceZoneMap';
import { AlertTriangle, ArrowLeft, ChevronRight, Sparkles } from 'lucide-react';
import api from '../../utils/api';
import { Card, CardContent } from '../../components/common/Card';
import { Skeleton } from '../../components/common/LoadingSkeleton';

export default function AnalysisResultPage() {
  const { id } = useParams();
  const { data: analysis, isLoading, error } = useAnalysis(id);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mt-6">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-rose-500 font-medium">
        <AlertTriangle className="mx-auto mb-2" size={32} />
        Failed to load results.
      </div>
    );
  }
  
  if (!analysis) return null;

  const { severity, raw, zonalSeverity, overallScore, delta, imageMetadata, igaGrade } = analysis;

  const getImageUrl = (type) => {
    return `${api.defaults.baseURL}/analyze/${id}/image/${type}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link to="/history" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
          <ArrowLeft size={16} className="mr-1.5" /> Back to History
        </Link>
      </div>

      <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-5 text-center md:text-left">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Skin Health Results</h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl">
                Based on our advanced dermatological analysis, here is the breakdown of your current skin condition.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <span className="px-3.5 py-1.5 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 rounded-full text-sm font-semibold shadow-sm">
                IGA Grade: {igaGrade}
              </span>
              {imageMetadata?.srApplied && (
                <span className="px-3.5 py-1.5 bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 rounded-full text-sm font-semibold flex items-center shadow-sm">
                  <Sparkles size={14} className="mr-1.5" /> AI Enhanced
                </span>
              )}
              {imageMetadata?.qualityFlags?.length > 0 && (
                <span className="px-3.5 py-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-full text-sm font-semibold flex items-center shadow-sm">
                  <AlertTriangle size={14} className="mr-1.5" /> {imageMetadata.qualityFlags[0]}
                </span>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 bg-white dark:bg-slate-950 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <SkinScoreGauge score={overallScore} delta={delta?.overall} />
            <div className="text-center mt-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">Overall Score</div>
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-xl font-bold mb-5 text-slate-900 dark:text-white tracking-tight">Condition Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <ConditionCard condition="acne" severity={severity.acne} delta={delta?.acne} />
          <ConditionCard condition="blackheads" severity={severity.blackheads} delta={delta?.blackheads} />
          <ConditionCard condition="wrinkles" severity={severity.wrinkles} delta={delta?.wrinkles} />
          <ConditionCard condition="pigmentation" severity={severity.pigmentation} delta={delta?.pigmentation} />
          <ConditionCard condition="hydration" severity={severity.hydration} delta={delta?.hydration} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight text-center">Facial Zonal Analysis</h2>
            <FaceZoneMap zones={zonalSeverity} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col h-full">
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">Visual Detection</h2>
            <div className="flex-1 flex gap-4">
              <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden aspect-[3/4] border border-slate-200 dark:border-slate-800 relative group">
                <img src={getImageUrl('original')} alt="Original" className="w-full h-full object-cover" 
                     onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Original'; }} />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md font-medium">Original</div>
              </div>
              <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden aspect-[3/4] border border-slate-200 dark:border-slate-800 relative group">
                <img src={getImageUrl('annotated')} alt="Annotated" className="w-full h-full object-cover" 
                     onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Annotated'; }} />
                <div className="absolute top-3 left-3 bg-violet-600/80 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md font-medium">Annotated</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none transform translate-x-1/4">
          <Sparkles size={256} />
        </div>
        <div className="mb-6 md:mb-0 max-w-xl relative z-10 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">Get Your Action Plan</h2>
          <p className="text-emerald-50 text-lg">
            Generate a hyper-personalized skincare routine tailored specifically to these analysis results, your local weather, and lifestyle.
          </p>
        </div>
        <Link 
          to="/routine" 
          state={{ analysisId: id }}
          className="relative z-10 px-8 py-4 bg-white text-emerald-600 font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center w-full md:w-auto justify-center whitespace-nowrap"
        >
          Generate Routine <ChevronRight size={20} className="ml-2" />
        </Link>
      </section>
    </div>
  );
}
