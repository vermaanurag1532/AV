import React, { useState, useEffect } from 'react';

const WelcomeBanner = ({ user, role }) => {
  const [greeting, setGreeting] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    let newGreeting = '';
    
    if (hour < 12) {
      newGreeting = 'Good Morning';
    } else if (hour < 18) {
      newGreeting = 'Good Afternoon';
    } else {
      newGreeting = 'Good Evening';
    }
    
    setGreeting(newGreeting);
    
    // Set formatted time
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }));
      
      setDate(now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      }));
    };
    
    updateTime();
    const timer = setInterval(updateTime, 30000); // Update every 30 seconds
    
    return () => clearInterval(timer);
  }, []);

  // Get user name (or default if not available)
  const userName = user?.['Admin Name'] || 'User';
  
  // Get role display name
  const getRoleDisplay = () => {
    if (!role) return '';
    
    if (role.toLowerCase() === 'manager') {
      return 'Restaurant Manager';
    } else if (role.toLowerCase() === 'chief' || role.toLowerCase() === 'chef') {
      return 'Head Chef';
    }
    
    return role;
  };
  
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm mb-8 transform transition-all duration-500 opacity-0 translate-y-10" 
         style={{animation: 'fadeInUp 0.7s forwards 0.2s'}}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-600"></div>
      
      <div className="px-6 py-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-3">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{greeting}, {userName}!</h1>
                <p className="text-sm text-gray-500">{getRoleDisplay()}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-3 sm:mt-0">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800" style={{opacity: 0, animation: 'fadeIn 0.7s forwards 0.6s'}}>
                {time}
              </div>
              <div className="text-sm text-gray-500" style={{opacity: 0, animation: 'fadeIn 0.7s forwards 0.8s'}}>
                {date}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Stats Row */}
      <div className="px-6 pb-5 mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white bg-opacity-60 px-4 py-3 rounded-lg" style={{opacity: 0, animation: 'fadeIn 0.5s forwards 1s'}}>
          <div className="text-xs font-medium text-gray-500 mb-1">Day's Goal</div>
          <div className="flex items-center">
            <div className="text-lg font-bold text-gray-800 mr-2">75%</div>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-2 bg-green-500 rounded-full" style={{width: '75%', animation: 'growWidth 1.5s ease-out forwards 1.2s'}}></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white bg-opacity-60 px-4 py-3 rounded-lg" style={{opacity: 0, animation: 'fadeIn 0.5s forwards 1.2s'}}>
          <div className="text-xs font-medium text-gray-500 mb-1">Tasks Today</div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-gray-800">12</div>
            <div className="text-xs text-blue-600 font-medium">8 Completed</div>
          </div>
        </div>
        
        <div className="bg-white bg-opacity-60 px-4 py-3 rounded-lg" style={{opacity: 0, animation: 'fadeIn 0.5s forwards 1.4s'}}>
          <div className="text-xs font-medium text-gray-500 mb-1">Notifications</div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-gray-800">5</div>
            <div className="text-xs text-red-500 font-medium pulse-dot">3 Urgent</div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes growWidth {
          from { width: 0; }
          to { width: 75%; }
        }
        
        .pulse-dot {
          position: relative;
          padding-right: 15px;
        }
        
        .pulse-dot:after {
          content: '';
          position: absolute;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #ef4444;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: translateY(-50%) scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            transform: translateY(-50%) scale(1);
            box-shadow: 0 0 0 5px rgba(239, 68, 68, 0);
          }
          100% {
            transform: translateY(-50%) scale(0.95);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomeBanner;