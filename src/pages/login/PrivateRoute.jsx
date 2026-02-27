// src/pages/login/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';


const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1]; 
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Erreur de décodage du JWT:', e);
    return null;
  }
};

const PrivateRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  if (requiredRole) {
    const decoded = decodeJwt(token);
    if (!decoded || decoded.type_user !== requiredRole) {
      return <Navigate to="/dash" />;
    }
  }
  return children;
};

export default PrivateRoute;