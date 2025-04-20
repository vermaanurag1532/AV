import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication token to requests if available
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions for Admin
export const loginAdmin = async (email, password) => {
  try {
    const response = await api.post('/Admin/login', { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAdmins = async () => {
  try {
    const response = await api.get('/Admin');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API functions for Chef
export const getChefs = async () => {
  try {
    const response = await api.get('/Admin/Chef');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createChef = async (chefData) => {
  try {
    const response = await api.post('/Admin', chefData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteChef = async (chefId) => {
  try {
    const response = await api.delete(`/Admin/${chefId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API functions for Dishes
export const getDishes = async () => {
  try {
    const response = await api.get('/Dish');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createDish = async (dishData) => {
  try {
    const response = await api.post('/Dish', dishData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateDish = async (dishId, dishData) => {
  try {
    const response = await api.put(`/Dish/${dishId}`, dishData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteDish = async (dishId) => {
  try {
    const response = await api.delete(`/Dish/${dishId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API functions for Orders
export const getOrders = async () => {
  try {
    const response = await api.get('/Order');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (orderId, statusData) => {
  try {
    const response = await api.put(`/Order/${orderId}`, statusData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API functions for Tables
export const getTables = async () => {
  try {
    const response = await api.get('/Table');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTableDetails = async (tableNo) => {
  try {
    const response = await api.get(`/Table/${tableNo}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API functions for Customers
export const getCustomers = async () => {
  try {
    const response = await api.get('/Customer');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCustomerById = async (customerId) => {
  try {
    const response = await api.get(`/Customer/${customerId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;