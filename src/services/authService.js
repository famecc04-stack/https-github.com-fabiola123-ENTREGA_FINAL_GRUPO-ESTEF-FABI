// Simulamos una demora de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  login: async (username, password) => {
    await delay(800); // Simulamos llamada API
    if (username === 'Administrador' && password === 'Sabiduría#2026') {
      return { success: true, token: 'mock-admin-token-xyz' };
    }
    throw new Error('Credenciales incorrectas');
  }
};
