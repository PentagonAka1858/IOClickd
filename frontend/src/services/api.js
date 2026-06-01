import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';
const API_URL = `${BACKEND_URL}/api`;

// Función para obtener token CSRF de la cookie
const getCsrfToken = () => {
  const name = 'XSRF-TOKEN';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para agregar token CSRF a cada request
api.interceptors.request.use((config) => {
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Redirigir a login en caso de error 401, excepto si es la petición para obtener el usuario actual
    if (error.response?.status === 401 && !error.config?.url?.endsWith('/user')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getCsrfCookie = () => axios.get(`${BACKEND_URL}/sanctum/csrf-cookie`, { withCredentials: true });

export default api;
