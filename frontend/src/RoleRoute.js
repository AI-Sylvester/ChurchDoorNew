import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleRoute = ({ children, allowedRoles }) => {
  const role = localStorage.getItem('role') || 'family';
  
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

export default RoleRoute;
