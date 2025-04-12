import Cookies from 'js-cookie';
import Router from 'next/router';
import { loginAdmin } from './api';

// Set token in cookie with expiry
export const setToken = (token) => {
  if (typeof window === 'undefined') {
    return;
  }
  Cookies.set('auth_token', token, { expires: 1 }); // 7 days
};

// Set admin user data in local storage
export const setAdminData = (userData) => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('admin_data', JSON.stringify(userData));
};

// Get admin data from local storage
export const getAdminData = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  const data = localStorage.getItem('admin_data');
  return data ? JSON.parse(data) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!Cookies.get('auth_token');
};

// Check user role
export const getUserRole = () => {
  const userData = getAdminData();
  return userData ? userData.Role : null;
};

// Check if user is a manager (case insensitive)
export const isManager = () => {
  const role = getUserRole();
  return role && role.toLowerCase() === 'manager';
};

// Check if user is a chief (case insensitive)
export const isChief = () => {
  const role = getUserRole();
  return role && (role.toLowerCase() === 'chief' || role.toLowerCase() === 'chef');
};

// Authentication login function
export const login = async (email, password) => {
  try {
    const data = await loginAdmin(email, password);
    setToken(data.token || 'dummy-token'); // Using dummy token if not provided by API
    setAdminData(data.admin || data); // Store admin data
    return data;
  } catch (error) {
    throw error;
  }
};

// Logout function
export const logout = () => {
  Cookies.remove('auth_token');
  localStorage.removeItem('admin_data');
  Router.push('/');
};

// Redirect if not authenticated
export const redirectIfNotAuthenticated = () => {
  if (!isAuthenticated() && typeof window !== 'undefined') {
    Router.push('/');
    return true;
  }
  return false;
};

// Redirect if not authorized for role
export const redirectIfNotAuthorized = (allowedRoles) => {
  const userRole = getUserRole();
  if (!allowedRoles.includes(userRole) && typeof window !== 'undefined') {
    Router.push('/dashboard');
    return true;
  }
  return false;
};