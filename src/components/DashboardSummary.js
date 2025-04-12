import React, { useState, useEffect } from 'react';

const DashboardSummary = ({ orders, dishes }) => {
  const [animatedRevenue, setAnimatedRevenue] = useState(0);
  const [animatedOrders, setAnimatedOrders] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  
  // Calculate total revenue
  const totalRevenue = orders.reduce((sum, order) => {
    return order['Payment Status'] ? sum + order.Amount : sum;
  }, 0);
  
  // Calculate total orders count
  const totalOrders = orders.length;
  
  // Get top dishes (most ordered)
  const getTopDishes = () => {
    // Create a frequency map of dishes
    const dishFrequency = {};
    
    orders.forEach(order => {
      order.Dishes.forEach(item => {
        const dishId = item['DishId'];
        dishFrequency[dishId] = (dishFrequency[dishId] || 0) + item.Quantity;
      });
    });
    
    // Sort dishes by frequency and get top 3
    const sortedDishes = Object.entries(dishFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([dishId, count]) => {
        const dish = dishes.find(d => d['DishId'] === parseInt(dishId) || d['DishId'] === dishId);
        return {
          name: dish ? dish.Name : `Dish #${dishId}`,
          count
        };
      });
    
    return sortedDishes;
  };
  
  // Animate numbers counting up on mount
  useEffect(() => {
    // Show the summary with a delay for entrance animation
    setTimeout(() => {
      setShowSummary(true);
    }, 500);
    
    // Animate revenue counter
    const revenueDuration = 2000; // 2 seconds
    const revenueIncrement = totalRevenue / (revenueDuration / 16);
    let currentRevenue = 0;
    
    const revenueInterval = setInterval(() => {
      currentRevenue += revenueIncrement;
      
      if (currentRevenue >= totalRevenue) {
        setAnimatedRevenue(totalRevenue);
        clearInterval(revenueInterval);
      } else {
        setAnimatedRevenue(currentRevenue);
      }
    }, 16);
    
    // Animate orders counter
    const ordersDuration = 1500; // 1.5 seconds
    const ordersIncrement = totalOrders / (ordersDuration / 50);
    let currentOrders = 0;
    
    const ordersInterval = setInterval(() => {
      currentOrders += ordersIncrement;
      
      if (currentOrders >= totalOrders) {
        setAnimatedOrders(totalOrders);
        clearInterval(ordersInterval);
      } else {
        setAnimatedOrders(Math.floor(currentOrders));
      }
    }, 50);
    
    return () => {
      clearInterval(revenueInterval);
      clearInterval(ordersInterval);
    };
  }, [totalRevenue, totalOrders]);

  // Get top dishes
  const topDishes = getTopDishes();
  
  return (
    <div className={`bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg p-6 text-white overflow-hidden relative mb-8 transform transition-all duration-500 ${showSummary ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -ml-20 -mb-20"></div>
      
      <div className="relative z-10">
        <h2 className="text-2xl font-bold mb-4">Dashboard Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-filter backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-2">Revenue Overview</h3>
            <div className="text-3xl font-bold mb-4">
              ₹{Math.floor(animatedRevenue).toLocaleString()}
              <span className="text-sm font-normal ml-2">total earnings</span>
            </div>
            
            <div className="h-2 bg-white bg-opacity-30 rounded-full mb-1 overflow-hidden">
              <div 
                className="h-2 bg-white rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, (animatedRevenue / 100000) * 100)}%` }}
              ></div>
            </div>
            <div className="text-xs">
              {Math.min(100, Math.floor((animatedRevenue / 100000) * 100))}% of monthly target
            </div>
          </div>
          
          <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-filter backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-2">Order Statistics</h3>
            <div className="text-3xl font-bold mb-4">
              {animatedOrders}
              <span className="text-sm font-normal ml-2">total orders</span>
            </div>
            
            <div className="flex items-center mb-1">
              <div className="w-24 text-xs">Completed</div>
              <div className="flex-1 h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
                <div 
                  className="h-2 bg-green-300 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${orders.filter(o => o['Serving Status']).length / Math.max(1, orders.length) * 100}%` }}
                ></div>
              </div>
              <div className="ml-2 text-xs">{Math.round(orders.filter(o => o['Serving Status']).length / Math.max(1, orders.length) * 100)}%</div>
            </div>
            
            <div className="flex items-center">
              <div className="w-24 text-xs">Paid</div>
              <div className="flex-1 h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
                <div 
                  className="h-2 bg-blue-300 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${orders.filter(o => o['Payment Status']).length / Math.max(1, orders.length) * 100}%` }}
                ></div>
              </div>
              <div className="ml-2 text-xs">{Math.round(orders.filter(o => o['Payment Status']).length / Math.max(1, orders.length) * 100)}%</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white bg-opacity-20 p-4 rounded-lg backdrop-filter backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-3">Top Dishes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topDishes.map((dish, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : 'bg-yellow-700'} text-gray-900 font-bold`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">{dish.name}</div>
                  <div className="text-xs">{dish.count} orders</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;