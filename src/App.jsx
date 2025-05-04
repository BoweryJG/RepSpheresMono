import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DashboardSupabase from './components/DashboardSupabase';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ResetPassword from './pages/auth/ResetPassword';
import ResetPasswordConfirm from './pages/auth/ResetPasswordConfirm';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './services/auth/AuthContext';
import theme from './theme';

function App({ initializationError = false }) {
  // Development mode - set to true to bypass authentication during development
  const BYPASS_AUTH = true;

  // Conditionally render the protected route or direct component based on BYPASS_AUTH
  const ProtectedWrapper = ({ children }) => {
    if (BYPASS_AUTH) {
      return children;
    }
    return <ProtectedRoute>{children}</ProtectedRoute>;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard/*" element={
              <ProtectedWrapper>
                <Dashboard />
              </ProtectedWrapper>
            } />
            
            {/* Supabase Dashboard Route */}
            <Route path="/dashboard-supabase/*" element={
              <ProtectedWrapper>
                <DashboardSupabase />
              </ProtectedWrapper>
            } />
            
            {/* Redirect root to dashboard if authenticated, otherwise to login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
