import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {MapPin,BedDouble,Bath,ArrowLeft,MessageSquare,CalendarPlus,User,Edit,Trash2,Home,} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import RecommendationsSidebar from '../components/RecommendationsSidebar';
import PropertyCard from '../components/PropertyCard';
import Chat from '../components/Chat';
import NearbyPlaces from '../components/NearbyPlaces';
import RequestVisitModal from '../components/RequestVisitModal';

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [recoLoading, setRecoLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false); // <-- NEW STATE

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setProperty(null);
      try {
        const res = await fetch(`http://localhost:5000/api/properties/${id}`);
        const data = await res.json();
        setProperty(data);
        console.log('Fetched property details:', data);
      } catch (error) {
        console.error('Error fetching property details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  // Fetch recommendations when property loads
  useEffect(() => {
    if (property && property._id) {
      const fetchRecommendations = async () => {
        setRecoLoading(true);
        try {
          const res = await fetch(
            `http://localhost:5000/api/properties/${id}/recommendations`
          );
          const data = await res.json();
          setRecommendations(data);
        } catch (error) {
          console.error('Error fetching recommendations:', error);
          setRecommendations([]);
        } finally {
          setRecoLoading(false);
        }
      };
      fetchRecommendations();
    }
  }, [property, id]);

  // Handle property deletion
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const res = await fetch(`http://localhost:5000/api/properties/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (res.ok) {
          toast.success('Property deleted successfully!');
          navigate('/');
        } else {
          toast.error('Failed to delete property.');
        }
      } catch (error) {
        toast.error('An error occurred while deleting the property.');
      }
    }
  };

  // UPDATED: Handle visit request via modal
  const handleRequestVisit = async ({ date, time }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to request a visit.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ propertyId: property._id, date, time }), // Send date & time
      });

      if (res.ok) {
        toast.success('Visit requested successfully!');
        setIsVisitModalOpen(false); // Close modal on success
      } else {
        toast.error('Failed to request visit.');
      }
    } catch (error) {
      toast.error('An error occurred while requesting the visit.');
    }
  };

  // Handle loading states
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">Loading...</div>
    );
  }

  if (!property || property.error) {
    return (
      <div className="flex justify-center items-center h-screen">
        Property not found.
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Properties
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
              <img
                src={property.imageUrl}
                alt={property.title}
                className="w-full h-96 object-cover rounded-xl mb-6"
              />
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-2">
                    <MapPin size={20} className="text-gray-400" />
                    <span>{property.location}</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${property.price.toLocaleString()}
                  <span className="text-lg font-normal text-gray-500 dark:text-gray-400">
                    /month
                  </span>
                </div>
              </div>

              <div className="border-t dark:border-gray-700 my-6"></div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Bedrooms
                  </p>
                  <p className="text-xl font-bold flex items-center justify-center gap-2">
                    <BedDouble />
                    {property.bedrooms}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Bathrooms
                  </p>
                  <p className="text-xl font-bold flex items-center justify-center gap-2">
                    <Bath />
                    {property.bathrooms}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Property Type
                  </p>
                  <p className="text-xl font-bold flex items-center justify-center gap-2">
                    <Home />
                    {property.type}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Description
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {property.description}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg sticky top-28">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User size={32} className="text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Owner</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {property.owner.username}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {user && user.id !== property.owner._id && (
                  <button
                    onClick={() => setIsVisitModalOpen(true)}
                    className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-600"
                  >
                    <CalendarPlus size={20} /> Request a Visit
                  </button>
                )}
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-600"
                >
                  <MessageSquare size={20} /> Chat with Owner
                </button>
                {user && user.id === property.owner._id && (
                  <div className="pt-2 border-t dark:border-gray-700 flex gap-3">
                    <button
                      onClick={() => navigate(`/edit-property/${property._id}`)}
                      className="w-full bg-yellow-500 text-white"
                    >
                      <Edit size={18} /> Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full bg-red-500 text-white"
                    >
                      <Trash2 size={18} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Places */}
        <div className="mt-12">
          <NearbyPlaces locationString={`${property.location}, ${property.city}`} />
        </div>

        {/* Recommendations */}
        <RecommendationsSidebar propertyId={property._id} />
      </div>

      {/* Modal for requesting visit */}
      {isVisitModalOpen && (
        <RequestVisitModal
          onClose={() => setIsVisitModalOpen(false)}
          onSubmit={handleRequestVisit}
        />
      )}

      {/* Chat */}
      {user && isChatOpen && (
        <Chat
          propertyId={property._id}
          ownerId={property.owner._id}
          ownerUsername={property.owner.username}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
};

export default PropertyDetailsPage;
