import API from '../api/axios';

export const authService = {
  signup: (name, email, password) => API.post('/auth/signup', { name, email, password }),
  login: (email, password) => API.post('/auth/login', { email, password }),
  getMe: () => API.get('/auth/me'),
};
