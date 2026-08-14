import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Toast from '../ui/Toast';

const AdminLayout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/panel', icon: 'dashboard' },
    { name: 'Mesas', path: '/admin/mesas', icon: 'table_restaurant' },
    { name: 'Reservas', path: '/admin/reservas', icon: 'list_alt' },
    { name: 'Menú', path: '/admin/menu', icon: 'restaurant_menu' },
  ];

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:flex-row font-body-md">
      
      {/* Sidebar para desktop / Header para mobile */}
      <aside className="w-full md:w-64 bg-surface-container-low border-b md:border-b-0 md:border-r border-outline-variant flex flex-col shadow-sm flex-shrink-0">
        <div className="p-4 md:p-6 border-b border-outline-variant flex justify-between items-center md:block">
          <h1 className="text-xl font-bold text-primary tracking-tight">Sazón Dúo Dinámico</h1>
          <span className="text-sm font-medium text-secondary bg-secondary/10 px-2 py-1 rounded-full hidden md:inline-block mt-2">
            Panel Admin
          </span>
          <button 
            onClick={handleLogout}
            className="md:hidden text-error flex items-center gap-1 text-sm font-medium hover:bg-error-container p-2 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>

        <nav className="flex-1 overflow-x-auto hide-scrollbar md:overflow-y-auto p-4">
          <ul className="flex md:flex-col gap-2 min-w-max md:min-w-0">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm md:text-base ${
                      isActive 
                        ? 'bg-primary text-on-primary shadow-sm' 
                        : 'text-on-surface hover:bg-surface-container-high'
                    }`
                  }
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden md:block p-4 border-t border-outline-variant">
          <button 
            onClick={handleLogout}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 rounded-xl text-error font-medium hover:bg-error-container hover:text-on-error-container transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mantenemos el Toast en el layout administrativo también */}
      <Toast />
    </div>
  );
};

export default AdminLayout;
