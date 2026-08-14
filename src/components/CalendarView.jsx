import { useState, useMemo, useEffect, useContext } from 'react';
import { ReservationContext } from '../context/ReservationContext';
import { useNavigate } from 'react-router-dom';
import { useCalendar } from '../hooks/useCalendar';

const ZONE_METADATA = {
  salon_principal: { name: 'Salón Principal', total: 8, bgClass: 'bg-[#610000] text-white' },
  barra_cocktail: { name: 'Barra Cocktail', total: 4, bgClass: 'bg-[#FADCD0] text-[#610000]' },
  salon_vip: { name: 'Salón VIP', total: 4, bgClass: 'bg-[#FDEBB5] text-[#5A450C]' },
  terraza: { name: 'Terraza', total: 5, bgClass: 'bg-[#C4622D] text-white' }
};

const getAdjustedToday = () => {
  const now = new Date();
  const hrs = now.getHours();
  const mins = now.getMinutes();
  const esPasadoFinServicio = hrs > 23 || (hrs === 23 && mins >= 30);
  
  const adjusted = new Date(now);
  if (esPasadoFinServicio) {
    adjusted.setDate(adjusted.getDate() + 1);
  }
  adjusted.setHours(0,0,0,0);
  return adjusted;
};

const getHorarioServicioForTime = (dateStr) => {
  const now = new Date();
  const dateObj = new Date(dateStr + 'T00:00:00');
  
  const isToday = dateObj.getDate() === now.getDate() &&
                  dateObj.getMonth() === now.getMonth() &&
                  dateObj.getFullYear() === now.getFullYear();
                  
  if (!isToday) return null;
  
  const hrs = now.getHours();
  const mins = now.getMinutes();
  const totalMins = hrs * 60 + mins;
  
  if (totalMins < 16 * 60 + 30) {
    return 'Almuerzo (12:00 - 16:00)';
  } else if (totalMins < 19 * 60) {
    return 'Lonche (16:30 - 18:30)';
  } else {
    return 'Cena (19:00 - 23:00)';
  }
};

const getOccupancyWarning = (res, allReservations) => {
  if (!res) return null;
  
  const zoneId = res.zone;
  const branch = res.branch;
  const dateStr = res.date;
  
  // Si la sede es Barranco, sabemos que está 100% llena siempre.
  const isBarranco = branch === 'Barranco' || branch.toLowerCase().includes('barranco');
  
  const zoneKeys = Object.keys(ZONE_METADATA);
  const timeSlots = [
    '12:00', '13:00', '14:00', '15:00', '16:00',
    '16:30', '17:30',
    '19:00', '20:00', '21:00', '22:00'
  ];
  
  if (isBarranco) {
    return {
      type: 'all_full',
      text: `Todos los horarios y ambientes para la sede de ${branch} se encuentran al 100% de su capacidad. Te sugerimos realizar tu reserva en cualquiera de nuestras otras sedes (San Borja, Miraflores o La Molina).`
    };
  }
  
  const branchReservations = (allReservations || []).filter(
    r => r.branch === branch && r.date === dateStr
  );
  
  // Verificar si hay al menos una mesa libre en la sede
  let tieneMesasLibresEnLaSede = false;
  for (const zKey of zoneKeys) {
    const zTotal = ZONE_METADATA[zKey].total;
    for (const slot of timeSlots) {
      const count = branchReservations.filter(r => r.zone === zKey && r.time === slot).length;
      if (zTotal - count > 0) {
        tieneMesasLibresEnLaSede = true;
        break;
      }
    }
    if (tieneMesasLibresEnLaSede) break;
  }
  
  if (!tieneMesasLibresEnLaSede) {
    return {
      type: 'all_full',
      text: `Todos los horarios y ambientes para la sede de ${branch} se encuentran al 100% de su capacidad para el día ${dateStr.split('-').reverse().join('/')}. Te sugerimos realizar tu reserva en cualquiera de nuestras otras sedes (San Borja, Miraflores o La Molina).`
    };
  }
  
  // Si hay mesas libres en la sede, pero el bloque específico está lleno
  const currentSlotCount = branchReservations.filter(r => r.zone === zoneId && r.time === res.time).length;
  const currentZoneTotal = ZONE_METADATA[zoneId]?.total || 0;
  
  if (currentZoneTotal - currentSlotCount <= 0) {
    return {
      type: 'slot_full',
      text: `Las mesas en el ambiente ${res.zoneName || ZONE_METADATA[zoneId]?.name} para las ${res.time} se encuentran al 100% de su capacidad. Te sugerimos buscar disponibilidad en otro horario o ambiente de esta sede.`
    };
  }
  
  return null;
};

function CalendarView() {
  const { reservas, fechaConflicto, setFechaConflicto, setReservaCompartida } = useContext(ReservationContext);
  const navigate = useNavigate();
  const {
    currentView,
    setCurrentView,
    currentDate,
    setCurrentDate,
    selectedSede,
    setSelectedSede,
    resSeleccionada,
    setResSeleccionada,
    crearResData,
    setCrearResData,
    getFilteredReservations,
    changePeriod,
    goToToday,
    jumpToDate,
    horarioServicio,
    setHorarioServicio
  } = useCalendar(reservas);

  useEffect(() => {
    if (fechaConflicto) {
      const parts = fechaConflicto.split('-');
      if (parts.length === 3) {
        setCurrentDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
        setCurrentView('daily');
        // Limpiamos el conflicto para no re-ejecutarlo
        const timer = setTimeout(() => {
          setFechaConflicto(null);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [fechaConflicto, setFechaConflicto]);

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  const getFormattedPeriod = () => {
    if (currentView === 'monthly') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (currentView === 'weekly') {
      const today = getAdjustedToday();
      
      const todayMonday = new Date(today);
      const todayDay = todayMonday.getDay();
      const todayDiff = todayMonday.getDate() - todayDay + (todayDay === 0 ? -6 : 1);
      todayMonday.setDate(todayDiff);
      todayMonday.setHours(0,0,0,0);
      
      const viewMonday = new Date(currentDate);
      const viewDay = viewMonday.getDay();
      const viewDiff = viewMonday.getDate() - viewDay + (viewDay === 0 ? -6 : 1);
      viewMonday.setDate(viewDiff);
      viewMonday.setHours(0,0,0,0);

      const isCurrentWeek = todayMonday.getTime() === viewMonday.getTime();
      const visibleStart = isCurrentWeek ? new Date(today) : new Date(viewMonday);

      const endOfWeek = new Date(viewMonday);
      endOfWeek.setDate(viewMonday.getDate() + 6);

      return `${visibleStart.getDate()} ${monthNames[visibleStart.getMonth()].substring(0, 3)} - ${endOfWeek.getDate()} ${monthNames[endOfWeek.getMonth()].substring(0, 3)}, ${endOfWeek.getFullYear()}`;
    } else {
      const adjustedToday = getAdjustedToday();
      const isToday = currentDate.getDate() === adjustedToday.getDate() && currentDate.getMonth() === adjustedToday.getMonth() && currentDate.getFullYear() === adjustedToday.getFullYear();
      return `${dayNames[currentDate.getDay()]}, ${currentDate.getDate()} de ${monthNames[currentDate.getMonth()]} de ${currentDate.getFullYear()}${isToday ? ' (Hoy)' : ''}`;
    }
  };

  // --- VISTA MENSUAL: CELDAS ---
  const renderMonthlyGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    let firstDayIndex = firstDay.getDay() - 1;
    if (firstDayIndex === -1) firstDayIndex = 6;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];
    const filtered = getFilteredReservations();

    // Previous month trailing cells
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
      cells.push(
        <div 
          key={`prev-${dayNum}`}
          onClick={() => handleShowEmptyState(dateStr)}
          className="min-h-[120px] p-2 border-r border-b calendar-grid-line bg-surface-dim/20 text-outline-variant font-title-lg cursor-pointer hover:bg-surface-container-low transition-colors"
        >
          {dayNum}
        </div>
      );
    }

    // Current month cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayReservations = filtered.filter(r => r.date === dateStr);
      const adjustedToday = getAdjustedToday();
      const isToday = day === adjustedToday.getDate() && month === adjustedToday.getMonth() && year === adjustedToday.getFullYear();

      const cellClass = isToday 
        ? 'min-h-[120px] p-2 border-r border-b calendar-grid-line bg-surface-container-low ring-1 ring-inset ring-secondary cursor-pointer hover:bg-surface-container-low/70 transition-colors' 
        : 'min-h-[120px] p-2 border-r border-b calendar-grid-line font-title-lg cursor-pointer hover:bg-surface-container-low transition-colors';

      const hasRes = dayReservations.length > 0;
      const isPast = new Date(year, month, day) < new Date().setHours(0,0,0,0);

      cells.push(
        <div key={`day-${day}`} className={cellClass} onClick={() => handleShowEmptyState(dateStr)}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
              <span className={isToday ? 'text-secondary font-bold' : 'text-on-surface'}>{day}</span>
              {!isPast && (
                <span className={`w-2 h-2 rounded-full inline-block ${hasRes ? 'bg-orange-500' : 'bg-green-500'}`}></span>
              )}
            </div>
            {isToday && <span className="bg-secondary text-white text-[10px] px-1.5 rounded-full">Hoy</span>}
          </div>
          <div className="space-y-1">
            {(() => {
              if (isPast) return null;
              const zoneDefs = Object.keys(ZONE_METADATA).map(key => ({ id: key, ...ZONE_METADATA[key] }));
              return zoneDefs.map(zDef => {
                const zoneReservations = dayReservations.filter(r => r.zone === zDef.id);
                const countsByTime = {};
                zoneReservations.forEach(r => {
                  countsByTime[r.time] = (countsByTime[r.time] || 0) + 1;
                });
                const count = Object.keys(countsByTime).length > 0 ? Math.max(...Object.values(countsByTime)) : 0;
                if (count > 0) {
                  return (
                    <div 
                      key={zDef.id} 
                      onClick={(e) => {
                        e.stopPropagation();
                        jumpToDate(dateStr);
                        const correctHorario = getHorarioServicioForTime(dateStr);
                        if (correctHorario) {
                          setHorarioServicio(correctHorario);
                        }
                        setCurrentView('daily');
                      }}
                      className={`reservation-card mb-1 p-1 rounded-md ${zDef.bgClass} text-[8px] font-semibold cursor-pointer transition-all hover:scale-[1.02] text-center leading-tight shadow-sm`}
                    >
                      <span className="font-extrabold uppercase block">{zDef.name}</span>
                      <span className="block mt-0.5">Ocupado: {count} {count === 1 ? 'mesa' : 'mesas'}</span>
                      <span className="block">Libre: {zDef.total - count} {zDef.total - count === 1 ? 'mesa' : 'mesas'}</span>
                    </div>
                  );
                }
                return null;
              });
            })()}
          </div>
        </div>
      );
    }

    // Next month leading cells
    const totalCells = firstDayIndex + daysInMonth;
    const remaining = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
    for (let day = 1; day <= remaining; day++) {
      const nextDate = new Date(year, month + 1, day);
      const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
      cells.push(
        <div 
          key={`next-${day}`}
          onClick={() => handleShowEmptyState(dateStr)}
          className="min-h-[120px] p-2 border-r border-b calendar-grid-line bg-surface-dim/20 text-outline-variant font-title-lg cursor-pointer hover:bg-surface-container-low transition-colors"
        >
          {day}
        </div>
      );
    }

    return cells;
  };

  // --- VISTA SEMANAL ---
  const renderWeeklyList = () => {
    const list = [];
    const today = getAdjustedToday();

    // Monday of today's actual week
    const todayMonday = new Date(today);
    const todayDay = todayMonday.getDay();
    const todayDiff = todayMonday.getDate() - todayDay + (todayDay === 0 ? -6 : 1);
    todayMonday.setDate(todayDiff);
    todayMonday.setHours(0,0,0,0);

    // Monday of currentDate's week
    const viewMonday = new Date(currentDate);
    const viewDay = viewMonday.getDay();
    const viewDiff = viewMonday.getDate() - viewDay + (viewDay === 0 ? -6 : 1);
    viewMonday.setDate(viewDiff);
    viewMonday.setHours(0,0,0,0);

    const isCurrentWeek = todayMonday.getTime() === viewMonday.getTime();
    const loopStart = isCurrentWeek ? new Date(today) : new Date(viewMonday);

    const endOfWeek = new Date(viewMonday);
    endOfWeek.setDate(viewMonday.getDate() + 6);
    endOfWeek.setHours(0,0,0,0);

    const timeDiff = endOfWeek.getTime() - loopStart.getTime();
    const daysToShow = Math.round(timeDiff / (1000 * 3600 * 24)) + 1;

    const filtered = getFilteredReservations();

    for (let i = 0; i < daysToShow; i++) {
      const loopDate = new Date(loopStart);
      loopDate.setDate(loopStart.getDate() + i);

      const dateStr = `${loopDate.getFullYear()}-${String(loopDate.getMonth() + 1).padStart(2, '0')}-${String(loopDate.getDate()).padStart(2, '0')}`;
      const dayReservations = filtered.filter(r => r.date === dateStr);

      const adjustedToday = getAdjustedToday();
      const isToday = loopDate.getDate() === adjustedToday.getDate() && loopDate.getMonth() === adjustedToday.getMonth() && loopDate.getFullYear() === adjustedToday.getFullYear();
      const headerColorClass = isToday ? 'text-secondary font-bold' : 'text-outline';

      const containerClass = 'border border-outline-variant/30 rounded-xl p-5 bg-white shadow-sm space-y-4 hover:border-secondary/20 transition-all';

      if (dayReservations.length === 0) {
        list.push(
          <div 
            key={`week-day-${dateStr}`}
            className="border border-outline-variant/30 rounded-xl p-4 bg-white hover:bg-surface-container-low shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors"
          >
            <div>
              <span className={`text-xs font-bold ${headerColorClass} uppercase tracking-wider`}>
                {dayNames[loopDate.getDay()]} {loopDate.getDate()} {monthNames[loopDate.getMonth()].substring(0,3)}, {loopDate.getFullYear()}
              </span>
              <h3 className="font-display-lg text-title-lg text-on-surface">No hay reservas programadas</h3>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-surface-container text-on-surface-variant font-semibold">0 Reservas</span>
          </div>
        );
      } else {
        list.push(
          <div key={`week-day-${dateStr}`} className={containerClass}>
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
              <div>
                <span className={`text-xs font-bold ${headerColorClass} uppercase tracking-wider`}>
                  {dayNames[loopDate.getDay()]} {loopDate.getDate()} {monthNames[loopDate.getMonth()].substring(0,3)}, {loopDate.getFullYear()}
                </span>
                <h3 className="font-display-lg text-title-lg text-primary font-bold">{isToday ? `Hoy (${dayNames[loopDate.getDay()]})` : dayNames[loopDate.getDay()]}</h3>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-secondary text-white font-bold">{dayReservations.length} Reservas</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(() => {
                const isPast = loopDate < new Date().setHours(0,0,0,0);
                if (isPast) {
                  return (
                    <div className="col-span-1 sm:col-span-2 lg:col-span-4 py-8 text-center text-on-surface-variant italic font-semibold text-sm bg-surface-container-low/25 rounded-xl">
                      Información no disponible para fechas pasadas.
                    </div>
                  );
                }
                const zoneDefs = Object.keys(ZONE_METADATA).map(key => ({ id: key, ...ZONE_METADATA[key] }));
                return zoneDefs.map(zDef => {
                  const zoneReservations = dayReservations.filter(r => r.zone === zDef.id);
                  const countsByTime = {};
                  zoneReservations.forEach(r => {
                    countsByTime[r.time] = (countsByTime[r.time] || 0) + 1;
                  });
                  const count = Object.keys(countsByTime).length > 0 ? Math.max(...Object.values(countsByTime)) : 0;
                  if (count > 0) {
                    return (
                      <div 
                        key={zDef.id} 
                        onClick={(e) => {
                          e.stopPropagation();
                          jumpToDate(dateStr);
                          const correctHorario = getHorarioServicioForTime(dateStr);
                          if (correctHorario) {
                            setHorarioServicio(correctHorario);
                          }
                          setCurrentView('daily');
                        }}
                        className={`p-3 rounded-xl ${zDef.bgClass} hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col justify-center items-center text-center`}
                      >
                        <span className="font-extrabold text-xs uppercase tracking-wider block mb-1">{zDef.name}</span>
                        <span className="opacity-95 text-xs font-semibold block">
                          Ocupado: {count} {count === 1 ? 'mesa' : 'mesas'}
                        </span>
                        <span className="opacity-95 text-xs font-semibold block">
                          Libre: {zDef.total - count} {zDef.total - count === 1 ? 'mesa' : 'mesas'}
                        </span>
                      </div>
                    );
                  }
                  return null;
                });
              })()}
            </div>
          </div>
        );
      }
    }
    return list;
  };

  // --- VISTA DIARIA: TABLA ---
  const renderDailyTable = () => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    const dayReservations = getFilteredReservations().filter(r => r.date === dateStr);

    // Filtrar slots según el Horario de Servicio seleccionado
    let activeSlots = [];
    if (horarioServicio.includes('Almuerzo')) {
      activeSlots = ['12:00', '13:00', '14:00', '15:00', '16:00'];
    } else if (horarioServicio.includes('Lonche')) {
      activeSlots = ['16:30', '17:30'];
    } else if (horarioServicio.includes('Cena')) {
      activeSlots = ['19:00', '20:00', '21:00', '22:00'];
    }

    // Si la fecha es hoy, filtrar para mostrar únicamente horarios futuros
    const now = new Date();
    const isToday = currentDate.getDate() === now.getDate() &&
                    currentDate.getMonth() === now.getMonth() &&
                    currentDate.getFullYear() === now.getFullYear();

    if (isToday) {
      const currentHr = now.getHours();
      const currentMin = now.getMinutes();
      activeSlots = activeSlots.filter(timeStr => {
        const [slotHr, slotMin] = timeStr.split(':').map(Number);
        if (slotHr > currentHr) return true;
        if (slotHr === currentHr && slotMin >= currentMin) return true;
        return false;
      });
    }

    const zonesList = Object.keys(ZONE_METADATA).map(key => ({ id: key, ...ZONE_METADATA[key] }));

    const getCorteLabel = (timeStr) => {
      if (['12:00', '13:00', '14:00', '15:00', '16:00'].includes(timeStr)) {
        return <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-extrabold uppercase mt-1">Almuerzo</span>;
      } else if (['16:30', '17:30'].includes(timeStr)) {
        return <span className="text-[9px] px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-extrabold uppercase mt-1">Lonche</span>;
      } else {
        return <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-extrabold uppercase mt-1">Cena</span>;
      }
    };

    return (
      <div className="min-w-[800px] border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-5 border-b calendar-grid-line bg-surface-container-low/50 font-bold text-secondary text-center py-3">
          <div className="col-span-1 py-1 font-label-md tracking-wider uppercase border-r calendar-grid-line">Hora</div>
          <div className="col-span-1 py-1 font-label-md tracking-wider uppercase border-r calendar-grid-line">Salón Principal</div>
          <div className="col-span-1 py-1 font-label-md tracking-wider uppercase border-r calendar-grid-line">Barra Cocktail</div>
          <div className="col-span-1 py-1 font-label-md tracking-wider uppercase border-r calendar-grid-line">Salón VIP</div>
          <div className="col-span-1 py-1 font-label-md tracking-wider uppercase">Terraza</div>
        </div>
        <div className="divide-y calendar-grid-line bg-white">
          {activeSlots.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant italic font-semibold text-sm bg-surface-container-low/25 w-full col-span-5">
              No hay más franjas horarias disponibles para el día de hoy en este servicio.
            </div>
          ) : (
            activeSlots.map(time => {
              return (
                <div key={time} className="grid grid-cols-5 h-16 items-center text-center">
                  <div className="col-span-1 font-bold text-secondary border-r calendar-grid-line h-full flex flex-col items-center justify-center bg-surface-container-low/30">
                    <span className="text-sm font-bold">{time}</span>
                    {getCorteLabel(time)}
                  </div>
                  {zonesList.map(zone => {
                    const slotReservations = dayReservations.filter(r => r.time === time && r.zone === zone.id);
                    const count = slotReservations.length;
                    const total = zone.total;
                    if (count > 0) {
                      const hasFreeTable = total - count > 0;
                      return (
                        <div key={zone.id} className="col-span-1 border-r calendar-grid-line h-full flex items-center justify-center p-1 bg-white">
                          <div 
                            onClick={() => {
                              if (hasFreeTable) {
                                handleShowEmptyState(dateStr, time, zone.id, zone.name);
                              } else {
                                setResSeleccionada(slotReservations[0]);
                              }
                            }}
                            className={`w-full h-full rounded-xl p-2 flex flex-col justify-center items-center cursor-pointer shadow-sm hover:scale-[1.02] transition-all duration-200 ${zone.bgClass}`}
                          >
                            <span className="text-[10px] font-extrabold uppercase tracking-wide block mb-0.5">{zone.name}</span>
                            <span className="text-[9px] block">Ocupado: {count} {count === 1 ? 'mesa' : 'mesas'}</span>
                            <span className="text-[9px] block">Libre: {total - count} {total - count === 1 ? 'mesa' : 'mesas'}</span>
                          </div>
                        </div>
                      );
                    } else {
                      const isPast = new Date(`${dateStr}T${time}:00`) < new Date();
                      if (isPast) {
                        return (
                          <div key={zone.id} className="col-span-1 border-r calendar-grid-line h-full flex items-center justify-center text-xs text-on-surface-variant/20 bg-surface-dim/5 italic cursor-not-allowed">
                            Pasado
                          </div>
                        );
                      } else {
                        return (
                          <div 
                            key={zone.id} 
                            onClick={() => handleShowEmptyState(dateStr, time, zone.id, zone.name)}
                            className="col-span-1 border-r calendar-grid-line h-full flex items-center justify-center text-xs text-on-surface-variant/40 italic hover:bg-surface-container-low transition-colors cursor-pointer"
                          >
                            <span className="hover:text-primary transition-colors flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">add</span> Disponible
                            </span>
                          </div>
                        );
                      }
                    }
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const handleShowEmptyState = (dateStr, time = null, zoneId = null, zoneName = null) => {
    if (selectedSede === 'Barranco') {
      alert("No hay mesas disponibles en la sede de Barranco para ninguna fecha u hora.");
      return;
    }
    const selectedDate = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0,0,0,0);

    const isPast = selectedDate < today;
    const targetBranch = selectedSede !== 'todos' ? selectedSede : 'San Borja';

    setCrearResData({
      date: dateStr,
      time: time || '19:30',
      zone: zoneId || 'salon_principal',
      zoneName: zoneName || 'Salón Principal',
      branch: targetBranch,
      isPast
    });
  };

  return (
    <main className="flex-grow pt-24 pb-stack-lg px-margin-desktop max-w-container-max mx-auto w-full">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-gutter mb-stack-lg">
        <div>
          <h1 className="font-display-lg text-headline-lg text-primary mb-2">Calendario de Reservas</h1>
          <p className="text-on-surface-variant font-body-lg">Gestionando legado y arte en cada servicio.</p>
        </div>
        <div className="flex items-center bg-surface-container rounded-xl p-1 shadow-inner border border-outline-variant/20">
          <button 
            onClick={() => setCurrentView('monthly')}
            className={`px-6 py-2 rounded-lg font-label-md text-label-md transition-all ${
              currentView === 'monthly' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-bright'
            }`}
          >
            Mensual
          </button>
          <button 
            onClick={() => setCurrentView('weekly')}
            className={`px-6 py-2 rounded-lg font-label-md text-label-md transition-all ${
              currentView === 'weekly' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-bright'
            }`}
          >
            Semanal
          </button>
          <button 
            onClick={() => setCurrentView('daily')}
            className={`px-6 py-2 rounded-lg font-label-md text-label-md transition-all ${
              currentView === 'daily' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-bright'
            }`}
          >
            Diario
          </button>
        </div>
      </div>

      {/* Calendar Control Bar */}
      <div className="flex items-center justify-between mb-stack-md">
        <div className="flex items-center gap-4">
          <button onClick={() => changePeriod(-1)} className="p-2 hover:bg-surface-container-low rounded-full text-secondary transition-all">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <h2 className="font-display-lg text-headline-md">{getFormattedPeriod()}</h2>
          <button onClick={() => changePeriod(1)} className="p-2 hover:bg-surface-container-low rounded-full text-secondary transition-all">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
          <button onClick={goToToday} className="ml-4 px-4 py-1 border border-secondary text-secondary rounded-full font-label-md text-label-md hover:bg-secondary/5 transition-all">
            Hoy ({dayNames[new Date().getDay()]})
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Horario de Servicio select dropdown */}
          <div className="flex items-center gap-2 bg-surface-container-high text-on-surface-variant rounded-lg p-2 px-3 border border-outline-variant/30 hover:bg-surface-container-highest transition-all relative">
            <span className="material-symbols-outlined text-[20px] text-secondary">schedule</span>
            <label className="font-label-md text-xs cursor-pointer select-none">Horario:</label>
            <select 
              value={horarioServicio}
              onChange={(e) => setHorarioServicio(e.target.value)}
              className="bg-transparent border-0 p-0 text-xs font-bold text-primary focus:ring-0 cursor-pointer w-44 outline-none appearance-none font-sans"
            >
              <option value="Almuerzo (12:00 - 16:00)">Almuerzo (12:00 - 16:00)</option>
              <option value="Lonche (16:30 - 18:30)">Lonche (16:30 - 18:30)</option>
              <option value="Cena (19:00 - 23:00)">Cena (19:00 - 23:00)</option>
            </select>
          </div>

          {/* Sede filter */}
          <div className="flex items-center gap-2 bg-surface-container-high text-on-surface-variant rounded-lg p-2 px-3 border border-outline-variant/30 hover:bg-surface-container-highest transition-all relative">
            <span className="material-symbols-outlined text-[20px] text-secondary">location_on</span>
            <label className="font-label-md text-xs cursor-pointer select-none">Sede:</label>
            <select 
              value={selectedSede}
              onChange={(e) => setSelectedSede(e.target.value)}
              className="bg-transparent border-0 p-0 text-xs font-bold text-primary focus:ring-0 cursor-pointer w-36"
            >
              <option value="todos">Todas las sedes</option>
              <option value="San Borja">San Borja (Sede Principal)</option>
              <option value="Miraflores">Miraflores</option>
              <option value="Barranco">Barranco</option>
              <option value="La Molina">La Molina</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 min-h-[600px] flex flex-col">
        {/* Legend bar */}
        {currentView === 'monthly' && (
          <div className="flex flex-wrap gap-6 justify-end items-center px-6 py-3 bg-surface-container-low/30 border-b border-outline-variant/20 text-[11px] font-semibold text-on-surface-variant">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 block"></span> Disponible</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 block"></span> Quedan pocas mesas</span>
          </div>
        )}

        {/* Monthly grid */}
        {currentView === 'monthly' && (
          <div className="flex flex-col flex-grow">
            <div className="grid grid-cols-7 border-b calendar-grid-line bg-surface-container-low/50">
              <div className="py-4 text-center font-label-md text-secondary tracking-widest uppercase">Lun</div>
              <div className="py-4 text-center font-label-md text-secondary tracking-widest uppercase">Mar</div>
              <div className="py-4 text-center font-label-md text-secondary tracking-widest uppercase">Mié</div>
              <div className="py-4 text-center font-label-md text-secondary tracking-widest uppercase">Jue</div>
              <div className="py-4 text-center font-label-md text-secondary tracking-widest uppercase">Vie</div>
              <div className="py-4 text-center font-label-md text-secondary tracking-widest uppercase">Sáb</div>
              <div className="py-4 text-center font-label-md text-secondary tracking-widest uppercase">Dom</div>
            </div>
            <div className="grid grid-cols-7 flex-grow">
              {renderMonthlyGrid()}
            </div>
          </div>
        )}

        {/* Weekly View */}
        {currentView === 'weekly' && (
          <div className="p-6 space-y-6 flex-grow bg-surface-container-lowest animate-in fade-in duration-300">
            {renderWeeklyList()}
          </div>
        )}

        {/* Daily View */}
        {currentView === 'daily' && (
          <div className="p-6 flex-grow bg-surface-container-lowest overflow-x-auto animate-in fade-in duration-300">
            {renderDailyTable()}
          </div>
        )}
      </div>

      {/* Reservation Detail Modal */}
      {resSeleccionada && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setResSeleccionada(null)}></div>
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-outline-variant/30 transform transition-all animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-display-lg text-headline-md text-[#610000] font-semibold">Detalles de la Reserva</h3>
                <p className="text-[#A93700] font-label-md uppercase font-bold tracking-wider text-xs">CONFIRMADO</p>
              </div>
              <button className="p-1 border border-on-surface rounded-full flex items-center justify-center hover:bg-surface-container-low transition-all text-on-surface" onClick={() => setResSeleccionada(null)}>
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div className="space-y-2">
                  <label className="text-[#8C8C8C] text-[11px] font-bold uppercase tracking-wider block">SEDE</label>
                  <p className="text-[#1A1A1A] font-bold text-base">{resSeleccionada.branch}</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[#8C8C8C] text-[11px] font-bold uppercase tracking-wider block">HORA</label>
                    <p className="text-[#1A1A1A] text-base">{resSeleccionada.time}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#8C8C8C] text-[11px] font-bold uppercase tracking-wider block">ZONA</label>
                    <p className="text-[#1A1A1A] text-base">({resSeleccionada.zoneName || ZONE_METADATA[resSeleccionada.zone]?.name})</p>
                  </div>
                </div>
              </div>

              {(() => {
                const warning = getOccupancyWarning(resSeleccionada, reservas);
                if (!warning) return null;
                return (
                  <div className="border border-[#FDEBB5] bg-[#FFFBEB] rounded-2xl p-5 flex gap-4 items-start text-left">
                    <span className="material-symbols-outlined text-[#C4622D] text-[20px] shrink-0 mt-0.5">warning</span>
                    <div>
                      <h4 className="font-bold text-[#610000] text-sm mb-1">Aviso de Ocupación</h4>
                      <p className="text-secondary text-xs leading-relaxed">
                        {warning.text}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Empty State Modal (Create Reservation) */}
      {crearResData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setCrearResData(null)}></div>
          <div className="relative bg-white rounded-[2rem] max-w-[440px] w-full p-6 text-center shadow-2xl border border-outline-variant/30 transform transition-all scale-100 opacity-100">
            <button onClick={() => setCrearResData(null)} className="absolute top-4 right-4 text-[#A93700] hover:bg-surface-container-low transition-all p-1.5 rounded-full flex items-center justify-center cursor-pointer z-10">
              <span className="material-symbols-outlined text-[20px] font-light">close</span>
            </button>
            
            <div className="w-full h-52 mb-6 overflow-hidden rounded-2xl relative mt-2">
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: "url('/images/salon_vip.png')" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
            </div>

            {crearResData.isPast ? (
              <div className="px-4 pb-6">
                <h3 className="font-display-lg text-2xl text-[#610000] mb-4">Fecha Pasada</h3>
                <p className="text-[#595959] font-body-md text-base leading-relaxed mb-6">
                  Esta fecha ya ha pasado. No se permiten reservas para fechas anteriores al día de hoy.
                </p>
              </div>
            ) : (
              <div className="px-2 pb-4">
                <h3 className="font-display-lg text-xl text-[#610000] mb-4">Reservar Espacio</h3>
                <p className="text-[#595959] font-body-md text-[15px] leading-relaxed mb-8 px-2">
                  El horario de las {crearResData.time} en la zona {crearResData.zoneName}<br/>
                  para el día {crearResData.date.split('-').reverse().join('/')} está disponible.<br/>
                  ¿Deseas realizar una reserva?
                </p>
                <button 
                  onClick={() => {
                    setReservaCompartida({
                      branch: crearResData.branch,
                      date: crearResData.date,
                      time: crearResData.time,
                      zone: crearResData.zone,
                      guests: ''
                    });
                    navigate('/reservas');
                    setCrearResData(null);
                  }} 
                  className="px-10 py-2.5 bg-[#A93700] text-white rounded-xl font-bold text-base hover:bg-[#8C2D00] transition-colors shadow-sm"
                >
                  Crear Reserva
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default CalendarView;
