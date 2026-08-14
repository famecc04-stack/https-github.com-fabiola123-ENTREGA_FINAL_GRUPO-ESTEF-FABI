import axios from 'axios';

// Instancia simulada de axios para el proyecto académico
const api = axios.create({
  baseURL: 'https://api.sazonduodinamico.com/v1',
  timeout: 5000,
});

// Simulamos interceptores
api.interceptors.request.use(config => {
  // Aquí se agregaría el token JWT en un escenario real
  return config;
});

export default api;
