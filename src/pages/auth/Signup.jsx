import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function Signup() {
  const navigate = useNavigate();
  const { signUp, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    
    if (!email || !password || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }
    
    if (!validateEmail(email)) {
      setLocalError('Please enter a valid email address');
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
      const { success, error } = await signUp(email, password);
      
      if (success) {
        setSuccess(true);
      } else {
        setLocalError(error || 'Failed to sign up. Please try again.');
        console.error('Signup error:', error);
      }
    } catch (err) {
      console.error('Unexpected error during signup:', err);
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
            Create Account
          </Typography>
          
          {success ? (
            <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Registration successful! Please check your email to confirm your account.
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
              {(error || localError) && (
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                  {localError || error}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
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
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
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
                  label="Confirm Password"
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
                  {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
                </Button>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <MuiLink component={Link} to="/login" variant="body2">
                    Already have an account? Sign In
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
