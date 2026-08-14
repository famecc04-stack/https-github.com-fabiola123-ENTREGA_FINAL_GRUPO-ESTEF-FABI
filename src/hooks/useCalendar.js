import { useState } from 'react';

const generarReservasOcupadasParaFecha = (branch, dateStr) => {
  const list = [];
  const zones = [
    { id: 'salon_vip', name: 'Salón VIP', prefix: 'VIP', count: 4 },
    { id: 'terraza', name: 'Terraza', prefix: 'T', count: 5 },
    { id: 'salon_principal', name: 'Salón Principal', prefix: 'SP', count: 8 },
    { id: 'barra_cocktail', name: 'Barra Cocktail', prefix: 'BC', count: 4 }
  ];
  const times = [
    '12:00', '13:00', '14:00', '15:00', '16:00',
    '16:30', '17:30',
    '19:00', '20:00', '21:00', '22:00'
  ];
  zones.forEach(zone => {
    times.forEach(time => {
      for (let num = 1; num <= zone.count; num++) {
        list.push({
          id: `BARR-${dateStr.replace(/-/g, '')}-${zone.prefix}-${num}`,
          branch: branch,
          date: dateStr,
          time: time,
          table: `Mesa ${zone.prefix}-${num}`,
          party: '2 Personas',
          status: 'Confirmada',
          zone: zone.id,
          zoneName: zone.name,
          obs: 'Todo Barranco Ocupado al 100%',
          email: 'barranco.full@sazon.com',
          nombre: 'Reserva Barranco'
        });
      }
    });
  });
  return list;
};

export function useCalendar(reservasExternas) {

  const obtenerValoresIniciales = () => {
    const now = new Date();
    const hrs = now.getHours();
    const mins = now.getMinutes();
    
    const esPasadoFinServicio = hrs > 23 || (hrs === 23 && mins >= 30);
    
    let fechaInicial = new Date();
    if (esPasadoFinServicio) {
      fechaInicial.setDate(fechaInicial.getDate() + 1);
    }
    
    return {
      fecha: fechaInicial,
      horario: 'Almuerzo (12:00 - 16:00)'
    };
  };

  const valoresIniciales = obtenerValoresIniciales();

  const [currentView, setCurrentView] = useState('monthly');

  const [currentDate, setCurrentDate] = useState(valoresIniciales.fecha);

  const [selectedSede, setSelectedSede] = useState('San Borja');

  const [horarioServicio, setHorarioServicio] = useState(valoresIniciales.horario);

  const [resSeleccionada, setResSeleccionada] = useState(null);

  const [crearResData, setCrearResData] = useState(null);

  const getFilteredReservations = () => {
    let todas = [];
    if (selectedSede === 'Barranco') {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - 35);
      for (let i = 0; i < 70; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        todas.push(...generarReservasOcupadasParaFecha('Barranco', dateStr));
      }
    } else {
      todas = (reservasExternas || []).filter(r => r.branch !== 'Barranco');
      if (selectedSede !== 'todos') {
        todas = todas.filter(r => r.branch === selectedSede);
      } else {
        // Si es 'todos', incluimos las de Barranco al 100% dinámicamente para el rango visible
        const start = new Date(currentDate);
        start.setDate(start.getDate() - 35);
        for (let i = 0; i < 70; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          todas.push(...generarReservasOcupadasParaFecha('Barranco', dateStr));
        }
      }
    }
 
    if (horarioServicio.includes('Almuerzo')) {
      todas = todas.filter(r => ['12:00', '13:00', '14:00', '15:00', '16:00'].includes(r.time));
    } else if (horarioServicio.includes('Lonche')) {
      todas = todas.filter(r => ['16:30', '17:30'].includes(r.time));
    } else if (horarioServicio.includes('Cena')) {
      todas = todas.filter(r => ['19:00', '20:00', '21:00', '22:00'].includes(r.time));
    }
    
    return todas;
  };

  const changePeriod = (dir) => {
    const updated = new Date(currentDate);
    if (currentView === 'monthly') updated.setMonth(updated.getMonth() + dir);
    else if (currentView === 'weekly') updated.setDate(updated.getDate() + dir * 7);
    else updated.setDate(updated.getDate() + dir);
    setCurrentDate(updated);
  };

  const goToToday = () => {
    const init = obtenerValoresIniciales();
    setCurrentDate(init.fecha);
    setHorarioServicio(init.horario);
  };

  const jumpToDate = (dateVal) => {
    if (!dateVal) return;
    const parts = dateVal.split('-');
    setCurrentDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
  };

  const goToDailyView = (dateStr) => {
    if (!dateStr) return;
    const parts = dateStr.split('-');
    setCurrentDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
    setCurrentView('daily');
  };

  return {
    currentView, setCurrentView,
    currentDate, setCurrentDate,
    selectedSede, setSelectedSede,
    resSeleccionada, setResSeleccionada,
    crearResData, setCrearResData,
    getFilteredReservations,
    changePeriod,
    goToToday,
    jumpToDate,
    goToDailyView,
    horarioServicio,
    setHorarioServicio
  };
}
