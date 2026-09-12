import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '@frontend/styles/index.css';

// Handle stale lazy chunk loading when a new Vercel deployment occurs
window.addEventListener('vite:preloadError', () => {
  const hasReloaded = sessionStorage.getItem('vite_preload_reloaded');
  if (!hasReloaded) {
    sessionStorage.setItem('vite_preload_reloaded', 'true');
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
