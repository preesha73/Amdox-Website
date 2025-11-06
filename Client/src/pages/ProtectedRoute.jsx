// In Client/src/pages/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { token } = useAuth();

  // If there's no token, redirect to login page
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;