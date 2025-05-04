import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider } from './services/auth/AuthContext.jsx';
import { supabaseDataService } from './services/supabase/supabaseDataService.js';

// Initialize Supabase data service before rendering the app
async function initializeApp() {
  try {
    // Check and load market data to Supabase if needed
    await supabaseDataService.initialize();
    
    // Render the app
    renderApp();
  } catch (error) {
    console.error('Error initializing application:', error);
    
    // Render app anyway with an error state
    renderApp(true);
  }
}

// Render the React application
function renderApp(hasError = false) {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <App initializationError={hasError} />
        </AuthProvider>
      </ThemeProvider>
    </React.StrictMode>,
  );
}

// Start the application
initializeApp();
