import React, { useState } from 'react';

const FaceZoneMap = ({ zones }) => {
  const [activeZone, setActiveZone] = useState(null);

  const getZoneColor = (severityObj) => {
    if (!severityObj) return 'rgba(16, 185, 129, 0.2)'; 
    const maxSeverity = Math.max(...Object.values(severityObj));
    if (maxSeverity <= 25) return 'rgba(16, 185, 129, 0.4)'; 
    if (maxSeverity <= 65) return 'rgba(245, 158, 11, 0.6)'; 
    return 'rgba(244, 63, 94, 0.7)'; 
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-center justify-center p-4">
      <div className="relative w-64 h-80 bg-gray-50 dark:bg-gray-800 rounded-3xl p-4 shadow-inner">
        <svg viewBox="0 0 200 250" className="w-full h-full">
          <ellipse cx="100" cy="125" rx="80" ry="110" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600" />
          
          <path 
            d="M 60 50 L 140 50 L 120 100 L 110 160 L 90 160 L 80 100 Z" 
            fill={getZoneColor(zones?.tZone)}
            stroke="white"
            strokeWidth="1"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setActiveZone('tZone')}
          />
          
          <path 
            d="M 20 110 Q 50 100 80 120 Q 75 160 50 180 Q 20 160 20 110 Z" 
            fill={getZoneColor(zones?.leftCheek)}
            stroke="white"
            strokeWidth="1"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setActiveZone('leftCheek')}
          />
          
          <path 
            d="M 180 110 Q 150 100 120 120 Q 125 160 150 180 Q 180 160 180 110 Z" 
            fill={getZoneColor(zones?.rightCheek)}
            stroke="white"
            strokeWidth="1"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setActiveZone('rightCheek')}
          />
          
          <path 
            d="M 40 50 Q 100 10 160 50 Q 140 90 100 90 Q 60 90 40 50 Z" 
            fill={getZoneColor(zones?.forehead)}
            stroke="white"
            strokeWidth="1"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setActiveZone('forehead')}
          />
          
          <path 
            d="M 70 180 Q 100 160 130 180 Q 120 220 100 220 Q 80 220 70 180 Z" 
            fill={getZoneColor(zones?.perioral)}
            stroke="white"
            strokeWidth="1"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setActiveZone('perioral')}
          />
        </svg>
      </div>

      <div className="w-full md:w-64 min-h-[16rem] bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        {activeZone ? (
          <div>
            <h4 className="font-bold text-lg mb-4 capitalize text-gray-900 dark:text-white">
              {activeZone.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            {zones?.[activeZone] ? (
              <ul className="space-y-3">
                {Object.entries(zones[activeZone]).map(([condition, score]) => (
                  <li key={condition} className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300 capitalize">{condition}</span>
                    <span className={`font-semibold ${score > 65 ? 'text-rose-500' : score > 25 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {score}/100
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No data for this zone.</p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-gray-400">
            Click on a facial zone to see detailed severity metrics.
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceZoneMap;
