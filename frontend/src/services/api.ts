import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: false,
});

// ── Token refresh state ───────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

// ── Response interceptor — auto-refresh on 401 ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      const storedRefresh = localStorage.getItem('refreshToken');

      if (storedRefresh) {
        if (isRefreshing) {
          // Queue up requests while refresh is in flight
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: storedRefresh,
          });

          const { token, refreshToken } = data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);
          api.defaults.headers.common.Authorization = `Bearer ${token}`;

          processQueue(null, token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          // Refresh failed — clear everything and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          delete api.defaults.headers.common.Authorization;
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token — clear and redirect
        localStorage.removeItem('token');
        delete api.defaults.headers.common.Authorization;
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth service ──────────────────────────────────────────────────────────────
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
  refresh: async (refreshToken: string) => {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    return data;
  },
};

// ── Flight service ────────────────────────────────────────────────────────────
export const flightService = {
  search: async (params: object) => {
    const searchParams = new URLSearchParams();
    Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
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

// ── Booking service ───────────────────────────────────────────────────────────
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

// ── Payment service ───────────────────────────────────────────────────────────
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

// ── AI service ────────────────────────────────────────────────────────────────
export const aiService = {
  planTrip: async (prompt: string, origin?: string, budget?: string, duration?: string) => {
    const { data } = await api.post('/ai/plan', { prompt, origin, budget, duration });
    return data;
  },
  planTripFull: async (params: {
    prompt: string;
    origin?: string;
    destination?: string;
    destinationDisplay?: string;
    originDisplay?: string;
    budget?: string;
    budgetOriginal?: string;
    budgetCurrency?: string;
    duration?: string;
    tripType?: string;
    isReturn?: boolean;
    departureDate?: string;
    returnDate?: string;
    passengers?: { adults: number; children: number; infants: number };
    cabinClass?: string;
  }) => {
    const { data } = await api.post('/ai/plan', params);
    return data;
  },
};

// ── Location service ──────────────────────────────────────────────────────────
export const locationService = {
  search: async (q: string) => {
    const { data } = await api.get(`/locations/search?q=${encodeURIComponent(q)}`);
    return data;
  },
};

export default api;
