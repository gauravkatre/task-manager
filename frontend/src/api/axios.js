import axios from 'axios';

// Production mein VITE_API_URL env var se aayega (Railway backend URL)
// Local mein vite proxy use hoga (/api -> localhost:5000)
const baseURL = import.meta.env.VITE_API_URL || '/api';

const API = axios.create({ baseURL });

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Handle 401 globally — token expired ya invalid
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;