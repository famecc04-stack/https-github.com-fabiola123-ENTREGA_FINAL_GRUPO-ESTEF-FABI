import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import GlobalLoader from '../ui/GlobalLoader';

const AdminGuard = () => {
  const { isAuthenticated, isInitializing } = useContext(AuthContext);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Si está autenticado, renderizar las rutas hijas dentro del Layout
  return <Outlet />;
};

export default AdminGuard;
