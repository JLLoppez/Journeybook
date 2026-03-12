import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: false,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common.Authorization;
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  setAuthToken: (token: string) => {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  },
  clearAuthToken: () => {
    delete api.defaults.headers.common.Authorization;
  },
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  register: async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  },
  getProfile: async () => {
    const { data } = await api.get('/auth/profile');
    return data;
  },
};

export const flightService = {
  search: async (params: object) => {
    const searchParams = new URLSearchParams();

    Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response = await api.get(`/flights/search?${searchParams.toString()}`);
    return response.data;
  },

  getAll: async () => {
    const { data } = await api.get('/flights');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/flights/${id}`);
    return data;
  },
};


export const bookingService = {
  create: async (bookingData: {
    flightId: string;
    passengers: number;
    class: string;
    contactEmail: string;
    contactPhone: string;
  }) => {
    const { data } = await api.post('/bookings', bookingData);
    return data;
  },
  getUserBookings: async () => {
    const { data } = await api.get('/bookings');
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/bookings/${id}`);
    return data;
  },
  cancel: async (id: string) => {
    const { data } = await api.delete(`/bookings/${id}`);
    return data;
  },
  saveItinerary: async (bookingId: string, itinerary: object) => {
    const { data } = await api.post('/bookings/save-itinerary', { bookingId, itinerary });
    return data;
  },
};

export const paymentService = {
  createIntent: async (bookingId: string) => {
    const { data } = await api.post('/payments/create-intent', { bookingId });
    return data;
  },
  confirm: async (bookingId: string, paymentIntentId: string) => {
    const { data } = await api.post('/payments/confirm', { bookingId, paymentIntentId });
    return data;
  },
};

export const aiService = {
  planTrip: async (prompt: string, origin?: string, budget?: string, duration?: string) => {
    const { data } = await api.post('/ai/plan', { prompt, origin, budget, duration });
    return data;
  },
};

export default api;


export const locationService = {
  search: async (q: string) => {
    const { data } = await api.get(`/locations/search?q=${encodeURIComponent(q)}`);
    return data;
  },
};
