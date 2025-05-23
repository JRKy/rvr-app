import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import './styles/global.css'

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        if (import.meta.env.DEV) {
          console.log('ServiceWorker registration successful');
        }
      })
      .catch((err) => {
        if (import.meta.env.DEV) {
          console.log('ServiceWorker registration failed: ', err);
        }
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
