import { NavLink, Link, useNavigate } from 'react-router-dom';

// Componente Header (Navbar) de Sazón Dúo Dinámico
function Header() {
  const navigate = useNavigate();

  // Elementos de navegación según requerimiento (sin "Carta")
  const navItems = [
    { id: '/',     label: 'Inicio' },
    { id: '/reservas',    label: 'Reservas' },
    { id: '/horarios',   label: 'Horarios' },
    { id: '/calendario', label: 'Calendario' }
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
      {/* Logo */}
      <Link 
        to="/"
        className="font-display-lg text-headline-md text-primary tracking-tight cursor-pointer selection:bg-transparent"
      >
        Sazón Dúo Dinámico
      </Link>

      {/* Links de navegación (Desktop) */}
      <div className="hidden md:flex items-center gap-8">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.id}
            className={({ isActive }) => `font-title-lg text-title-lg transition-colors selection:bg-transparent ${
              isActive 
                ? 'text-primary font-bold border-b-2 border-secondary' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Botón CTA derecho */}
      <button 
        onClick={() => navigate('/reservas')}
        className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-md text-label-md border-b-2 border-secondary-container hover:bg-primary-container active:scale-95 transition-all"
      >
        Reservar ahora
      </button>
    </nav>
  );
}

export default Header;
