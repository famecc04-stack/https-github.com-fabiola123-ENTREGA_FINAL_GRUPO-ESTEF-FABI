import React from 'react';
import { useNavigate } from 'react-router-dom';

// Componente Hero modular con Tailwind original
function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative h-[870px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center transition-transform duration-[10s] scale-110 hover:scale-100" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCFT9KT1UBd3an5GYf0NcZru68Lqsu4n6SgAyB-9J9wShJ5r0jkrLgg9lsjNUFy8UePOzim8-bBEgTVuUUiwCevu_bnYVRTKWr-59H_EMVDjVnaf6DfRGNs91zpH5ds_oDAVLYiNP4v7ROkph5W5gBZCWX2tjegSR1-JeitDLKZwPLzaEKJn7bjNmXQR7FO7fFhwQTE2lu8wYn001sQhMeGkZa785-7xY8CM8GkGJW6LMfT8DQNvXoV')" }}
        ></div>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-white mb-6 hero-shadow">
          El auténtico sabor criollo en cada plato
        </h1>
        <p className="font-body-lg text-body-lg text-surface-container-low mb-10 max-w-2xl mx-auto italic">
          Una experiencia culinaria que rinde homenaje a la herencia del Perú, fusionando tradición y elegancia.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/reservas')} 
            className="bg-primary text-on-primary px-8 py-4 rounded-full font-label-md text-label-md border-b-[3px] border-tertiary-fixed flex items-center justify-center gap-2 hover:bg-primary-container active:scale-95 transition-all"
          >
            Reservar ahora
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
