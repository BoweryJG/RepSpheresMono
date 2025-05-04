import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/auth/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner when checking authentication status
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          gap: 2
        }}
      >
        <CircularProgress size={40} thickness={4} />
        <Typography variant="body1" color="text.secondary">
          Verifying your credentials...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  // Render children if authenticated
  return children;
}
