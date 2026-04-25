// src/services/api.js
import axios from 'axios';

// نجيب الـ CSRF token من الـ cookie
function getCsrfToken() {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let c of cookies) {
    const [key, val] = c.trim().split('=');
    if (key === name) return decodeURIComponent(val);
  }
  return '';
}

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,   // ← دايماً يبعت الـ session cookie
  headers: { 'Content-Type': 'application/json' },
});

// نضيف CSRF token لكل request
api.interceptors.request.use((config) => {
  config.headers['X-CSRFToken'] = getCsrfToken();
  return config;
});

export default api;
