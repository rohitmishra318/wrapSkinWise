// frontend/src/components/PropertyCard.jsx
// This component now supports dark mode and a more informative layout.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, MapPin, BedDouble, Bath } from 'lucide-react';
import { toast } from 'react-toastify';

const PropertyCard = ({ property, isInitiallyFavorited }) => {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(isInitiallyFavorited);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // This makes the card compatible with both old (imageUrl) and new (imageUrls) data.
  const images = (property.imageUrls && property.imageUrls.length > 0)
    ? property.imageUrls
    : [property.imageUrl];

  useEffect(() => {
    // Only run the slideshow if there is more than one image
    if (images && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000); // Change image every 3 seconds
      return () => clearInterval(interval); // Cleanup timer
    }
  }, [images]);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to save favorites.");
      return;
    }

    const token = localStorage.getItem('token');
    const method = isFavorited ? 'DELETE' : 'POST';
    const url = `http://localhost:5000/api/users/favorites/${property._id}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setIsFavorited(!isFavorited);
        toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites!');
      } else {
        toast.error('Failed to update favorites.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred.');
    }
  };

  return (
    <Link to={`/properties/${property._id}`} className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="relative">
        <img 
          src={images[currentImageIndex]} 
          alt={property.title} 
          className="w-full h-48 object-cover" 
        />
        {user && (
          <button onClick={handleToggleFavorite} className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-gray-900/80 rounded-full hover:bg-white dark:hover:bg-gray-900 transition">
            <Heart size={20} className={isFavorited ? 'text-red-500 fill-current' : 'text-gray-700 dark:text-gray-300'} />
          </button>
        )}
        {images && images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, index) => (
                    <div 
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                ))}
            </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xl font-bold text-gray-800 dark:text-white">${property.price.toLocaleString()}<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/month</span></p>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate mt-1">{property.title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm truncate flex items-center gap-1 mt-1">
          <MapPin size={14} /> {property.location}
        </p>
        <div className="border-t dark:border-gray-700 my-3"></div>
        <div className="flex justify-start items-center text-sm text-gray-600 dark:text-gray-300 gap-4">
            <span className="flex items-center gap-2"><BedDouble size={16}/> {property.bedrooms} Beds</span>
            <span className="flex items-center gap-2"><Bath size={16}/> {property.bathrooms} Baths</span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
