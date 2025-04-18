import { useEffect } from 'react';
import { NextUIProvider } from '@nextui-org/react';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import Layout from '../components/Layout';
import ToastProvider from '../components/ToastProvider';
import { initializeSocket, cleanupSocket } from '../utils/socketService';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  useEffect(() => {
    // Initialize socket connection when the app loads
    initializeSocket();
    
    // Clean up socket connection when the app unmounts
    return () => {
      cleanupSocket();
    };
  }, []);
  
  return (
    <NextUIProvider>
      <ToastProvider />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </NextUIProvider>
  );
}

export default MyApp;