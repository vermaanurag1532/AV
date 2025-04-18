import { io } from 'socket.io-client';

// Define the socket connection URL
const SOCKET_URL = 'http://localhost:3000'; // Use your server URL here

// Create a socket instance
let socket;

// Initialize socket connection
export const initializeSocket = () => {
  // Close existing socket if it exists
  if (socket) {
    socket.close();
  }

  // Create a new socket connection
  socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });

  // Listen for connection events
  socket.on('connect', () => {
    console.log('Connected to Socket.IO server');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected from Socket.IO server:', reason);
  });

  return socket;
};

// Get the socket instance
export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

// Subscribe to specific events
export const subscribeToOrders = (callback) => {
  const socket = getSocket();
  
  // Listen for new orders
  socket.on('order_created', (newOrder) => {
    callback('created', newOrder);
  });

  // Listen for order updates
  socket.on('order_updated', (updatedOrder) => {
    callback('updated', updatedOrder);
  });

  // Listen for order status updates
  socket.on('order_status_updated', (statusData) => {
    callback('status_updated', statusData);
  });

  // Listen for order deletions
  socket.on('order_deleted', (orderId) => {
    callback('deleted', orderId);
  });
};

// Unsubscribe from events to prevent memory leaks
export const unsubscribeFromOrders = () => {
  const socket = getSocket();
  socket.off('order_created');
  socket.off('order_updated');
  socket.off('order_status_updated');
  socket.off('order_deleted');
};

// Clean up function to be called when the app is unmounted
export const cleanupSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  initializeSocket,
  getSocket,
  subscribeToOrders,
  unsubscribeFromOrders,
  cleanupSocket
};