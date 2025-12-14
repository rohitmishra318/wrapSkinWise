// frontend/src/components/RecommendationsSidebar.jsx
// This component now supports dark mode.

import React, { useState, useEffect, useRef } from 'react';
import PropertyCard from './PropertyCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const RecommendationsSidebar = ({ propertyId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (!propertyId) return;

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/properties/${propertyId}/recommendations`);
        const data = await res.json();
        setRecommendations(data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [propertyId]);
  
  const scroll = (scrollOffset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
        <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">You Might Also Like 🏘️</h2>
            <p className="text-gray-500 dark:text-gray-400">Loading recommendations...</p>
        </div>
    );
  }

  if (recommendations.length === 0) {
    return null; // Don't show the section if there are no recommendations
  }

  return (
    <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">You Might Also Like 🏘️</h2>
            <div className="flex gap-2">
                <button 
                    onClick={() => scroll(-300)} 
                    className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                    onClick={() => scroll(300)} 
                    className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>

        <div 
            ref={scrollContainerRef} 
            className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide"
        >
            {recommendations.map(recoProperty => (
                <div key={recoProperty._id} className="flex-shrink-0 w-80">
                    <PropertyCard property={recoProperty} />
                </div>
            ))}
        </div>
    </div>
  );
};

export default RecommendationsSidebar;
