import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useAnalysisStore } from '../stores/analysisStore';
import api from '../utils/api';
import AnalysisProgressTracker from '../components/AnalysisProgressTracker';
import { UploadCloud, Camera, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

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
      <div className="max-w-4xl mx-auto p-6 mt-10">
        <AnalysisProgressTracker jobId={activeJobId} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Analyze Your Skin</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Upload a clear, frontal photo of your face to get a comprehensive dermatological analysis and personalized routine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {!preview ? (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500 bg-gray-50 dark:bg-gray-800/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center">
                <UploadCloud className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {isDragActive ? 'Drop image here' : 'Drag & drop a photo here'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  or click to select a file
                </p>
                <div className="mt-4 flex gap-2 text-xs text-gray-400">
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">JPEG</span>
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">PNG</span>
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">WEBP</span>
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Max 15MB</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] max-w-md mx-auto shadow-lg">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center">
                <button 
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="text-white text-sm hover:underline"
                >
                  Change Photo
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
                >
                  {isUploading ? 'Uploading...' : 'Start Analysis'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2 mb-3">
              <Camera size={18} /> Photo Guidelines
            </h3>
            <ul className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                Face directly to the camera (no extreme angles)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                Good, even lighting (natural daylight is best)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                Remove glasses and pull hair back
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                No heavy makeup (for accurate skin assessment)
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-xl border border-amber-100 dark:border-amber-800 text-sm">
            <h3 className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-2 mb-2">
              <AlertCircle size={16} /> Privacy Note
            </h3>
            <p className="text-amber-800 dark:text-amber-200">
              Your photos are securely processed and never shared with third parties. We use state-of-the-art AI to assess your skin health locally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
