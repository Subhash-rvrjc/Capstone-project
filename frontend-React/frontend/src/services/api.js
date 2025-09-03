import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1'}/auth/refresh`,
            { refreshToken }
          );

          const { token } = response.data;
          localStorage.setItem('token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          originalRequest.headers['Authorization'] = `Bearer ${token}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
};

export const tripAPI = {
  search: (searchParams) => api.post('/trips/search', searchParams),
  getById: (id) => api.get(`/trips/${id}`),
  getSeats: (id) => api.get(`/trips/${id}/seats`),
  create: (tripData) => api.post('/trips', tripData),
  update: (id, tripData) => api.put(`/trips/${id}`, tripData),
  delete: (id) => api.delete(`/trips/${id}`),
  getAll: () => api.get('/trips'),
  getByDate: (date) => api.get(`/trips/date/${date}`),
  getByRoute: (routeId) => api.get(`/trips/route/${routeId}`),
  getByBus: (busId) => api.get(`/trips/bus/${busId}`),
};

export const bookingAPI = {
  holdSeats: (bookingData) => api.post('/bookings/hold', bookingData),
  confirmBooking: (bookingId) => api.post(`/bookings/${bookingId}/confirm`),
  cancelBooking: (bookingId, reason) => api.post(`/bookings/${bookingId}/cancel`, { reason }),
  getById: (id) => api.get(`/bookings/${id}`),
  getMy: () => api.get('/bookings/my'),
  getUserBookings: (userId) => api.get(`/bookings/user/${userId}`),
  getAll: () => api.get('/bookings'),
};

export const busAPI = {
  create: (busData) => api.post('/buses', busData),
  getAll: () => api.get('/buses'),
  getById: (id) => api.get(`/buses/${id}`),
  update: (id, busData) => api.put(`/buses/${id}`, busData),
  delete: (id) => api.delete(`/buses/${id}`),
  getActive: () => api.get('/buses/active'),
  getByType: (type) => api.get(`/buses/type/${type}`),
};

export const routeAPI = {
  create: (routeData) => api.post('/routes', routeData),
  getAll: () => api.get('/routes'),
  getById: (id) => api.get(`/routes/${id}`),
  update: (id, routeData) => api.put(`/routes/${id}`, routeData),
  delete: (id) => api.delete(`/routes/${id}`),
  getActive: () => api.get('/routes/active'),
  search: (source, destination) => api.get(`/routes/search?source=${source}&destination=${destination}`),
};

export const paymentAPI = {
  processPayment: (paymentData) => api.post('/payments/checkout', paymentData),
  getByBooking: (bookingId) => api.get(`/payments/booking/${bookingId}`),
  processRefund: (paymentId, reason) => api.post(`/payments/${paymentId}/refund`, { reason }),
  getById: (id) => api.get(`/payments/${id}`),
  getAll: () => api.get('/payments'),
};

export const ticketAPI = {
  getById: (id) => api.get(`/tickets/${id}`),
  getByBooking: (bookingId) => api.get(`/tickets/booking/${bookingId}`),
  generateTicket: (bookingId) => api.post(`/tickets/generate/${bookingId}`),
  validateTicket: (ticketNumber) => api.get(`/tickets/validate/${ticketNumber}`),
  getAll: () => api.get('/tickets'),
};

// Helper: try GET first, then fall back to POST with body
const getOrPost = async (url, body) => {
  try {
    return await api.get(url);
  } catch (err) {
    // Only fallback for 404/405/400 style route mismatches
    const status = err.response?.status;
    if (status && [400, 404, 405].includes(status)) {
      return await api.post(url.split('?')[0], body);
    }
    throw err;
  }
};

export const reportAPI = {
  getSalesReport: (startDate, endDate) => 
    getOrPost(`/reports/sales?startDate=${startDate}&endDate=${endDate}`, { startDate, endDate }),
  getOccupancyReport: (startDate, endDate) => 
    getOrPost(`/reports/occupancy?startDate=${startDate}&endDate=${endDate}`, { startDate, endDate }),
  getRoutePerformanceReport: (startDate, endDate) => 
    getOrPost(`/reports/route-performance?startDate=${startDate}&endDate=${endDate}`, { startDate, endDate }),
  getDailySettlementReport: (date) => 
    getOrPost(`/reports/daily-settlement?date=${date}`, { date }),
  getDashboardData: () => api.get('/reports/dashboard'),
};

export default api;
