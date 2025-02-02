import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProductPage from '../pages/ProductPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;