import React, { useState } from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '../../components/common/Button';

// Mock product data
const MOCK_PRODUCTS = [
  {
    id: 'p1',
    name: 'Hydrating Facial Cleanser',
    brand: 'CeraVe',
    price: 14.99,
    rating: 4.8,
    reviews: 1245,
    category: 'Cleanser',
    image: 'https://via.placeholder.com/300x400?text=CeraVe+Cleanser',
    description: 'A gentle, non-foaming cleanser that removes dirt and makeup without disrupting the natural skin barrier.'
  },
  {
    id: 'p2',
    name: 'Daily Facial Cleanser',
    brand: 'Cetaphil',
    price: 13.49,
    rating: 4.6,
    reviews: 890,
    category: 'Cleanser',
    image: 'https://via.placeholder.com/300x400?text=Cetaphil+Cleanser',
    description: 'Deep cleans skin without stripping it of its natural moisture, formulated for normal to oily skin.'
  },
  {
    id: 'p3',
    name: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    price: 6.50,
    rating: 4.5,
    reviews: 3400,
    category: 'Serum',
    image: 'https://via.placeholder.com/300x400?text=The+Ordinary+Niacinamide',
    description: 'A high-strength vitamin and blemish formula that reduces the appearance of skin blemishes and congestion.'
  },
  {
    id: 'p4',
    name: 'Hyaluronic Acid 2% + B5',
    brand: 'The Ordinary',
    price: 8.90,
    rating: 4.7,
    reviews: 2150,
    category: 'Serum',
    image: 'https://via.placeholder.com/300x400?text=The+Ordinary+HA',
    description: 'A hydration support formula with ultra-pure, vegan hyaluronic acid.'
  },
  {
    id: 'p5',
    name: 'Toleriane Double Repair Face Moisturizer',
    brand: 'La Roche-Posay',
    price: 22.99,
    rating: 4.7,
    reviews: 1560,
    category: 'Moisturizer',
    image: 'https://via.placeholder.com/300x400?text=LRP+Moisturizer',
    description: 'Provides 48-hour hydration and helps restore the skin barrier.'
  },
  {
    id: 'p6',
    name: 'AM Facial Moisturizing Lotion SPF 30',
    brand: 'CeraVe',
    price: 19.99,
    rating: 4.4,
    reviews: 2010,
    category: 'Sunscreen',
    image: 'https://via.placeholder.com/300x400?text=CeraVe+AM+Lotion',
    description: 'Morning skincare multitasker offering both moisture and broad-spectrum sun protection.'
  }
];

const BRANDS = ['All Brands', 'CeraVe', 'Cetaphil', 'The Ordinary', 'La Roche-Posay'];

export default function ShopPage() {
  const [selectedBrand, setSelectedBrand] = useState('All Brands');

  // Filter products based on selected brand
  const filteredProducts = selectedBrand === 'All Brands' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(product => product.brand === selectedBrand);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Shop Top Skincare Brands</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Discover dermatologist-recommended products tailored for your unique skin needs.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 sticky top-24">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Filter by Brand</h2>
              <div className="space-y-2">
                {BRANDS.map(brand => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                      selectedBrand === brand
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                {selectedBrand === 'All Brands' ? 'All Products' : `${selectedBrand} Products`} 
                <span className="text-sm font-normal text-slate-500 ml-2">({filteredProducts.length} items)</span>
              </h2>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 flex flex-col group">
                    <div className="aspect-[3/4] relative overflow-hidden bg-slate-100 dark:bg-slate-700">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded-md text-slate-800 dark:text-slate-200">
                        {product.category}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="text-sm font-medium text-violet-600 dark:text-violet-400 mb-1">{product.brand}</div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-2">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-4">
                        <Star className="fill-amber-400 text-amber-400" size={16} />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{product.rating}</span>
                        <span className="text-xs text-slate-500">({product.reviews})</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-6 flex-grow">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xl font-bold text-slate-900 dark:text-white">${product.price.toFixed(2)}</span>
                        <Button size="sm" className="gap-2">
                          <ShoppingCart size={16} />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">No products found for this brand.</p>
                <button 
                  onClick={() => setSelectedBrand('All Brands')}
                  className="mt-4 text-violet-600 hover:text-violet-700 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
