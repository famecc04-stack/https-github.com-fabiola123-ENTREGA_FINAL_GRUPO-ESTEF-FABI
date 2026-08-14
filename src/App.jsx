import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/ui/Toast';
import GlobalLoader from './components/ui/GlobalLoader';

// Lazy loading de las vistas para optimización
const Inicio = lazy(() => import('./pages/Inicio'));
const Reservas = lazy(() => import('./pages/Reservas'));
const Calendario = lazy(() => import('./pages/Calendario'));
const Horarios = lazy(() => import('./pages/Horarios'));

// Admin views
const AdminGuard = lazy(() => import('./components/admin/AdminGuard'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const MesasAdmin = lazy(() => import('./pages/admin/MesasAdmin'));
const ReservasAdmin = lazy(() => import('./pages/admin/ReservasAdmin'));
const MenuAdmin = lazy(() => import('./pages/admin/MenuAdmin'));

function App() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <Routes>
        {/* Rutas Públicas (con Header, Footer, Toast, Loader) */}
        <Route path="/" element={
          <div className="min-h-screen bg-background text-on-background flex flex-col font-body-md">
            <Header />
            <div className="flex-grow">
              <Inicio />
            </div>
            <Footer />
            <Toast />
            <GlobalLoader />
          </div>
        } />
        <Route path="/reservas" element={
          <div className="min-h-screen bg-background text-on-background flex flex-col font-body-md">
            <Header />
            <div className="flex-grow">
              <Reservas />
            </div>
            <Footer />
            <Toast />
            <GlobalLoader />
          </div>
        } />
        <Route path="/calendario" element={
          <div className="min-h-screen bg-background text-on-background flex flex-col font-body-md">
            <Header />
            <div className="flex-grow">
              <Calendario />
            </div>
            <Footer />
            <Toast />
            <GlobalLoader />
          </div>
        } />
        <Route path="/horarios" element={
          <div className="min-h-screen bg-background text-on-background flex flex-col font-body-md">
            <Header />
            <div className="flex-grow">
              <Horarios />
            </div>
            <Footer />
            <Toast />
            <GlobalLoader />
          </div>
        } />

        {/* Rutas Administrativas */}
        <Route path="/admin/login" element={<Login />} />
        
        {/* Rutas Protegidas de Admin */}
        <Route path="/admin" element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route path="panel" element={<Dashboard />} />
            <Route path="mesas" element={<MesasAdmin />} />
            <Route path="reservas" element={<ReservasAdmin />} />
            <Route path="menu" element={<MenuAdmin />} />
            <Route index element={<Navigate to="/admin/panel" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
