import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card } from '@nextui-org/react';
import useAuth from '../hooks/useAuth';
import Head from 'next/head';
import styles from '../styles/Login.module.css';

function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [animationComplete, setAnimationComplete] = useState(false);
  
  useEffect(() => {
    // Set animation complete after the initial animations
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setError('');
    
    try {
      await login(email, password);
      // Will be redirected by the useAuth hook if successful
    } catch (error) {
      console.error('Login failed:', error);
      setError('Invalid email or password');
    }
  };
  
  return (
    <>
      <Head>
        <title>Restaurant Admin Login</title>
      </Head>
      
      <div className={styles.loginContainer}>
        {/* Animated Background Elements */}
        <div className={styles.backgroundElements}>
          <div className={styles.circle1}></div>
          <div className={styles.circle2}></div>
          <div className={styles.square1}></div>
          <div className={styles.square2}></div>
        </div>
        
        {/* Animated Restaurant Logo */}
        <div className={styles.logoContainer}>
          <svg 
            className={styles.logoSvg} 
            width="120" 
            height="120" 
            viewBox="0 0 120 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Plate */}
            <circle cx="60" cy="60" r="50" fill="white" stroke="#3B82F6" strokeWidth="2" className={styles.plate} />
            
            {/* Fork */}
            <path 
              className={styles.fork} 
              d="M40 30C40 30 40 45 40 50C40 55 35 55 35 60C35 65 40 65 40 70C40 75 40 90 40 90" 
              stroke="#3B82F6" 
              strokeWidth="3" 
              strokeLinecap="round" 
            />
            <path 
              className={styles.forkTines}
              d="M35 35C35 35 35 45 35 45M45 35C45 35 45 45 45 45M30 35C30 35 30 45 30 45" 
              stroke="#3B82F6" 
              strokeWidth="2" 
              strokeLinecap="round" 
            />
            
            {/* Knife */}
            <path 
              className={styles.knife} 
              d="M80 30L80 90" 
              stroke="#3B82F6" 
              strokeWidth="3" 
              strokeLinecap="round" 
            />
            <path 
              className={styles.knifeBlade}
              d="M75 45C75 35 85 30 90 30C90 45 85 55 75 55" 
              fill="#3B82F6" 
            />
            
            {/* Food */}
            <path 
              className={styles.food1}
              d="M50 60C50 60 55 55 60 55C65 55 70 60 70 60" 
              stroke="#F472B6" 
              strokeWidth="3" 
              strokeLinecap="round" 
            />
            <circle 
              className={styles.food2}
              cx="55" 
              cy="65" 
              r="4" 
              fill="#F59E0B" 
            />
            <circle 
              className={styles.food3}
              cx="65" 
              cy="65" 
              r="4" 
              fill="#10B981" 
            />
          </svg>
        </div>
        
        <Card className={styles.loginCard}>
          <div className={styles.cardContent}>
            <h1 className={styles.title}>Restaurant Admin</h1>
            <p className={styles.subtitle}>Sign in to your dashboard</p>
            
            <form onSubmit={handleLogin} className={styles.form}>
              <div className={`${styles.inputGroup} ${animationComplete ? styles.inputReady : ''}`}>
                <div className={styles.inputIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className={styles.inputBorder}></div>
              </div>
              
              <div className={`${styles.inputGroup} ${animationComplete ? styles.inputReady : ''}`}>
                <div className={styles.inputIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className={styles.inputBorder}></div>
              </div>
              
              {error && (
                <div className={styles.errorMessage}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              
              <button
                className={`${styles.loginButton} ${loading ? styles.loading : ''}`}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className={styles.spinner}></div>
                ) : (
                  <>
                    <span>Log In</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>
            
            <div className={styles.footer}>
              <p>For admin and chef accounts only</p>
              <div className={styles.securityNote}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Secure Login</span>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Floating Food Icons */}
        <div className={`${styles.floatingIcon} ${styles.pizza}`}>
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M44 18C44 28 24 44 24 44C24 44 4 28 4 18C4 8 14 4 24 4C34 4 44 8 44 18Z" fill="#FFC107"/>
            <circle cx="12" cy="16" r="2" fill="#FF5722"/>
            <circle cx="36" cy="16" r="2" fill="#FF5722"/>
            <circle cx="24" cy="28" r="2" fill="#FF5722"/>
            <circle cx="30" cy="20" r="2" fill="#FF5722"/>
            <circle cx="18" cy="20" r="2" fill="#FF5722"/>
          </svg>
        </div>
        
        <div className={`${styles.floatingIcon} ${styles.bowl}`}>
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 22C8 22 8 18 24 18C40 18 40 22 40 22H8Z" fill="#FF9800"/>
            <path d="M38 22H10C10 22 6 38 24 38C42 38 38 22 38 22Z" fill="#E91E63"/>
            <path d="M15 26C15 26 20 28 24 28C28 28 33 26 33 26" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
        
        <div className={`${styles.floatingIcon} ${styles.burger}`}>
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 18C10 15 14 12 24 12C34 12 38 15 38 18H10Z" fill="#8D6E63"/>
            <path d="M10 18H38V20H10V18Z" fill="#FFCC80"/>
            <path d="M10 20H38V24H10V20Z" fill="#A5D6A7"/>
            <path d="M10 24H38V26H10V24Z" fill="#EF9A9A"/>
            <path d="M10 26H38V30H10V26Z" fill="#FFCC80"/>
            <path d="M38 30H10C10 33 14 36 24 36C34 36 38 33 38 30Z" fill="#8D6E63"/>
          </svg>
        </div>
        
        <div className={`${styles.floatingIcon} ${styles.coffee}`}>
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16H28V34H12V16Z" fill="#795548"/>
            <path d="M28 20H34C36 20 38 22 38 24C38 26 36 28 34 28H28V20Z" fill="#5D4037"/>
            <path d="M12 13C12 13 18 10 28 13" stroke="#8D6E63" strokeWidth="2"/>
            <path d="M20 34H20C18 38 20 40 24 40C28 40 30 38 28 34H20Z" fill="#A1887F"/>
          </svg>
        </div>
      </div>
    </>
  );
}

export default LoginPage;