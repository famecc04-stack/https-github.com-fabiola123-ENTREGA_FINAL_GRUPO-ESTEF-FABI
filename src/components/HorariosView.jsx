import { useState, useEffect, useRef, useContext } from 'react';
import { ReservationContext } from '../context/ReservationContext';

// Total de mesas por zona
const ZONE_CAPACITIES = {
  salon_principal: 8,
  barra_cocktail: 4,
  salon_vip: 4,
  terraza: 5
};
const ZONE_TABLES = {
  salon_principal: ['SP-1', 'SP-2', 'SP-3', 'SP-4', 'SP-5', 'SP-6', 'SP-7', 'SP-8'],
  barra_cocktail: ['BC-1', 'BC-2', 'BC-3', 'BC-4'],
  salon_vip: ['VIP-1', 'VIP-2', 'VIP-3', 'VIP-4'],
  terraza: ['T-1', 'T-2', 'T-3', 'T-4', 'T-5']
};



// Detalle de las 4 Zonas del local
const ZONES = [
  {
    id: 'salon_principal',
    name: 'Salón Principal',
    desc: 'Mesa convencional en el salón interior climatizado, con música criolla de fondo.',
    cap: '2-8 personas',
    img: '/images/salon_principal.png',
    icon: 'table_restaurant'
  },
  {
    id: 'barra_cocktail',
    name: 'Barra Cocktail',
    desc: 'Espacio exclusivo en la barra interna donde podrás ver a nuestros baristas preparar piscos y cocteles de autor.',
    cap: '1-2 personas',
    img: '/images/barra_cocktail.png',
    icon: 'local_bar'
  },
  {
    id: 'salon_vip',
    name: 'Salón VIP',
    desc: 'Área privada elegante con atención de primer nivel, ideal para celebraciones especiales y reuniones íntimas.',
    cap: '4-12 personas',
    img: '/images/salon_vip.png',
    icon: 'workspace_premium'
  },
  {
    id: 'terraza',
    name: 'Terraza',
    desc: 'Área al aire libre rodeada de plantas y decorada con luces cálidas bohemias, perfecta para una velada relajada.',
    cap: '2-6 personas',
    img: '/images/terraza.png',
    icon: 'deck'
  }
];

function HorariosView() {
  const { reservas, ultimaReserva, setUltimaReserva } = useContext(ReservationContext);

  // useState: Filtros del mapa de mesas
  const [sede, setSede] = useState('San Borja (Sede Principal)');
  const [fecha, setFecha] = useState(() => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
  });
  const [horario, setHorario] = useState('Almuerzo (12:00 - 16:00)');

  // useState: Controla la visibilidad del banner de bienvenida de nueva reserva
  const [showBanner, setShowBanner] = useState(false);

  // useState: Estado de carga para animación de esqueleto
  const [loading, setLoading] = useState(false);

  // useState: Hora seleccionada por ambiente/zona
  const [selectedHours, setSelectedHours] = useState({
    salon_principal: '12:00',
    barra_cocktail: '12:00',
    salon_vip: '12:00',
    terraza: '12:00'
  });

  // Helper para verificar si una mesa física está ocupada
  const isTableOccupied = (zoneId, tableCode, activeHour) => {
    if (sede === 'Barranco' || sede.toLowerCase().includes('barranco')) {
      return true;
    }
    return (reservas || []).some(r => {
      const branchMatch = sede.toLowerCase().includes(r.branch.toLowerCase()) || r.branch.toLowerCase().includes(sede.toLowerCase());
      const tableMatch = r.table && (r.table.replace('Mesa ', '').trim() === tableCode || r.table.includes(tableCode));
      return branchMatch && r.date === fecha && r.zone === zoneId && r.time === activeHour && tableMatch;
    });
  };

  // useEffect: Sincronizar selectedHours al cambiar el periodo del filtro
  useEffect(() => {
    const slots = getTimeSlotsForHorario(horario);
    if (slots && slots.length > 0) {
      setSelectedHours({
        salon_principal: slots[0],
        barra_cocktail: slots[0],
        salon_vip: slots[0],
        terraza: slots[0]
      });
    }
  }, [horario]);

  // useRef: Referencias a cada tarjeta de zona para hacer scroll automático
  const zoneRefs = useRef({});

  // useEffect: Si hay una reserva recién creada, mostrar banner, navegar a su fecha/hora y hacer scroll a su zona
  useEffect(() => {
    if (!ultimaReserva) return;
    setShowBanner(true);

    // Auto-seleccionar la fecha y sede de la nueva reserva
    setFecha(ultimaReserva.date);
    const sedeMap = {
      'San Borja': 'San Borja (Sede Principal)',
      'Miraflores': 'Miraflores',
      'Barranco': 'Barranco',
      'La Molina': 'La Molina'
    };
    setSede(sedeMap[ultimaReserva.branch] || 'San Borja (Sede Principal)');

    // Auto-seleccionar el horario correcto según la hora de la reserva
    const t = ultimaReserva.time || '12:00';
    if (['12:00', '13:00', '14:00', '15:00', '16:00'].includes(t)) setHorario('Almuerzo (12:00 - 16:00)');
    else if (['16:30', '17:30'].includes(t)) setHorario('Lonche (16:30 - 18:30)');
    else setHorario('Cena (19:00 - 23:00)');

    // Auto-seleccionar la hora exacta de la reserva para esa zona
    if (ultimaReserva.zone && ultimaReserva.time) {
      setSelectedHours(prev => ({
        ...prev,
        [ultimaReserva.zone]: ultimaReserva.time
      }));
    }

    // Hacer scroll directo a la tarjeta de la zona reservada (con delay mínimo para que el DOM se monte)
    const scrollTimer = setTimeout(() => {
      const zoneCard = zoneRefs.current[ultimaReserva.zone];
      if (zoneCard) {
        zoneCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);

    // Auto-cerrar el banner tras 5 segundos
    const bannerTimer = setTimeout(() => {
      setShowBanner(false);
      setUltimaReserva(null);
    }, 5000);

    return () => { clearTimeout(scrollTimer); clearTimeout(bannerTimer); };
  }, [ultimaReserva]);

  // Asegura fecha mínima en el selector
  const [minDate, setMinDate] = useState('');
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setMinDate(`${year}-${month}-${day}`);
  }, []);

  // Simulación de carga inicial (se omite si venimos de confirmar una reserva)
  useEffect(() => {
    if (ultimaReserva) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [ultimaReserva]);

  const handleUpdateView = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const selected = new Date(fecha + 'T00:00:00');
    if (selected < today) {
      alert("No es posible consultar horarios para fechas pasadas.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 850);
  };

  const getTimeSlotsForHorario = (horarioText) => {
    if (horarioText.includes('Almuerzo')) {
      return ['12:00', '13:00', '14:00', '15:00', '16:00'];
    } else if (horarioText.includes('Lonche')) {
      return ['16:30', '17:30'];
    } else if (horarioText.includes('Cena')) {
      return ['19:00', '20:00', '21:00', '22:00'];
    }
    return [];
  };

  // Calcula cuántas mesas de una zona están ocupadas en un horario dado.
  // Usa ÚNICAMENTE el array real 'reservas' de App.jsx (mocks + sesión).
  // Lo que muestra Horarios como "Ocupado" es exactamente lo que bloquea el formulario.
  const getOccupiedTablesCount = (zoneId, timeSlot) => {
    if (sede === 'Barranco' || sede.toLowerCase().includes('barranco')) {
      return ZONE_CAPACITIES[zoneId] || 0;
    }
    return (reservas || []).filter(r => {
      const branchMatch = sede.toLowerCase().includes(r.branch.toLowerCase()) || r.branch.toLowerCase().includes(sede.toLowerCase());
      return branchMatch && r.date === fecha && r.zone === zoneId && r.time === timeSlot;
    }).length;
  };


  const timeSlots = getTimeSlotsForHorario(horario);

  return (
    <main className="mt-32 px-margin-desktop max-w-container-max mx-auto mb-stack-lg w-full">

      {/* Banner de bienvenida: nueva reserva confirmada */}
      {showBanner && ultimaReserva && (
        <div className="mb-6 bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in slide-in-from-top fade-in duration-500 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_20%_50%,#C4622D_0%,transparent_60%)]"></div>
          <span className="material-symbols-outlined text-[40px] text-secondary shrink-0">celebration</span>
          <div className="flex-grow">
            <p className="font-bold text-primary text-lg">¡Tu reserva #{ultimaReserva.id} está confirmada!</p>
            <p className="text-on-surface-variant text-sm mt-0.5">
              {ultimaReserva.zoneName} — {ultimaReserva.date.split('-').reverse().join('/')} a las {ultimaReserva.time} · {ultimaReserva.table}
            </p>
          </div>
          <button onClick={() => { setShowBanner(false); setUltimaReserva(null); }}
            className="shrink-0 text-on-surface-variant hover:text-primary p-1.5 rounded-full hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      )}
      {/* Header Section */}
      <header className="mb-stack-lg text-center md:text-left">
        <h1 className="font-display-lg text-display-lg text-primary mb-2">Plano de Mesas en Vivo</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Seguimiento de ocupación en tiempo real para las sedes de Sazón Dúo Dinámico. Gestiona la asignación de mesas y consulta el estado del servicio actual.
        </p>
      </header>

      {/* Filters Bar */}
      <div className="bg-surface-container-low p-6 rounded-xl shadow-sm mb-stack-md flex flex-wrap gap-gutter items-end border border-outline-variant/20">
        <div className="flex-1 min-w-[200px] relative">
          <label className="block font-bold text-on-surface-variant mb-2 font-title-lg">Sede</label>
          <div className="relative">
            <select 
              value={sede} 
              onChange={(e) => setSede(e.target.value)}
              className="w-full bg-transparent border-0 border-b-2 border-tertiary focus:ring-0 focus:border-primary-container outline-none py-2 font-title-lg appearance-none cursor-pointer"
            >
              <option value="San Borja (Sede Principal)">San Borja (Sede Principal)</option>
              <option value="Miraflores">Miraflores</option>
              <option value="Barranco">Barranco</option>
              <option value="La Molina">La Molina</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2 pointer-events-none">expand_more</span>
          </div>
        </div>

        <div className="flex-1 min-w-[200px] relative">
          <label className="block font-bold text-on-surface-variant mb-2 font-title-lg">Fecha</label>
          <input 
            value={fecha}
            min={minDate}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full bg-transparent border-0 border-b-2 border-tertiary focus:ring-0 focus:border-primary-container outline-none py-2 font-title-lg cursor-pointer" 
            type="date" 
          />
        </div>

        <div className="flex-1 min-w-[200px] relative">
          <label className="block font-bold text-on-surface-variant mb-2 font-title-lg">Horario de Servicio</label>
          <div className="relative">
            <select 
              value={horario} 
              onChange={(e) => setHorario(e.target.value)}
              className="w-full bg-transparent border-0 border-b-2 border-tertiary focus:ring-0 focus:border-primary-container outline-none py-2 font-title-lg appearance-none cursor-pointer"
            >
              <option>Almuerzo (12:00 - 16:00)</option>
              <option>Lonche (16:30 - 18:30)</option>
              <option>Cena (19:00 - 23:00)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2 pointer-events-none">schedule</span>
          </div>
        </div>

        <button 
          onClick={handleUpdateView}
          className="bg-secondary text-on-secondary px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          <span className="material-symbols-outlined">filter_list</span> Actualizar Vista
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mb-stack-md justify-center md:justify-start">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-label-md font-label-md">Mesa disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="text-label-md font-label-md">Mesa ocupada</span>
        </div>
      </div>
      <div className="gold-thread border-t border-secondary/20 my-stack-md w-full"></div>

      {/* Seating Plan Interactive Grid */}
      <section className="relative">
        {loading ? (
          // Skeleton Loader
          <div className="zone-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-[250px] w-full rounded-2xl border border-outline-variant/30 bg-surface-container animate-pulse"></div>
            ))}
          </div>
        ) : (
          // Seating plan main grid
          <div className="zone-grid animate-in fade-in duration-300">
            {ZONES.map((z) => {
              const totalTables = ZONE_CAPACITIES[z.id];

              const esZonaDeNuevaReserva = ultimaReserva &&
                ultimaReserva.zone === z.id &&
                ultimaReserva.date === fecha;

              return (
                <div
                  key={z.id}
                  ref={el => zoneRefs.current[z.id] = el}
                  className={`group relative bg-surface-container-lowest border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row h-auto ${
                    esZonaDeNuevaReserva
                      ? 'border-secondary/60 ring-2 ring-secondary/30 shadow-lg shadow-secondary/10'
                      : 'border-outline-variant/30 hover:border-secondary/40'
                  }`}>

                  {/* Etiqueta destacada para la nueva reserva */}
                  {esZonaDeNuevaReserva && (
                    <div className="absolute top-3 right-3 z-10 bg-secondary text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse">
                      <span className="material-symbols-outlined text-[12px]">star</span>
                      Tu Reserva
                    </div>
                  )}
                  {/* Zone Image */}
                  <div className="w-full md:w-1/3 relative min-h-[160px] md:h-auto overflow-hidden">
                    <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={z.img} alt={z.name} />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-primary/30 to-transparent"></div>
                    <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-sm p-2 rounded-xl text-primary flex items-center justify-center border border-outline-variant/20 shadow-sm">
                      <span className="material-symbols-outlined">{z.icon}</span>
                    </div>
                  </div>

                  {/* Zone Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                        <h3 className="font-display-lg text-headline-sm text-primary">{z.name}</h3>
                        <span className="text-xs text-on-surface-variant font-bold flex items-center gap-1 bg-surface-container-low px-2.5 py-1 rounded-lg border border-outline-variant/20 shadow-sm">
                          <span className="material-symbols-outlined text-sm">groups</span> {z.cap} | {totalTables} Mesas
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{z.desc}</p>

                      {/* Dropdown de Disponibilidad de Mesas por Horario */}
                      <div className="relative mb-5">
                        <select
                          value={selectedHours[z.id] || timeSlots[0] || '12:00'}
                          onChange={(e) => setSelectedHours(prev => ({ ...prev, [z.id]: e.target.value }))}
                          className="w-full bg-white border border-secondary text-secondary focus:ring-0 focus:border-secondary font-bold text-xs uppercase text-center py-2.5 px-8 rounded-lg appearance-none cursor-pointer tracking-wider"
                        >
                          {timeSlots.map(time => (
                            <option key={time} value={time}>
                              Disponibilidad de Mesas: {time}
                            </option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-2.5 text-secondary pointer-events-none text-sm font-bold">arrow_drop_down</span>
                      </div>

                      {/* Grid de Mesas */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
                        {(ZONE_TABLES[z.id] || []).map((tableCode, idx) => {
                          const isOccupied = isTableOccupied(z.id, tableCode, selectedHours[z.id] || timeSlots[0] || '12:00');
                          
                          const esMesaNueva = ultimaReserva &&
                            ultimaReserva.zone === z.id &&
                            ultimaReserva.date === fecha &&
                            (selectedHours[z.id] || timeSlots[0] || '12:00') === ultimaReserva.time &&
                            ultimaReserva.table &&
                            (ultimaReserva.table.replace('Mesa ', '').trim() === tableCode || ultimaReserva.table.includes(tableCode));

                          if (esMesaNueva) {
                            return (
                              <div key={tableCode} className="bg-secondary/10 border-2 border-secondary text-secondary p-3 rounded-xl flex flex-col justify-center items-center text-center shadow-md animate-pulse">
                                <span className="text-[11px] font-bold uppercase">Mesa {idx + 1}</span>
                                <span className="text-[10px] font-extrabold uppercase mt-0.5">¡Tu Mesa!</span>
                              </div>
                            );
                          } else if (isOccupied) {
                            return (
                              <div key={tableCode} className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex flex-col justify-center items-center text-center shadow-sm">
                                <span className="text-[11px] font-bold uppercase">Mesa {idx + 1}</span>
                                <span className="text-[10px] font-extrabold uppercase mt-0.5">Ocupado</span>
                              </div>
                            );
                          } else {
                            return (
                              <div key={tableCode} className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl flex flex-col justify-center items-center text-center shadow-sm hover:bg-green-100/50 transition-colors duration-200">
                                <span className="text-[11px] font-bold uppercase">Mesa {idx + 1}</span>
                                <span className="text-[10px] font-extrabold uppercase mt-0.5">Libre</span>
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3 text-xs text-on-surface-variant font-semibold">
                      <span className="opacity-80">Sede: {sede}</span>
                      <span className="opacity-80">Fecha: {fecha}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default HorariosView;
