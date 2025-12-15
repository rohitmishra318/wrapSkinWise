// frontend/src/pages/Analyze.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/**
 * Analyze Page
 * - Collects user answers + optional image upload
 * - Sends to backend endpoint: POST /api/analyze (multipart/form-data)
 * - Expects backend response JSON like:
 *   { acne: {...}, blackheads: {...}, wrinkles: {...}, pigmentation: {...}, recommendations: "..." }
 *
 * Make sure VITE_API_BASE_URL is set in your env or proxy /api requests in dev.
 */

const initialConcerns = {
  acne: false,
  blackheads: false,
  wrinkles: false,
  pigmentation: false,
  dryness: false,
  oiliness: false,
  sensitivity: false,
};

export default function Analyze() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('prefer-not');
  const [skinType, setSkinType] = useState('normal');
  const [concerns, setConcerns] = useState(initialConcerns);
  const [sleepHours, setSleepHours] = useState(7);
  const [waterLiters, setWaterLiters] = useState(2);
  const [smokes, setSmokes] = useState(false);
  const [productsUsed, setProductsUsed] = useState(''); // comma separated
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // handle checkbox group
  const toggleConcern = (key) => {
    setConcerns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  function handleImageChange(e) {
    setError(null);
    const f = e.target.files && e.target.files[0];
    if (!f) {
      setImageFile(null);
      setPreviewUrl(null);
      return;
    }
    // Basic client-side validation
    if (!/^image\//.test(f.type)) {
      setError('Please upload a valid image file.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('Image too large. Max 5MB allowed.');
      return;
    }
    setImageFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);

    // basic validation
    if (!age || isNaN(Number(age)) || Number(age) <= 0) {
      setError('Please enter a valid age.');
      return;
    }
    if (!fullName.trim()) {
      setError('Please enter your name (or nickname).');
      return;
    }

    setSubmitting(true);

    try {
      // Build multipart payload: JSON metadata + optional image file
      const formData = new FormData();
      const metadata = {
        name: fullName.trim(),
        age: Number(age),
        gender,
        skinType,
        concerns: Object.keys(concerns).filter(k => concerns[k]),
        lifestyle: {
          sleepHours: Number(sleepHours),
          waterLiters: Number(waterLiters),
          smokes: Boolean(smokes),
        },
        productsUsed: productsUsed.split(',').map(s => s.trim()).filter(Boolean),
        timestamp: new Date().toISOString(),
      };

     // formData.append('metadata', JSON.stringify(metadata));
      if (imageFile) formData.append('image', imageFile);
      console.log('Submitting metadata:', metadata);

      // Replace base URL depending on your environment:
      // - In dev you might proxy /api to your backend; then use '/api/analyze'
      // - In production use VITE_API_BASE_URL env var
      const base = import.meta.env.VITE_API_BASE_URL || '';
      const endpoint = `${base}/api/analyze`;

      const token = localStorage.getItem('token');

const res = await axios.post(endpoint, formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  },
  timeout: 120000,
});


      setResult(res.data);
      // Optionally navigate to a result page:
      // navigate(`/result/${res.data.id}`);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to analyze. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">SkinWise — Skin Analysis</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Answer a few quick questions and optionally upload a frontal photo (no heavy makeup). This helps our analyser give you personalized suggestions and a short report.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col">
            <span className="text-sm text-gray-700 dark:text-gray-200">Name</span>
            <input value={fullName} onChange={(e)=>setFullName(e.target.value)} placeholder="Rahul / Riya" className="mt-1 p-2 rounded border dark:bg-gray-900" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700 dark:text-gray-200">Age</span>
            <input value={age} onChange={(e)=>setAge(e.target.value)} type="number" min="1" className="mt-1 p-2 rounded border dark:bg-gray-900" />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex flex-col">
            <span className="text-sm text-gray-700 dark:text-gray-200">Gender</span>
            <select value={gender} onChange={(e)=>setGender(e.target.value)} className="mt-1 p-2 rounded border dark:bg-gray-900">
              <option value="prefer-not">Prefer not</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700 dark:text-gray-200">Skin Type</span>
            <select value={skinType} onChange={(e)=>setSkinType(e.target.value)} className="mt-1 p-2 rounded border dark:bg-gray-900">
              <option value="normal">Normal</option>
              <option value="dry">Dry</option>
              <option value="oily">Oily</option>
              <option value="combination">Combination</option>
              <option value="sensitive">Sensitive</option>
            </select>
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700 dark:text-gray-200">Products you use (comma separated)</span>
            <input value={productsUsed} onChange={(e)=>setProductsUsed(e.target.value)} placeholder="Niacinamide, Sunscreen" className="mt-1 p-2 rounded border dark:bg-gray-900" />
          </label>
        </div>

        <fieldset className="border rounded p-3">
          <legend className="px-2 text-sm font-medium text-gray-700 dark:text-gray-200">Skin concerns (select all that apply)</legend>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.keys(initialConcerns).map((k) => (
              <label key={k} className="inline-flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                <input
                  type="checkbox"
                  checked={!!concerns[k]}
                  onChange={() => toggleConcern(k)}
                />
                <span className="text-sm text-gray-700 dark:text-gray-200 capitalize">{k.replace('_',' ')}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex flex-col">
            <span className="text-sm text-gray-700 dark:text-gray-200">Sleep (hrs)</span>
            <input type="number" min="0" max="24" value={sleepHours} onChange={(e)=>setSleepHours(e.target.value)} className="mt-1 p-2 rounded border dark:bg-gray-900" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700 dark:text-gray-200">Water (L/day)</span>
            <input type="number" min="0" step="0.1" value={waterLiters} onChange={(e)=>setWaterLiters(e.target.value)} className="mt-1 p-2 rounded border dark:bg-gray-900" />
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={smokes} onChange={()=>setSmokes(s=>!s)} />
            <span className="text-sm text-gray-700 dark:text-gray-200">Smoker</span>
          </label>
        </div>

        <div>
          <label className="flex flex-col">
            <span className="text-sm text-gray-700 dark:text-gray-200">Upload a frontal photo (optional)</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
            <small className="text-xs text-gray-500">Clear frontal photo, neutral lighting, no heavy make-up. Max 5MB.</small>

            {previewUrl && (
              <div className="mt-3">
                <div className="text-xs text-gray-600 mb-1">Preview</div>
                <img src={previewUrl} alt="preview" className="w-48 h-48 object-cover rounded shadow-sm" />
              </div>
            )}
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={()=>navigate('/')} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Cancel</button>
          <button type="submit" disabled={submitting} className={`px-4 py-2 rounded font-medium text-white ${submitting ? 'bg-rose-300' : 'bg-rose-500 hover:bg-rose-600'}`}>
            {submitting ? 'Analyzing...' : 'Analyze My Skin'}
          </button>
        </div>
      </form>

      {/* Result area */}
      {result && (
        <div className="mt-6 bg-white dark:bg-gray-800 p-5 rounded shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Analysis Results</h2>

          {/* show uploaded image if present */}
          {result.imageUrl && (
            <div className="mb-3">
              <img src={result.imageUrl} alt="uploaded" className="w-48 h-48 object-cover rounded" />
            </div>
          )}

          {/* show detector outputs (safe rendering if keys missing) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 border rounded">
              <div className="text-sm text-gray-600">Acne</div>
              <div className="font-medium text-gray-800">{result.acne?.label ?? 'N/A'}</div>
              {result.acne?.count != null && <div className="text-xs text-gray-500">Count: {result.acne.count}</div>}
            </div>

            <div className="p-3 border rounded">
              <div className="text-sm text-gray-600">Blackheads</div>
              <div className="font-medium text-gray-800">{result.blackheads?.present ? 'Present' : (result.blackheads?.present === false ? 'None' : 'N/A')}</div>
              {result.blackheads?.count != null && <div className="text-xs text-gray-500">Count: {result.blackheads.count}</div>}
            </div>

            <div className="p-3 border rounded">
              <div className="text-sm text-gray-600">Wrinkles</div>
              <div className="font-medium text-gray-800">{result.wrinkles?.label ?? 'N/A'}</div>
              {result.wrinkles?.edge_density != null && <div className="text-xs text-gray-500">Edge density: {result.wrinkles.edge_density}</div>}
            </div>

            <div className="p-3 border rounded">
              <div className="text-sm text-gray-600">Pigmentation</div>
              <div className="font-medium text-gray-800">{result.pigmentation?.label ?? 'N/A'}</div>
              {result.pigmentation?.count != null && <div className="text-xs text-gray-500">Patches: {result.pigmentation.count}</div>}
            </div>
          </div>

          {/* Optional recommendations */}
          {result.recommendations && (
            <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-900/20 rounded">
              <h3 className="font-medium text-gray-800 dark:text-gray-100">Recommendations</h3>
              <p className="text-sm text-gray-700 dark:text-gray-200 mt-2 whitespace-pre-wrap">{result.recommendations}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
