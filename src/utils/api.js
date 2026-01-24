import axios from 'axios';

// Untuk production di Vercel, gunakan relative path /api
// Untuk development local, gunakan http://localhost:3001/api
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth', { username, password });
    return response.data;
  },
  verify: async () => {
    const response = await api.get('/auth');
    return response.data;
  },
};

// Invoice API
export const invoiceAPI = {
  getAll: async () => {
    const response = await api.get('/invoices');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  create: async (invoiceData) => {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  },

  update: async (id, invoiceData) => {
    const response = await api.put(`/invoices/${id}`, invoiceData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  },
};

// Portfolio API
export const portfolioAPI = {
  getAll: async () => {
    const response = await api.get('/portfolio');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/portfolio?id=${id}`);
    return response.data;
  },
  create: async (projectData) => {
    const response = await api.post('/portfolio', projectData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/portfolio/${id}`);
    return response.data;
  },
};

// Utility functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateInvoiceTotals = (items = []) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.price);
  }, 0);

  return {
    subtotal,
    total: subtotal,
  };
};

export const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'LUNAS':
      return 'bg-green-500';
    case 'DP':
      return 'bg-yellow-500';
    case 'BELUM LUNAS':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export const getShareableLink = (invoiceId) => {
  return `${window.location.origin}/invoice/${invoiceId}`;
};

export const generateInvoiceNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV/${year}/${month}/${timestamp}-${random}`;
};

export default api;
