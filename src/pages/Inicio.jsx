import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import Carousel from '../components/Carousel';
import { menuService } from '../services/menuService';

function Inicio() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('entradas');
  
  // Estado para el menú dinámico
  const [digitalMenu, setDigitalMenu] = useState({
    entradas: [],
    piqueos: [],
    fondos: [],
    postres: [],
    bebidas: []
  });
  
  const [carouselItems, setCarouselItems] = useState([]);
  const [specialtyItems, setSpecialtyItems] = useState([]);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const data = await menuService.getMenu();
        const availableItems = data.filter(item => item.available);
        
        // Agrupar por categoría
        const grouped = {
          entradas: availableItems.filter(i => i.category === 'Entradas'),
          piqueos: availableItems.filter(i => i.category === 'Piqueos'),
          fondos: availableItems.filter(i => i.category === 'Fondos'),
          postres: availableItems.filter(i => i.category === 'Postres'),
          bebidas: availableItems.filter(i => i.category === 'Bebidas')
        };
        
        setDigitalMenu(grouped);
        
        // Platos específicos para el carrusel (Agregando más platos para que haya más de dos/tres opciones)
        const cIds = ['PL-007', 'PL-008', 'PL-001', 'PL-002', 'PL-004', 'PL-012'];
        const cItems = cIds.map(id => availableItems.find(i => i.id === id)).filter(Boolean);
        setCarouselItems(cItems);

        // Platos específicos para especialidades (Seco, Carapulcra, Arroz con Pollo)
        const sIds = ['PL-009', 'PL-011', 'PL-010'];
        const sItems = sIds.map(id => availableItems.find(i => i.id === id)).filter(Boolean);
        setSpecialtyItems(sItems);
        
      } catch (error) {
        console.error('Error fetching menu for public site:', error);
      }
    };
    fetchMenuData();
  }, []);

  // Prevenir scroll del cuerpo de la página cuando el drawer del menú digital está abierto
  useEffect(() => {
    if (menuAbierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuAbierto]);

  return (
    <div className="selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Hero Section */}
      <Hero />

      {/* Action Bento Grid */}
      <section className="py-stack-lg px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-gutter">
          {/* Card 1: Reservar */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_30px_-15px_rgba(74,50,16,0.08)] border border-outline-variant/20 hover:-translate-y-2 transition-all group">
            <span className="material-symbols-outlined text-[40px] mb-4 group-hover:scale-110 transition-transform block">restaurant_menu</span>
            <h3 className="font-headline-md text-headline-md text-primary mb-2">Reservar mesa</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">Asegura tu lugar en la mesa más cotizada de Lima.</p>
            <button onClick={() => navigate('/reservas')} className="text-secondary font-label-md text-label-md flex items-center gap-1 hover:underline">
              Ver más <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          {/* Card 2: Horarios */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_30px_-15px_rgba(74,50,16,0.08)] border border-outline-variant/20 hover:-translate-y-2 transition-all group">
            <span className="material-symbols-outlined text-[40px] mb-4 group-hover:scale-110 transition-transform block">schedule</span>
            <h3 className="font-headline-md text-headline-md text-primary mb-2">Horarios</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">Estamos listos para recibirte de Lunes a Domingo.</p>
            <button onClick={() => navigate('/horarios')} className="text-secondary font-label-md text-label-md flex items-center gap-1 hover:underline">
              Ver más <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          {/* Card 3: Calendario */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_30px_-15px_rgba(74,50,16,0.08)] border border-outline-variant/20 hover:-translate-y-2 transition-all group">
            <span className="material-symbols-outlined text-[40px] mb-4 group-hover:scale-110 transition-transform block">event</span>
            <h3 className="font-headline-md text-headline-md text-primary mb-2">Calendario</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">Disponibilidad en vivo, zonas y reservas en tiempo real.</p>
            <button onClick={() => navigate('/calendario')} className="text-secondary font-label-md text-label-md flex items-center gap-1 hover:underline">
              Ver más <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          {/* Card 4: Sedes */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_30px_-15px_rgba(74,50,16,0.08)] border border-outline-variant/20 hover:-translate-y-2 transition-all group">
            <span className="material-symbols-outlined text-[40px] mb-4 group-hover:scale-110 transition-transform block">location_on</span>
            <h3 className="font-headline-md text-headline-md text-primary mb-2">Sedes</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">Cuatro ubicaciones emblemáticas cerca de ti.</p>
            <button className="text-secondary font-label-md text-label-md flex items-center gap-1 hover:underline">
              Ver más <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Dishes Carousel */}
      <Carousel items={carouselItems} />

      {/* About Section */}
      <section className="py-stack-lg px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack-lg items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div 
                  className="w-full aspect-square bg-cover bg-center rounded-2xl shadow-xl" 
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAAo4P3zs7BTSRpKRSyvLgIQxXACBtpjhrpggnxSDNhXYpVFvmGSRYpSmtNaXlJujC3iVjQUk_QupymQ7f4LmXLvcL4Ax9HVe8-oqaC22hKDtw7rmU1DI2HwYmbV344ol5LsM5gN067NHkitETb3IIm-IWWgK6Pc0iH1lYBLADb2hvQdFjL-OhB3u4xTPrihu0yWgyDvJDerHx-4HQRvq0yOaoEkgs6zdczPs0dmXNuiZ1g8Gh2BdSX')" }}
                ></div>
                <div className="absolute -bottom-10 -right-10 hidden lg:block w-64 h-64 border-[12px] border-tertiary-fixed rounded-2xl z-[-1]"></div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-stack-md">
              <span className="font-label-md text-label-md text-secondary uppercase tracking-widest">Nuestra Herencia</span>
              <h2 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-primary">Sazón que trasciende generaciones</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                En Sazón Dúo Dinámico, creemos que la cocina es el hilo que une nuestro pasado colonial con el vibrante presente limeño. Nuestra misión es preservar las técnicas ancestrales mientras elevamos el producto peruano a nuevas cumbres de sofisticación.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-6">
                <div>
                  <h5 className="font-title-lg text-title-lg text-primary mb-2">Visión</h5>
                  <p className="font-body-md text-body-md text-on-surface-variant">Ser el referente mundial de la alta cocina criolla auténtica.</p>
                </div>
                <div>
                  <h5 className="font-title-lg text-title-lg text-primary mb-2">Misión</h5>
                  <p className="font-body-md text-body-md text-on-surface-variant">Honrar los ingredientes locales mediante procesos artesanales.</p>
                </div>
              </div>
              <div className="pt-6">
                <div className="gold-thread mb-8"></div>
                <div className="flex flex-wrap gap-4">
                  <span className="bg-surface-container-high text-tertiary font-label-md px-4 py-1 rounded-full border border-outline/10">Tradición</span>
                  <span className="bg-surface-container-high text-tertiary font-label-md px-4 py-1 rounded-full border border-outline/10">Innovación</span>
                  <span className="bg-surface-container-high text-tertiary font-label-md px-4 py-1 rounded-full border border-outline/10">Sostenibilidad</span>
                  <span className="bg-surface-container-high text-tertiary font-label-md px-4 py-1 rounded-full border border-outline/10">Hospitalidad</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Gallery */}
      <section className="py-stack-lg px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-container-max mx-auto text-center mb-stack-lg">
          <h2 className="font-display-lg text-headline-lg text-primary">Especialidades del Chef</h2>
          <div className="gold-thread mt-4 max-w-xs mx-auto"></div>
        </div>
        <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {specialtyItems.map((item, idx) => (
            <div key={idx} className="bg-surface-container-lowest overflow-hidden rounded-xl border border-outline-variant/30 group">
              <div className="h-64 overflow-hidden relative bg-surface-container-highest">
                {item.image ? (
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={item.image} alt={item.name}/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-6xl">restaurant</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h4 className="font-display-lg text-headline-sm text-primary mb-3">{item.name}</h4>
                <p className="font-body-md text-body-md text-on-surface-variant mb-4 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-secondary font-bold">S/ {Math.round(item.price)}</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Branches Section */}
      <section className="py-stack-lg px-margin-mobile md:px-margin-desktop bg-surface-container-high/60">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-stack-lg">
            <span className="font-label-lg text-secondary uppercase tracking-widest text-xs font-semibold block mb-1">ENCUÉNTRANOS</span>
            <h2 className="font-display-lg text-headline-lg text-primary">Nuestras Sedes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {/* San Borja */}
            <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-secondary text-[22px]">location_on</span>
                  <h4 className="font-title-lg text-title-lg text-primary font-bold">San Borja</h4>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6 min-h-[48px]">Av. Javier Prado Este 2450<br/>(Principal)</p>
              </div>
              <button 
                onClick={() => alert('Abriendo mapas para San Borja...')}
                className="w-full border border-secondary text-secondary py-2.5 rounded-full font-label-md flex items-center justify-center gap-2 hover:bg-secondary hover:text-white transition-all text-xs uppercase tracking-wider font-semibold"
              >
                Cómo llegar
                <span className="material-symbols-outlined text-sm">directions</span>
              </button>
            </div>
            {/* Miraflores */}
            <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-secondary text-[22px]">location_on</span>
                  <h4 className="font-title-lg text-title-lg text-primary font-bold">Miraflores</h4>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6 min-h-[48px]">Calle Lima 120, Parque Kennedy</p>
              </div>
              <button 
                onClick={() => alert('Abriendo mapas para Miraflores...')}
                className="w-full border border-secondary text-secondary py-2.5 rounded-full font-label-md flex items-center justify-center gap-2 hover:bg-secondary hover:text-white transition-all text-xs uppercase tracking-wider font-semibold"
              >
                Cómo llegar
                <span className="material-symbols-outlined text-sm">directions</span>
              </button>
            </div>
            {/* Barranco */}
            <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-secondary text-[22px]">location_on</span>
                  <h4 className="font-title-lg text-title-lg text-primary font-bold">Barranco</h4>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6 min-h-[48px]">Av. Pedro de Osma 302</p>
              </div>
              <button 
                onClick={() => alert('Abriendo mapas para Barranco...')}
                className="w-full border border-secondary text-secondary py-2.5 rounded-full font-label-md flex items-center justify-center gap-2 hover:bg-secondary hover:text-white transition-all text-xs uppercase tracking-wider font-semibold"
              >
                Cómo llegar
                <span className="material-symbols-outlined text-sm">directions</span>
              </button>
            </div>
            {/* La Molina */}
            <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-secondary text-[22px]">location_on</span>
                  <h4 className="font-title-lg text-title-lg text-primary font-bold">La Molina</h4>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6 min-h-[48px]">Alameda del Corregidor 540</p>
              </div>
              <button 
                onClick={() => alert('Abriendo mapas para La Molina...')}
                className="w-full border border-secondary text-secondary py-2.5 rounded-full font-label-md flex items-center justify-center gap-2 hover:bg-secondary hover:text-white transition-all text-xs uppercase tracking-wider font-semibold"
              >
                Cómo llegar
                <span className="material-symbols-outlined text-sm">directions</span>
              </button>
            </div>
          </div>

          {/* Horario de atención Banner unificado */}
          <div className="mt-12 bg-white border border-primary/30 rounded-2xl p-5 text-center max-w-5xl mx-auto shadow-sm flex flex-col items-center justify-center gap-1 hover:border-primary/60 transition-all duration-300">
            <span className="font-title-lg text-primary font-bold tracking-widest uppercase text-xs">Horario de atención</span>
            <span className="text-on-surface-variant font-display-md text-headline-sm font-semibold">12:00 a 23:00</span>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-stack-lg px-margin-mobile md:px-margin-desktop bg-surface overflow-hidden">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-stack-lg">
            <h2 className="font-display-lg text-headline-lg text-primary italic">"Inigualable, cada bocado te cuenta una historia diferente del Perú."</h2>
            <p className="font-label-md text-label-md text-on-surface-variant mt-4">— Crítica Gastronómica, El Comercio</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md mt-12">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/10">
              <div className="flex gap-1 mb-4">
                <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface mb-6 italic">"Una verdadera joya de la gastronomía. La atención al detalle en cada plato y la atmósfera acogedora hacen de esta experiencia algo inolvidable."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">AL</div>
                <div>
                  <h6 className="font-title-lg text-title-lg leading-tight">Alejandro Lozano</h6>
                  <p className="text-on-surface-variant text-sm">Crítico Culinario</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/10">
              <div className="flex gap-1 mb-4">
                <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface mb-6 italic">"Una propuesta audaz que respeta la tradición. Los sabores están perfectamente equilibrados y la presentación es simplemente magistral."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary font-bold">MR</div>
                <div>
                  <h6 className="font-title-lg text-title-lg leading-tight">Mariana Robles</h6>
                  <p className="text-on-surface-variant text-sm">Editora, Revista Gourmet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAB flotante de Menú Digital */}
      <button 
        onClick={() => setMenuAbierto(true)} 
        className="fixed bottom-8 right-8 z-[60] bg-secondary-container text-on-secondary-container p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-transform flex items-center justify-center group"
      >
        <span className="material-symbols-outlined text-[32px]">restaurant</span>
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-3 transition-all duration-500 font-label-md">Menú Digital</span>
      </button>

      {/* Digital Menu Slide-over Drawer */}
      {menuAbierto && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-[90] transition-opacity duration-300 opacity-100" 
            onClick={() => setMenuAbierto(false)}
          ></div>
          <div className="fixed top-0 right-0 h-full w-full max-w-md md:max-w-xl bg-surface-container-lowest border-l border-outline-variant/30 z-[100] shadow-2xl transition-transform duration-500 transform translate-x-0 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
              <div>
                <h2 className="font-display-lg text-headline-md text-primary">Carta Digital</h2>
                <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Sazón Dúo Dinámico • Alta Cocina</p>
              </div>
              <button onClick={() => setMenuAbierto(false)} className="text-on-surface-variant hover:text-primary hover:bg-surface-container/50 transition-all p-2 rounded-full flex items-center justify-center cursor-pointer">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            
            {/* Tab Categories Bar */}
            <div className="px-6 py-3 border-b border-outline-variant/20 bg-surface/50 overflow-x-auto scrollbar-none flex gap-4 scroll-smooth">
              {['entradas', 'piqueos', 'fondos', 'postres', 'bebidas'].map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setCategoriaActiva(cat)}
                  className={`menu-tab-btn whitespace-nowrap pb-1 border-b-2 transition-all ${
                    categoriaActiva === cat 
                      ? 'border-primary text-primary font-bold text-sm tracking-wide' 
                      : 'border-transparent text-on-surface-variant hover:text-primary font-semibold text-sm tracking-wide'
                  }`}
                >
                  {cat === 'entradas' ? 'Entradas' : cat === 'piqueos' ? 'Piqueos' : cat === 'fondos' ? 'Platos de Fondo' : cat === 'postres' ? 'Postres' : 'Bebidas'}
                </button>
              ))}
            </div>
            
            {/* Content List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {digitalMenu[categoriaActiva]?.map((item, idx) => (
                <div key={idx} className="border-b border-outline-variant/10 pb-4">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h4 className="font-display-lg text-body-lg text-primary font-bold leading-tight">{item.name}</h4>
                    <span className="text-secondary font-extrabold text-body-lg shrink-0">S/ {Number(item.price).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-outline-variant/30 bg-surface-container-low text-center">
              <button 
                onClick={() => {
                  setMenuAbierto(false);
                  navigate('/reservas');
                }} 
                className="w-full bg-primary text-on-primary py-3 rounded-full font-bold hover:bg-primary-container active:scale-95 transition-all shadow-md"
              >
                Reservar Mesa Ahora
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Inicio;
