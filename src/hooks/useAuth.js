import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  isAuthenticated, 
  getAdminData, 
  getUserRole,
  login as authLogin,
  logout as authLogout
} from '../utils/auth';

export default function useAuth(requiredRole = null) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  
  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      // Not logged in and not on login page
      if (router.pathname !== '/') {
        router.push('/');
      }
      setLoading(false);
      return;
    }
    
    // Logged in but on login page, redirect to dashboard
    if (router.pathname === '/') {
      router.push('/dashboard');
    }
    
    // Set user data and role
    const userData = getAdminData();
    setUser(userData);
    setRole(userData?.Role || null);
    
    // Check if user has required role
    if (requiredRole && getUserRole() !== requiredRole) {
      router.push('/dashboard');
    }
    
    setLoading(false);
  }, [router.pathname, requiredRole, router]);
  
  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authLogin(email, password);
      setUser(getAdminData());
      setRole(getAdminData()?.Role || null);
      router.push('/dashboard');
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    authLogout();
    setUser(null);
    setRole(null);
  };
  
  // Check if user is a manager (case insensitive)
  const isManager = role && role.toLowerCase() === 'manager';
  
  // Check if user is a chief/chef (case insensitive)
  const isChief = role && (role.toLowerCase() === 'chief' || role.toLowerCase() === 'chef');
  
  return {
    isAuthenticated: isAuthenticated(),
    user,
    role,
    isManager,
    isChief,
    login,
    logout,
    loading
  };
}