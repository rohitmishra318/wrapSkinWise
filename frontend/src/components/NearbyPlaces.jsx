// frontend/src/components/NearbyPlaces.jsx
// This component now supports dark mode.

import React, { useState, useEffect } from 'react';
import { School, Utensils, Hospital, Train, ShoppingCart } from 'lucide-react';

// TomTom uses categorySet IDs for searching
const placeCategories = [
  { id: 7332, name: 'Restaurants', icon: <Utensils size={20} /> },
  { id: 9376, name: 'Train/Metro', icon: <Train size={20} /> },   // Railway Station
  { id: 8627, name: 'Hospitals', icon: <Hospital size={20} /> },      // Hospital
  { id: 7372, name: 'Schools', icon: <School size={20} /> },        // School
  { id: 9361, name: 'Groceries', icon: <ShoppingCart size={20} /> },// Supermarket/Grocery
];

const NearbyPlaces = ({ locationString }) => {
  const [places, setPlaces] = useState({});
  const [loading, setLoading] = useState(true);
  const API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;

  useEffect(() => {
    if (!locationString || !API_KEY) {
        setLoading(false);
        return;
    };

    const fetchAllPlaces = async () => {
      setLoading(true);
      const fetchedData = {};

      try {
        // Step 1: Geocode the address to get latitude and longitude
        const geoUrl = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(locationString)}.json?key=${API_KEY}`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
          console.error("Geocoding failed for:", locationString);
          setLoading(false);
          return;
        }
        const { lat, lon } = geoData.results[0].position;

        // Step 2: Fetch nearby places for each category using the coordinates
        for (const category of placeCategories) {
          const placesUrl = `https://api.tomtom.com/search/2/nearbySearch/.json?key=${API_KEY}&lat=${lat}&lon=${lon}&radius=2000&categorySet=${category.id}&limit=3`;
          const placesRes = await fetch(placesUrl);
          const placesData = await placesRes.json();
          fetchedData[category.id] = placesData.results || [];
        }

      } catch (error) {
        console.error("Error fetching places from TomTom API:", error);
      }

      setPlaces(fetchedData);
      setLoading(false);
    };

    fetchAllPlaces();
  }, [locationString, API_KEY]);

  if (loading) return <div className="text-gray-500 dark:text-gray-400">Loading nearby facilities...</div>;

  const hasAnyPlaces = Object.values(places).some(p => p.length > 0);

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">What's Nearby?</h2>
      {hasAnyPlaces ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {placeCategories.map(category => (
            places[category.id] && places[category.id].length > 0 && (
              <div key={category.id}>
                <h3 className="flex items-center gap-2 font-bold mb-2 text-lg text-gray-800 dark:text-gray-200">
                  {category.icon} {category.name}
                </h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                  {places[category.id].map(p => <li key={p.id}>{p.poi.name}</li>)}
                </ul>
              </div>
            )
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">Could not find nearby facilities for this location.</p>
      )}
    </div>
  );
};

export default NearbyPlaces;
