import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Check, X, Clock, Home, User as UserIcon, CalendarDays, Inbox, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const VisitsPage = () => {
  const { user } = useAuth();
  const [ownerVisits, setOwnerVisits] = useState([]);
  const [tenantVisits, setTenantVisits] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchVisits = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const [ownerRes, tenantRes] = await Promise.all([
        fetch('http://localhost:5000/api/visits/owner', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:5000/api/visits/tenant', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (ownerRes.ok) {
        const ownerData = await ownerRes.json();
        setOwnerVisits(ownerData);
      } else {
        console.error('Failed to fetch owner visits');
      }

      if (tenantRes.ok) {
        const tenantData = await tenantRes.json();
        setTenantVisits(tenantData);
      } else {
        console.error('Failed to fetch tenant visits');
      }
    } catch (error) {
      toast.error('Could not load visit requests.');
      console.error('Error fetching visits:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);


  const handleUpdateStatus = async (visitId, status) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/visits/${visitId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast.success(`Visit request has been ${status}.`);
        setOwnerVisits(ownerVisits.map(v => (v._id === visitId ? { ...v, status } : v)));
      } else {
        toast.error('Failed to update status.');
      }
    } catch (error) {
      toast.error('An error occurred.');
    }
  };


  const isUpcoming = (visitDate) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const visit = new Date(visitDate);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    visit.setHours(0, 0, 0, 0);

    return visit.getTime() === today.getTime() || visit.getTime() === tomorrow.getTime();
  };

  // ✅ Format visit date & time
  const formatDateTime = (dateStr, timeStr) => {
    const date = new Date(dateStr);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString(undefined, options);

    if (timeStr) {
      let [hours, minutes] = timeStr.split(':');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${formattedDate} at ${hours}:${minutes} ${ampm}`;
    }
    return formattedDate;
  };

  
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      Pending:
        'bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-500/50',
      Accepted:
        'bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-500/50',
      Rejected:
        'bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-500/50',
    };
    const statusIcons = {
      Pending: <Clock size={14} className="mr-1" />,
      Accepted: <Check size={14} className="mr-1" />,
      Rejected: <X size={14} className="mr-1" />,
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {statusIcons[status]}
        {status}
      </span>
    );
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <CalendarDays size={40} className="text-blue-500 mb-4" />
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading your visit requests...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 md:p-10">
      <h1 className="text-4xl font-extrabold mb-10 text-gray-800 dark:text-white text-center">
        My Visit Requests
      </h1>

      {/* ✅ Owner Section */}
      {ownerVisits.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-400">
            Requests for Your Properties
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ownerVisits.map(visit => (
              <div
                key={visit._id}
                className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition duration-300"
              >
                <Link
                  to={`/properties/${visit.property._id}`}
                  className="font-bold text-lg text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  <Home size={18} className="mr-2" />
                  {visit.property.title}
                </Link>
                <p className="text-gray-600 dark:text-gray-300 flex items-center mt-2">
                  <UserIcon size={16} className="mr-2 text-gray-400" />
                  Requested by:
                  <span className="font-semibold ml-1">{visit.tenant.username}</span>
                </p>

                {/* ✅ Show requested date & time */}
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-3">
                  Requested for: {formatDateTime(visit.requestedDate, visit.requestedTime)}
                </p>

                <div className="flex items-center mt-3">
                  <StatusBadge status={visit.status} />
                </div>

                {/* ✅ Upcoming visit reminder */}
                {visit.status === 'Accepted' && isUpcoming(visit.requestedDate) && (
                  <div className="mt-3 text-sm flex items-center gap-2 text-orange-500 bg-orange-100 dark:bg-orange-900/50 p-2 rounded-md">
                    <Bell size={16} />
                    <span>This visit is upcoming!</span>
                  </div>
                )}

                {/* ✅ Accept / Reject buttons */}
                {visit.status === 'Pending' && (
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => handleUpdateStatus(visit._id, 'Accepted')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      <Check size={18} /> Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(visit._id, 'Rejected')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      <X size={18} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ Tenant Section */}
      {tenantVisits.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-green-600 dark:text-green-400">Visits You've Requested</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tenantVisits.map(visit => (
              <div
                key={visit._id}
                className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition duration-300"
              >
                <Link
                  to={`/properties/${visit.property._id}`}
                  className="font-bold text-lg text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  <Home size={18} className="mr-2" />
                  {visit.property.title}
                </Link>

                {/* ✅ Show requested date & time */}
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-3">
                  Requested for: {formatDateTime(visit.requestedDate, visit.requestedTime)}
                </p>

                <div className="flex items-center mt-3">
                  <StatusBadge status={visit.status} />
                </div>

                {/* ✅ Upcoming visit reminder */}
                {visit.status === 'Accepted' && isUpcoming(visit.requestedDate) && (
                  <div className="mt-3 text-sm flex items-center gap-2 text-orange-500 bg-orange-100 dark:bg-orange-900/50 p-2 rounded-md">
                    <Bell size={16} />
                    <span>Your visit is upcoming!</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ No visits */}
      {!loading && ownerVisits.length === 0 && tenantVisits.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-10 text-center flex flex-col items-center">
          <Inbox size={40} className="text-gray-400 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">You have no visit requests at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default VisitsPage;
