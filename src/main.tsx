
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById("root");
if (!container) {
  throw new Error('Root element not found');
}

// AppLoader ensures smooth transition from splash to app
function AppLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure CSS and providers initialize
    const timer = setTimeout(() => {
      setReady(true);
      // Notify index.html that app is ready
      window.dispatchEvent(new Event('app-ready'));
    }, 150);
    
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#000'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(0, 122, 255, 0.2)',
          borderTopColor: '#007AFF',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

  return <App />;
}

const root = createRoot(container);
root.render(<AppLoader />);
