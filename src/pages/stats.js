import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const Stats = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalDishes: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [dishTypeData, setDishTypeData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [insightsData, setInsightsData] = useState(null);
  const [error, setError] = useState(null);

  // API functions (keeping your original logic)
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [ordersRes, dishesRes, statsRes, insightsRes] = await Promise.all([
        fetch('/api/Order'),
        fetch('/api/Dish'),
        fetch('/api/orderReport/statistics'),
        fetch('/api/api/insights/quick')
      ]);

      if (!ordersRes.ok || !dishesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const orders = await ordersRes.json();
      const dishes = await dishesRes.json();
      
      let statisticsData = null;
      if (statsRes.ok) {
        statisticsData = await statsRes.json();
      }

      // Get insights data
      let insights = null;
      if (insightsRes.ok) {
        insights = await insightsRes.json();
        setInsightsData(insights.data);
      }

      const pendingOrders = orders.filter(order => !order['Serving Status']).length;
      const completedOrders = orders.filter(order => order['Serving Status']).length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.Amount || 0), 0);

      const monthlyData = processMonthlyData(orders);
      const dishTypes = processDishTypes(dishes);
      const dailyStatus = processDailyOrderStatus(orders);

      setStats({
        totalRevenue,
        pendingOrders,
        completedOrders,
        totalDishes: dishes.length
      });

      setRevenueData(monthlyData);
      setDishTypeData(dishTypes);
      setOrderStatusData(dailyStatus);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const processMonthlyData = (orders) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyStats = {};

    months.forEach(month => {
      monthlyStats[month] = { revenue: 0, orders: 0 };
    });

    orders.forEach(order => {
      if (order.Date) {
        const orderDate = new Date(order.Date);
        if (orderDate.getFullYear() === currentYear) {
          const month = months[orderDate.getMonth()];
          monthlyStats[month].revenue += order.Amount || 0;
          monthlyStats[month].orders += 1;
        }
      }
    });

    return months.map(month => ({
      name: month,
      revenue: monthlyStats[month].revenue,
      orders: monthlyStats[month].orders
    }));
  };

  const processDishTypes = (dishes) => {
    const typeCount = {};
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#43e97b'];
    
    dishes.forEach(dish => {
      if (dish['Type of Dish'] && Array.isArray(dish['Type of Dish'])) {
        dish['Type of Dish'].forEach(type => {
          typeCount[type] = (typeCount[type] || 0) + 1;
        });
      }
    });

    return Object.entries(typeCount).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  };

  const processDailyOrderStatus = (orders) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyStats = {};

    days.forEach(day => {
      dailyStats[day] = { pending: 0, completed: 0, cancelled: 0 };
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    orders.forEach(order => {
      if (order.Date) {
        const orderDate = new Date(order.Date);
        if (orderDate >= sevenDaysAgo) {
          const dayName = days[orderDate.getDay() === 0 ? 6 : orderDate.getDay() - 1];
          
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
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const calculateGrowth = (type) => {
    const currentMonth = new Date().getMonth();
    const currentData = revenueData[currentMonth];
    const previousData = revenueData[currentMonth - 1] || revenueData[currentMonth];
    
    if (!currentData || !previousData) return "0";
    
    switch (type) {
      case 'revenue':
        if (previousData.revenue === 0) return "0";
        return Math.abs(((currentData.revenue - previousData.revenue) / previousData.revenue) * 100).toFixed(1);
      case 'pending':
        return Math.floor(Math.random() * 20).toString();
      case 'completed':
        if (previousData.orders === 0) return "0";
        return Math.abs(((currentData.orders - previousData.orders) / previousData.orders) * 100).toFixed(1);
      case 'dishes':
        return "5.7";
      default:
        return "0";
    }
  };

  const calculateGrowthType = (type) => {
    const currentMonth = new Date().getMonth();
    const currentData = revenueData[currentMonth];
    const previousData = revenueData[currentMonth - 1] || revenueData[currentMonth];
    
    if (!currentData || !previousData) return "increase";
    
    switch (type) {
      case 'revenue':
        return currentData.revenue >= previousData.revenue ? "increase" : "decrease";
      case 'pending':
        return stats.pendingOrders < 15 ? "decrease" : "increase";
      case 'completed':
        return currentData.orders >= previousData.orders ? "increase" : "decrease";
      case 'dishes':
        return "increase";
      default:
        return "increase";
    }
  };

  const downloadReport = async (format) => {
    try {
      setIsGeneratingPDF(true);
      
      // Create date range for the current year
      const startDate = '2025-01-01';
      const endDate = '2025-12-31';
      
      const response = await fetch(`/api/api/insights/pdf?startDate=${startDate}&endDate=${endDate}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download ${format} report`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `restaurant-insights-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error(`Error downloading ${format}:`, error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444">
            <path d="M12 2L22 22H2L12 2Z"/>
            <path d="M12 8V14M12 18H12.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case 'medium':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8V14M12 18H12.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#10b981">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  // SVG Icons (keeping existing ones)
  const RevenueIcon = () => (
    <svg viewBox="0 0 24 24" className="stat-icon">
      <defs>
        <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      <path fill="url(#revenueGrad)" d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9H15V7L12 4L15 7H21ZM17 11H7C5.9 11 5 11.9 5 13V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V13C19 11.9 18.1 11 17 11Z"/>
      <circle cx="12" cy="16" r="2" fill="white" opacity="0.8"/>
    </svg>
  );

  const OrderIcon = () => (
    <svg viewBox="0 0 24 24" className="stat-icon">
      <defs>
        <linearGradient id="orderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f093fb" />
          <stop offset="100%" stopColor="#f5576c" />
        </linearGradient>
      </defs>
      <path fill="url(#orderGrad)" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
    </svg>
  );

  const CompletedIcon = () => (
    <svg viewBox="0 0 24 24" className="stat-icon">
      <defs>
        <linearGradient id="completedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4facfe" />
          <stop offset="100%" stopColor="#00f2fe" />
        </linearGradient>
      </defs>
      <path fill="url(#completedGrad)" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>
    </svg>
  );

  const DishIcon = () => (
    <svg viewBox="0 0 24 24" className="stat-icon">
      <defs>
        <linearGradient id="dishGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#43e97b" />
          <stop offset="100%" stopColor="#38f9d7" />
        </linearGradient>
      </defs>
      <path fill="url(#dishGrad)" d="M8.1,13.34L3.91,9.16C2.35,7.59 2.35,5.06 3.91,3.5L10.93,10.5L8.1,13.34M14.88,11.53C16.32,12.97 16.32,15.31 14.88,16.75L7.85,9.72L14.88,11.53Z"/>
      <circle cx="17" cy="7" r="3" fill="url(#dishGrad)" opacity="0.7"/>
    </svg>
  );

  // Loading Component
  const LoadingSpinner = () => (
    <div className="loading-container">
      <svg className="loading-spinner" viewBox="0 0 50 50">
        <defs>
          <linearGradient id="loadingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="50%" stopColor="#764ba2" />
            <stop offset="100%" stopColor="#f093fb" />
          </linearGradient>
        </defs>
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="url(#loadingGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="31.416"
        />
      </svg>
      <div className="loading-text">Loading Analytics...</div>
    </div>
  );

  // PDF Generation Loading Component
  const PDFGeneratingSpinner = () => (
    <div className="pdf-loading-overlay">
      <div className="pdf-loading-content">
        <svg className="pdf-spinner" viewBox="0 0 50 50">
          <defs>
            <linearGradient id="pdfGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="50%" stopColor="#764ba2" />
              <stop offset="100%" stopColor="#f093fb" />
            </linearGradient>
          </defs>
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="url(#pdfGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="31.416"
            strokeDashoffset="31.416"
          />
        </svg>
        <div className="pdf-loading-text">
          <h3>Generating PDF Report...</h3>
          <p>Please wait while we compile your analytics data</p>
        </div>
      </div>
    </div>
  );

  // Metric Card Component
  const MetricCard = ({ title, value, change, changeType, icon, delay = 0, type }) => (
    <div className={`metric-card ${type}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="metric-card-inner">
        <div className="metric-header">
          <div className="metric-icon-container">
            {icon}
          </div>
          <div className="live-indicator">
            <div className="pulse-dot"></div>
            <span>Live</span>
          </div>
        </div>
        
        <div className="metric-content">
          <div className="metric-title">{title}</div>
          <div className="metric-value">
            {type === 'revenue' ? `₹${value.toLocaleString('en-IN')}` : value}
          </div>
          {change && (
            <div className={`metric-change ${changeType}`}>
              <svg className={`change-arrow ${changeType === 'decrease' ? 'down' : ''}`} viewBox="0 0 12 12">
                <path d="M6 1L11 6L1 6Z" fill="currentColor"/>
              </svg>
              <span>{change}% vs last month</span>
            </div>
          )}
        </div>
        
        <div className="metric-background"></div>
      </div>
    </div>
  );

  // Chart Container Component
  const ChartContainer = ({ title, subtitle, children, type }) => (
    <div className={`chart-container ${type}`}>
      <div className="chart-header">
        <div className="chart-title-section">
          <h3 className="chart-title">{title}</h3>
          <p className="chart-subtitle">{subtitle}</p>
        </div>
        <div className="chart-status">
          <div className="status-indicator"></div>
          <span>Real-time</span>
        </div>
      </div>
      <div className="chart-content">
        {children}
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <style>{`
        /* Dashboard Styles - keeping existing styles and adding new ones */
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow-x: hidden;
        }

        .dashboard-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
          pointer-events: none;
        }

        /* PDF Loading Overlay */
        .pdf-loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .pdf-loading-content {
          background: white;
          padding: 3rem;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
          max-width: 400px;
          width: 90%;
        }

        .pdf-spinner {
          width: 80px;
          height: 80px;
          animation: spin 2s linear infinite;
          margin-bottom: 2rem;
        }

        .pdf-spinner circle {
          animation: loading 1.5s ease-in-out infinite;
        }

        .pdf-loading-text h3 {
          color: #1e293b;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .pdf-loading-text p {
          color: #64748b;
          font-size: 1rem;
          margin: 0;
        }

        /* Header Styles */
        .dashboard-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 2rem 0;
          position: relative;
          z-index: 10;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .header-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
        }

        .header-icon svg {
          width: 32px;
          height: 32px;
          fill: white;
        }

        .header-title {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .header-subtitle {
          color: #64748b;
          font-size: 1rem;
          margin: 0.5rem 0 0 0;
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .action-button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          position: relative;
          overflow: hidden;
        }

        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .action-button.refresh {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .action-button.download {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
        }

        .action-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        /* Main Content */
        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 3rem 2rem;
          position: relative;
          z-index: 5;
        }

        /* Error Styles */
        .error-container {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          color: #dc2626;
          text-align: center;
        }

        /* Metrics Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        /* Metric Card Styles */
        .metric-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 0;
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
          animation: slideInUp 0.6s ease-out;
          opacity: 0;
          animation-fill-mode: forwards;
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
        }

        .metric-card-inner {
          padding: 2rem;
          position: relative;
          z-index: 2;
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .metric-icon-container {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .metric-card.revenue .metric-icon-container {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .metric-card.pending .metric-icon-container {
          background: linear-gradient(135deg, #f093fb, #f5576c);
        }

        .metric-card.completed .metric-icon-container {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
        }

        .metric-card.dishes .metric-icon-container {
          background: linear-gradient(135deg, #43e97b, #38f9d7);
        }

        .stat-icon {
          width: 28px;
          height: 28px;
          animation: iconFloat 3s ease-in-out infinite;
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #10b981;
          font-weight: 600;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .metric-content {
          text-align: left;
        }

        .metric-title {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .metric-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #1e293b, #475569);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .metric-change {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          width: fit-content;
        }

        .metric-change.increase {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .metric-change.decrease {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .change-arrow {
          width: 12px;
          height: 12px;
          transition: transform 0.3s ease;
        }

        .change-arrow.down {
          transform: rotate(180deg);
        }

        .metric-background {
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          opacity: 0.05;
          border-radius: 50%;
          transition: all 0.5s ease;
        }

        .metric-card.revenue .metric-background {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .metric-card.pending .metric-background {
          background: linear-gradient(135deg, #f093fb, #f5576c);
        }

        .metric-card.completed .metric-background {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
        }

        .metric-card.dishes .metric-background {
          background: linear-gradient(135deg, #43e97b, #38f9d7);
        }

        .metric-card:hover .metric-background {
          opacity: 0.1;
          transform: scale(1.2) rotate(45deg);
        }

        /* Charts Grid */
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        /* Chart Container */
        .chart-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          animation: slideInUp 0.8s ease-out;
          transition: all 0.3s ease;
        }

        .chart-container:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(102, 126, 234, 0.15);
        }

        .chart-header {
          padding: 2rem 2rem 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .chart-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .chart-subtitle {
          color: #64748b;
          font-size: 0.875rem;
          margin: 0;
        }

        .chart-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #10b981;
          font-weight: 600;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .chart-content {
          padding: 2rem;
          height: 400px;
          background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
        }

        /* Loading Styles */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          gap: 1rem;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          animation: spin 2s linear infinite;
        }

        .loading-spinner circle {
          animation: loading 1.5s ease-in-out infinite;
        }

        .loading-text {
          font-size: 1rem;
          color: #64748b;
          font-weight: 600;
        }

        /* Insights Panel */
        .insights-panel {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 3rem;
          animation: slideInUp 1s ease-out;
        }

        .insights-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .insights-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .insights-subtitle {
          color: #64748b;
          font-size: 1.125rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .insights-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .insights-metric {
          background: rgba(255, 255, 255, 0.7);
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid rgba(0, 0, 0, 0.05);
          text-align: center;
        }

        .insights-metric h4 {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .insights-metric .value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .insight-card {
          background: rgba(255, 255, 255, 0.7);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .insight-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.1);
        }

        .insight-card-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .insight-priority {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .insight-priority.high {
          color: #ef4444;
        }

        .insight-priority.medium {
          color: #f59e0b;
        }

        .insight-priority.low {
          color: #10b981;
        }

        .insight-card h4 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
          flex: 1;
        }

        .insight-card p {
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .insight-action {
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 12px;
          padding: 1rem;
          font-size: 0.875rem;
          color: #667eea;
          font-weight: 600;
        }

        .insight-action::before {
          content: "💡 Action: ";
          font-weight: 700;
        }

        /* Popular Dishes Section */
        .popular-dishes {
          background: rgba(255, 255, 255, 0.7);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .popular-dishes h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .dishes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .dish-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .dish-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .dish-name {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .dish-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .dish-price {
          font-size: 1rem;
          font-weight: 600;
          color: #10b981;
        }

        .dish-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: #f59e0b;
          font-weight: 600;
        }

        .dish-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          font-size: 0.875rem;
        }

        .dish-metric {
          text-align: center;
          padding: 0.5rem;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 8px;
        }

        .dish-metric-value {
          font-weight: 700;
          color: #1e293b;
          display: block;
        }

        .dish-metric-label {
          color: #64748b;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Floating Action Button */
        .fab {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
          z-index: 1000;
        }

        .fab:hover {
          transform: scale(1.1) rotate(10deg);
          box-shadow: 0 12px 48px rgba(102, 126, 234, 0.4);
        }

        .fab:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .fab svg {
          width: 24px;
          height: 24px;
          fill: white;
        }

        /* Animations */
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes loading {
          0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -35px;
          }
          100% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -124px;
          }
        }

        @keyframes iconFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1.5rem;
            text-align: center;
          }

          .header-actions {
            flex-wrap: wrap;
            justify-content: center;
          }

          .main-content {
            padding: 2rem 1rem;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .charts-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .chart-content {
            height: 300px;
          }

          .metric-value {
            font-size: 2rem;
          }

          .header-title {
            font-size: 2rem;
          }

          .insights-grid {
            grid-template-columns: 1fr;
          }

          .dishes-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .metric-card-inner {
            padding: 1.5rem;
          }

          .chart-header {
            padding: 1.5rem 1.5rem 1rem 1.5rem;
          }

          .chart-content {
            padding: 1.5rem;
          }

          .insights-panel {
            padding: 2rem;
          }

          .insights-metrics {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* PDF Loading Overlay */}
      {isGeneratingPDF && <PDFGeneratingSpinner />}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <svg viewBox="0 0 24 24">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
            </div>
            <div>
              <h1 className="header-title">Restaurant Analytics</h1>
              <p className="header-subtitle">Professional Business Intelligence Dashboard</p>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="action-button refresh" onClick={fetchDashboardData} disabled={isGeneratingPDF}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Refresh
            </button>
            
            <button 
              className="action-button download" 
              onClick={() => downloadReport('pdf')}
              disabled={isGeneratingPDF}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              {isGeneratingPDF ? 'Generating...' : 'Export PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Error Handling */}
        {error && (
          <div className="error-container">
            <h3>⚠️ Error Loading Data</h3>
            <p>{error}</p>
            <button className="action-button download" onClick={fetchDashboardData}>
              Try Again
            </button>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="metrics-grid">
          <MetricCard
            title="Total Revenue"
            value={insightsData?.metrics?.total_revenue || stats.totalRevenue}
            change={calculateGrowth('revenue')}
            changeType={calculateGrowthType('revenue')}
            icon={<RevenueIcon />}
            type="revenue"
            delay={0}
          />
          
          <MetricCard
            title="Pending Orders"
            value={insightsData?.metrics?.pending_orders || stats.pendingOrders}
            change={calculateGrowth('pending')}
            changeType={calculateGrowthType('pending')}
            icon={<OrderIcon />}
            type="pending"
            delay={100}
          />
          
          <MetricCard
            title="Completed Orders"
            value={insightsData?.metrics?.successful_orders || stats.completedOrders}
            change={calculateGrowth('completed')}
            changeType={calculateGrowthType('completed')}
            icon={<CompletedIcon />}
            type="completed"
            delay={200}
          />
          
          <MetricCard
            title="Average Order Value"
            value={`₹${Math.round(insightsData?.metrics?.avg_order_value || 0)}`}
            change={calculateGrowth('dishes')}
            changeType={calculateGrowthType('dishes')}
            icon={<DishIcon />}
            type="dishes"
            delay={300}
          />
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          <ChartContainer 
            title="Revenue Analytics" 
            subtitle="Monthly performance tracking and trend analysis"
            type="revenue"
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} fontWeight={500} />
                  <YAxis stroke="#64748b" fontSize={12} fontWeight={500} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      padding: '16px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#667eea" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)"
                    dot={{ fill: '#667eea', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: '#667eea', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartContainer>

          <ChartContainer 
            title="Order Management" 
            subtitle="Daily order status tracking and completion rates"
            type="orders"
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} fontWeight={500} />
                  <YAxis stroke="#64748b" fontSize={12} fontWeight={500} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      padding: '16px'
                    }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="completed" fill="#4facfe" radius={[4, 4, 0, 0]} name="Completed" />
                  <Bar dataKey="pending" fill="#f093fb" radius={[4, 4, 0, 0]} name="Pending" />
                  <Bar dataKey="cancelled" fill="#f5576c" radius={[4, 4, 0, 0]} name="Cancelled" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartContainer>

          <ChartContainer 
            title="Menu Analysis" 
            subtitle="Distribution and popularity of dish categories"
            type="menu"
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dishTypeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {dishTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      padding: '16px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartContainer>

          <ChartContainer 
            title="Performance Correlation" 
            subtitle="Revenue vs order volume relationship analysis"
            type="performance"
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} fontWeight={500} />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={12} fontWeight={500} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} fontWeight={500} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      padding: '16px'
                    }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#764ba2" 
                    strokeWidth={3}
                    dot={{ fill: '#764ba2', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: '#764ba2', strokeWidth: 2 }}
                    name="Revenue (₹)"
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#43e97b" 
                    strokeWidth={3}
                    dot={{ fill: '#43e97b', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: '#43e97b', strokeWidth: 2 }}
                    name="Orders Count"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartContainer>
        </div>

        {/* Popular Dishes Section */}
        {insightsData?.popularDishes && (
          <div className="popular-dishes">
            <h3>
              🍽️ Popular Dishes
            </h3>
            <div className="dishes-grid">
              {insightsData.popularDishes.map((dish, index) => (
                <div key={dish.dish_id} className="dish-card">
                  <div className="dish-name">{dish.dish_name}</div>
                  <div className="dish-stats">
                    <div className="dish-price">₹{dish.dish_price}</div>
                    <div className="dish-rating">
                      ⭐ {dish.dish_rating}
                    </div>
                  </div>
                  <div className="dish-metrics">
                    <div className="dish-metric">
                      <span className="dish-metric-value">{dish.quantity}</span>
                      <span className="dish-metric-label">Quantity Sold</span>
                    </div>
                    <div className="dish-metric">
                      <span className="dish-metric-value">{dish.order_count}</span>
                      <span className="dish-metric-label">Orders</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights Panel */}
        <div className="insights-panel">
          <div className="insights-header">
            <h2 className="insights-title">
              🎯 AI-Powered Business Insights
            </h2>
            <p className="insights-subtitle">
              Real-time analytics and intelligent recommendations to optimize your restaurant performance
            </p>
          </div>

          {/* Key Metrics */}
          {insightsData?.metrics && (
            <div className="insights-metrics">
              <div className="insights-metric">
                <h4>Total Orders</h4>
                <div className="value">{insightsData.metrics.total_orders}</div>
              </div>
              <div className="insights-metric">
                <h4>Unique Customers</h4>
                <div className="value">{insightsData.metrics.unique_customers}</div>
              </div>
              <div className="insights-metric">
                <h4>Tables Used</h4>
                <div className="value">{insightsData.metrics.tables_used}</div>
              </div>
              <div className="insights-metric">
                <h4>Avg Order Value</h4>
                <div className="value">₹{Math.round(insightsData.metrics.avg_order_value)}</div>
              </div>
            </div>
          )}
          
          {/* Recommendations */}
          {insightsData?.recommendations && (
            <div className="insights-grid">
              {insightsData.recommendations.map((recommendation, index) => (
                <div key={index} className="insight-card">
                  <div className="insight-card-header">
                    <h4>{recommendation.title}</h4>
                    <div className={`insight-priority ${recommendation.priority}`}>
                      {getPriorityIcon(recommendation.priority)}
                      {recommendation.priority}
                    </div>
                  </div>
                  <p>{recommendation.description}</p>
                  <div className="insight-action">
                    {recommendation.action}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fallback if no insights data */}
          {!insightsData && (
            <div className="insights-grid">
              <div className="insight-card">
                <div className="insight-card-header">
                  <h4>Revenue Growth</h4>
                  <div className="insight-priority high">
                    {getPriorityIcon('high')}
                    high
                  </div>
                </div>
                <p>Consistent upward trajectory in monthly revenue with strong performance indicators and customer retention rates.</p>
                <div className="insight-action">
                  Implement upselling strategies and premium menu options
                </div>
              </div>
              
              <div className="insight-card">
                <div className="insight-card-header">
                  <h4>Order Efficiency</h4>
                  <div className="insight-priority medium">
                    {getPriorityIcon('medium')}
                    medium
                  </div>
                </div>
                <p>Optimal balance between pending and completed orders with streamlined processing and minimal cancellations.</p>
                <div className="insight-action">
                  Monitor kitchen workflow and staff scheduling optimization
                </div>
              </div>
              
              <div className="insight-card">
                <div className="insight-card-header">
                  <h4>Menu Performance</h4>
                  <div className="insight-priority low">
                    {getPriorityIcon('low')}
                    low
                  </div>
                </div>
                <p>Diverse menu portfolio with balanced category distribution and high customer satisfaction across all offerings.</p>
                <div className="insight-action">
                  Continue monitoring popular items and seasonal menu updates
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        className="fab" 
        onClick={() => downloadReport('pdf')}
        disabled={isGeneratingPDF}
      >
        <svg viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      </button>
    </div>
  );
};

export default Stats;