import React, { useState, useEffect } from 'react';
import { getTables } from '../utils/api';
import ImprovedTableCard from '../components/ImprovedTableCard'; // Fixed import path
import styles from '../styles/Table.module.css';

function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  const tablesPageRef = React.useRef(null);
  
  useEffect(() => {
    fetchTables();
    
    // Add background effects
    const handleMouseMove = (e) => {
      if (tablesPageRef.current) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        tablesPageRef.current.style.setProperty('--mouse-x', x);
        tablesPageRef.current.style.setProperty('--mouse-y', y);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the API to fetch tables
      const tablesData = await getTables();
      
      // Process the data
      const processedTables = tablesData.map(table => ({
        tableNo: table['Table No'],
        customerId: table['Customer ID'] || '',
        orderId: table['Order Id'] || ''
      }));
      
      setTables(processedTables);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setError('Failed to load tables data. Please try again later.');
      
      // Fallback to mock data if API fails
      const mockTablesData = [
        { tableNo: 1, customerId: 'CUSTOMER-1', orderId: 'ORDER-1' },
        { tableNo: 2, customerId: '', orderId: '' },
        { tableNo: 3, customerId: '', orderId: '' },
        { tableNo: 4, customerId: '', orderId: '' },
        { tableNo: 5, customerId: 'CUSTOMER-5', orderId: 'ORDER-5' },
        { tableNo: 6, customerId: '', orderId: '' },
        { tableNo: 7, customerId: '', orderId: '' },
        { tableNo: 8, customerId: 'CUSTOMER-8', orderId: 'ORDER-8' },
      ];
      
      setTables(mockTablesData);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter tables based on search and filter
  const getFilteredTables = () => {
    return tables.filter(table => {
      // Filter by status
      if (filter === 'occupied' && !table.customerId) return false;
      if (filter === 'available' && table.customerId) return false;
      
      // Filter by search term (table number)
      if (searchTerm && !`Table ${table.tableNo}`.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };
  
  // Calculate stats
  const totalTables = tables.length;
  const occupiedTables = tables.filter(table => !!table.customerId).length;
  const availableTables = totalTables - occupiedTables;
  const occupancyRate = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

  return (
    <div className={styles.tablesPage} ref={tablesPageRef}>
      <div className={styles.backgroundEffect}></div>
      
      <div className={styles.headerSection}>
        <div className={styles.titleContainer}>
          <h1 className={styles.pageTitle}>Restaurant Tables</h1>
          <p className={styles.pageSubtitle}>Monitor and manage your dining spaces</p>
        </div>
        
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{totalTables}</div>
            <div className={styles.statLabel}>Total Tables</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statValue}>{occupiedTables}</div>
            <div className={styles.statLabel}>Occupied</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statValue}>{availableTables}</div>
            <div className={styles.statLabel}>Available</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statValue}>{occupancyRate}%</div>
            <div className={styles.statLabel}>Occupancy Rate</div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.controlsSection}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        
        <div className={styles.filterContainer}>
          <button 
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All Tables
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'occupied' ? styles.active : ''}`}
            onClick={() => setFilter('occupied')}
          >
            Occupied
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'available' ? styles.active : ''}`}
            onClick={() => setFilter('available')}
          >
            Available
          </button>
        </div>
        
        <button className={styles.refreshButton} onClick={fetchTables}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Refresh
        </button>
      </div>
      
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loader}>
            <div className={styles.loaderInner}></div>
          </div>
          <p className={styles.loadingText}>Setting up the tables...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorText}>{error}</p>
          <button className={styles.retryButton} onClick={fetchTables}>
            Try Again
          </button>
        </div>
      ) : getFilteredTables().length === 0 ? (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>🍽️</div>
          <p className={styles.emptyText}>No tables match your search</p>
          {searchTerm || filter !== 'all' ? (
            <button className={styles.resetButton} onClick={() => {
              setSearchTerm('');
              setFilter('all');
            }}>
              Reset Filters
            </button>
          ) : (
            <p className={styles.emptySubtext}>Try adding some tables to your restaurant</p>
          )}
        </div>
      ) : (
        <div className={styles.tablesGrid}>
          {getFilteredTables().map((table) => (
            <div key={table.tableNo} className={styles.tableItem}>
              <ImprovedTableCard 
                table={table} 
                tableNo={`${table.tableNo}`} 
              />
            </div>
          ))}
        </div>
      )}
      
      <div className={styles.floorPlanSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Floor Plan View</h2>
          <p className={styles.sectionSubtitle}>Interactive view of your restaurant layout</p>
        </div>
        
        <div className={styles.floorPlanContainer}>
          <div className={styles.floorPlan}>
            {/* Restaurant Layout Background SVG */}
            <svg className={styles.floorPlanBackground} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
              <rect x="0" y="0" width="800" height="500" fill="#f8fafc" />
              
              {/* Floor Tile Pattern */}
              <pattern id="floorPattern" patternUnits="userSpaceOnUse" width="50" height="50" patternTransform="rotate(45)">
                <rect width="50" height="50" fill="#f1f5f9" />
                <rect width="25" height="25" fill="#f8fafc" />
                <rect x="25" y="25" width="25" height="25" fill="#f8fafc" />
              </pattern>
              <rect x="0" y="0" width="800" height="500" fill="url(#floorPattern)" />
              
              {/* Wall Outlines */}
              <rect x="10" y="10" width="780" height="480" fill="none" stroke="#cbd5e1" strokeWidth="5" strokeDasharray="5,5" rx="20" />
              
              {/* Entrance Area */}
              <rect x="380" y="10" width="40" height="30" fill="#bae6fd" stroke="#0ea5e9" strokeWidth="2" />
              
              {/* Kitchen Area */}
              <rect x="600" y="400" width="150" height="80" fill="#fecaca" stroke="#ef4444" strokeWidth="2" rx="10" />
              <circle cx="650" cy="440" r="20" fill="#fca5a5" />
              <circle cx="700" cy="440" r="20" fill="#fca5a5" />
              
              {/* Bar Area */}
              <rect x="50" y="400" width="200" height="40" fill="#bbf7d0" stroke="#22c55e" strokeWidth="2" rx="5" />
              <circle cx="80" cy="420" r="10" fill="#86efac" />
              <circle cx="120" cy="420" r="10" fill="#86efac" />
              <circle cx="160" cy="420" r="10" fill="#86efac" />
              <circle cx="200" cy="420" r="10" fill="#86efac" />
              <circle cx="240" cy="420" r="10" fill="#86efac" />
              
              {/* Walking Paths */}
              <path d="M400,40 L400,120 L300,220 L300,350 L600,350" fill="none" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" strokeDasharray="1,15" />
            </svg>
            
            <div className={styles.entranceArea}>
              <div className={styles.entranceIcon}>
                <svg viewBox="0 0 24 24" width="30" height="30">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
                  <polyline points="16 17 21 12 16 7" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
                  <line x1="21" y1="12" x2="9" y2="12" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="10" fill="#dbeafe" opacity="0.5" />
                </svg>
              </div>
              <span className={styles.entranceLabel}>Entrance</span>
            </div>
            
            <div className={styles.floorPlanTables}>
              {tables.map((table) => (
                <div 
                  key={`floor-${table.tableNo}`} 
                  className={`${styles.floorPlanTable} ${table.customerId ? styles.floorPlanOccupied : styles.floorPlanAvailable}`}
                  style={{ 
                    top: `${20 + Math.floor((table.tableNo - 1) / 3) * 30}%`,
                    left: `${20 + ((table.tableNo - 1) % 3) * 30}%`
                  }}
                >
                  <svg className={styles.tableSvg} viewBox="0 0 100 100" width="100%" height="100%">
                    <circle cx="50" cy="50" r="45" fill={table.customerId ? "#fecaca" : "#bbf7d0"} stroke={table.customerId ? "#ef4444" : "#22c55e"} strokeWidth="3" />
                    <circle cx="50" cy="50" r="35" fill="white" opacity="0.7" />
                    {table.customerId && (
                      <>
                        <circle cx="35" cy="35" r="8" fill="#f87171" />
                        <circle cx="65" cy="35" r="8" fill="#f87171" />
                        <circle cx="50" cy="65" r="8" fill="#f87171" />
                        <line x1="30" y1="25" x2="40" y2="45" stroke="#f87171" strokeWidth="2" />
                        <line x1="70" y1="25" x2="60" y2="45" stroke="#f87171" strokeWidth="2" />
                      </>
                    )}
                    <text x="50" y="53" fontSize="16" fontWeight="bold" fill={table.customerId ? "#b91c1c" : "#166534"} textAnchor="middle">{table.tableNo}</text>
                  </svg>
                </div>
              ))}
            </div>
            
            <div className={styles.kitchenArea}>
              <div className={styles.kitchenIcon}>
                <svg viewBox="0 0 24 24" width="30" height="30">
                  <circle cx="12" cy="12" r="10" fill="#fee2e2" />
                  <path d="M7,15 C7,8 17,8 17,15" stroke="#ef4444" strokeWidth="2" fill="none" />
                  <circle cx="8" cy="8" r="2" fill="#ef4444" />
                  <circle cx="16" cy="8" r="2" fill="#ef4444" />
                  <path d="M8,18 C10,20 14,20 16,18" stroke="#ef4444" strokeWidth="2" fill="none" />
                </svg>
              </div>
              <span className={styles.kitchenLabel}>Kitchen</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tables;