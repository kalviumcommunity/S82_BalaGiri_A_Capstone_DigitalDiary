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
  // Check TOKEN presence ONLY.
  // If token exists but key is missing, AuthContext/App will handle the "Locked" state (UnlockModal).
  if (!isAuthenticated || !token) {
    // If no token -> Not authenticated. Redirect to Landing.
    return <Navigate to="/" replace state={{ openLogin: true }} />;
  }

  return children;
};

export default ProtectedRoute;
