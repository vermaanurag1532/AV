import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '@nextui-org/react';
import Link from 'next/link'; // Import Link from next/link
import { getOrders, getDishes } from '../utils/api';
import useAuth from '../hooks/useAuth';
import EnhancedOrderCard from '../components/OrderCard';
import EnhancedStatCard from '../components/StatCard';
import AnimatedLoader from '../components/AnimatedLoader';
import ThemeToggle from '../components/ThemeToggle';
import styles from '../styles/Dashboard.module.css';

function Dashboard() {
  const { user, role } = useAuth();
  const [orders, setOrders] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch orders
        const ordersData = await getOrders();
        
        // Ensure ordersData is an array
        const validOrdersData = Array.isArray(ordersData) ? ordersData : [];
        
        // Sort orders by date and time (most recent first)
        const sortedOrders = [...validOrdersData].sort((a, b) => {
          // Create date objects from date and time strings
          // Add fallbacks for missing date/time
          const dateA = new Date(`${a.Date || '2023-01-01'} ${a.Time || '00:00'}`);
          const dateB = new Date(`${b.Date || '2023-01-01'} ${b.Time || '00:00'}`);
          return dateB - dateA; // Sort in descending order (newest first)
        });
        
        // Show all orders for both roles, but limit to most recent 9 for dashboard
        const filteredOrders = sortedOrders.slice(0, 9);
        
        // Set the orders in state - important to set this before the dishes
        setOrders(filteredOrders);
        
        // Fetch dishes for order details
        const dishesData = await getDishes();
        
        // Ensure dishesData is an array
        const validDishesData = Array.isArray(dishesData) ? dishesData : [];
        
        // Set the dishes in state
        setDishes(validDishesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Keep default empty arrays when error occurs
      } finally {
        // Set loading to false after everything is done
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle order status update
  const handleOrderStatusUpdate = async () => {
    try {
      // Refetch orders
      const ordersData = await getOrders();
      
      // Ensure ordersData is an array
      const validOrdersData = Array.isArray(ordersData) ? ordersData : [];
      
      // Sort orders by date and time (most recent first)
      const sortedOrders = [...validOrdersData].sort((a, b) => {
        // Create date objects from date and time strings
        // Add fallbacks for missing date/time
        const dateA = new Date(`${a.Date || '2023-01-01'} ${a.Time || '00:00'}`);
        const dateB = new Date(`${b.Date || '2023-01-01'} ${b.Time || '00:00'}`);
        return dateB - dateA; // Sort in descending order (newest first)
      });
      
      // Show all orders for both roles, but limit to most recent 9 for dashboard
      const filteredOrders = sortedOrders.slice(0, 9);
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error updating orders:', error);
      // Keep existing orders on error
    }
  };
  
  // Calculate dashboard stats
  const getTotalRevenue = () => {
    return orders.reduce((sum, order) => {
      return order['Payment Status'] ? sum + order.Amount : sum;
    }, 0).toFixed(2);
  };
  
  const getPendingOrders = () => {
    return orders.filter(order => !order['Serving Status']).length;
  };
  
  const getCompletedOrders = () => {
    return orders.filter(order => order['Serving Status']).length;
  };

  // Get available dishes count
  const getAvailableDishes = () => {
    return dishes.filter(dish => dish.Available).length;
  };
  
  const renderOrders = () => {
    if (loading) {
      return <AnimatedLoader />;
    }
    
    if (!orders || orders.length === 0) {
      return (
        <Card>
          <CardBody className={styles.noOrders}>
            <p className="text-lg text-gray-500">No orders available</p>
          </CardBody>
        </Card>
      );
    }
    
    return (
      <div className={styles.ordersGrid}>
        {orders.map((order, index) => (
          <div 
            key={order['Order Id']} 
            className={styles.orderCard}
          >
            <EnhancedOrderCard 
              order={order} 
              onStatusUpdate={handleOrderStatusUpdate}
              dishes={dishes}
            />
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className={styles.dashboard}>
      {/* Notification panel component */}
      <h1 className={styles.dashboardTitle}>Dashboard Overview</h1>
      <div className={styles.statCardGrid} style={{marginTop: '20px'}}>
        <EnhancedStatCard
          title="Total Revenue"
          value={`₹${getTotalRevenue()}`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          change="15"
          changeType="increase"
          cardType="revenue"
        />
        
        <EnhancedStatCard
          title="Pending Orders"
          value={getPendingOrders()}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          cardType="pending"
        />
        
        <EnhancedStatCard
          title="Completed Orders"
          value={getCompletedOrders()}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          change="8"
          changeType="increase"
          cardType="completed"
        />
        
        <EnhancedStatCard
          title="Available Dishes"
          value={getAvailableDishes()}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          }
          cardType="dishes"
        />
      </div>
      
      <div className={styles.ordersSection}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={styles.ordersTitle}>
            Recent Orders
          </h2>
          
          {/* View All Orders button - visible to all users */}
          {orders && orders.length > 0 && (
            <Link href="/orders" className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 flex items-center">
              View All Orders
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
        
        {renderOrders()}
      </div>
    </div>
  );
}

export default Dashboard;