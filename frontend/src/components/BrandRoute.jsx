import React from 'react';
import { Navigate } from 'react-router-dom';

const BrandRoute = ({ children }) => {
  const brandKey = localStorage.getItem('brandApiKey');
  
  // Basic check for API key
  // In a real app, we might also verify the key is valid via an endpoint
  if (!brandKey) {
    // Optionally redirect to a dedicated brand login page, or general login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default BrandRoute;
