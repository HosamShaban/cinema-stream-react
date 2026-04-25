// src/services/index.js
import api from './api';

export const moviesService = {
  getAll:      (params) => api.get('/movies/', { params }),
  getTrending: ()       => api.get('/trending/'),
  search:      (query)  => api.get('/movies/', { params: { q: query } }),
  getById:     (id)     => api.get(`/movies/${id}/`),
};

export const seriesService = {
  getAll:  (params) => api.get('/movies/', { params: { ...params, type: 'series' } }),
  search:  (query)  => api.get('/movies/', { params: { q: query, type: 'series' } }),
  getById: (id)     => api.get(`/series/${id}/`),
};

export const reviewsService = {
  create: (data) => api.post('/review/', data),
  delete: (id)   => api.post(`/review/${id}/delete/`),
};

export const favoritesService = {
  toggle: (slug, content_type) =>
    api.post('/favorite/toggle/', { slug, content_type }),
};

export const searchService = {
  suggestions: (q) => api.get('/search-suggestions/', { params: { q } }),
};
