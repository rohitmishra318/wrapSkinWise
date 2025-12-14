import React from 'react';
import { Link } from 'react-router-dom';

const rentalTypes = [
  { name: 'Rental Room', link: '/properties?type=Room' },
  { name: 'Rental Apartment', link: '/properties?type=Apartment' },
  { name: 'Rental Studio', link: '/properties?type=Flat' },
];

const popularCities = ['Gwalior', 'New York', 'Los Angeles', 'Chicago'];

const CategoryBrowser = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 py-16 sm:py-24">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {rentalTypes.map((type) => (
          <div key={type.name}>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{type.name}</h3>
            <ul className="space-y-2">
              {popularCities.map((city) => (
                <li key={city}>
                  <Link 
                    to={`${type.link}&location=${city}`} 
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:underline"
                  >
                    &gt; {type.name.split(' ')[1]} {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBrowser;
