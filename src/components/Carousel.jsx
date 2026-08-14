import { useState, useEffect } from 'react';

// Componente Carousel modular para los platos clásicos
function Carousel({ items = [] }) {
  // useState: Controla el slide activo en el carrusel
  const [slideActivo, setSlideActivo] = useState(0);

  // Auto-slide para el carrusel de platos clásicos cada 5 segundos
  useEffect(() => {
    if (items.length <= 2) return;
    const interval = setInterval(() => {
      setSlideActivo((prev) => (prev + 1) % (items.length - 1 || 1)); 
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length]);

  const handleNextSlide = () => {
    if (items.length <= 2) return;
    setSlideActivo((prev) => (prev + 1) % (items.length - 1 || 1));
  };

  const handlePrevSlide = () => {
    if (items.length <= 2) return;
    setSlideActivo((prev) => (prev - 1 + (items.length - 1 || 1)) % (items.length - 1 || 1));
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="bg-surface-container-low py-stack-lg overflow-hidden">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-stack-md flex justify-between items-end">
        <div>
          <span className="font-label-md text-label-md text-secondary uppercase tracking-widest">Nuestros Clásicos</span>
          <h2 className="font-display-lg text-headline-lg text-primary mt-2">La Maestría Criolla</h2>
        </div>
        <div className="flex gap-4">
          <button className="w-12 h-12 rounded-full border border-outline flex items-center justify-center hover:bg-surface-container-highest transition-all" onClick={handlePrevSlide}>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="w-12 h-12 rounded-full border border-outline flex items-center justify-center hover:bg-surface-container-highest transition-all" onClick={handleNextSlide}>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop overflow-hidden">
        <div 
          className="flex transition-transform duration-700 ease-in-out gap-gutter" 
          style={{ transform: `translateX(calc(-${slideActivo} * (var(--slide-width, 40%) + 1rem)))` }}
        >
          <style>{`
            @media (max-width: 768px) {
              .gap-gutter { --slide-width: 85%; }
            }
          `}</style>
          {items.map((item, idx) => (
            <div key={idx} className="min-w-[85%] md:min-w-[40%] flex-shrink-0 group cursor-pointer">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-container-highest">
                {item.image ? (
                  <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={item.image} alt={item.name}/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-6xl">restaurant</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-tertiary-fixed text-on-tertiary-fixed font-bold px-4 py-2 rounded-lg shadow-lg">
                  S/ {Math.round(item.price)}
                </div>
              </div>
              <h4 className="font-display-lg text-headline-md text-primary mt-6">{item.name}</h4>
              <p className="font-body-md text-body-md text-on-surface-variant">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Carousel;
