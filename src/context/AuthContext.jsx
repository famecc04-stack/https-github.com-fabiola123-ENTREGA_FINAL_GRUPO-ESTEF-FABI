import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Al cargar, verificar si hay token en sessionStorage
  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (token === 'mock-admin-token-xyz') {
      setIsAuthenticated(true);
    }
    setIsInitializing(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      if (response.success) {
        sessionStorage.setItem('adminToken', response.token);
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isInitializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
