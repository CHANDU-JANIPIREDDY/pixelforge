import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pixelforge-rqd5.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Handle 401 Unauthorized - clear auth and redirect
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Handle 5xx Server Errors - show toast
    if (status && status >= 500) {
      const toastEvent = new CustomEvent('toast', {
        detail: {
          type: 'error',
          message: 'Server error. Please try again later.',
        },
      });
      window.dispatchEvent(toastEvent);
    }

    return Promise.reject(error);
  }
);

export default api;
