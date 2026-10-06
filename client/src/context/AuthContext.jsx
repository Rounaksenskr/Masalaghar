import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('masala_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  // Login handler
  const login = async (email, password, requiredRole = null) => {
    const payload = { email, password };
    if (requiredRole) payload.requiredRole = requiredRole;

    const res = await api.post('/auth/login', payload);
    const { token: receivedToken, user: receivedUser } = res.data;

    localStorage.setItem('masala_token', receivedToken);
    localStorage.setItem('masala_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  // Register handler
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: receivedToken, user: receivedUser } = res.data;

    localStorage.setItem('masala_token', receivedToken);
    localStorage.setItem('masala_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('masala_token');
    localStorage.removeItem('masala_user');
    setToken(null);
    setUser(null);
  };

  const isCustomer = user && user.role === 'CUSTOMER';
  const isVendor = user && user.role === 'VENDOR';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isCustomer,
        isVendor,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
