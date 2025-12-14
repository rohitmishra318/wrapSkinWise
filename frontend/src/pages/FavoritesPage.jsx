import React, { useState, useEffect } from 'react';
import PropertyCard from '../components/PropertyCard';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Heart } from 'lucide-react';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5000/api/users/favorites', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFavorites(data);
        } else {
          toast.error("Failed to load favorites.");
        }
      } catch (error) {
        console.error("Failed to fetch favorites", error);
        toast.error("An error occurred while fetching favorites.");
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Loading your favorites...
      </div>
    );
  }

  return (
    
    <div className="min-h-screen">
      <div className="container mx-auto p-8">
        <div className="flex items-center gap-3 mb-8">
            <Heart size={32} className="text-red-500"/>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">My Favorite Properties</h1>
        </div>
        
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map(property => (
              <PropertyCard key={property._id} property={property} isInitiallyFavorited={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-gray-500 dark:text-gray-400">You haven't saved any favorite properties yet.</p>
            <p className="text-gray-400 dark:text-gray-500 mt-2 text-sm">Click the heart icon on any property to add it to this list.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
