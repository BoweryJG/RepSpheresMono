import { CssBaseline } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DashboardSupabase from './components/DashboardSupabase';
import { ThemeProvider } from './services/theme/ThemeContext';
import { useEffect, useState } from 'react';
import { supabaseDataService } from './services/supabase/supabaseDataService';
import { Alert, Snackbar } from '@mui/material';
import apiService from './services/apiService';

function App({ initializationError = false }) {
  const [backendConnected, setBackendConnected] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

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
    <ThemeProvider>
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
        {/* Dashboard Routes */}
        <Route path="/dashboard/*" element={<Dashboard mcpEnabled={false} backendConnected={backendConnected} />} />
        
        {/* Supabase Dashboard Route - Primary route for Supabase data */}
        <Route path="/dashboard-supabase/*" element={<DashboardSupabase />} />
        
        {/* Redirect root to dashboard by default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
    </ThemeProvider>
  );
}

export default App;
