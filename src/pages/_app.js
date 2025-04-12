import React from 'react';
import { NextUIProvider } from '@nextui-org/react';
import Layout from '../components/Layout';
import '../styles/globals.css';
import '../styles/Animations.css'; 
import '../styles/navbar-animations.css';

function MyApp({ Component, pageProps }) {
  return (
    <NextUIProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </NextUIProvider>
  );
}

export default MyApp;