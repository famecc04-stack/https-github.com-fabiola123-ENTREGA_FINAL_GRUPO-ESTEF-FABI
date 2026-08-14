import { useState, useEffect, useContext } from 'react';
import { useReservas } from '../hooks/useReservas';
import { useNavigate } from 'react-router-dom';
import { ReservationContext } from '../context/ReservationContext';

// Componente del Formulario de Reservas Multi-paso (Refactorizado con Hook useReservas)
function ReservationForm() {
  const navigate = useNavigate();
  const { setFechaConflicto } = useContext(ReservationContext);
  const {
    currentStep,
    form,
    errores,
    modalAbierto,
    setModalAbierto,
    showSuccessModal,
    reservaConfirmada,
    showConflictModal,
    setShowConflictModal,
    handleChange,
    handleNextStep,
    handlePrevStep,
    handleShowSummary,
    handleConfirmReservation,
    handleCloseSuccessModal
  } = useReservas();

  // Restricción de fecha mínima en el navegador (hoy en adelante)
  const [minDate, setMinDate] = useState('');
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setMinDate(`${year}-${month}-${day}`);
  }, []);

  // Nombres de zonas legibles
  const getZoneLabel = (zone) => {
    const labels = {
      salon_principal: 'Salón Principal (Mesa convencional)',
      barra_cocktail: 'Barra Cocktail (Barra interna)',
      salon_vip: 'Salón VIP (Mesa interna)',
      terraza: 'Terraza (mesa externa)'
    };
    return labels[zone] || '-';
  };

  return (
    <main className="pt-32 pb-stack-lg px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto selection:bg-primary-fixed selection:text-primary overflow-x-hidden">
      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-center mb-stack-lg">
        <div>
          <span className="font-label-md text-label-md text-secondary uppercase tracking-widest mb-2 block">Asegura tu Mesa</span>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-stack-sm leading-tight">
            Un viaje ancestral te espera.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
            Reserva tu momento en nuestro hogar. Experimenta la convergencia de sabores heredados y elegancia colonial.
          </p>
        </div>
        <div className="relative h-[400px] rounded-xl overflow-hidden shadow-lg group">
          <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/0 transition-all duration-700 z-10"></div>
          <img 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKu8ZUntgdwknaunzfAUFvoQnocW1Az3v9WG4CCRUJc13NbHyKNByYXDe7FowYC0mInN-vIGVsaZ0oYfll3X3hwPbp4ptuyW6T7XVpMzT6h1xfaGhHWCJBgj2Rq_XIgfxpfTO6Nl2k2Bydl6OnzO_w7dXsBTsXAx8uRnuEzZ2jawE-sOfsifRdTpLdmCHJgq2gr6Fx_IX8uo8tq9uiii8sgbaqpvPN5Rsf8y8JfjZ5uZp-5fgzOhGI" 
            alt="Interior restaurante" 
          />
        </div>
      </div>
      <div className="gold-divider mb-stack-lg"></div>

      {/* Multi-Step Form Container */}
      <section className="max-w-4xl mx-auto bg-surface-container-low border border-outline-variant/20 rounded-xl p-8 md:p-12 shadow-sm relative overflow-hidden">
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-outline-variant/30 -z-10"></div>
          <div 
            className="absolute top-1/2 left-0 h-[2px] bg-secondary transition-all duration-500 -z-10" 
            style={{ width: `${(currentStep - 1) * 50}%` }}
          ></div>
          <div className="step-indicator flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ring-4 ring-background transition-all ${
              currentStep >= 1 ? 'bg-secondary text-on-secondary' : 'bg-surface-container-highest text-on-surface-variant'
            }`}>
              {currentStep > 1 ? <span className="material-symbols-outlined text-sm">check</span> : '1'}
            </div>
            <span className={`text-xs font-bold uppercase tracking-tighter ${currentStep >= 1 ? 'text-secondary' : 'text-on-surface-variant'}`}>Detalles</span>
          </div>
          <div className="step-indicator flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ring-4 ring-background transition-all ${
              currentStep >= 2 ? 'bg-secondary text-on-secondary' : 'bg-surface-container-highest text-on-surface-variant'
            }`}>
              {currentStep > 2 ? <span className="material-symbols-outlined text-sm">check</span> : '2'}
            </div>
            <span className={`text-xs font-bold uppercase tracking-tighter ${currentStep >= 2 ? 'text-secondary' : 'text-on-surface-variant'}`}>Identidad</span>
          </div>
          <div className="step-indicator flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ring-4 ring-background transition-all ${
              currentStep >= 3 ? 'bg-secondary text-on-secondary' : 'bg-surface-container-highest text-on-surface-variant'
            }`}>
              3
            </div>
            <span className={`text-xs font-bold uppercase tracking-tighter ${currentStep >= 3 ? 'text-secondary' : 'text-on-surface-variant'}`}>Confirmar</span>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} noValidate="">
          {/* Step 1: Reservation Details */}
          {currentStep === 1 && (
            <div className="form-step active animate-in fade-in duration-300">
              <h3 className="font-display-lg text-headline-md text-primary mb-8 italic">Elige tu ambiente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-gutter gap-y-8">
                
                {/* Sede */}
                <div className="relative">
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Sede *</label>
                  <select 
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 py-2 font-body-md transition-colors appearance-none cursor-pointer" 
                    name="branch" 
                    value={form.branch} 
                    onChange={handleChange}
                    required=""
                  >
                    <option value="" disabled="">Selecciona una sede</option>
                    <option value="San Borja">San Borja - Mansión Colonial (Principal)</option>
                    <option value="Miraflores">Miraflores - Vista Costera</option>
                    <option value="Barranco">Barranco - Barrio Artístico</option>
                    <option value="La Molina">La Molina - Santuario Jardín</option>
                  </select>
                  <div className={`absolute bottom-0 left-0 h-[2px] bg-secondary transition-all ${form.branch ? 'w-full' : 'w-0'}`}></div>
                  {errores.branch && <span className="text-xs text-error mt-1 block italic">{errores.branch}</span>}
                </div>

                {/* Número de Personas */}
                <div className="relative">
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Número de Personas *</label>
                  <input 
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 py-2 font-body-md" 
                    max="20" 
                    min="1" 
                    name="guests" 
                    placeholder="ej. 2" 
                    value={form.guests} 
                    onChange={handleChange}
                    required="" 
                    type="number"
                  />
                  <div className={`absolute bottom-0 left-0 h-[2px] bg-secondary transition-all ${form.guests ? 'w-full' : 'w-0'}`}></div>
                  {errores.guests && <span className="text-xs text-error mt-1 block italic">{errores.guests}</span>}
                </div>

                {/* Fecha */}
                <div className="relative">
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Fecha de preferencia *</label>
                  <input 
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 py-2 font-body-md" 
                    name="date" 
                    min={minDate}
                    value={form.date} 
                    onChange={handleChange}
                    required="" 
                    type="date"
                  />
                  <div className={`absolute bottom-0 left-0 h-[2px] bg-secondary transition-all ${form.date ? 'w-full' : 'w-0'}`}></div>
                  {errores.date && <span className="text-xs text-error mt-1 block italic">{errores.date}</span>}
                </div>

                {/* Hora */}
                <div className="relative">
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Hora de preferencia *</label>
                  <select 
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 py-2 font-body-md transition-colors appearance-none cursor-pointer" 
                    name="time" 
                    value={form.time} 
                    onChange={handleChange}
                    required=""
                  >
                    <option value="" disabled="">Seleccione</option>
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
                  <div className={`absolute bottom-0 left-0 h-[2px] bg-secondary transition-all ${form.time ? 'w-full' : 'w-0'}`}></div>
                  {errores.time && <span className="text-xs text-error mt-1 block italic">{errores.time}</span>}
                </div>

                {/* Zona */}
                <div className="relative">
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Zona *</label>
                  <select 
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 py-2 font-body-md transition-colors appearance-none cursor-pointer" 
                    name="zone" 
                    value={form.zone} 
                    onChange={handleChange}
                    required=""
                  >
                    <option value="" disabled="">Selecciona la zona</option>
                    <option value="salon_principal">Salón Principal (Mesa convencional)</option>
                    <option value="barra_cocktail">Barra Cocktail (Barra interna)</option>
                    <option value="salon_vip">Salón VIP (Mesa interna)</option>
                    <option value="terraza">Terraza (mesa externa)</option>
                  </select>
                  <div className={`absolute bottom-0 left-0 h-[2px] bg-secondary transition-all ${form.zone ? 'w-full' : 'w-0'}`}></div>
                  {errores.zone && <span className="text-xs text-error mt-1 block italic">{errores.zone}</span>}
                </div>

                {/* Zona Image Preview */}
                <div className="flex flex-col justify-end">
                  <div className="w-full h-[180px] rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-highest flex items-center justify-center relative group/img shadow-sm transition-all duration-300">
                    {!form.zone ? (
                      <div className="text-on-surface-variant/60 flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-4xl">image</span>
                        <span className="text-xs font-semibold uppercase tracking-wider">Vista de la Zona</span>
                      </div>
                    ) : (
                      <>
                        <img 
                          src={`/images/${form.zone}.png`} 
                          alt="Vista de la zona" 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 scale-105 group-hover/img:scale-100 opacity-100" 
                        />
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </>
                    )}
                  </div>
                </div>

              </div>
              <div className="flex justify-end mt-12">
                <button 
                  className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-primary-container active:scale-95 transition-all group" 
                  onClick={handleNextStep} 
                  type="button"
                >
                  Siguiente paso
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <div className="form-step active animate-in fade-in duration-300">
              <h3 className="font-display-lg text-headline-md text-primary mb-8 italic">Información de contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-gutter gap-y-8">
                
                <div className="relative">
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Nombres *</label>
                  <input 
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 py-2 font-body-md" 
                    name="firstName" 
                    value={form.firstName} 
                    onChange={handleChange}
                    required="" 
                    type="text"
                  />
                  <div className={`absolute bottom-0 left-0 h-[2px] bg-secondary transition-all ${form.firstName ? 'w-full' : 'w-0'}`}></div>
                  {errores.firstName && <span className="text-xs text-error mt-1 block italic">{errores.firstName}</span>}
                </div>

                <div className="relative">
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Apellidos *</label>
                  <input 
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 py-2 font-body-md" 
                    name="lastName" 
                    value={form.lastName} 
                    onChange={handleChange}
                    required="" 
                    type="text"
                  />
                  <div className={`absolute bottom-0 left-0 h-[2px] bg-secondary transition-all ${form.lastName ? 'w-full' : 'w-0'}`}></div>
                  {errores.lastName && <span className="text-xs text-error mt-1 block italic">{errores.lastName}</span>}
                </div>

                <div className="relative">
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Número de Teléfono *</label>
                  <input 
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 py-2 font-body-md" 
                    name="phone" 
                    placeholder="+51 ..." 
                    value={form.phone} 
                    onChange={handleChange}
                    required="" 
                    type="tel"
                  />
                  <div className={`absolute bottom-0 left-0 h-[2px] bg-secondary transition-all ${form.phone ? 'w-full' : 'w-0'}`}></div>
                  {errores.phone && <span className="text-xs text-error mt-1 block italic">{errores.phone}</span>}
                </div>

                <div className="relative">
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Correo Electrónico *</label>
                  <input 
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 py-2 font-body-md" 
                    name="email" 
                    placeholder="nombre@correo.com" 
                    value={form.email} 
                    onChange={handleChange}
                    required="" 
                    type="email"
                  />
                  <div className={`absolute bottom-0 left-0 h-[2px] bg-secondary transition-all ${form.email ? 'w-full' : 'w-0'}`}></div>
                  {errores.email && <span className="text-xs text-error mt-1 block italic">{errores.email}</span>}
                </div>

                <div className="md:col-span-2 relative">
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Observaciones Especiales (Alergias, Eventos)</label>
                  <textarea 
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 py-2 font-body-md resize-none" 
                    name="observations" 
                    value={form.observations} 
                    onChange={handleChange}
                    rows="3"
                  ></textarea>
                  <div className={`absolute bottom-0 left-0 h-[2px] bg-secondary transition-all ${form.observations ? 'w-full' : 'w-0'}`}></div>
                </div>

              </div>
              <div className="flex justify-between mt-12">
                <button 
                  className="border border-secondary text-secondary px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-secondary-fixed-dim transition-all" 
                  onClick={handlePrevStep} 
                  type="button"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Atrás
                </button>
                <button 
                  className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-primary-container active:scale-95 transition-all group" 
                  onClick={handleShowSummary} 
                  type="button"
                >
                  Revisar Reserva
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">visibility</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </section>

      {/* Confirmation Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-margin-mobile">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setModalAbierto(false)}></div>
          <div className="bg-surface-bright max-w-xl w-full rounded-2xl shadow-2xl relative z-10 overflow-hidden transform scale-100 opacity-100 transition-all duration-300">
            <div className="bg-primary p-6 text-on-primary flex justify-between items-center">
              <h3 className="font-display-lg text-headline-sm">Verifica tus Datos</h3>
              <button className="material-symbols-outlined hover:rotate-90 transition-transform" onClick={() => setModalAbierto(false)}>close</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block font-label-md text-on-surface-variant mb-1 uppercase">Nombre del Comensal</span>
                  <p className="font-bold text-on-surface">{form.firstName} {form.lastName}</p>
                </div>
                <div>
                  <span className="block font-label-md text-on-surface-variant mb-1 uppercase">Sede</span>
                  <p className="font-bold text-on-surface">{form.branch}</p>
                </div>
                <div>
                  <span className="block font-label-md text-on-surface-variant mb-1 uppercase">Fecha y Hora</span>
                  <p className="font-bold text-on-surface">{form.date} a las {form.time}</p>
                </div>
                <div>
                  <span className="block font-label-md text-on-surface-variant mb-1 uppercase">Invitados</span>
                  <p className="font-bold text-on-surface">{form.guests} Personas</p>
                </div>
                <div>
                  <span className="block font-label-md text-on-surface-variant mb-1 uppercase">Zona</span>
                  <p className="font-bold text-on-surface">{getZoneLabel(form.zone)}</p>
                </div>
              </div>
              <div className="border-t border-outline-variant pt-4">
                <span className="block font-label-md text-on-surface-variant mb-1 uppercase">Notas</span>
                <p className="italic text-on-surface-variant">{form.observations || "Sin peticiones especiales."}</p>
              </div>
              <div className="pt-4 flex flex-col gap-3">
                <button 
                  className="w-full bg-secondary text-on-secondary py-4 rounded-xl font-bold text-lg hover:bg-secondary-container transition-all flex items-center justify-center gap-2" 
                  onClick={() => handleConfirmReservation()}
                >
                  Confirmar y Reservar
                  <span className="material-symbols-outlined">restaurant</span>
                </button>
                <button 
                  className="w-full py-2 text-on-surface-variant hover:text-primary transition-colors font-semibold" 
                  onClick={() => setModalAbierto(false)}
                >
                  Editar Información
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Éxito Premium */}
      {showSuccessModal && reservaConfirmada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface-bright rounded-3xl overflow-hidden max-w-[480px] w-full shadow-2xl border border-outline-variant/30 animate-in scale-in duration-300 flex flex-col relative z-10">
            {/* Cabecera Premium Gradient */}
            <div className="bg-primary p-8 flex flex-col items-center justify-center text-center text-on-primary relative">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/40 mb-4 animate-bounce">
                <span className="material-symbols-outlined text-3xl font-extrabold text-white">check_circle</span>
              </div>
              <h3 className="font-display-lg text-headline-md italic mb-1 text-on-primary">¡Reserva Confirmada!</h3>
              <p className="text-white/80 font-body-sm text-xs font-semibold">Tu experiencia está completamente asegurada</p>
            </div>

            {/* Detalles de la Confirmación */}
            <div className="p-8 flex-1 flex flex-col">
              {/* Código Destacado */}
              <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/20 text-center mb-6 shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary block mb-1">Código de Reserva</span>
                <span className="font-display-lg text-headline-sm text-primary tracking-widest font-extrabold"># {reservaConfirmada.id}</span>
              </div>

              {/* Grid de Datos */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/15 flex flex-col">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-1">Fecha</span>
                  <span className="font-body-md font-bold text-sm text-on-surface">{reservaConfirmada.date.split('-').reverse().join('/')}</span>
                </div>
                <div className="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/15 flex flex-col">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-1">Hora</span>
                  <span className="font-body-md font-bold text-sm text-on-surface">{reservaConfirmada.time}</span>
                </div>
                <div className="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/15 flex flex-col">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-1">Ambiente</span>
                  <span className="font-body-md font-bold text-xs text-on-surface truncate">{reservaConfirmada.zoneName}</span>
                </div>
                <div className="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/15 flex flex-col">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-1">Mesa Asignada</span>
                  <span className="font-body-md font-bold text-sm text-secondary">{reservaConfirmada.table}</span>
                </div>
              </div>

              {/* Nota de envío de correo */}
              <div className="flex items-start gap-3 bg-surface-container rounded-2xl p-4 border border-outline-variant/20 text-xs mb-8 text-on-surface-variant leading-relaxed">
                <span className="material-symbols-outlined text-secondary text-[20px]">mail</span>
                <div>
                  <span className="font-bold text-on-surface">Confirmación enviada</span>
                  <p className="mt-0.5">El código de reserva fue enviado a: <strong className="text-secondary font-bold break-all">{reservaConfirmada.email}</strong></p>
                </div>
              </div>

              {/* Botón CTA de Navegación */}
              <button 
                onClick={() => {
                  handleCloseSuccessModal();
                  navigate('/horarios');
                }}
                className="w-full bg-primary text-on-primary hover:bg-primary-container p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all text-sm cursor-pointer"
              >
                Ver mi Reserva en Horarios
                <span className="material-symbols-outlined text-sm">calendar_view_day</span>
              </button>
              
              <span className="text-[10px] text-on-surface-variant/40 text-center font-bold mt-3 block">
                Serás redirigido al plano de mesas para ver tu mesa activa
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Conflicto (Ocupación Completa) */}
      {showConflictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface-bright rounded-3xl border border-outline-variant/30 max-w-[480px] w-full p-8 shadow-2xl text-center animate-in scale-in duration-300 relative z-10">
            <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl font-extrabold text-error">warning</span>
            </div>
            
            <h3 className="font-display-lg text-headline-md text-primary italic mb-4">Mesa no disponible</h3>
            
            <p className="text-on-surface-variant font-body-md mb-8 leading-relaxed">
              No hay mesas disponibles en este ambiente para el horario seleccionado. Por favor, elija otro horario o seleccione otro ambiente.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => setShowConflictModal(false)}
                className="bg-primary text-on-primary hover:bg-primary-container px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-all w-full sm:w-auto shadow-md cursor-pointer"
              >
                Cambiar Selección
              </button>
              <button 
                onClick={() => { 
                  setShowConflictModal(false); 
                  setFechaConflicto(form.date);
                  navigate('/calendario');
                }}
                className="border border-outline hover:bg-surface-container-high px-5 py-2.5 rounded-lg font-bold active:scale-95 transition-all text-on-surface-variant w-full sm:w-auto text-center cursor-pointer"
              >
                Ver Calendario
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ReservationForm;
