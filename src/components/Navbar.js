import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';
import styles from '../styles/Navbar.module.css';

function EnhancedNavbar() {
  const { user, role, logout } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState(3); // Example notification count
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Handle scroll event for navbar transformation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, you would implement actual theme switching here
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };
  
  // Generate user initials for avatar
  const getUserInitials = () => {
    if (!user || !user['Admin Name']) return 'U';
    
    const nameParts = user['Admin Name'].split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };
  
  // Get display name for role
  const getRoleDisplay = () => {
    if (!role) return 'User';
    
    switch(role.toLowerCase()) {
      case 'manager':
        return 'Restaurant Manager';
      case 'chief':
      case 'chef':
        return 'Head Chef';
      default:
        return role;
    }
  };
  
  return (
    <div className={`${styles.navbarContainer} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.navbarContent}>
        <div className={`${styles.navbarBrand} ${styles.fadeIn}`}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M12 2c5.522 0 10 4.478 10 10s-4.478 10-10 10S2 17.522 2 12 6.478 2 12 2zm-1.987 13.332A.666.666 0 0110.667 16a.666.666 0 01-.667-.667.666.666 0 01.667-.666.666.666 0 01.666.666.673.673 0 01-.32.056zm1.318.817c.937.703 1.36 1.516 1.36 2.318 0 .179-.092.323-.205.323h-4.701c-.113 0-.205-.144-.205-.323 0-.802.423-1.615 1.36-2.318-.333-.574-.531-1.124-.531-1.638 0-.922.68-1.244.944-1.338a.25.25 0 01.317.146c.018.055.037.133.037.18 0 .204-.074.484-.477.74.33.073.097.185.145.249.293.4.402.495.465.653.055.138.066.255.066.523 0 .15.128.268.28.268a.284.284 0 00.279-.268c0-.386.01-.484.066-.622.064-.159.172-.254.465-.654.049-.064.115-.176.148-.25-.403-.255-.477-.535-.477-.739 0-.047.019-.124.037-.18a.25.25 0 01.317-.145c.263.094.944.416.944 1.338 0 .514-.198 1.064-.53 1.637zm2.669-5.098c0 .647-.525 1.172-1.172 1.172a1.172 1.172 0 01-1.172-1.172c0-.647.525-1.172 1.172-1.172s1.172.525 1.172 1.172zm-7.998 0c0 .647-.525 1.172-1.172 1.172a1.172 1.172 0 01-1.172-1.172c0-.647.525-1.172 1.172-1.172s1.172.525 1.172 1.172z" />
              </svg>
            </div>
          </div>
          <span className={styles.brandText}>Restaurant Admin</span>
        </div>
        
        <div className={styles.navbarRightSection}>
          {/* Search Bar */}
          <form onSubmit={handleSearch} className={`${styles.searchContainer} ${styles.slideInRight}`}>
            <input
              type="text"
              placeholder="Search..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className={styles.searchIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </form>
          
          {/* Navigation Links */}
          <div className={styles.navLinks}>
            <Link href="/dashboard">
              <div className={`${styles.navLink} ${router.pathname === '/dashboard' ? styles.active : ''}`}>
                Dashboard
              </div>
            </Link>
          </div>
          
          {/* Theme Switcher */}
          <button onClick={toggleTheme} className={styles.themeSwitcher}>
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
          
          {/* Notifications */}
          <button className={styles.notificationButton}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {notifications > 0 && (
              <span className={styles.notificationBadge}>{notifications}</span>
            )}
          </button>
          
          {/* User Profile Dropdown */}
          <div className={styles.dropdownContainer}>
            <div className={styles.userButton}>
              <div className={styles.userAvatar}>
                {getUserInitials()}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.['Admin Name'] || 'User'}</span>
                <span className={styles.userRole}>{getRoleDisplay()}</span>
              </div>
            </div>
            
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownHeader}>
                <p>Signed in as</p>
                <p className={styles.emailText}>{user?.Email || 'admin@email.com'}</p>
              </div>
              <div className={styles.dropdownItems}>
                <div className={styles.dropdownItem}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.dropdownIcon}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  My Profile
                </div>
                <div className={styles.dropdownItem}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.dropdownIcon}>
                    <path d="M19 21a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14Z"></path>
                    <path d="M16 3v5"></path>
                    <path d="M8 3v5"></path>
                    <path d="M3 9h18"></path>
                    <path d="M9 13h.01"></path>
                    <path d="M9 17h.01"></path>
                    <path d="M13 13h.01"></path>
                    <path d="M13 17h.01"></path>
                  </svg>
                  Activity Log
                </div>
                <div className={styles.dropdownItem}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.dropdownIcon}>
                    <path d="M12 10v6"></path>
                    <path d="M12 2v2"></path>
                    <circle cx="12" cy="18" r="2"></circle>
                    <path d="M18.24 16.24A9 9 0 1 0 6 4.93"></path>
                    <path d="M22 12c0-5.52-4.48-10-10-10"></path>
                  </svg>
                  Help Center
                </div>
                <div className={styles.dropdownItem}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.dropdownIcon}>
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Settings
                </div>
                <div className={styles.dropdownItem} onClick={logout}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.dropdownIcon}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Logout
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedNavbar;