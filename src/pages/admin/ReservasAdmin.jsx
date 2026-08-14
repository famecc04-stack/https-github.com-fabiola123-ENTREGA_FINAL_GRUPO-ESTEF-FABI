import React, { useEffect, useState, useMemo } from 'react';
import { reservationService } from '../../services/reservationService';

const ReservasAdmin = () => {
  const [reservas, setReservas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    cliente: '',
    fecha: '',
    hora: '',
    sede: '',
    ambiente: '',
    estado: ''
  });

  // Estados para el flujo de cancelación
  const [cancelData, setCancelData] = useState(null); // null | { id: string, step: 1 | 2 }
  const [authData, setAuthData] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchReservas();
  }, []);

  // Volver a la página 1 cuando los filtros cambien
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const fetchReservas = async () => {
    setIsLoading(true);
    try {
      const data = await reservationService.getReservations();
      // Mostrar reservas ordenadas por fecha
      const sorted = [...data].sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
      setReservas(sorted);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await reservationService.updateReservationStatus(id, newStatus);
      // Actualizar estado local
      setReservas(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmada':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold uppercase tracking-wider">Confirmada</span>;
      case 'Pendiente':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold uppercase tracking-wider">Pendiente</span>;
      case 'Cancelada':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold uppercase tracking-wider">Cancelada</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  // Filtrar reservas según los filtros seleccionados
  const filteredReservas = useMemo(() => {
    return reservas.filter(reserva => {
      const matchCliente = filters.cliente === '' || (reserva.nombre || '').toLowerCase().includes(filters.cliente.toLowerCase());
      const matchFecha = filters.fecha === '' || reserva.date === filters.fecha;
      const matchHora = filters.hora === '' || reserva.time === filters.hora;
      const matchSede = filters.sede === '' || reserva.branch === filters.sede;
      const matchAmbiente = filters.ambiente === '' || reserva.zoneName === filters.ambiente;
      const matchEstado = filters.estado === '' || reserva.status === filters.estado;

      return matchCliente && matchFecha && matchHora && matchSede && matchAmbiente && matchEstado;
    });
  }, [reservas, filters]);

  // Calcular paginación
  const { currentReservas, totalPages, indexOfFirstItem, indexOfLastItem } = useMemo(() => {
    const totalPages = Math.ceil(filteredReservas.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReservas = filteredReservas.slice(indexOfFirstItem, indexOfLastItem);
    return { currentReservas, totalPages, indexOfFirstItem, indexOfLastItem };
  }, [filteredReservas, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Gestión de Reservas</h1>
          <p className="text-on-surface-variant">Administra y filtra las reservas de todas las sedes</p>
        </div>
        <button 
          onClick={fetchReservas}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-medium"
        >
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          Actualizar
        </button>
      </div>

      <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant text-sm text-on-surface-variant">
                <th className="p-4 font-semibold w-[8%]">ID</th>
                <th className="p-4 font-semibold w-[22%]">Cliente</th>
                <th className="p-4 font-semibold w-[18%]">Fecha y Hora</th>
                <th className="p-4 font-semibold w-[18%]">Sede y Mesa</th>
                <th className="p-4 font-semibold w-[10%]">Personas</th>
                <th className="p-4 font-semibold w-[12%]">Estado</th>
                <th className="p-4 font-semibold w-[12%] text-right">Acciones</th>
              </tr>
              {/* FILTROS INTEGRADOS EN LA CABECERA */}
              <tr className="bg-surface-container-lowest border-b-2 border-outline-variant text-sm shadow-sm">
                <th className="p-2"></th>
                <th className="p-2 align-top">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
                    <input 
                      type="text" 
                      placeholder="Buscar cliente..." 
                      value={filters.cliente}
                      onChange={e => setFilters({...filters, cliente: e.target.value})}
                      className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary font-normal"
                    />
                  </div>
                </th>
                <th className="p-2 align-top">
                  <div className="flex flex-col gap-1">
                    <input 
                      type="date" 
                      value={filters.fecha}
                      onChange={e => setFilters({...filters, fecha: e.target.value})}
                      className="w-full px-2 py-1.5 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary font-normal text-xs"
                    />
                    <select 
                      value={filters.hora}
                      onChange={e => setFilters({...filters, hora: e.target.value})}
                      className="w-full px-2 py-1.5 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary font-normal text-xs"
                    >
                      <option value="">Todas las horas</option>
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
                </th>
                <th className="p-2 align-top">
                  <div className="flex flex-col gap-1">
                    <select 
                      value={filters.sede}
                      onChange={e => setFilters({...filters, sede: e.target.value})}
                      className="w-full px-2 py-1.5 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary font-normal text-xs"
                    >
                      <option value="">Todas las sedes</option>
                      <option value="San Borja">San Borja</option>
                      <option value="Miraflores">Miraflores</option>
                      <option value="Barranco">Barranco</option>
                      <option value="La Molina">La Molina</option>
                    </select>
                    <select 
                      value={filters.ambiente}
                      onChange={e => setFilters({...filters, ambiente: e.target.value})}
                      className="w-full px-2 py-1.5 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary font-normal text-xs"
                    >
                      <option value="">Todos los ambientes</option>
                      <option value="Salón Principal">Salón Principal (Mesa convencional)</option>
                      <option value="Barra Cocktail">Barra Cocktail (Barra interna)</option>
                      <option value="Salón VIP">Salón VIP (Mesa interna)</option>
                      <option value="Terraza">Terraza (mesa externa)</option>
                    </select>
                  </div>
                </th>
                <th className="p-2"></th>
                <th className="p-2 align-top">
                  <select 
                    value={filters.estado}
                    onChange={e => setFilters({...filters, estado: e.target.value})}
                    className="w-full px-2 py-1.5 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary font-normal text-xs"
                  >
                    <option value="">Todos</option>
                    <option value="Confirmada">Confirmada</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </th>
                <th className="p-2 align-top">
                  <button 
                    onClick={() => setFilters({cliente:'', fecha:'', hora:'', sede:'', ambiente:'', estado:''})}
                    className="w-full py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors font-medium text-xs text-on-surface-variant flex items-center justify-center gap-1 border border-transparent hover:border-outline-variant"
                  >
                    <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
                    Limpiar
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : currentReservas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                    <p>No se encontraron reservas con esos filtros.</p>
                  </td>
                </tr>
              ) : (
                currentReservas.map((reserva) => (
                  <tr key={reserva.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 font-mono text-xs text-on-surface-variant">{reserva.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-on-surface">{reserva.nombre || 'Cliente'}</p>
                      {reserva.obs && <p className="text-xs text-secondary mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">info</span> {reserva.obs}</p>}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-on-surface">{reserva.date}</p>
                      <p className="text-sm text-on-surface-variant">{reserva.time}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-on-surface">{reserva.branch}</p>
                      <p className="text-sm text-on-surface-variant">{reserva.table} ({reserva.zoneName})</p>
                    </td>
                    <td className="p-4 text-on-surface-variant font-medium">{reserva.party}</td>
                    <td className="p-4">{getStatusBadge(reserva.status)}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        {reserva.status !== 'Confirmada' && (
                          <button 
                            onClick={() => handleUpdateStatus(reserva.id, 'Confirmada')}
                            title="Confirmar Reserva"
                            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          >
                            <span className="material-symbols-outlined">check</span>
                          </button>
                        )}
                        {reserva.status !== 'Cancelada' && (
                          <button 
                            onClick={() => setCancelData({ id: reserva.id, step: 1 })}
                            title="Cancelar Reserva"
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        )}
                        {reserva.status !== 'Pendiente' && (
                          <button 
                            onClick={() => handleUpdateStatus(reserva.id, 'Pendiente')}
                            title="Marcar como Pendiente"
                            className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
                          >
                            <span className="material-symbols-outlined">schedule</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface border border-outline-variant rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-on-surface-variant font-medium">
            Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredReservas.length)} de {filteredReservas.length} reservas
          </p>
          <div className="flex gap-2 items-center">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-1 text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              Anterior
            </button>
            <span className="text-sm font-bold text-on-surface mx-2">
              Página {currentPage} de {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-1 text-on-surface"
            >
              Siguiente
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Popups de Cancelación */}
      {cancelData && cancelData.step === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface-bright rounded-3xl border border-outline-variant/30 max-w-sm w-full p-8 shadow-2xl text-center animate-in scale-in duration-300 relative z-10">
            <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-6 animate-bounce">
              <span className="material-symbols-outlined text-3xl font-extrabold text-error">warning</span>
            </div>
            <h3 className="font-display-lg text-headline-sm text-primary mb-2">¿Cancelar Reserva?</h3>
            <p className="text-on-surface-variant font-body-md mb-8">Esta acción no se puede deshacer. ¿Estás seguro de cancelar la reserva {cancelData.id}?</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setCancelData(null)}
                className="px-6 py-2 rounded-lg font-bold hover:bg-surface-container-high transition-colors text-on-surface-variant"
              >
                No, volver
              </button>
              <button 
                onClick={() => setCancelData({ id: cancelData.id, step: 2 })}
                className="bg-error text-on-error px-6 py-2 rounded-lg font-bold hover:bg-error/90 transition-colors shadow-md active:scale-95"
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelData && cancelData.step === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface-bright rounded-3xl border border-outline-variant/30 max-w-sm w-full p-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-300 relative z-10">
            <h3 className="font-display-lg text-headline-sm text-primary mb-2 text-center">Autorización Requerida</h3>
            <p className="text-on-surface-variant font-body-sm mb-6 text-center">Ingresa tus credenciales de administrador para proceder con la cancelación de la reserva {cancelData.id}.</p>
            
            <div className="space-y-4 mb-6 text-left">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1 transition-colors group-focus-within:text-primary">Usuario</label>
                <input 
                  type="text"
                  value={authData.username}
                  onChange={e => setAuthData({...authData, username: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Administrador"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1 transition-colors group-focus-within:text-primary">Contraseña</label>
                <input 
                  type="password"
                  value={authData.password}
                  onChange={e => setAuthData({...authData, password: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="•••••••••••••"
                />
              </div>
              {authError && (
                <div className="bg-error/10 border border-error/20 rounded-lg p-2 animate-in slide-in-from-top-2 duration-300">
                  <p className="text-error text-xs font-semibold text-center flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {authError}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => {
                  if (authData.username === 'Administrador' && authData.password === 'Sabiduría#2026') {
                    handleUpdateStatus(cancelData.id, 'Cancelada');
                    setCancelData(null);
                    setAuthData({username: '', password: ''});
                    setAuthError('');
                  } else {
                    setAuthError('Credenciales incorrectas');
                    // Resetear el error despues de un tiempo para poder re-animar
                    setTimeout(() => setAuthError(''), 3000);
                  }
                }}
                className="bg-primary text-on-primary w-full py-3 rounded-lg font-bold hover:bg-primary-container hover:shadow-lg transition-all duration-300 active:scale-95 group relative overflow-hidden"
              >
                <span className="relative z-10">Autorizar y Cancelar</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </button>
              <button 
                onClick={() => {
                  setCancelData(null);
                  setAuthData({username: '', password: ''});
                  setAuthError('');
                }}
                className="w-full py-2 rounded-lg font-bold hover:bg-surface-container-high transition-colors text-on-surface-variant active:scale-95"
              >
                Atrás
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservasAdmin;
