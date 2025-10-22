
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Web Vitals tracking (solo producción)
if (import.meta.env.PROD) {
  import('./utils/webVitals').then(({ reportWebVitals, trackTTI }) => {
    reportWebVitals();
    trackTTI();
  });
}

const container = document.getElementById("root");
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(<App />);

// TODO: Registrar Service Worker cuando esté estable
// Temporalmente deshabilitado para evitar problemas de cache
// if (import.meta.env.PROD && 'serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//   });
// }
