import api from './api';

export const authService = {
  login:      (data) => api.post('/auth/login/',    data, { withCredentials: true }),
  register:   (data) => api.post('/auth/register/', data, { withCredentials: true }),
  getProfile: ()     => api.get('/auth/me/',               { withCredentials: true }),
  logout:     ()     => api.post('/auth/logout/',   {},    { withCredentials: true }),
};