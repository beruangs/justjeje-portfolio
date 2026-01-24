import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const verifyToken = async () => {
      const token = sessionStorage.getItem('adminToken');
      if (token) {
        try {
          const response = await authAPI.verify();
          if (response.success) {
            setIsAuthenticated(true);
            setUser(response.user);
          } else {
            sessionStorage.removeItem('adminToken');
          }
        } catch (error) {
          sessionStorage.removeItem('adminToken');
        }
      }
      setIsLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);

      if (response.success && response.token) {
        sessionStorage.setItem('adminToken', response.token);
        setIsAuthenticated(true);
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const loginPasskey = async () => {
    try {
      const response = await authAPI.loginPasskey();
      if (response && response.token) {
        sessionStorage.setItem('adminToken', response.token);
        setIsAuthenticated(true);
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Passkey Login Error:', error);
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    loginPasskey,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
