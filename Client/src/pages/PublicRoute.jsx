// In Client/src/pages/PublicRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const token = localStorage.getItem('token');

  // If token exists, redirect to dashboard, otherwise show the page
  return token ? <Navigate to="/home" replace /> : <Outlet />;
};

export default PublicRoute;