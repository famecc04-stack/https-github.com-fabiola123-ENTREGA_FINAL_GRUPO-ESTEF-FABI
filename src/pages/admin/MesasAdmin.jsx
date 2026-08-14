import React, { useEffect, useState } from 'react';
import { reservationService } from '../../services/reservationService';
import { motion } from 'framer-motion';

const MesasAdmin = () => {
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [branch, setBranch] = useState('Miraflores');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('13:00');

  useEffect(() => {
    const fetchTables = async () => {
      setIsLoading(true);
      try {
        const data = await reservationService.getTablesStatus(branch, date, time);
        setTables(data);
      } catch (error) {
        console.error('Error fetching tables:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTables();
  }, [branch, date, time]);

  // Agrupar mesas por zona
  const zonesMap = tables.reduce((acc, table) => {
    if (!acc[table.zoneName]) acc[table.zoneName] = [];
    acc[table.zoneName].push(table);
    return acc;
  }, {});

  const getStatusColor = (status) => {
    switch(status) {
      case 'Disponible': return 'bg-green-100 border-green-300 text-green-800';
      case 'Ocupada': return 'bg-red-100 border-red-300 text-red-800';
      case 'Reservada': return 'bg-orange-100 border-orange-300 text-orange-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Disponible': return 'check_circle';
      case 'Ocupada': return 'restaurant';
      case 'Reservada': return 'schedule';
      default: return 'help';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Gestión de Mesas</h1>
          <p className="text-on-surface-variant">Visualiza la disponibilidad actual del restaurante</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select 
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="px-4 py-2 rounded-xl border border-outline-variant bg-surface outline-none"
          >
            <option value="Barranco">Barranco</option>
            <option value="Miraflores">Miraflores</option>
            <option value="San Isidro">San Isidro</option>
            <option value="San Borja">San Borja</option>
            <option value="La Molina">La Molina</option>
          </select>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 rounded-xl border border-outline-variant bg-surface outline-none"
          />
          <select 
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="px-4 py-2 rounded-xl border border-outline-variant bg-surface outline-none"
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
        <div className="space-y-8">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-green-200 border border-green-400"></span><span className="text-sm">Disponible</span></div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-orange-200 border border-orange-400"></span><span className="text-sm">Reservada</span></div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-red-200 border border-red-400"></span><span className="text-sm">Ocupada</span></div>
          </div>

          {Object.keys(zonesMap).map((zoneName, zIdx) => (
            <div key={zoneName} className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-on-surface mb-4 pb-2 border-b border-outline-variant">{zoneName}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {zonesMap[zoneName].map((table, tIdx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (zIdx * 0.1) + (tIdx * 0.05) }}
                    key={table.id}
                    className={`border-2 rounded-xl p-4 flex flex-col items-center text-center gap-2 ${getStatusColor(table.status)}`}
                  >
                    <span className="material-symbols-outlined text-3xl">{getStatusIcon(table.status)}</span>
                    <div>
                      <h3 className="font-bold">{table.name}</h3>
                      <p className="text-xs font-medium uppercase tracking-wider">{table.status}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MesasAdmin;
