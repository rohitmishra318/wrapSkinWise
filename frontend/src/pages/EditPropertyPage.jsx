import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Trash2, Home, MapPin, DollarSign, BedDouble, Bath } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const EditPropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    type: 'Apartment',
    location: '',
    city: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    imageUrls: [''], // Handle multiple images
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/properties/${id}`);
        const data = await res.json();
        // Ensure imageUrls is always an array
        if (!Array.isArray(data.imageUrls) || data.imageUrls.length === 0) {
            data.imageUrls = [data.imageUrl || ''];
        }
        setFormData(data);
      } catch (error) {
        toast.error('Failed to load property data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
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
    
    const finalFormData = {
        ...formData,
        imageUrls: formData.imageUrls.filter(url => url.trim() !== ''),
    };

    try {
      const res = await fetch(`http://localhost:5000/api/properties/${id}`, {
        method: 'PUT', // Use PUT or PATCH for updates
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(finalFormData),
      });
      if (res.ok) {
        toast.success('Property updated successfully!');
        setTimeout(() => navigate(`/properties/${id}`), 1500);
      } else {
        toast.error('Failed to update property.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading form...</div>;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-3xl">
        <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors mb-6"
        >
            <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Edit Property</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Update the details for your property listing.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* --- All form sections with dark mode classes --- */}
            <div className="space-y-4 p-6 border dark:border-gray-700 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2"><Home size={20} className="text-blue-500"/>Property Details</h2>
                {/* ... Title, Type, Description fields ... */}
            </div>
            <div className="space-y-4 p-6 border dark:border-gray-700 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2"><MapPin size={20} className="text-blue-500"/>Location</h2>
                {/* ... Address, City fields ... */}
            </div>
            <div className="space-y-4 p-6 border dark:border-gray-700 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2"><DollarSign size={20} className="text-blue-500"/>Specs & Price</h2>
                {/* ... Price, Bedrooms, Bathrooms fields ... */}
            </div>
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
                className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
                {isSubmitting ? 'Updating...' : 'Update Property'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPropertyPage;
