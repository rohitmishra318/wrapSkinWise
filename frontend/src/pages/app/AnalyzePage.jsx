import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAnalysisStore } from '../../stores/analysisStore';
import api from '../../utils/api';
import AnalysisProgressTracker from '../../components/AnalysisProgressTracker';
import { UploadCloud, Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export default function AnalyzePage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const { activeJobId, setActiveJob } = useAnalysisStore();
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      const selected = acceptedFiles[0];
      if (selected.size > 15 * 1024 * 1024) {
        toast.error('Image size must be under 15MB');
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 1,
    multiple: false
  });

  const handleSubmit = async () => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await api.post('/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setActiveJob(data.data.jobId);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Upload failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  if (activeJobId) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <AnalysisProgressTracker jobId={activeJobId} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">Analyze Your Skin</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Upload a clear, frontal photo to receive a clinical-grade dermatological analysis and a personalized skincare routine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {!preview ? (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 ${
                isDragActive 
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-inner' 
                  : 'border-slate-300 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500 bg-white dark:bg-slate-800/50 shadow-sm'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
                  <UploadCloud className="w-10 h-10 text-violet-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {isDragActive ? 'Drop image here to scan' : 'Drag & drop a photo here'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  or click to browse your files
                </p>
                <div className="flex gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">JPEG</span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">PNG</span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">WEBP</span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">Max 15MB</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-[3/4] max-w-md mx-auto shadow-2xl border border-slate-200 dark:border-slate-800 group">
              <img src={preview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="text-white hover:bg-white/20 hover:text-white w-full sm:w-auto border border-white/30 backdrop-blur-sm"
                  >
                    Change Photo
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    isLoading={isUploading}
                    className="w-full sm:w-auto shadow-xl"
                  >
                    Start AI Scan
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-violet-50/50 dark:bg-violet-900/10 border-violet-100 dark:border-violet-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-violet-900 dark:text-violet-300">
                <Camera size={20} className="text-violet-500" /> 
                Photo Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-violet-800/80 dark:text-violet-200/80">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                  Face directly to the camera (no extreme angles)
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                  Good, even lighting (natural daylight is best)
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                  Remove glasses and pull hair back
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                  No heavy makeup (for accurate skin assessment)
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-300 text-sm">
                <AlertCircle size={16} className="text-amber-500" /> 
                Privacy Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-amber-800/80 dark:text-amber-200/80">
                Your photos are securely processed and never shared with third parties. We use state-of-the-art AI to assess your skin health locally and temporarily cache images strictly for your historical tracking.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
