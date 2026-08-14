// Simulamos latencia
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let menuMockDatabase = [
  // Entradas
  { id: 'PL-001', name: "Causa Limeña", description: "Suavidad de papa amarilla prensada con ají amarillo, palta punta y pulpa de cangrejo seleccionada de la costa sur.", price: 38.00, category: 'Entradas', image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCskCm7bo9tnaMDmwvhKFq0CqowcnTxX2BoPLMf3xxoUJ0DPwjNEmD0IjhdZQJLgAos2bPzvq4VAJ2W-WtjnnNKiWHe4yFWscBtNG1AknWt8jm6BKRFEWdnu95FIdxNjFFzzjJg0N2tVx7qiimXH0IIycDf6RI2EFZ5kQBpXhHywYrIkt96dP3emZvazTA2bQu-asdc-5hFwdxMyQkkG2un8E9trD00mOEe9BCfwHO5v8r9mAgpqICV", available: true },
  { id: 'PL-002', name: "Ceviche de la Casa", description: "Cubos de pesca del día marinados al momento en jugo de limón de Chulucanas, ají limo, cebolla roja y cilantro fresco.", price: 48.00, category: 'Entradas', image: "/images/ceviche_1786241542655.png", available: true },
  { id: 'PL-003', name: "Papa a la Huancaína Tradicional", description: "Rodajas de papa cocida bañadas con nuestra crema untuosa de ají amarillo, queso fresco andino y galletas.", price: 26.00, category: 'Entradas', image: "/images/papa_huancaina_1786241550938.png", available: true },
  // Piqueos
  { id: 'PL-004', name: "Anticuchos de Corazón Premium", description: "Brochetas de corazón de res marinadas en ají panca y cerveza negra, asadas al carbón y servidas con papas doradas y choclo tierno.", price: 35.00, category: 'Piqueos', image: "/images/anticuchos_1786241559044.png", available: true },
  { id: 'PL-005', name: "Tequeños Criollos", description: "Masas crocantes hechas en casa rellenas de jugoso lomo saltado y queso andino derretido, servidas con guacamole.", price: 28.00, category: 'Piqueos', image: "/images/tequenos_1786241566692.png", available: true },
  { id: 'PL-006', name: "Chicharrón de Calamar", description: "Aros de calamar crujientes marinados con el toque de especias peruanas, yucas fritas, salsa criolla y tártara.", price: 36.00, category: 'Piqueos', image: "/images/chicharron_calamar_1786241575062.png", available: true },
  // Fondos
  { id: 'PL-007', name: "Lomo Saltado Dúo Dinámico", description: "Tiras de lomo fino salteadas al wok con cebolla morada, tomate, ají amarillo y un toque de pisco Quebranta, papas y arroz.", price: 58.00, category: 'Fondos', image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNUJUIJs7Qt204qfpuf40yNxu9-oFrZ9EVtcR13ICPvjrXy6TzuqQDqburFZfsgoacTbvJgtNH5jokkG9yRhV_30p2niikdOFXvfk-ZhArGB3YmefomqE19N5-N19B4sN5Jbq4WPJWFMcH4b8UjgYdb76yWN0u5i_ZIqall8kz7JJJQ4pkGIq_SkAYfYFNv8Kd-hvFIfjqIVUpdTLJ6SLqi6Mb4r8peX76YJZ908n_v_jXzNvOTWak", available: true },
  { id: 'PL-008', name: "Ají de Gallina de la Abuela", description: "Pechuga de gallina deshilachada en crema de ají amarillo y leche evaporada, coronada con nueces pecana y huevo de codorniz.", price: 45.00, category: 'Fondos', image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-KLInRkiWk1ARfXYUFlgB51yf4sN6bQQKqAD-Q423jkRRlpJ7H1s2twPianqnKHKfuw6O96uV3fM_vMHt0G64nMiy-lDvVvXjDlL3MGCt5ZVkRpQ4UPReImFlizrOFMbws8mS5yCq7k4YSb2HZk5Kc5VXtyR6WOBwwIqRylNh9sSpunVJ4N5gipA3bGktytyWScbdGGlF2_eoIFeAZxfEVwUrpj5R22cZZyfsUt1tElooAcDnsnzg", available: true },
  { id: 'PL-009', name: "Seco de Cordero con Frejoles", description: "Cabrito tierno de leche guisado en cerveza negra y culantro fresco, acompañado de frejoles canarios y arroz con choclo.", price: 52.00, category: 'Fondos', image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUYKBjoi1MyaqJZDzpXqgBtg82-wOM0j0RTMkt7zKV0znhU1BAB_nikmJUkE9sJD3wG-S81e6jGQ9_zgeu0rMqO08ila3nGj0x7d38yo_0-DwxfBfJ8uQIKfuQiu2KLX2Rxikl0hKykk8XfvIpTm44s78HilDIFs2W75l5zFtYeIVeKxcZKaxnS2HsjWS8cRtq67BOSL01VzV7rmeGKenYegvyzqRiCBDR5-ca8-jS__ESvKTjop-w", available: true },
  { id: 'PL-010', name: "Arroz con Pollo a la Chiclayana", description: "Arroz norteño cocido con cilantro y cerveza norteña, servido con presa dorada de pollo y crema huancaína.", price: 42.00, category: 'Fondos', image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxd4VcvlANUexRqjWQKYFWGpzs7ZO4kIVpLiOPHo1E8JHyo9Oa3CHdz4yxurfL7KF39Fss7KwCnFq0jtgJqiTaBFlBwEw4Q-6GMMqYcVVlaP2_qDvl5WbVn12cpqa54wKLRAx-8d7yR_6GSW6n8Xqs1zWg1B_MvZsS3On2eUR0LdJHBjnGNMrxXF6HJgTiPx5RE20ApSrVWdqIlSAogNiJN81HABni9qujHcuGdhe-sbS0NqY5oRBg", available: true },
  { id: 'PL-011', name: "Carapulcra", description: "Papa seca artesanal con trozos de cerdo crocante y el toque ahumado del maní tostado.", price: 48.00, category: 'Fondos', image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCSVedX1HMDgc5rA7G3v0VOzV8exZpqpGRn6wehWwO9yRu6R8smfBm0S9oGFIdE9ZdzwIUQU74HthFTuz_sbrvIDNING1dZpF1kmy6VTtar9u9CuvFnNlpu2gH9ofpFFufcaaVcHcKqFltJ4S2V1XeNNEJIyGrtIVKeLudMAthXKh-Desq0f1TxNmdwfJkWPjF_y_mdSCIuVo33diC61-vMt7It6q_XimnyPjoUhFYGQcTgjikGRO8L", available: true },
  // Postres
  { id: 'PL-012', name: "Suspiro a la Limeña Tradicional", description: "Manjar blanco a base de leches y yemas de huevo, coronado con merengue al oporto perfumado con canela.", price: 18.00, category: 'Postres', image: "/images/suspiro_limena_1786241583563.png", available: true },
  { id: 'PL-013', name: "Picarones Crujientes", description: "Buñuelos de camote y zapallo bañados en miel de chancaca caliente con hojas de higo, naranja y clavo de olor.", price: 20.00, category: 'Postres', image: "/images/picarones_1786241607706.png", available: true },
  { id: 'PL-014', name: "Mazamorra y Arroz con Leche", description: "El clásico postre combinado limeño (clásico 'sol y sombra') servido tibio.", price: 16.00, category: 'Postres', image: "/images/mazamorra_1786241615346.png", available: true },
  // Bebidas
  { id: 'PL-015', name: "Pisco Sour Catedral", description: "Pisco Quebranta premium, jarabe de goma, jugo de limón fresco, clara de huevo de corral y gotas de amargo de angostura.", price: 32.00, category: 'Bebidas', image: "/images/pisco_sour_1786241625940.png", available: true },
  { id: 'PL-016', name: "Chicha Morada de Maíz de Urubamba", description: "Hervido tradicional de maíz morado con piña, manzana, membrillo, canela y clavo de olor.", price: 14.00, category: 'Bebidas', image: "/images/chicha_morada_1786241633869.png", available: true },
  { id: 'PL-017', name: "Maracuyá Sour", description: "Fusión refrescante de pisco premium, pulpa de maracuyá y un toque dulce de jarabe.", price: 28.00, category: 'Bebidas', image: "/images/maracuya_sour_1786241640925.png", available: true }
];

export const menuService = {
  getMenu: async () => {
    await delay(500);
    return [...menuMockDatabase];
  },
  
  addDish: async (dish) => {
    await delay(500);
    const newDish = { 
      ...dish, 
      id: `PL-${String(menuMockDatabase.length + 1).padStart(3, '0')}`,
      image: dish.image || ''
    };
    menuMockDatabase.push(newDish);
    return newDish;
  },

  updateDish: async (id, updatedFields) => {
    await delay(500);
    const index = menuMockDatabase.findIndex(d => d.id === id);
    if (index !== -1) {
      menuMockDatabase[index] = { ...menuMockDatabase[index], ...updatedFields };
      return menuMockDatabase[index];
    }
    throw new Error('Plato no encontrado');
  },

  deleteDish: async (id) => {
    await delay(500);
    menuMockDatabase = menuMockDatabase.filter(d => d.id !== id);
    return true;
  },

  toggleAvailability: async (id) => {
    await delay(300);
    const index = menuMockDatabase.findIndex(d => d.id === id);
    if (index !== -1) {
      menuMockDatabase[index].available = !menuMockDatabase[index].available;
      return menuMockDatabase[index];
    }
    throw new Error('Plato no encontrado');
  }
};
