import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../services/auth/AuthContext';
import { supabase } from '../../services/supabase/supabaseClient';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Link as MuiLink,
  Alert,
  CircularProgress
} from '@mui/material';

export default function ResetPasswordConfirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, error: authError } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset any previous errors
    setLocalError('');
    
    if (!password || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get the hash from the URL (Supabase should have redirected with the hash parameter)
      const hash = location.hash;
      
      if (!hash) {
        throw new Error('Password reset link is invalid or has expired. Please try again.');
      }
      
      // Use the Supabase client directly here to update the user's password
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000); // Redirect to login after 3 seconds
    } catch (err) {
      console.error('Error resetting password:', err);
      setLocalError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          marginTop: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
            Market Insights
          </Typography>
          
          <Typography component="h2" variant="h5">
            Set New Password
          </Typography>
          
          {success ? (
            <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Your password has been successfully reset. You will be redirected to login shortly.
              </Alert>
              <Button 
                variant="contained" 
                component={Link} 
                to="/login"
                sx={{ mt: 2 }}
              >
                Go to Login
              </Button>
            </Box>
          ) : (
            <>
              {(authError || localError) && (
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                  {localError || authError}
                </Alert>
              )}
              
              <Typography variant="body1" sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
                Please enter your new password below.
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="New Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Reset Password'}
                </Button>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <MuiLink component={Link} to="/login" variant="body2">
                    Back to Sign In
                  </MuiLink>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
