import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  Button, 
  useDisclosure,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Tooltip,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from '@nextui-org/react';
import { getChefs, createChef, deleteChef } from '../utils/api';
import ChefForm from '../components/ChefForm';
import { isManager } from '../utils/auth';
import { useRouter } from 'next/router';
import styles from '../styles/ChefPage.module.css';

function Chefs() {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Check authorization on mount
  useEffect(() => {
    // Only check on client-side
    const checkAccess = () => {
      const hasAccess = isManager();
      setAuthorized(hasAccess);
      
      if (!hasAccess) {
        router.push('/dashboard');
      } else {
        fetchChefs();
      }
    };
    
    checkAccess();
    
    // Set animation complete after initial load
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1800);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  // Add background animation effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (typeof window !== 'undefined') {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        document.documentElement.style.setProperty('--mouse-x', x);
        document.documentElement.style.setProperty('--mouse-y', y);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  const fetchChefs = async () => {
    setLoading(true);
    try {
      const chefsData = await getChefs();
      setChefs(chefsData);
    } catch (error) {
      console.error('Error fetching chefs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle creating new chef
  const handleCreateChef = async (chefData) => {
    try {
      await createChef(chefData);
      onClose();
      fetchChefs();
    } catch (error) {
      console.error('Error creating chef:', error);
    }
  };
  
  // Handle deleting chef
  const handleDeleteChef = async (chefId) => {
    try {
      setDeleting(true);
      setDeletingId(chefId);
      await deleteChef(chefId);
      // Update local state instead of refetching to avoid table issues
      setChefs(prevChefs => prevChefs.filter(chef => chef['Admin Id'] !== chefId));
    } catch (error) {
      console.error('Error deleting chef:', error);
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };
  
  // Filter chefs based on search
  const filteredChefs = chefs.filter(chef => {
    // Ensure chef and its properties are not undefined/null before filtering
    if (!chef || typeof chef !== 'object') return false;
    
    return (
      (chef['Admin Name'] && chef['Admin Name'].toLowerCase().includes(searchTerm.toLowerCase())) ||
      (chef['Email'] && chef['Email'].toLowerCase().includes(searchTerm.toLowerCase())) ||
      (chef['Contact Number'] && chef['Contact Number'].toString().includes(searchTerm))
    );
  });
  
  // Sort chefs based on selected option
  const sortedChefs = [...filteredChefs].sort((a, b) => {
    if (sortOption === 'name-asc') return a['Admin Name'].localeCompare(b['Admin Name']);
    if (sortOption === 'name-desc') return b['Admin Name'].localeCompare(a['Admin Name']);
    if (sortOption === 'id-asc') return a['Admin Id'] - b['Admin Id'];
    if (sortOption === 'id-desc') return b['Admin Id'] - a['Admin Id'];
    // Default to newest (id-desc)
    return b['Admin Id'] - a['Admin Id'];
  });
  
  // If not authorized, show loading until redirect happens
  if (!authorized) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.chefHatLoader}>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle className={styles.loaderCircle} cx="50" cy="50" r="30" />
            <path className={styles.loaderHat} d="M30,50 C30,40 40,30 50,30 C60,30 70,40 70,50 L70,60 L30,60 L30,50 Z" />
            <ellipse className={styles.loaderBrim} cx="50" cy="60" rx="40" ry="10" />
          </svg>
          <p className={styles.loadingText}>Checking authorization...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.chefPageContainer}>
      {/* Background patterns */}
      <div className={styles.bgPattern}></div>
      <div className={styles.bgGradient}></div>
      
      {/* Header section */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Chef Management</h1>
          <p className={styles.pageSubtitle}>Add, remove and manage your restaurant's chef staff</p>
        </div>
        
        {/* Improved header controls with better styling and layout */}
        <div className={styles.headerControls}>
          <div className={styles.searchContainer}>
            <Input
              placeholder="Search chefs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              size="md"
              radius="sm"
              variant="bordered"
              startContent={
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  className={styles.searchIcon}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              }
              isClearable
              onClear={() => setSearchTerm('')}
            />
          </div>
          
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button 
                variant="flat" 
                className={styles.sortButton}
                radius="sm"
                startContent={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.sortIcon}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
                  </svg>
                }
              >
                {sortOption === 'name-asc' ? 'Name (A-Z)' : 
                 sortOption === 'name-desc' ? 'Name (Z-A)' :
                 sortOption === 'id-asc' ? 'ID (Ascending)' :
                 sortOption === 'id-desc' ? 'ID (Descending)' : 'Sort By'}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Sort options"
              selectionMode="single"
              selectedKeys={[sortOption]}
              onSelectionChange={(keys) => setSortOption(Array.from(keys)[0])}
              variant="flat"
              className={styles.sortDropdown}
            >
              <DropdownItem key="name-asc">Name (A-Z)</DropdownItem>
              <DropdownItem key="name-desc">Name (Z-A)</DropdownItem>
              <DropdownItem key="id-asc">ID (Ascending)</DropdownItem>
              <DropdownItem key="id-desc">ID (Descending)</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          
          <Button 
            color="primary" 
            onPress={onOpen}
            className={styles.addButton}
            radius="sm"
            startContent={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.addIcon}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            }
          >
            Add New Chef
          </Button>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard} style={{ animationDelay: '0.2s' }}>
          <div className={styles.statIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statValue}>{chefs.length}</h3>
            <p className={styles.statLabel}>Total Chefs</p>
          </div>
        </div>
        
        <div className={styles.statCard} style={{ animationDelay: '0.4s' }}>
          <div className={styles.statIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" />
            </svg>
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statValue}>{(chefs.length / 2).toFixed(1)}</h3>
            <p className={styles.statLabel}>Chefs per Shift</p>
          </div>
        </div>
        
        <div className={styles.statCard} style={{ animationDelay: '0.6s' }}>
          <div className={styles.statIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statValue}>4.8</h3>
            <p className={styles.statLabel}>Avg. Rating</p>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.chefHatLoader}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle className={styles.loaderCircle} cx="50" cy="50" r="30" />
              <path className={styles.loaderHat} d="M30,50 C30,40 40,30 50,30 C60,30 70,40 70,50 L70,60 L30,60 L30,50 Z" />
              <ellipse className={styles.loaderBrim} cx="50" cy="60" rx="40" ry="10" />
            </svg>
            <p className={styles.loadingText}>Setting the table, please wait...</p>
          </div>
        </div>
      ) : (
        <Card className={styles.chefTable}>
          <CardBody className={styles.cardBody}>
            {filteredChefs.length === 0 ? (
              <div className={styles.noChefs}>
                <div className={styles.emptyStateIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
                </div>
                <p className={styles.noResultsText}>
                  {searchTerm ? 'No chefs match your search criteria' : 'No chefs found. Add your first chef!'}
                </p>
                {searchTerm && (
                  <Button 
                    color="primary"
                    variant="flat"
                    onClick={() => setSearchTerm('')}
                    className={styles.resetButton}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <Table aria-label="Chefs Table" className={styles.table}>
                <TableHeader>
                  <TableColumn className={styles.tableHeader}>ID</TableColumn>
                  <TableColumn className={styles.tableHeader}>NAME</TableColumn>
                  <TableColumn className={styles.tableHeader}>EMAIL</TableColumn>
                  <TableColumn className={styles.tableHeader}>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {sortedChefs.map((chef, index) => (
                    <TableRow 
                      key={chef['Admin Id']} 
                      className={`${styles.tableRow} ${index % 2 === 0 ? styles.evenRow : styles.oddRow}`}
                      style={{ 
                        animationDelay: `${0.1 + index * 0.05}s`,
                        opacity: animationComplete ? 1 : 0,
                        transform: animationComplete ? 'translateY(0)' : 'translateY(20px)'
                      }}
                    >
                      <TableCell className={styles.tableCell}>
                        <div className={styles.chefIdCell}>
                          <div className={styles.chefAvatar}>
                            {chef['Admin Name'] && chef['Admin Name'].trim() ? chef['Admin Name'].charAt(0).toUpperCase() : '?'}
                          </div>
                          <span>{chef['Admin Id']}</span>
                        </div>
                      </TableCell>
                      <TableCell className={styles.tableCell}>{chef['Admin Name']}</TableCell>
                      <TableCell className={styles.tableCell}>{chef['Email']}</TableCell>
                      <TableCell className={styles.tableCell}>
                        <div className={styles.actionButtons}>
                          <Tooltip content="Chef details">
                            <Button 
                              size="sm" 
                              isIconOnly
                              variant="light" 
                              className={styles.viewButton}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </Button>
                          </Tooltip>
                          
                          <Tooltip content="Delete chef">
                            <Button 
                              size="sm"
                              isIconOnly
                              color="danger" 
                              variant="light"
                              isLoading={deleting && deletingId === chef['Admin Id']}
                              onPress={() => handleDeleteChef(chef['Admin Id'])}
                              className={styles.deleteButton}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      )}
      
      {/* Floating chef hats */}
      <div className={styles.floatingHat} style={{ top: '15%', left: '5%', animationDelay: '0.5s' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
          <path d="M52 28c0-11-9-20-20-20s-20 9-20 20v8h40v-8z" fill="#f0f0f0" />
          <ellipse cx="32" cy="36" rx="28" ry="7" fill="#f0f0f0" />
        </svg>
      </div>
      
      <div className={styles.floatingHat} style={{ top: '70%', right: '8%', animationDelay: '1.2s' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
          <path d="M52 28c0-11-9-20-20-20s-20 9-20 20v8h40v-8z" fill="#f0f0f0" />
          <ellipse cx="32" cy="36" rx="28" ry="7" fill="#f0f0f0" />
        </svg>
      </div>
      
      <div className={styles.floatingHat} style={{ top: '40%', right: '15%', animationDelay: '0.8s' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
          <path d="M52 28c0-11-9-20-20-20s-20 9-20 20v8h40v-8z" fill="#f0f0f0" />
          <ellipse cx="32" cy="36" rx="28" ry="7" fill="#f0f0f0" />
        </svg>
      </div>
      
      {/* Improved ChefForm with optimized rendering */}
      {isOpen && (
        <ChefForm 
          isOpen={isOpen} 
          onClose={onClose}
          onSubmit={handleCreateChef}
        />
      )}
    </div>
  );
}

export default Chefs;