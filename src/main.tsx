import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PortfolioProvider } from './context/PortfolioContext';
import { AlertsProvider } from './context/AlertsContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PortfolioProvider>
      <AlertsProvider>
        <App />
      </AlertsProvider>
    </PortfolioProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}