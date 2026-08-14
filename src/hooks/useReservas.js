import { useState, useEffect } from 'react';

const ZONE_LABELS = {
  salon_principal: 'Salón Principal',
  barra_cocktail: 'Barra Cocktail',
  salon_vip: 'Salón VIP',
  terraza: 'Terraza'
};

const AMBIENT_TABLES = {
  salon_principal: ['SP-1', 'SP-2', 'SP-3', 'SP-4', 'SP-5', 'SP-6', 'SP-7', 'SP-8'],
  barra_cocktail: ['BC-1', 'BC-2', 'BC-3', 'BC-4'],
  salon_vip: ['VIP-1', 'VIP-2', 'VIP-3', 'VIP-4'],
  terraza: ['T-1', 'T-2', 'T-3', 'T-4', 'T-5']
};

export function useReservas(reservaPrevia, onLimpiarCompartida, reservas, onCrearReserva, onVerCalendarioDiario) {

  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState({
    branch: '', guests: '', date: '', time: '', zone: '',
    firstName: '', lastName: '', phone: '', email: '', observations: ''
  });

  const [errores, setErrores] = useState({});

  const [modalAbierto, setModalAbierto] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [reservaConfirmada, setReservaConfirmada] = useState(null);

  const [showConflictModal, setShowConflictModal] = useState(false);

  useEffect(() => {
    if (reservaPrevia) {
      setForm(prev => ({
        ...prev,
        branch: reservaPrevia.branch || '',
        guests: reservaPrevia.guests || '',
        date: reservaPrevia.date || '',
        time: reservaPrevia.time || '',
        zone: reservaPrevia.zone || ''
      }));
      onLimpiarCompartida();
    }
  }, [reservaPrevia]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: null }));
  };

  const validateStep = (step) => {
    let tempErrores = {};
    let valid = true;

    if (step === 1) {
      if (!form.branch) { tempErrores.branch = 'Por favor selecciona una sede'; valid = false; }
      if (!form.guests || form.guests < 1 || form.guests > 20) { tempErrores.guests = 'Requerido (1-20)'; valid = false; }
      if (!form.date) {
        tempErrores.date = 'Selecciona una fecha válida'; valid = false;
      } else {
        const today = new Date(); today.setHours(0,0,0,0);
        if (new Date(form.date + 'T00:00:00') < today) {
          tempErrores.date = 'No se permiten reservas para fechas pasadas'; valid = false;
        }
      }
      if (!form.time) { tempErrores.time = 'Selecciona un horario válido'; valid = false; }
      if (!form.zone) { tempErrores.zone = 'Por favor selecciona una zona'; valid = false; }
    } else if (step === 2) {
      if (!form.firstName) { tempErrores.firstName = 'El nombre es requerido'; valid = false; }
      if (!form.lastName) { tempErrores.lastName = 'El apellido es requerido'; valid = false; }
      if (!form.phone) { tempErrores.phone = 'Teléfono válido requerido'; valid = false; }
      if (!form.email || !form.email.includes('@')) { tempErrores.email = 'Correo electrónico válido requerido'; valid = false; }
    }

    setErrores(tempErrores);
    return valid;
  };

  const obtenerMesasOcupadas = () => {
    if (form.branch === 'Barranco') {
      return AMBIENT_TABLES[form.zone] || [];
    }
    return (reservas || [])
      .filter(r => r.branch === form.branch && r.date === form.date && r.time === form.time && r.zone === form.zone)
      .map(r => r.table.replace('Mesa ', '').trim());
  };

  const obtenerSiguienteMesaDisponible = () => {
    const mesasFisicas = AMBIENT_TABLES[form.zone] || [];
    const mesasOcupadas = obtenerMesasOcupadas();
    return mesasFisicas.find(m => !mesasOcupadas.includes(m)) || null;
  };

  // Existe conflicto si no hay ninguna mesa física disponible en esa zona para esa fecha/hora/sede
  const existeConflicto = () => {
    if (!form.branch || !form.date || !form.time || !form.zone) return false;
    return obtenerSiguienteMesaDisponible() === null;
  };

  const handleNextStep = () => {
    if (!validateStep(1)) return;
    if (existeConflicto()) { setShowConflictModal(true); return; }
    setCurrentStep(2);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handlePrevStep = () => setCurrentStep(1);

  const handleShowSummary = () => {
    if (!validateStep(2)) return;
    if (existeConflicto()) { setShowConflictModal(true); return; }
    setModalAbierto(true);
  };

  const handleConfirmReservation = () => {
    const mesaAsignada = obtenerSiguienteMesaDisponible();
    if (!mesaAsignada) {
      setModalAbierto(false);
      setShowConflictModal(true);
      return;
    }

    const idGenerado = `RES-${String((reservas || []).length + 1).padStart(3, '0')}`;

    const reservaFinal = {
      id: idGenerado,
      status: 'Confirmada',
      branch: form.branch,
      date: form.date,
      time: form.time,
      zone: form.zone,
      zoneName: ZONE_LABELS[form.zone] || 'Salón Principal',
      table: `Mesa ${mesaAsignada}`,
      party: form.guests === '1' ? '1 Persona' : `${form.guests} Personas`,
      obs: form.observations,
      email: form.email,
      nombre: `${form.firstName} ${form.lastName}`
    };

    onCrearReserva(reservaFinal);

    setReservaConfirmada(reservaFinal);
    setModalAbierto(false);
    setShowSuccessModal(true);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setReservaConfirmada(null);
    setForm({ branch: '', guests: '', date: '', time: '', zone: '', firstName: '', lastName: '', phone: '', email: '', observations: '' });
    setCurrentStep(1);
  };

  return {
    currentStep, setCurrentStep,
    form, setForm,
    errores, setErrores,
    modalAbierto, setModalAbierto,
    showSuccessModal, setShowSuccessModal,
    reservaConfirmada,
    showConflictModal, setShowConflictModal,
    handleChange,
    validateStep,
    handleNextStep,
    handlePrevStep,
    handleShowSummary,
    handleConfirmReservation,
    handleCloseSuccessModal
  };
}
