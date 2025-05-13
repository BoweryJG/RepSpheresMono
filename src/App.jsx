import { CssBaseline } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DashboardSupabase from './components/DashboardSupabase';
import DashboardSupabaseUnified from './components/DashboardSupabaseUnified';
import Login from './components/Login';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import CategoryPage from './pages/CategoryPage';
import ProcedureDetailsPage from './pages/ProcedureDetailsPage';
import NotFoundPage from './pages/NotFoundPage';
import { IndustryThemeProvider, useIndustryTheme } from './services/theme/IndustryThemeContext';
import { useEffect, useState } from 'react';
import { supabaseDataService } from './services/supabase/supabaseDataService';
import { unifiedSupabaseService } from './services/supabase/unifiedSupabaseService';
import { Alert, Snackbar, Box, Button, CircularProgress } from '@mui/material';
import apiService from './services/apiService';
import { supabase } from './services/supabase/supabaseClient';
import { isAuthenticated, getCurrentUser, signOut } from './services/demoAuth';

// Create a separate component for the theme switcher buttons
const ThemeSwitcher = () => {
  const { industry, changeIndustryTheme } = useIndustryTheme();
  
  return (
    <Box sx={{ position: 'fixed', top: 8, right: 16, zIndex: 9999 }}>
      <Button 
        onClick={() => changeIndustryTheme('dental')} 
        variant={industry === 'dental' ? 'contained' : 'outlined'} 
        sx={{ mr: 1 }}
      >
        Dental
      </Button>
      <Button 
        onClick={() => changeIndustryTheme('aesthetic')} 
        variant={industry === 'aesthetic' ? 'contained' : 'outlined'} 
        sx={{ mr: 1 }}
      >
        Aesthetic
      </Button>
      <Button 
        onClick={() => changeIndustryTheme('random')} 
        variant={industry === 'random' ? 'contained' : 'outlined'}
      >
        Cosmic/Random
      </Button>
    </Box>
  );
};

function AppContent({ initializationError = false }) {
  const [backendConnected, setBackendConnected] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  // Authentication is now bypassed - always authenticated with a default user
  const [user, setUser] = useState({ id: 'default-user', email: 'user@example.com' });

  // Initialize services when the app loads
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize regular Supabase service
        console.log('Initializing Supabase data service...');
        const supabaseResult = await supabaseDataService.initialize();
        
        if (supabaseResult.success) {
          console.log('Supabase data service initialized successfully');
          setNotification({
            open: true,
            message: 'Connected to Supabase successfully!',
            severity: 'success'
          });
        } else {
          console.error('Failed to initialize Supabase data service:', supabaseResult.error);
          setNotification({
            open: true,
            message: 'Failed to connect to Supabase: ' + supabaseResult.error,
            severity: 'error'
          });
        }
        
        // Initialize the unified Supabase service (handles both MCP and direct connections)
        console.log('Initializing Unified Supabase service...');
        try {
          const unifiedResult = await unifiedSupabaseService.initialize();
          console.log('Unified Supabase service initialized:', 
            unifiedResult.usingMcp ? 'Using MCP' : 'Using Direct API',
            'in', unifiedResult.environment || 'unknown', 'mode');
        } catch (unifiedError) {
          console.error('Error initializing unified service:', unifiedError);
          // Don't show notification to user since the regular service is the fallback
        }
        
        // Check backend API connection
        try {
          console.log('Checking backend API connection...');
          const backendConnected = await apiService.checkConnection();
          
          if (backendConnected) {
            console.log('Backend API connection established successfully');
            setBackendConnected(true);
            setNotification({
              open: true,
              message: 'Connected to backend API successfully!',
              severity: 'success'
            });
          } else {
            console.error('Failed to connect to backend API');
            setNotification({
              open: true,
              message: 'Failed to connect to backend API',
              severity: 'error'
            });
          }
        } catch (backendError) {
          console.error('Backend API connection error:', backendError);
          setNotification({
            open: true,
            message: 'Error connecting to backend API: ' + backendError.message,
            severity: 'error'
          });
        }
      } catch (error) {
        console.error('Error initializing services:', error);
        setNotification({
          open: true,
          message: 'Error initializing services: ' + error.message,
          severity: 'error'
        });
      }
    };

    initializeServices();
  }, []);

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <ThemeSwitcher />
      <CssBaseline />
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
      
      <Routes>
        {/* Main Procedure Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/categories/:categoryName" element={<CategoryPage />} />
        <Route path="/procedures/:id" element={<ProcedureDetailsPage />} />
        
        {/* Dashboard Routes - Using only Supabase data (legacy) */}
        <Route path="/dashboard-legacy/*" element={<DashboardSupabase user={user} />} />
        
        {/* Dashboard Routes - Using Unified Supabase Service (MCP in dev, direct in prod) */}
        <Route path="/dashboard/*" element={<DashboardSupabaseUnified user={user} />} />
        
        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

function App(props) {
  return (
    <IndustryThemeProvider>
      <AppContent {...props} />
    </IndustryThemeProvider>
  );
}

export default App;
