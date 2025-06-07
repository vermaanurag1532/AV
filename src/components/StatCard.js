import React, { useState, useEffect } from 'react';
import styles from '../styles/StatCard.module.css';

function EnhancedStatCard({ 
  title, 
  value, 
  icon, 
  change, 
  changeType = 'increase', 
  cardType = 'default',
  delay = 0,
  isLoading = false,
  onClick = null,
  description = null,
  currency = false
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Determine card class based on type
  const getCardTypeClass = () => {
    switch (cardType) {
      case 'revenue':
        return styles.revenueCard;
      case 'pending':
        return styles.pendingCard;
      case 'completed':
        return styles.completedCard;
      case 'dishes':
        return styles.dishesCard;
      case 'customers':
        return styles.customersCard;
      case 'tables':
        return styles.tablesCard;
      default:
        return '';
    }
  };

  // Determine icon container class based on type
  const getIconContainerClass = () => {
    switch (cardType) {
      case 'revenue':
        return styles.revenueIcon;
      case 'pending':
        return styles.pendingIcon;
      case 'completed':
        return styles.completedIcon;
      case 'dishes':
        return styles.dishesIcon;
      case 'customers':
        return styles.customersIcon;
      case 'tables':
        return styles.tablesIcon;
      default:
        return '';
    }
  };

  // Format value based on type
  const formatValue = (val) => {
    if (isLoading) return '...';
    if (currency && typeof val === 'number') {
      return `₹${val.toLocaleString('en-IN')}`;
    }
    if (typeof val === 'number' && val > 999) {
      return val.toLocaleString('en-IN');
    }
    return val;
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className={styles.loadingSkeleton}>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
    </div>
  );

  // Change indicator component
  const ChangeIndicator = () => {
    if (!change) return null;

    return (
      <div className={`${styles.statCardChange} ${changeType === 'increase' ? styles.increase : styles.decrease}`}>
        <svg 
          className={`w-4 h-4 mr-1 transform transition-transform ${
            isHovered ? 'scale-110' : ''
          } ${changeType === 'increase' ? 'rotate-0' : 'rotate-180'}`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" 
            clipRule="evenodd" 
          />
        </svg>
        <span className="font-semibold">{change}%</span>
        <span className="ml-1 text-gray-500 text-xs font-normal">vs last month</span>
      </div>
    );
  };

  // Progress bar component for certain card types
  const ProgressBar = () => {
    if (!['pending', 'completed'].includes(cardType) || isLoading) return null;

    const progressValue = Math.min((value / 100) * 100, 100);
    const progressColor = cardType === 'pending' ? '#f59e0b' : '#3b82f6';

    return (
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ 
            width: `${progressValue}%`,
            backgroundColor: progressColor,
            transitionDelay: `${delay + 500}ms`
          }}
        ></div>
        <p className="text-xs text-gray-500 mt-1">
          {cardType === 'pending' ? 'Pending Orders' : 'Completion Rate'}
        </p>
      </div>
    );
  };

  return (
    <div 
      className={`${styles.statCard} ${getCardTypeClass()} ${
        !isVisible ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      } ${onClick ? 'cursor-pointer' : ''}`}
      style={{ 
        transitionDelay: `${delay}ms`,
        animationDelay: `${delay}ms`
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background decoration circle */}
      <div 
        className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 transition-all duration-500"
        style={{ 
          background: `linear-gradient(45deg, ${
            cardType === 'revenue' ? '#10b981' : 
            cardType === 'pending' ? '#f59e0b' : 
            cardType === 'completed' ? '#3b82f6' : 
            cardType === 'dishes' ? '#a855f7' :
            cardType === 'customers' ? '#ec4899' :
            cardType === 'tables' ? '#6366f1' : '#6b7280'
          }, transparent)`,
          transform: isHovered ? 'scale(1.5)' : 'scale(1)',
          opacity: isHovered ? 0.2 : 0.1
        }}
      >
      </div>

      <div className={styles.statCardBody}>
        <div className={styles.statCardContent}>
          <div className={styles.statCardInfo}>
            <p className={styles.statCardTitle}>
              {title}
            </p>
            
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <>
                <h3 className={styles.statCardValue}>
                  {formatValue(value)}
                </h3>
                
                {description && (
                  <p className={styles.statCardDescription}>
                    {description}
                  </p>
                )}
                
                <ChangeIndicator />
              </>
            )}
          </div>
          
          <div className={`${styles.statCardIconContainer} ${getIconContainerClass()}`}>
            <div className={styles.statCardIcon}>
              {isLoading ? (
                <div className="w-6 h-6 bg-white/30 rounded animate-pulse"></div>
              ) : (
                icon
              )}
            </div>
          </div>
        </div>

        <ProgressBar />
      </div>

      {/* Animated border bottom */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r opacity-0 transition-opacity duration-500"
           style={{
             background: `linear-gradient(90deg, ${
               cardType === 'revenue' ? '#10b981, #34d399' : 
               cardType === 'pending' ? '#f59e0b, #fbbf24' : 
               cardType === 'completed' ? '#3b82f6, #60a5fa' : 
               cardType === 'dishes' ? '#a855f7, #c084fc' :
               cardType === 'customers' ? '#ec4899, #f472b6' :
               cardType === 'tables' ? '#6366f1, #818cf8' : '#6b7280, #9ca3af'
             })`,
             opacity: isHovered ? 1 : 0
           }}>
      </div>
    </div>
  );
}

// Helper function to get icon for card type
export const getCardIcon = (cardType) => {
  const iconProps = { className: "w-6 h-6", fill: "currentColor", viewBox: "0 0 20 20" };
  
  switch (cardType) {
    case 'revenue':
      return (
        <svg {...iconProps}>
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      );
    case 'pending':
      return (
        <svg {...iconProps}>
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    case 'completed':
      return (
        <svg {...iconProps}>
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    case 'dishes':
      return (
        <svg {...iconProps}>
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      );
    case 'customers':
      return (
        <svg {...iconProps}>
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM5 8a2 2 0 00-2 2v1a2 2 0 002 2V8zM15 8v5a2 2 0 002-2v-1a2 2 0 00-2-2z" />
          <path d="M5 12a4 4 0 008 0v-1H5v1z" />
        </svg>
      );
    case 'tables':
      return (
        <svg {...iconProps}>
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3z" clipRule="evenodd" />
        </svg>
      );
  }
};

export default EnhancedStatCard;