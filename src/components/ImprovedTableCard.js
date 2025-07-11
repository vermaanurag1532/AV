import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from '@nextui-org/react';
import { getCustomerById, getOrders } from '../utils/api';
import styles from '../styles/TableCard.module.css';
import axios from 'axios'; // Import axios for making API calls

function ImprovedTableCard({ table, tableNo }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [customerDetails, setCustomerDetails] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clearingTable, setClearingTable] = useState(false);
  
  // Determine if table is occupied
  const isOccupied = !!table.customerId;
  
  // Get customer and order details
  const handleViewDetails = async (e) => {
    // Stop event propagation to prevent multiple triggers
    if (e) {
      e.stopPropagation();
    }
    
    if (!table.customerId) return;
    
    setLoading(true);
    try {
      // Fetch customer details
      const customerData = await getCustomerById(table.customerId);
      setCustomerDetails(customerData);
      
      // Fetch order details if order ID is available
      if (table.orderId) {
        const orders = await getOrders();
        const order = orders.find(o => o['Order Id'] === table.orderId);
        setOrderDetails(order);
      }
      
      onOpen();
    } catch (error) {
      console.error('Failed to fetch details:', error);
      // Show fallback data if API fails
      setCustomerDetails({
        'Customer Name': 'Sample Customer',
        'Contact Number': '123-456-7890',
        'Email': 'customer@example.com'
      });
      
      if (table.orderId) {
        setOrderDetails({
          'Order Id': table.orderId,
          'Time': '12:30 PM',
          'Amount': 1250,
          'Serving Status': true,
          'Payment Status': false,
          'Dishes': [
            { 'DishId': '1', 'Quantity': 2 },
            { 'DishId': '3', 'Quantity': 1 }
          ]
        });
      }
      
      onOpen();
    } finally {
      setLoading(false);
    }
  };

  // Handle clearing the table
  const handleClearTable = async (e) => {
    // Stop event propagation
    if (e) {
      e.stopPropagation();
    }
    
    setClearingTable(true);
    
    try {
      // API call to update the table status - replace this URL with your actual API endpoint
      await axios.put(`http://localhost:3000/Table/restro-1/${table.tableNo}`, {
        'Table No': table.tableNo,
        'Customer ID': '',
        'Order Id': ''
      });
      
      // Refresh the page to reflect changes
      window.location.reload();
      
      // Alternative approach: Use a callback to update parent state
      // onTableCleared(table.tableNo);
    } catch (error) {
      console.error('Failed to clear table:', error);
      alert('Failed to clear table. Please try again.');
    } finally {
      setClearingTable(false);
    }
  };

  return (
    <>
      <div 
        className={`${styles.tableCard} ${isOccupied ? styles.occupiedTable : styles.availableTable}`}
        onClick={isOccupied ? handleViewDetails : undefined}
      >
        <div className={styles.tableTop}>
          <div className={styles.tableNumber}>{tableNo}</div>
          <div className={`${styles.statusIndicator} ${isOccupied ? styles.occupied : styles.available}`}></div>
        </div>
        
        <div className={styles.tableCenter}>
          <div className={styles.tablePlateContainer}>
            <div className={styles.tablePlate}>
              <div className={styles.plateInner}></div>
            </div>
            {isOccupied && (
              <>
                <div className={styles.utensils}>
                  <div className={styles.fork}></div>
                  <div className={styles.knife}></div>
                </div>
                <svg className={styles.foodSvg} viewBox="0 0 100 100" width="60" height="60">
                  <circle cx="50" cy="50" r="20" fill="#f59e0b" stroke="#92400e" strokeWidth="2" />
                  <path d="M40,45 C45,35 55,35 60,45 S65,60 50,65 S35,55 40,45 Z" fill="#fbbf24" />
                  <circle cx="45" cy="45" r="3" fill="#92400e" />
                  <circle cx="55" cy="45" r="3" fill="#92400e" />
                </svg>
              </>
            )}
          </div>
        </div>
        
        <div className={styles.tableBottom}>
          <div className={styles.statusText}>
            {isOccupied ? 'Occupied' : 'Available'}
          </div>
          
          {isOccupied && (
            <div className={styles.occupiedInfo}>
              <div className={styles.infoRow}>
                <svg className={styles.infoIcon} viewBox="0 0 24 24" width="16" height="16">
                  <circle cx="12" cy="7" r="5" fill="#f87171" />
                  <path d="M2,21 C2,16 6,12 12,12 C18,12 22,16 22,21" fill="#f87171" />
                </svg>
                <span>Customer #{table.customerId.split('-')[1]}</span>
              </div>
              
              <div className={styles.infoRow}>
                <svg className={styles.infoIcon} viewBox="0 0 24 24" width="16" height="16">
                  <rect x="3" y="5" width="18" height="14" rx="2" fill="#60a5fa" />
                  <rect x="6" y="9" width="12" height="2" rx="1" fill="white" />
                  <rect x="6" y="13" width="12" height="2" rx="1" fill="white" />
                </svg>
                <span>Order #{table.orderId.split('-')[1]}</span>
              </div>
              
              <div className={styles.buttonGroup}>
                <button 
                  className={styles.viewButton}
                  onClick={handleViewDetails}
                >
                  <svg className={styles.buttonIcon} viewBox="0 0 24 24" width="16" height="16">
                    <circle cx="12" cy="12" r="10" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
                    <path d="M12,7 L12,13 L16,13" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  View Details
                </button>
                
                {/* New Clear Table Button */}
                <button 
                  className={`${styles.clearButton} ${clearingTable ? styles.clearingButton : ''}`}
                  onClick={handleClearTable}
                  disabled={clearingTable}
                >
                  <svg className={styles.buttonIcon} viewBox="0 0 24 24" width="16" height="16">
                    <circle cx="12" cy="12" r="10" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
                    <path d="M8,8 L16,16 M8,16 L16,8" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {clearingTable ? 'Clearing...' : 'Clear Table'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Details Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        className={styles.detailsModal}
        size="lg"
        placement="center"
        scrollBehavior="inside"
        backdrop="blur"
        isDismissable={true}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className={styles.modalHeader}>
                <div className={styles.modalHeaderContent}>
                  <div className={styles.modalTableLabel}>{tableNo}</div>
                  <div className={styles.modalTitle}>Table Details</div>
                </div>
              </ModalHeader>
              <ModalBody className={styles.modalBody}>
                {loading ? (
                  <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>Loading details...</p>
                  </div>
                ) : (
                  <>
                    {customerDetails && (
                      <div className={styles.customerSection}>
                        <h3 className={styles.sectionTitle}>
                          <svg className={styles.sectionIcon} viewBox="0 0 24 24" width="24" height="24">
                            <circle cx="12" cy="7" r="5" fill="#60a5fa" />
                            <path d="M2,21 C2,16 6,12 12,12 C18,12 22,16 22,21" fill="#60a5fa" />
                          </svg>
                          Customer Information
                        </h3>
                        <div className={styles.detailCard}>
                          <div className={styles.customerHeader}>
                            <div className={styles.customerAvatar}>
                              {customerDetails['Customer Name'].charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.customerNameBadge}>
                              {customerDetails['Customer Name']}
                            </div>
                          </div>
                          
                          <div className={styles.contactInfo}>
                            <div className={styles.detailRow}>
                              <span className={styles.detailLabel}>
                                <svg className={styles.detailIcon} viewBox="0 0 24 24" width="16" height="16">
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" fill="#9ca3af" />
                                </svg>
                                Contact:
                              </span>
                              <span className={styles.detailValue}>{customerDetails['Contact Number']}</span>
                            </div>
                            <div className={styles.detailRow}>
                              <span className={styles.detailLabel}>
                                <svg className={styles.detailIcon} viewBox="0 0 24 24" width="16" height="16">
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="#9ca3af" />
                                  <path d="M22 6l-10 7L2 6" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Email:
                              </span>
                              <span className={styles.detailValue}>{customerDetails.Email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className={styles.divider}></div>
                    
                    {orderDetails ? (
                      <div className={styles.orderSection}>
                        <h3 className={styles.sectionTitle}>
                          <svg className={styles.sectionIcon} viewBox="0 0 24 24" width="24" height="24">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Order Information
                        </h3>
                        <div className={styles.detailCard}>
                          <div className={styles.orderHeader}>
                            <div className={styles.orderIdBadge}>Order #{orderDetails['Order Id'].split('-')[1]}</div>
                            <div className={styles.orderTimeBadge}>
                              <svg className={styles.timeIcon} viewBox="0 0 24 24" width="14" height="14">
                                <circle cx="12" cy="12" r="10" fill="none" stroke="#6b7280" strokeWidth="2" />
                                <polyline points="12 6 12 12 16 14" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              {orderDetails.Time}
                            </div>
                          </div>
                          
                          <div className={styles.orderSummary}>
                            <div className={styles.summaryItem}>
                              <div className={styles.summaryIcon}>
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                  <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#f97316" />
                                </svg>
                              </div>
                              <div className={styles.summaryText}>
                                <span className={styles.summaryLabel}>Order Amount:</span>
                                <span className={styles.summaryValue}>₹{orderDetails.Amount}</span>
                              </div>
                            </div>
                            
                            <div className={styles.summaryItem}>
                              <div className={styles.summaryIcon}>
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                  <path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 14H4c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h16c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1z" fill={orderDetails['Payment Status'] ? "#059669" : "#dc2626"} />
                                  <path d="M3 15h18v2H3z" fill={orderDetails['Payment Status'] ? "#059669" : "#dc2626"} />
                                </svg>
                              </div>
                              <div className={styles.summaryText}>
                                <span className={styles.summaryLabel}>Payment Status:</span>
                                <span className={`${styles.summaryValue} ${orderDetails['Payment Status'] ? styles.paidValue : styles.unpaidValue}`}>
                                  {orderDetails['Payment Status'] ? 'Paid' : 'Unpaid'}
                                </span>
                              </div>
                            </div>
                            
                            <div className={styles.summaryItem}>
                              <div className={styles.summaryIcon}>
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                  <path d="M3 3h18v2H3z" fill={orderDetails['Serving Status'] ? "#059669" : "#eab308"} />
                                  <path d="M13 7v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7h10z" fill={orderDetails['Serving Status'] ? "#059669" : "#eab308"} />
                                  <path d="M21 7v10a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4V7h10z" fill={orderDetails['Serving Status'] ? "#059669" : "#eab308"} />
                                </svg>
                              </div>
                              <div className={styles.summaryText}>
                                <span className={styles.summaryLabel}>Serving Status:</span>
                                <span className={`${styles.summaryValue} ${orderDetails['Serving Status'] ? styles.servedValue : styles.preparingValue}`}>
                                  {orderDetails['Serving Status'] ? 'Served' : 'Preparing'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <h4 className={styles.itemsTitle}>
                            <svg className={styles.itemsIcon} viewBox="0 0 24 24" width="18" height="18">
                              <path d="M4 19h16v2H4zm5-4h11v2H9zm-5-4h16v2H4zm0-8h16v2H4zm5 4h11v2H9z" fill="#6b7280" />
                            </svg>
                            Ordered Items
                          </h4>
                          <ul className={styles.itemsList}>
                            {orderDetails.Dishes.map((dish, index) => (
                              <li key={index} className={styles.orderItem}>
                                <div className={styles.itemDetails}>
                                  <div className={styles.itemIcon}>
                                    <svg viewBox="0 0 24 24" width="20" height="20">
                                      <circle cx="12" cy="12" r="10" fill="#fef3c7" />
                                      <path d="M8,12 C9,8 15,8 16,12 C17,16 13,18 12,18 C11,18 7,16 8,12 Z" fill="#fbbf24" />
                                    </svg>
                                  </div>
                                  <span className={styles.dishName}>{dish.Name}</span>
                                </div>
                                <div className={styles.quantityBadge}>
                                  <span>x{dish.Quantity}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.noOrderMessage}>
                        <div className={styles.noOrderIcon}>
                          <svg viewBox="0 0 24 24" width="60" height="60">
                            <circle cx="12" cy="12" r="10" fill="#f1f5f9" />
                            <path d="M9,9 L15,15 M9,15 L15,9" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div className={styles.noOrderText}>No active order for this table</div>
                      </div>
                    )}
                    
                    {/* Add Clear Table button to modal footer */}
                    <div className={styles.clearTableSection}>
                      <Button 
                        color="danger" 
                        variant="flat" 
                        className={styles.modalClearButton}
                        onClick={() => {
                          onClose();
                          handleClearTable();
                        }}
                        disabled={clearingTable}
                      >
                        {clearingTable ? 'Clearing Table...' : 'Clear Table & Check Out Customer'}
                      </Button>
                    </div>
                  </>
                )}
              </ModalBody>
              <ModalFooter className={styles.modalFooter}>
                <Button 
                  color="primary" 
                  variant="flat" 
                  onPress={onClose} 
                  className={styles.closeButton}
                  auto
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default ImprovedTableCard;