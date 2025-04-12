import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { isAuthenticated } from '../utils/auth';
import styles from '../styles/Layout.module.css';

function Layout({ children }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
    const auth = isAuthenticated();
    setAuthenticated(auth);
    setLoading(false);
  }, []);

  // Only render the full content after component has mounted
  // This prevents hydration errors by ensuring server and client render the same thing initially
  if (!mounted) {
    return <div className="min-h-screen bg-gray-50"></div>;
  }
  
  // If on login page or not authenticated, don't show navbar and sidebar
  if (router.pathname === '/' || !authenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }
  
  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Navbar />
        <main className={styles.contentArea}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

export default Layout;