import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { SnackbarProvider } from 'notistack'; // ✅ Add this import
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SnackbarProvider maxSnack={3}>
      <App />
    </SnackbarProvider>
  </React.StrictMode>
);
