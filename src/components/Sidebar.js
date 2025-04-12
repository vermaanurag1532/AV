import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getUserRole } from '../utils/auth';
import styles from '../styles/Sidebar.module.css';

function Sidebar() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    // Get role only on client-side
    const userRole = getUserRole();
    setRole(userRole);

    // Add event listener for window resize to handle responsive changes
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Check if user is a manager (case insensitive)
  const isManagerUser = role && role.toLowerCase() === 'manager';
  
  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
        </svg>
      ),
    },
    {
      name: 'Tables',
      href: '/tables',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
        </svg>
      ),
    },
    {
      name: 'Dishes',
      href: '/dishes',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" />
        </svg>
      ),
    },
  ];
  
  // Only show manager-specific menu items if client-side rendering is done and the user is a manager
  const finalMenuItems = [...menuItems];
  
  if (mounted && isManagerUser) {
    finalMenuItems.push(
      {
        name: 'Chefs',
        href: '/chefs',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        ),
      },
      {
        name: 'Stats',
        href: '/stats',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        ),
      }
    );
  }

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <>
      {/* Desktop Sidebar */}
      <div className={styles.desktopSidebar}>
        <div className={styles.sidebarContent}>
          <div className={styles.logoContainer}>
            <h2 className={styles.logo}>Restaurant Admin</h2>
          </div>
          <div className={styles.menuContainer}>
            <ul className={styles.menuList}>
              {finalMenuItems.map((item) => (
                <li key={item.name} className={styles.menuItem}>
                  <Link href={item.href}>
                    <div
                      className={`${styles.menuLink} ${
                        router.pathname === item.href ? styles.active : ''
                      }`}
                    >
                      <div className={styles.iconContainer}>{item.icon}</div>
                      <span className={styles.menuText}>{item.name}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navbar */}
      <div className={styles.mobileNavbar}>
        {finalMenuItems.map((item) => (
          <Link key={item.name} href={item.href}>
            <div
              className={`${styles.mobileNavItem} ${
                router.pathname === item.href ? styles.mobileActive : ''
              }`}
            >
              <div className={styles.mobileIconContainer}>{item.icon}</div>
              <span className={styles.mobileMenuText}>{item.name}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile Menu Toggle Button */}
      <button className={styles.mobileMenuToggle} onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {/* Mobile Expanded Menu */}
      <div className={`${styles.mobileExpandedMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
        <ul className={styles.mobileMenuList}>
          {finalMenuItems.map((item) => (
            <li key={item.name} className={styles.mobileMenuItem}>
              <Link href={item.href}>
                <div
                  className={`${styles.mobileMenuLink} ${
                    router.pathname === item.href ? styles.mobileActive : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className={styles.mobileMenuIconContainer}>{item.icon}</div>
                  <span className={styles.mobileMenuLinkText}>{item.name}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default Sidebar;