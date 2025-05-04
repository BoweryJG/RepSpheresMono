import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../services/auth/AuthContext';
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

export default function ResetPassword() {
  const { resetPassword, error } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset any previous errors
    setLocalError('');
    
    if (!email) {
      setLocalError('Please enter your email address');
      return;
    }
    
    if (!validateEmail(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { success, error } = await resetPassword(email);
      
      if (success) {
        setSuccess(true);
      } else {
        setLocalError(error || 'Failed to send reset password email. Please try again.');
        console.error('Password reset error:', error);
      }
    } catch (err) {
      console.error('Unexpected error during password reset:', err);
      setLocalError('An unexpected error occurred. Please try again.');
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
            Reset Password
          </Typography>
          
          {success ? (
            <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Password reset instructions have been sent to your email.
              </Alert>
              <Button 
                variant="contained" 
                component={Link} 
                to="/login"
                sx={{ mt: 2 }}
              >
                Back to Login
              </Button>
            </Box>
          ) : (
            <>
              {(error || localError) && (
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                  {localError || error}
                </Alert>
              )}
              
              <Typography variant="body1" sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
                Enter your email address and we'll send you instructions to reset your password.
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
