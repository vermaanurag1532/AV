import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'http://localhost:3000/';

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

// Enhanced error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API functions for Admin
export const loginAdmin = async (email, password) => {
  try {
    const response = await api.post('/Admin/restro-1/login', { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAdmins = async () => {
  try {
    const response = await api.get('/Admin/restro-1');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API functions for Chef
export const getChefs = async () => {
  try {
    const response = await api.get('/Admin/restro-1/Chefs');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createChef = async (chefData) => {
  try {
    console.log(chefData)
    const response = await api.post('/Admin/restro-1', chefData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteChef = async (chefId) => {
  try {
    const response = await api.delete(`/Admin/restro-1/${chefId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API functions for Dishes
export const getDishes = async () => {
  try {
    const response = await api.get('/Dish/restro-1');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createDish = async (dishData) => {
  try {
    const response = await api.post('/Dish/restro-1', dishData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateDish = async (dishId, dishData) => {
  try {
    const response = await api.put(`/Dish/restro-1/${dishId}`, dishData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteDish = async (dishId) => {
  try {
    const response = await api.delete(`/Dish/restro-1/${dishId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API functions for Orders
export const getOrders = async () => {
  try {
    const response = await api.get('/Order/restro-1');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/Order/restro-1', orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (orderId, statusData) => {
  try {
    const response = await api.put(`/Order/restro-1/${orderId}`, statusData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const response = await api.delete(`/Order/restro-1/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API functions for Tables
export const getTables = async () => {
  try {
    const response = await api.get('/Table/restro-1');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTableDetails = async (tableNo) => {
  try {
    const response = await api.get(`/Table/restro-1/${tableNo}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTable = async (tableNo, tableData) => {
  try {
    const response = await api.put(`/Table/restro-1/${tableNo}`, tableData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API functions for Customers
export const getCustomers = async () => {
  try {
    const response = await api.get('/Customer/restro-1');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCustomerById = async (customerId) => {
  try {
    const response = await api.get(`/Customer/restro-1/${customerId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createCustomer = async (customerData) => {
  try {
    const response = await api.post('/Customer/restro-1', customerData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCustomer = async (customerId, customerData) => {
  try {
    const response = await api.put(`/Customer/restro-1/${customerId}`, customerData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API functions for Robots
export const getRobots = async () => {
  try {
    const response = await api.get('/Robot');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateRobotStatus = async (robotId, statusData) => {
  try {
    const response = await api.put(`/Robot/${robotId}`, statusData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// NEW: Enhanced API functions for Statistics and Reports
export const getStatistics = async () => {
  try {
    const response = await api.get('/orderReport/statistics');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getReportPreview = async () => {
  try {
    const response = await api.get('/orderReport/preview');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Download report functions
export const downloadPDFReport = async () => {
  try {
    const response = await api.get('/orderReport/download/pdf', {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const downloadExcelReport = async () => {
  try {
    const response = await api.get('/orderReport/download/excel', {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const downloadWordReport = async () => {
  try {
    const response = await api.get('/orderReport/download/word', {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const downloadAllReports = async () => {
  try {
    const response = await api.get('/orderReport/download/all', {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// NEW: Dashboard specific API functions
export const getDashboardStats = async () => {
  try {
    // Fetch all required data in parallel
    const [orders, dishes, customers, tables] = await Promise.all([
      getOrders(),
      getDishes(),
      getCustomers(),
      getTables()
    ]);

    // Calculate statistics
    const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.Amount) || 0), 0);
    const pendingOrders = orders.filter(order => !order['Serving Status']).length;
    const completedOrders = orders.filter(order => order['Serving Status']).length;
    const totalDishes = dishes.length;
    const totalCustomers = customers.length;
    const totalTables = tables.length;

    return {
      totalRevenue,
      pendingOrders,
      completedOrders,
      totalDishes,
      totalCustomers,
      totalTables,
      orders,
      dishes,
      customers,
      tables
    };
  } catch (error) {
    throw error;
  }
};

// NEW: Analytics functions
export const getMonthlyRevenue = async () => {
  try {
    const orders = await getOrders();
    const currentYear = new Date().getFullYear();
    const monthlyData = {};

    // Initialize months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(month => {
      monthlyData[month] = { revenue: 0, orders: 0 };
    });

    // Process orders
    orders.forEach(order => {
      if (order.Date) {
        const orderDate = new Date(order.Date);
        if (orderDate.getFullYear() === currentYear) {
          const month = months[orderDate.getMonth()];
          monthlyData[month].revenue += parseFloat(order.Amount) || 0;
          monthlyData[month].orders += 1;
        }
      }
    });

    return months.map(month => ({
      name: month,
      revenue: monthlyData[month].revenue,
      orders: monthlyData[month].orders
    }));
  } catch (error) {
    throw error;
  }
};

export const getDishTypeAnalytics = async () => {
  try {
    const dishes = await getDishes();
    const typeCount = {};

    dishes.forEach(dish => {
      if (dish['Type of Dish'] && Array.isArray(dish['Type of Dish'])) {
        dish['Type of Dish'].forEach(type => {
          typeCount[type] = (typeCount[type] || 0) + 1;
        });
      }
    });

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];
    return Object.entries(typeCount).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  } catch (error) {
    throw error;
  }
};

export const getDailyOrderStatus = async () => {
  try {
    const orders = await getOrders();
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyStats = {};

    // Initialize days
    days.forEach(day => {
      dailyStats[day] = { pending: 0, completed: 0, cancelled: 0 };
    });

    // Process last 7 days of orders
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    orders.forEach(order => {
      if (order.Date) {
        const orderDate = new Date(order.Date);
        if (orderDate >= sevenDaysAgo) {
          const dayIndex = orderDate.getDay();
          const dayName = days[dayIndex === 0 ? 6 : dayIndex - 1]; // Adjust for Monday start
          
          if (order['Serving Status']) {
            dailyStats[dayName].completed += 1;
          } else if (order['Payment Status'] === false) {
            dailyStats[dayName].cancelled += 1;
          } else {
            dailyStats[dayName].pending += 1;
          }
        }
      }
    });

    return days.map(day => ({
      name: day,
      ...dailyStats[day]
    }));
  } catch (error) {
    throw error;
  }
};

// NEW: Real-time updates
export const subscribeToRealtimeUpdates = (callback) => {
  // This would integrate with your socket service
  // Example implementation:
  /*
  import { getSocket, subscribeToOrders } from './socketService';
  
  const socket = getSocket();
  subscribeToOrders((type, data) => {
    callback(type, data);
  });
  */
};

// Utility function to handle file downloads
export const handleFileDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Health check function
export const checkAPIHealth = async () => {
  try {
    const response = await api.get('/orderReport/health');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;