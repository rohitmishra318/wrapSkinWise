import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Trash2, Home, MapPin, DollarSign, BedDouble, Bath } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AddPropertyPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    type: 'Apartment',
    location: '',
    city: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    imageUrls: [''],
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handlers for form state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  
  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls[index] = value;
    setFormData(prev => ({ ...prev, imageUrls: newImageUrls }));
  };

  const handleAddImageUrlField = () => {
    setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ''] }));
  };

  const handleRemoveImageUrlField = (index) => {
    const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, imageUrls: newImageUrls }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to add a property.');
      setIsSubmitting(false);
      return;
    }
    
    const finalFormData = {
        ...formData,
        imageUrls: formData.imageUrls.filter(url => url.trim() !== ''),
    };

    if (finalFormData.imageUrls.length === 0) {
        toast.error('Please provide at least one image URL.');
        setIsSubmitting(false);
        return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(finalFormData),
      });

      if (res.ok) {
        toast.success('Property added successfully!');
        navigate('/');
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.message || 'Failed to add property.'}`);
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // The main background is handled by index.css
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-3xl">
        <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors mb-6"
        >
            <ArrowLeft size={20} /> Back to Properties
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">List a New Property</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Fill in the details below to put your property on the market.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* --- Section 1: Basic Info --- */}
            <div className="space-y-4 p-6 border dark:border-gray-700 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2"><Home size={20} className="text-blue-500"/>Property Details</h2>
              <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Title</label>
                  <input type="text" id="title" name="title" placeholder="e.g., Cozy Downtown Apartment" value={formData.title} onChange={handleChange} required className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"/>
              </div>
              <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Type</label>
                  <select id="type" name="type" value={formData.type} onChange={handleChange} required className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                      <option>Apartment</option>
                      <option>Bungalow</option>
                      <option>Villa</option>
                      <option>Flat</option>
                      <option>Cabin</option>
                  </select>
              </div>
               <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea id="description" name="description" placeholder="Describe the key features..." value={formData.description} onChange={handleChange} rows="4" required className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"></textarea>
              </div>
            </div>

            {/* --- Section 2: Location --- */}
            <div className="space-y-4 p-6 border dark:border-gray-700 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2"><MapPin size={20} className="text-blue-500"/>Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                        <input type="text" id="location" name="location" placeholder="e.g., 123 Main St" value={formData.location} onChange={handleChange} required className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                        <input type="text" id="city" name="city" placeholder="e.g., Gwalior" value={formData.city} onChange={handleChange} required className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                </div>
            </div>

            {/* --- Section 3: Specs & Pricing --- */}
            <div className="space-y-4 p-6 border dark:border-gray-700 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2"><DollarSign size={20} className="text-blue-500"/>Specs & Price</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($/month)</label>
                        <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bedrooms</label>
                        <input type="number" id="bedrooms" name="bedrooms" value={formData.bedrooms} onChange={handleChange} required className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bathrooms</label>
                        <input type="number" id="bathrooms" name="bathrooms" value={formData.bathrooms} onChange={handleChange} required className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                </div>
            </div>
            
            {/* --- Section 4: Images --- */}
            <div className="space-y-2 p-6 border dark:border-gray-700 rounded-lg">
                <label className="block text-lg font-semibold text-gray-800 dark:text-white mb-2">Image URLs</label>
                {formData.imageUrls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input type="url" placeholder="https://example.com/image.jpg" value={url} onChange={(e) => handleImageUrlChange(index, e.target.value)} required className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"/>
                        {formData.imageUrls.length > 1 && (
                            <button type="button" onClick={() => handleRemoveImageUrlField(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={handleAddImageUrlField} className="mt-2 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:text-blue-800 dark:hover:text-blue-300">
                    <PlusCircle size={18} /> Add More Images
                </button>
            </div>
            
            <button
                type="submit" disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Property'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyPage;