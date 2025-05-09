import { CssBaseline } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DashboardSupabase from './components/DashboardSupabase';
import { ThemeProvider } from './services/theme/ThemeContext';
import { useEffect, useState } from 'react';
import { supabaseDataService } from './services/supabase/supabaseDataService';
import { mcpSupabaseService } from './services/supabase/mcpSupabaseService';
import { Alert, Snackbar } from '@mui/material';

function App({ initializationError = false }) {
  const [mcpInitialized, setMcpInitialized] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Initialize Supabase data service when the app loads
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
        
        // Try to initialize MCP Supabase service if available
        try {
          console.log('Checking for MCP Supabase service...');
          const mcpResult = await mcpSupabaseService.initialize();
          
          if (mcpResult.success) {
            console.log('MCP Supabase service initialized successfully');
            setMcpInitialized(true);
            setNotification({
              open: true,
              message: 'Connected to Supabase via MCP successfully!',
              severity: 'success'
            });
          } else {
            console.log('MCP Supabase service not available:', mcpResult.error);
          }
        } catch (mcpError) {
          console.log('MCP Supabase service not available:', mcpError);
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
        <Route path="/dashboard/*" element={<Dashboard mcpEnabled={mcpInitialized} />} />
        
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
