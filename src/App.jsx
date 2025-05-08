import { CssBaseline } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DashboardSupabase from './components/DashboardSupabase';






import { ThemeProvider } from './services/theme/ThemeContext';

function App({ initializationError = false }) {


  return (
    <ThemeProvider>
      <CssBaseline />
      
        <Routes>
          {/* Public Authentication Routes */}
          
          
          
          
          
          {/* Protected Routes */}
          <Route path="/dashboard/*" element={
            
              <Dashboard />
            
          } />
          
          {/* Supabase Dashboard Route */}
          <Route path="/dashboard-supabase/*" element={
            
              <DashboardSupabase />
            
          } />
          
          {/* Redirect root to dashboard if authenticated, otherwise to login */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      
    </ThemeProvider>
  );
}

export default App;
