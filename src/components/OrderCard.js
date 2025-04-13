import React from 'react';
import styles from '../styles/OrderCard.module.css';
import { updateOrderStatus } from '../utils/api';
import useAuth from '../hooks/useAuth';

function EnhancedOrderCard({ order, onStatusUpdate, dishes = [] }) {
  const { isManager } = useAuth();
  
  // Safety check in case order is not properly defined
  if (!order || typeof order !== 'object') {
    return (
      <div className={styles.orderCard}>
        <div className={styles.orderCardBody}>
          <p className="text-gray-500">Invalid order data</p>
        </div>
      </div>
    );
  }
  
  // Find dish details from the dishes array
  const getDishDetails = (dishId) => {
    // Convert both IDs to the same type (string) for comparison
    const dishIdStr = String(dishId);
    return dishes.find(dish => String(dish['Dish Id']) === dishIdStr) || {};
  };
  
  // Handle serving status update
  const handleServingStatusUpdate = async () => {
    try {
      await updateOrderStatus(order['Order Id'], { 
        'Serving Status': !order['Serving Status'] 
      });
      onStatusUpdate();
    } catch (error) {
      console.error('Failed to update serving status:', error);
    }
  };
  
  // Handle payment status update (manager only)
  const handlePaymentStatusUpdate = async () => {
    if (!isManager) return;
    
    try {
      await updateOrderStatus(order['Order Id'], { 
        'Payment Status': !order['Payment Status'] 
      });
      onStatusUpdate();
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  };
  
  return (
    <div className={styles.orderCard}>
      <div className={styles.orderCardBody}>
        <div className={styles.orderCardHeader}>
          <div className={styles.orderInfo}>
            <h2 className={styles.orderId}>Order #{order['Order Id']}</h2>
            <p className={styles.orderMeta}>
              Table: {order['Table No']}
            </p>
            <p className={styles.orderMeta}>
              Time: {order['Time']} | Date: {order['Date']}
            </p>
          </div>
          <div className={styles.statusChips}>
            <div 
              className={order['Serving Status'] ? styles.chipPrepared : styles.chipPreparing}
            >
              {order['Serving Status'] ? "✓ Prepared" : "⟳ Preparing"}
            </div>
            {isManager && (
              <div 
                className={order['Payment Status'] ? styles.chipPaid : styles.chipUnpaid}
              >
                {order['Payment Status'] ? "✓ Paid" : "✗ Unpaid"}
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.divider}></div>
        
        <div>
          <h3 className={styles.orderItemsTitle}>Order Items:</h3>
          <ul className={styles.orderItemsList}>
            {order.Dishes.map((item, index) => {
              const dish = getDishDetails(item['Dish Id']);
              return (
                <li key={index} className={styles.orderItem}>
                  <span>{dish.Name || `Dish #${item['Dish Id']}`}</span>
                  <span>x{item.Quantity}</span>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className={styles.orderTotal}>
          <p>Total: ₹{order.Amount}</p>
        </div>
      </div>
      
      <div className={styles.orderActions}>
        <button
          className={order['Serving Status'] ? styles.preparingButton : styles.prepareButton}
          onClick={handleServingStatusUpdate}
        >
          {order['Serving Status'] ? "Mark as Preparing" : "Mark as Prepared"}
        </button>
        
        {/* Only render payment buttons for manager users */}
        {isManager && (
          <button
            className={order['Payment Status'] ? styles.unpayButton : styles.payButton}
            onClick={handlePaymentStatusUpdate}
          >
            {order['Payment Status'] ? "Mark as Unpaid" : "Mark as Paid"}
          </button>
        )}
      </div>
    </div>
  );
}

export default EnhancedOrderCard;