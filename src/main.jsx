import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import theme from './theme';
import { AuthProvider } from './services/auth/AuthContext';
import { ensureDataExists } from './services/dataRefreshService';

// Initialize data refresh service to ensure we have real data in Supabase
ensureDataExists().then(result => {
  if (result.success) {
    console.log('Data check completed successfully');
  } else {
    console.error('Error checking data:', result.error);
  }
});

// Initialize React app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
