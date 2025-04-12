import React from 'react';
import styles from '../styles/StatCard.module.css';

function EnhancedStatCard({ title, value, icon, change, changeType = 'increase', cardType = 'default' }) {
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
      default:
        return '';
    }
  };

  return (
    <div className={`${styles.statCard} ${getCardTypeClass()}`}>
      <div className={styles.statCardBody}>
        <div className={styles.statCardContent}>
          <div className={styles.statCardInfo}>
            <p className={styles.statCardTitle}>{title}</p>
            <h3 className={styles.statCardValue}>{value}</h3>
            
            {change && (
              <div className={`${styles.statCardChange} ${changeType === 'increase' ? styles.increase : styles.decrease}`}>
                <span>{changeType === 'increase' ? '↑' : '↓'} {change}%</span>
                <span style={{ marginLeft: '4px', color: '#6b7280' }}>since last month</span>
              </div>
            )}
          </div>
          
          <div className={`${styles.statCardIconContainer} ${getIconContainerClass()}`}>
            <div className={styles.statCardIcon}>
              {icon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedStatCard;