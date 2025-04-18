import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem, 
  Button,
  Chip,
  Input,
  Badge
} from '@nextui-org/react';
import { getOrders, getDishes } from '../utils/api';
import useAuth from '../hooks/useAuth';
import OrderCard from '../components/OrderCard';
import AnimatedLoader from '../components/AnimatedLoader';
import styles from '../styles/Orders.module.css';
import { subscribeToOrders, unsubscribeFromOrders, initializeSocket } from '../utils/socketService';
import { toast } from 'react-hot-toast'; // Add toast for notifications

function Orders() {
  const { role } = useAuth();
  const [orders, setOrders] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showStats, setShowStats] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all orders
        const ordersData = await getOrders();
        setOrders(ordersData);
        
        // Fetch dishes for order details
        const dishesData = await getDishes();
        setDishes(dishesData);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Initialize socket connection
    initializeSocket();
    
    // Subscribe to order events
    subscribeToOrders(handleOrderEvent);
    
    // Cleanup on component unmount
    return () => {
      unsubscribeFromOrders();
    };
  }, []);
  
  // Handle socket events related to orders
  const handleOrderEvent = (eventType, data) => {
    switch (eventType) {
      case 'created':
        // Add new order to the list
        setOrders(prevOrders => [data, ...prevOrders]);
        toast.success('New order received!');
        break;
        
      case 'updated':
        // Update the order in the list
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order['Order Id'] === data['Order Id'] ? data : order
          )
        );
        break;
        
      case 'status_updated':
        // Update only the specific status field
        setOrders(prevOrders => 
          prevOrders.map(order => {
            if (order['Order Id'] === data.orderId) {
              // Create a copy of the order
              const updatedOrder = { ...order };
              
              // Update the specific status field
              if (data.status === 'serving') {
                updatedOrder['Serving Status'] = data.value;
              } else if (data.status === 'payment') {
                updatedOrder['Payment Status'] = data.value;
              }
              
              return updatedOrder;
            }
            return order;
          })
        );
        break;
        
      case 'deleted':
        // Remove the order from the list
        setOrders(prevOrders => 
          prevOrders.filter(order => order['Order Id'] !== data)
        );
        toast.info('An order has been deleted');
        break;
        
      default:
        console.log('Unknown event type:', eventType);
    }
  };
  
  // Handle order status update (now only needed for local updates)
  const handleOrderStatusUpdate = async () => {
    try {
      const ordersData = await getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error updating orders:', error);
      toast.error('Failed to update orders');
    }
  };
  
  // Filter orders based on selected filter
  const getFilteredOrders = () => {
    let filteredOrders = [...orders];
    
    // Apply main filter category
    if (activeCategory === 'preparing') {
      filteredOrders = filteredOrders.filter(order => !order['Serving Status']);
    } else if (activeCategory === 'prepared') {
      filteredOrders = filteredOrders.filter(order => order['Serving Status']);
    } else if (activeCategory === 'unpaid') {
      filteredOrders = filteredOrders.filter(order => !order['Payment Status']);
    } else if (activeCategory === 'paid') {
      filteredOrders = filteredOrders.filter(order => order['Payment Status']);
    }
    
    // Apply additional filter
    if (filter === 'serving') {
      filteredOrders = filteredOrders.filter(order => !order['Serving Status']);
    } else if (filter === 'served') {
      filteredOrders = filteredOrders.filter(order => order['Serving Status']);
    } else if (filter === 'unpaid') {
      filteredOrders = filteredOrders.filter(order => !order['Payment Status']);
    } else if (filter === 'paid') {
      filteredOrders = filteredOrders.filter(order => order['Payment Status']);
    }
    
    // Apply search filter if any
    if (searchTerm) {
      filteredOrders = filteredOrders.filter(order => {
        const orderIdMatch = order['Order Id'].toString().includes(searchTerm);
        const tableMatch = order['Table No']?.toString().includes(searchTerm);
        return orderIdMatch || tableMatch;
      });
    }
    
    // Sort orders
    if (sortBy === 'newest') {
      filteredOrders.sort((a, b) => new Date(b.Date + ' ' + b.Time) - new Date(a.Date + ' ' + a.Time));
    } else if (sortBy === 'oldest') {
      filteredOrders.sort((a, b) => new Date(a.Date + ' ' + a.Time) - new Date(b.Date + ' ' + b.Time));
    } else if (sortBy === 'amount-high') {
      filteredOrders.sort((a, b) => b.Amount - a.Amount);
    } else if (sortBy === 'amount-low') {
      filteredOrders.sort((a, b) => a.Amount - b.Amount);
    }
    
    return filteredOrders;
  };
  
  // Get stats for the header section
  const getStats = () => {
    const totalOrders = orders.length;
    const preparingCount = orders.filter(order => !order['Serving Status']).length;
    const completedCount = orders.filter(order => order['Serving Status']).length;
    const paidCount = orders.filter(order => order['Payment Status']).length;
    const unpaidCount = orders.filter(order => !order['Payment Status']).length;
    
    return {
      total: totalOrders,
      preparing: preparingCount,
      completed: completedCount,
      paid: paidCount,
      unpaid: unpaidCount
    };
  };
  
  const stats = getStats();
  const filteredOrders = getFilteredOrders();
  
  return (
    <div className={styles.ordersContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Order Management</h1>
          <p className={styles.pageSubtitle}>Manage and track all restaurant orders</p>
        </div>
        
        <div className={styles.headerRight}>
          <Input
            className={styles.searchInput}
            placeholder="Search by order ID or table"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            clearable
            onClear={() => setSearchTerm('')}
            startContent={
              <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="flat" 
                className={styles.sortButton}
                startContent={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.sortIcon}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                }
              >
                {sortBy === 'newest' ? 'Newest First' : 
                 sortBy === 'oldest' ? 'Oldest First' :
                 sortBy === 'amount-high' ? 'Amount (High to Low)' :
                 'Amount (Low to High)'}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Sort options"
              selectionMode="single"
              selectedKeys={[sortBy]}
              onSelectionChange={(keys) => setSortBy(Array.from(keys)[0])}
            >
              <DropdownItem key="newest">Newest First</DropdownItem>
              <DropdownItem key="oldest">Oldest First</DropdownItem>
              <DropdownItem key="amount-high">Amount (High to Low)</DropdownItem>
              <DropdownItem key="amount-low">Amount (Low to High)</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          
          <Button 
            className={styles.statsToggleButton}
            variant="light" 
            isIconOnly
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      {showStats && (
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#3b82f6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Total Orders</p>
              <h3 className={styles.statValue}>{stats.total}</h3>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#f59e0b">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Preparing</p>
              <h3 className={styles.statValue}>{stats.preparing}</h3>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#10b981">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Completed</p>
              <h3 className={styles.statValue}>{stats.completed}</h3>
            </div>
          </div>
          
          {role === 'manager' && (
            <>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#10b981">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>Paid</p>
                  <h3 className={styles.statValue}>{stats.paid}</h3>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>Unpaid</p>
                  <h3 className={styles.statValue}>{stats.unpaid}</h3>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        <Button
          className={`${styles.filterTab} ${activeCategory === 'all' ? styles.activeTab : ''}`}
          variant="light"
          onClick={() => setActiveCategory('all')}
        >
          All Orders
          <Badge color="primary" content={stats.total} shape="circle" size="sm" />
        </Button>
        
        <Button
          className={`${styles.filterTab} ${activeCategory === 'preparing' ? styles.activeTab : ''}`}
          variant="light"
          onClick={() => setActiveCategory('preparing')}
        >
          Preparing
          <Badge color="warning" content={stats.preparing} shape="circle" size="sm" />
        </Button>
        
        <Button
          className={`${styles.filterTab} ${activeCategory === 'prepared' ? styles.activeTab : ''}`}
          variant="light"
          onClick={() => setActiveCategory('prepared')}
        >
          Prepared
          <Badge color="success" content={stats.completed} shape="circle" size="sm" />
        </Button>
        
        {role === 'manager' && (
          <>
            <Button
              className={`${styles.filterTab} ${activeCategory === 'paid' ? styles.activeTab : ''}`}
              variant="light"
              onClick={() => setActiveCategory('paid')}
            >
              Paid
              <Badge color="success" content={stats.paid} shape="circle" size="sm" />
            </Button>
            
            <Button
              className={`${styles.filterTab} ${activeCategory === 'unpaid' ? styles.activeTab : ''}`}
              variant="light"
              onClick={() => setActiveCategory('unpaid')}
            >
              Unpaid
              <Badge color="danger" content={stats.unpaid} shape="circle" size="sm" />
            </Button>
          </>
        )}
      </div>
      
      {/* Orders Content */}
      {loading ? (
        <div className={styles.loaderContainer}>
          <AnimatedLoader />
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className={styles.ordersGrid}>
          {filteredOrders.map((order, index) => (
            <div 
              key={order['Order Id']} 
              className={styles.orderCardContainer}
              style={{ animationDelay: `${0.05 * index}s` }}
            >
              <OrderCard 
                order={order} 
                onStatusUpdate={handleOrderStatusUpdate}
                dishes={dishes}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className={styles.noOrdersCard}>
          <CardBody className={styles.noOrdersContent}>
            <div className={styles.noOrdersIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className={styles.noOrdersText}>No orders found</p>
            <p className={styles.noOrdersSubtext}>Try changing your filters or check back later</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default Orders;