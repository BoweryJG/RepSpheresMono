import { CssBaseline } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DashboardSupabase from './components/DashboardSupabase';
import Login from './components/Login';
import { IndustryThemeProvider, useIndustryTheme } from './services/theme/IndustryThemeContext';
import { useEffect, useState } from 'react';
import { supabaseDataService } from './services/supabase/supabaseDataService';
import { Alert, Snackbar, Box, Button, CircularProgress } from '@mui/material';
import apiService from './services/apiService';
import { supabase } from './services/supabase/supabaseClient';
import { isAuthenticated, getCurrentUser, signOut } from './services/supabase/supabaseAuth';

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
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthLoading(true);
        
        // Check for OAuth redirects first
        if (window.location.hash) {
          console.log('OAuth redirect detected');
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          if (data && data.session) {
            setAuthenticated(true);
            setUser(data.session.user);
            return;
          }
        }
        
        // Regular authentication check
        const isAuth = await isAuthenticated();
        setAuthenticated(isAuth);
        
        if (isAuth) {
          const userResult = await getCurrentUser();
          if (userResult.success) {
            setUser(userResult.user);
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleLoginSuccess = (loginUser) => {
    setAuthenticated(true);
    setUser(loginUser);
  };
  
  const handleLogout = async () => {
    await signOut();
    setAuthenticated(false);
    setUser(null);
  };

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
      
      {authLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress size={60} />
        </Box>
      ) : authenticated ? (
        <>
          {/* Add logout button */}
          <Box sx={{ position: 'fixed', top: 8, left: 16, zIndex: 9999 }}>
            <Button 
              onClick={handleLogout} 
              variant="outlined" 
              color="secondary"
            >
              Logout
            </Button>
          </Box>
          
          <Routes>
            {/* Dashboard Routes */}
            <Route path="/dashboard-mock/*" element={<Dashboard mcpEnabled={false} backendConnected={backendConnected} />} />
            
            {/* Supabase Dashboard Route - Primary route for Supabase data */}
            <Route path="/dashboard/*" element={<DashboardSupabase user={user} />} />
            
            {/* Redirect root to dashboard by default */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
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
