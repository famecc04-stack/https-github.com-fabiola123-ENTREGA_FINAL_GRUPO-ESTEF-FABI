import React from 'react';
import { Link } from 'react-router-dom';

// Componente Footer modular con Tailwind original
function Footer() {
  return (
    <footer className="w-full px-margin-mobile md:px-margin-desktop py-stack-lg grid grid-cols-1 md:grid-cols-4 gap-gutter bg-surface-container-lowest border-t border-secondary/20">
      <div className="col-span-1 md:col-span-1">
        <div className="font-display-lg text-headline-sm text-primary mb-4">Sazón Dúo Dinámico</div>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">Elevando el sabor de nuestra tierra al siguiente nivel. Experiencias que perduran.</p>
        <div className="flex gap-4">
          <span className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant"><span className="material-symbols-outlined">share</span></span>
          <span className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant"><span className="material-symbols-outlined">public</span></span>
          <span className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant"><span className="material-symbols-outlined">mail</span></span>
        </div>
      </div>
      <div>
        <h5 className="font-title-lg text-title-lg text-primary mb-6">Explora</h5>
        <ul className="space-y-4 flex flex-col">
          <Link to="/" className="font-body-md text-body-md text-on-surface-variant cursor-pointer hover:text-primary transition-colors inline-block w-fit">Inicio</Link>
          <Link to="/reservas" className="font-body-md text-body-md text-on-surface-variant cursor-pointer hover:text-primary transition-colors inline-block w-fit">Hacer una Reserva</Link>
          <Link to="/horarios" className="font-body-md text-body-md text-on-surface-variant cursor-pointer hover:text-primary transition-colors inline-block w-fit">Horarios en Vivo</Link>
          <Link to="/calendario" className="font-body-md text-body-md text-on-surface-variant cursor-pointer hover:text-primary transition-colors inline-block w-fit">Calendario de Reservas</Link>
        </ul>
      </div>
      <div>
        <h5 className="font-title-lg text-title-lg text-primary mb-6">Ubicaciones</h5>
        <ul className="space-y-4">
          <li className="font-body-md text-body-md text-on-surface-variant">San Borja (Sede Principal)</li>
          <li className="font-body-md text-body-md text-on-surface-variant">Miraflores</li>
          <li className="font-body-md text-body-md text-on-surface-variant">Barranco</li>
          <li className="font-body-md text-body-md text-on-surface-variant">La Molina</li>
        </ul>
      </div>
      <div>
        <h5 className="font-title-lg text-title-lg text-primary mb-6">Legal</h5>
        <ul className="space-y-4">
          <li className="font-body-md text-body-md text-on-surface-variant">Política de Privacidad</li>
          <li className="font-body-md text-body-md text-on-surface-variant">Términos del Servicio</li>
          <li className="pt-4">
            <p className="font-label-md text-label-md text-on-surface-variant opacity-80 italic">© 2026 Sazón Dúo Dinámico. Creado con Tradición.</p>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
