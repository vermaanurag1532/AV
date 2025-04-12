import React, { useState, useEffect } from 'react';
import { Card, CardBody, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@nextui-org/react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { getOrders, getDishes } from '../utils/api';
import StatCard from '../components/StatCard';
import { isManager } from '../utils/auth';
import { useRouter } from 'next/router';

function Stats() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState('week');
  const [authorized, setAuthorized] = useState(false);
  
  // Check authorization on mount
  useEffect(() => {
    // Only check on client-side
    const checkAccess = () => {
      const hasAccess = isManager();
      setAuthorized(hasAccess);
      
      if (!hasAccess) {
        router.push('/dashboard');
      } else {
        fetchData();
      }
    };
    
    checkAccess();
  }, [router]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const ordersData = await getOrders();
      setOrders(ordersData);
      
      // Fetch dishes
      const dishesData = await getDishes();
      setDishes(dishesData);
    } catch (error) {
      console.error('Error fetching statistics data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Total Revenue Calculation
  const calculateTotalRevenue = () => {
    return orders.reduce((total, order) => {
      if (order['Payment Status']) {
        return total + order.Amount;
      }
      return total;
    }, 0).toFixed(2);
  };
  
  // Average Order Value
  const calculateAverageOrderValue = () => {
    if (orders.length === 0) return '0.00';
    
    const totalRevenue = orders.reduce((total, order) => {
      return total + order.Amount;
    }, 0);
    
    return (totalRevenue / orders.length).toFixed(2);
  };
  
  // Order Completion Rate
  const calculateCompletionRate = () => {
    if (orders.length === 0) return '0';
    
    const completedOrders = orders.filter(order => order['Serving Status']).length;
    return Math.round((completedOrders / orders.length) * 100);
  };
  
  // Payment Completion Rate
  const calculatePaymentRate = () => {
    if (orders.length === 0) return '0';
    
    const paidOrders = orders.filter(order => order['Payment Status']).length;
    return Math.round((paidOrders / orders.length) * 100);
  };
  
  // Generate revenue data for chart
  const generateRevenueData = () => {
    // For demo, create sample data
    // In real app, this would use the actual orders data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (timeFrame === 'week') {
      return days.map(day => ({
        name: day,
        revenue: Math.floor(Math.random() * 10000) + 5000,
        orders: Math.floor(Math.random() * 30) + 10
      }));
    } else if (timeFrame === 'month') {
      return weeks.map(week => ({
        name: week,
        revenue: Math.floor(Math.random() * 50000) + 30000,
        orders: Math.floor(Math.random() * 100) + 50
      }));
    } else {
      return months.map(month => ({
        name: month,
        revenue: Math.floor(Math.random() * 200000) + 100000,
        orders: Math.floor(Math.random() * 500) + 200
      }));
    }
  };
  
  // Generate top dishes data
  const generateTopDishesData = () => {
    // For demo, return sample data
    // In real app, would analyze orders to find top dishes
    const sampleTopDishes = [
      { name: 'Butter Chicken', value: 42 },
      { name: 'Paneer Tikka', value: 28 },
      { name: 'Vegetable Biryani', value: 25 },
      { name: 'Chicken Fried Rice', value: 20 },
      { name: 'Gulab Jamun', value: 15 }
    ];
    
    return sampleTopDishes;
  };
  
  // Generate order status data
  const generateOrderStatusData = () => {
    const served = orders.filter(order => order['Serving Status']).length;
    const pending = orders.filter(order => !order['Serving Status']).length;
    
    return [
      { name: 'Served', value: served },
      { name: 'Pending', value: pending }
    ];
  };
  
  // Generate payment status data
  const generatePaymentStatusData = () => {
    const paid = orders.filter(order => order['Payment Status']).length;
    const unpaid = orders.filter(order => !order['Payment Status']).length;
    
    return [
      { name: 'Paid', value: paid },
      { name: 'Unpaid', value: unpaid }
    ];
  };
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  // If not authorized, show loading until redirect happens
  if (!authorized) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Restaurant Statistics</h1>
        
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered">
              {timeFrame === 'week' ? 'This Week' : 
               timeFrame === 'month' ? 'This Month' : 'This Year'}
            </Button>
          </DropdownTrigger>
          <DropdownMenu 
            aria-label="Time Frame Options"
            selectionMode="single"
            selectedKeys={[timeFrame]}
            onSelectionChange={keys => setTimeFrame(Array.from(keys)[0])}
          >
            <DropdownItem key="week">This Week</DropdownItem>
            <DropdownItem key="month">This Month</DropdownItem>
            <DropdownItem key="year">This Year</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <StatCard
                title="Total Revenue"
                value={`₹${calculateTotalRevenue()}`}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                change="15"
                changeType="increase"
              />
            </div>
            
            <div>
              <StatCard
                title="Average Order Value"
                value={`₹${calculateAverageOrderValue()}`}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                }
                change="5"
                changeType="increase"
              />
            </div>
            
            <div>
              <StatCard
                title="Order Completion Rate"
                value={`${calculateCompletionRate()}%`}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                change="7"
                changeType="increase"
              />
            </div>
            
            <div>
              <StatCard
                title="Payment Success Rate"
                value={`${calculatePaymentRate()}%`}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
                change="12"
                changeType="increase"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2">
              <Card className="w-full h-96">
                <CardBody>
                  <h2 className="text-xl font-bold mb-4">Revenue Overview</h2>
                  <ResponsiveContainer width="100%" height="90%">
                    <AreaChart
                      data={generateRevenueData()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </div>
            
            <div>
              <Card className="w-full h-96">
                <CardBody>
                  <h2 className="text-xl font-bold mb-4">Top Dishes</h2>
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie
                        data={generateTopDishesData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {generateTopDishesData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Card className="w-full h-80">
                <CardBody>
                  <h2 className="text-xl font-bold mb-4">Order Status</h2>
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie
                        data={generateOrderStatusData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#00C49F" />
                        <Cell fill="#FFBB28" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </div>
            
            <div>
              <Card className="w-full h-80">
                <CardBody>
                  <h2 className="text-xl font-bold mb-4">Payment Status</h2>
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie
                        data={generatePaymentStatusData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#0088FE" />
                        <Cell fill="#FF8042" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Stats;