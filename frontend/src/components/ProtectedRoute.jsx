import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, token, encryptionKey } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  // Check TOKEN presence AND Encryption Key
  // If token exists but key is missing (e.g. refresh), force login to re-derive key.
  // Check TOKEN presence AND Encryption Key
  // If token exists but key is missing (e.g. refresh), force login to re-derive key.
  if (!isAuthenticated || !token || !encryptionKey) {
    // If token exists but no key -> It means we refreshed.
    // We must redirect to LOGIN (Landing page) to re-enter password.
    // passing state to open login modal if landing page supports it
    return <Navigate to="/" replace state={{ openLogin: true }} />;
  }

  return children;
};

export default ProtectedRoute;
