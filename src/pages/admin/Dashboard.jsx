import React, { useEffect, useState } from 'react';
import { reservationService } from '../../services/reservationService';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    mesasDisponibles: 0,
    mesasOcupadas: 0,
    mesasConfirmadas: 0,
    reservasPendientes: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [branch, setBranch] = useState('Miraflores');
  const [time, setTime] = useState('13:00');

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      try {
        const hoy = new Date();
        const dateStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
        
        // Obtener reservas y mesas según la sede y hora seleccionadas
        const reservas = await reservationService.getReservations();
        const tables = await reservationService.getTablesStatus(branch, dateStr, time);

        // Calcular métricas
        // Pendientes del día (de todas las sedes, o de la sede? Por defecto de todas es más útil, pero si el usuario selecciona sede, mejor filtramos por sede)
        const pendientes = reservas.filter(r => r.status === 'Pendiente' && r.date === dateStr && r.branch === branch).length;
        
        const disp = tables.filter(t => t.status === 'Disponible').length;
        const ocup = tables.filter(t => t.status === 'Ocupada').length;
        const conf = tables.filter(t => t.status === 'Reservada').length; // El estado de la mesa cuando tiene reserva es "Reservada"

        setMetrics({
          mesasDisponibles: disp,
          mesasOcupadas: ocup,
          mesasConfirmadas: conf,
          reservasPendientes: pendientes
        });
      } catch (error) {
        console.error('Error cargando métricas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [branch, time]);

  const metricCards = [
    { title: 'Mesas Disponibles', value: metrics.mesasDisponibles, icon: 'table_restaurant', color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Mesas Ocupadas', value: metrics.mesasOcupadas, icon: 'dining', color: 'text-error', bg: 'bg-error-container' },
    { title: 'Mesas Confirmadas', value: metrics.mesasConfirmadas, icon: 'book_online', color: 'text-secondary', bg: 'bg-secondary-container' },
    { title: 'Pendiente de Confirmación', value: metrics.reservasPendientes, icon: 'pending_actions', color: 'text-tertiary', bg: 'bg-tertiary-container' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Dashboard</h1>
          <p className="text-on-surface-variant">Resumen de operaciones (Hoy)</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="px-4 py-2 rounded-xl border border-outline-variant bg-surface outline-none text-sm font-medium focus:border-primary"
          >
            <option value="Barranco">Barranco</option>
            <option value="Miraflores">Miraflores</option>
            <option value="San Isidro">San Isidro</option>
            <option value="San Borja">San Borja</option>
          </select>
          
          <select 
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="px-4 py-2 rounded-xl border border-outline-variant bg-surface outline-none text-sm font-medium focus:border-primary"
          >
            <optgroup label="Almuerzo (12:00 a 16:00)">
              <option value="12:00">12:00</option>
              <option value="13:00">13:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="16:00">16:00</option>
            </optgroup>
            <optgroup label="Lonche (16:30 a 17:30)">
              <option value="16:30">16:30</option>
              <option value="17:30">17:30</option>
            </optgroup>
            <optgroup label="Cena (19:00 a 22:00)">
              <option value="19:00">19:00</option>
              <option value="20:00">20:00</option>
              <option value="21:00">21:00</option>
              <option value="22:00">22:00</option>
            </optgroup>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((card, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={card.title}
              className="bg-surface border border-outline-variant rounded-2xl p-5 shadow-sm flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.bg}`}>
                <span className={`material-symbols-outlined ${card.color}`}>{card.icon}</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-on-surface-variant leading-tight mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold text-on-surface">{card.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="bg-surface border border-outline-variant rounded-2xl p-6 mt-8">
        <h2 className="text-lg font-bold text-on-surface mb-4">Accesos Rápidos</h2>
        <div className="flex flex-wrap gap-4">
          <a href="/admin/mesas" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-medium hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined">table_chart</span>
            Ver mapa de mesas
          </a>
          <a href="/admin/reservas" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-on-secondary font-medium hover:bg-secondary/90 transition-colors">
            <span className="material-symbols-outlined">event_note</span>
            Gestionar Reservas
          </a>
          <a href="/admin/menu" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-container-high text-on-surface font-medium hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined">restaurant_menu</span>
            Actualizar Menú
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
