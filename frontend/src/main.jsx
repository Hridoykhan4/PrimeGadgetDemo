import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          gutter={12}
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: "'Poppins', sans-serif",
              fontSize: '0.9rem',
              padding: '12px 16px',
            }
          }}
        />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
