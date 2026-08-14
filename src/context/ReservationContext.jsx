import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { reservationService } from '../services/reservationService';
import { useDispatch } from 'react-redux';
import { showToast, setGlobalLoading } from '../store/uiSlice';

export const ReservationContext = createContext();

export const ReservationProvider = ({ children }) => {
  const [reservas, setReservas] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [reservaCompartida, setReservaCompartida] = useState(null);
  const [fechaConflicto, setFechaConflicto] = useState(null);
  const [ultimaReserva, setUltimaReserva] = useState(null);

  const dispatch = useDispatch();

  // Carga inicial de reservas simulando una API
  useEffect(() => {
    let mounted = true;
    const fetchReservas = async () => {
      try {
        const data = await reservationService.getReservations();
        if (mounted) {
          setReservas(data);
        }
      } catch (error) {
        if (mounted) {
          dispatch(showToast({ message: 'Error cargando reservas', type: 'error' }));
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };
    fetchReservas();
    return () => { mounted = false; };
  }, [dispatch]);

  // Manejador para crear una reserva globalmente
  const crearReserva = useCallback(async (reservaFinal) => {
    dispatch(setGlobalLoading(true));
    try {
      const nuevaReserva = await reservationService.createReservation(reservaFinal);
      setReservas(prev => [...prev, nuevaReserva]);
      setUltimaReserva(nuevaReserva);
      dispatch(showToast({ message: 'Reserva confirmada con éxito', type: 'success' }));
      return nuevaReserva;
    } catch (error) {
      dispatch(showToast({ message: 'Ocurrió un error al reservar', type: 'error' }));
      throw error;
    } finally {
      dispatch(setGlobalLoading(false));
    }
  }, [dispatch]);

  const value = useMemo(() => ({
    reservas,
    isInitializing,
    reservaCompartida,
    setReservaCompartida,
    fechaConflicto,
    setFechaConflicto,
    ultimaReserva,
    setUltimaReserva,
    crearReserva,
  }), [reservas, isInitializing, reservaCompartida, fechaConflicto, ultimaReserva, crearReserva]);

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
};
