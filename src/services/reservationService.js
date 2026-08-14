import api from './api/axios';

// Simulamos una demora de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const names = ['Juan', 'María', 'Pedro', 'Ana', 'Luis', 'Carmen', 'Carlos', 'Elena', 'Miguel', 'Rosa', 'Jorge', 'Sofía', 'Fernando', 'Lucía', 'Ricardo', 'Inés', 'Manuel', 'Patricia', 'Héctor', 'Beatriz'];
const lastNames = ['Quispe', 'Flores', 'Rodríguez', 'Sánchez', 'García', 'Rojas', 'Díaz', 'Torres', 'López', 'Gonzales', 'Chávez', 'Mendoza', 'Vargas', 'Espinoza', 'Ramos', 'Castillo'];
const observationsList = ['Mesa tranquila.', 'Celebración familiar.', 'Mesa cerca a la ventana.', 'Sin mariscos.', 'Cliente frecuente.', 'Aniversario.', 'Cumpleaños.', 'Traer vela para postre.'];
const sedes = ['San Borja', 'Miraflores', 'Barranco', 'La Molina'];
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

let resCounter = 1;

const createRes = (branch, date, time, zoneId, zoneName, tableNum, partyNum) => {
  const id = `RES-${String(resCounter++).padStart(3, '0')}`;
  const name = names[resCounter % names.length];
  const lastName = lastNames[resCounter % lastNames.length];
  const obs = observationsList[resCounter % observationsList.length];
  return {
    id,
    branch,
    date,
    time,
    table: `Mesa ${tableNum}`,
    party: partyNum === 1 ? '1 Persona' : `${partyNum} Personas`,
    status: 'Confirmada',
    zone: zoneId,
    zoneName,
    obs,
    email: `${name.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
    nombre: `${name} ${lastName}`
  };
};

// Base de datos simulada en memoria
let mockDatabase = [];

function loadFromLocalStorage() {
  try {
    const data = localStorage.getItem('mockReservations');
    if (data) {
      mockDatabase = JSON.parse(data);
      // Actualizar resCounter al más alto
      let maxId = 0;
      mockDatabase.forEach(r => {
        if (r.id.startsWith('RES-')) {
          const num = parseInt(r.id.split('-')[1]);
          if (num > maxId) maxId = num;
        }
      });
      resCounter = maxId + 1;
      return true;
    }
  } catch (e) {
    console.error("Error loading localStorage", e);
  }
  return false;
}

function saveToLocalStorage() {
  try {
    localStorage.setItem('mockReservations', JSON.stringify(mockDatabase));
  } catch (e) {
    console.error("Error saving to localStorage", e);
  }
}

function generateMockData() {
  if (mockDatabase.length > 0) return mockDatabase;
  if (loadFromLocalStorage()) return mockDatabase;

  const hoy = new Date();
  const getFormattedDate = (offset) => {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const list = [];
  const hoyStr = getFormattedDate(0);
  const mananaStr = getFormattedDate(1);
  const pasadoStr = getFormattedDate(2);

  // Reglas de negocio fijas para evaluación
  for (let i = 1; i <= 4; i++) list.push(createRes('San Borja', hoyStr, '13:00', 'barra_cocktail', 'Barra Cocktail', `BC-${i}`, 2));
  for (let i = 1; i <= 4; i++) list.push(createRes('San Borja', hoyStr, '20:00', 'salon_vip', 'Salón VIP', `VIP-${i}`, 4));
  for (let i = 1; i <= 5; i++) list.push(createRes('Miraflores', mananaStr, '21:00', 'terraza', 'Terraza', `T-${i}`, 3));
  for (let i = 1; i <= 8; i++) list.push(createRes('La Molina', pasadoStr, '19:00', 'salon_principal', 'Salón Principal', `SP-${i}`, 4));

  const occupiedTracker = {};
  list.forEach(r => {
    const key = `${r.branch}_${r.date}_${r.time}_${r.zone}`;
    if (!occupiedTracker[key]) occupiedTracker[key] = [];
    occupiedTracker[key].push(r.table.replace('Mesa ', ''));
  });

  // REDUCIDO: De 60 días a solo 14 días para mejorar radicalmente el rendimiento
  for (let dayOffset = 0; dayOffset <= 14; dayOffset++) {
    const dateStr = getFormattedDate(dayOffset);
    sedes.forEach(branch => {
      const dateVal = parseInt(dateStr.replace(/-/g, ''));
      const branchHash = branch.charCodeAt(0) + branch.charCodeAt(branch.length - 1);
      const dayHash = (branchHash + dateVal) % 100;
      const dayBasePercentage = 0.45 + (dayHash % 5) * 0.1;

      zones.forEach((zone, zIdx) => {
        times.forEach((time, tIdx) => {
          const key = `${branch}_${dateStr}_${time}_${zone.id}`;
          if (!occupiedTracker[key]) occupiedTracker[key] = [];

          let targetOccupy = 0;
          if (branch === 'Barranco') {
            targetOccupy = zone.count;
          } else {
            const hourFluctuation = ((tIdx + dayHash + zIdx) % 3) - 1;
            const baseCount = Math.round(zone.count * dayBasePercentage);
            targetOccupy = baseCount + hourFluctuation;
            targetOccupy = Math.max(1, Math.min(zone.count - 1, targetOccupy));
          }

          for (let num = 1; num <= targetOccupy; num++) {
            const tableNum = `${zone.prefix}-${num}`;
            if (!occupiedTracker[key].includes(tableNum)) {
              occupiedTracker[key].push(tableNum);
              list.push(createRes(branch, dateStr, time, zone.id, zone.name, tableNum, 2 + (num % 3)));
            }
          }
        });
      });
    });
  }

  mockDatabase = list.sort((a, b) => a.id.localeCompare(b.id));
  saveToLocalStorage();
  return mockDatabase;
}

export const reservationService = {
  getReservations: async () => {
    await delay(300); // Simulamos carga de API
    // En un futuro real se usaría: return api.get('/reservations');
    return generateMockData();
  },
  
  createReservation: async (reservaFinal) => {
    await delay(600); // Simulamos POST a la API
    // En el futuro: return api.post('/reservations', reservaFinal);
    const newReservation = { ...reservaFinal, id: `RES-${String(resCounter++).padStart(3, '0')}` };
    generateMockData(); // ensure data is generated before pushing
    mockDatabase.push(newReservation);
    saveToLocalStorage();
    return newReservation;
  },

  // --- Funciones Administrativas ---
  
  updateReservationStatus: async (id, status) => {
    await delay(200);
    generateMockData();
    const index = mockDatabase.findIndex(r => r.id === id);
    if (index !== -1) {
      mockDatabase[index].status = status;
      saveToLocalStorage();
      return mockDatabase[index];
    }
    throw new Error('Reserva no encontrada');
  },

  getTablesStatus: async (branch, date, time) => {
    await delay(300);
    generateMockData(); // ensure data exists
    
    // Todas las mesas posibles por zona
    let allTables = [];
    zones.forEach(zone => {
      for(let i = 1; i <= zone.count; i++) {
        allTables.push({
          id: `${zone.prefix}-${i}`,
          zoneName: zone.name,
          zoneId: zone.id,
          name: `Mesa ${zone.prefix}-${i}`,
          status: 'Disponible' // default
        });
      }
    });

    // Encontrar reservas confirmadas o pendientes para esa fecha/hora/sede
    const activeReservations = mockDatabase.filter(r => 
      r.branch === branch && 
      r.date === date && 
      // Simplified: we check if they are in the same time slot, or close to it
      r.time === time && 
      (r.status === 'Confirmada' || r.status === 'Pendiente')
    );

    // Actualizar estado de mesas
    activeReservations.forEach(res => {
      const tableId = res.table.replace('Mesa ', '');
      const tableIndex = allTables.findIndex(t => t.id === tableId);
      if (tableIndex !== -1) {
        allTables[tableIndex].status = res.status === 'Confirmada' ? 'Ocupada' : 'Reservada';
        allTables[tableIndex].reservation = res;
      }
    });

    return allTables;
  }
};
