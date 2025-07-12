import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  // If no token, redirect to login and preserve the location for later redirect
  return token ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
