import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Route protection guard checking authentication and user role
 * @param {string} role - Required role ('CUSTOMER' or 'VENDOR')
 */
const ProtectedRoute = ({ children, role }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-stone-600 text-sm font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    const redirectPath = role === 'VENDOR' ? '/vendor/login' : '/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Role mismatch protection (e.g. customer trying to access vendor pages or vice versa)
  if (role && user.role !== role) {
    if (user.role === 'VENDOR') {
      return <Navigate to="/vendor/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
