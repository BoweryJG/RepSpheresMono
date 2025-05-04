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
  CircularProgress,
  Divider
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, signInWithFacebook, error } = useAuth();
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

  const validatePassword = (password) => {
    // Password must be at least 8 characters, include a number, and a special character
    const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return re.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset any previous errors or success messages
    setLocalError('');
    setSuccess(false);
    
    // Form validation
    if (!email || !password || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }
    
    if (!validateEmail(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }
    
    if (!validatePassword(password)) {
      setLocalError('Password must be at least 8 characters and include a number and a special character');
      return;
    }
    
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { success, error, emailConfirmationRequired } = await signUp(email, password);
      
      if (success) {
        setSuccess(true);
        
        if (emailConfirmationRequired) {
          // Stay on signup page with a success message
          setLocalError('');
          setSuccess(true);
        } else {
          // Redirect to dashboard if email confirmation is not required
          navigate('/dashboard');
        }
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

  const handleGoogleSignIn = async () => {
    try {
      setLocalError('');
      await signInWithGoogle();
      // No need to navigate as OAuth will redirect
    } catch (err) {
      console.error('Error signing in with Google:', err);
      setLocalError('Failed to sign in with Google. Please try again.');
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setLocalError('');
      await signInWithFacebook();
      // No need to navigate as OAuth will redirect
    } catch (err) {
      console.error('Error signing in with Facebook:', err);
      setLocalError('Failed to sign in with Facebook. Please try again.');
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
            Sign Up
          </Typography>
          
          {localError && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {localError}
            </Alert>
          )}
          
          {error && !localError && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
              Your account has been created! Please check your email to confirm your registration.
            </Alert>
          )}
          
          {/* Social Login Buttons */}
          <Box sx={{ mt: 3, width: '100%' }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              sx={{ mb: 2 }}
            >
              Sign up with Google
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FacebookIcon />}
              onClick={handleFacebookSignIn}
              sx={{ mb: 2, color: '#1877F2', borderColor: '#1877F2' }}
            >
              Sign up with Facebook
            </Button>
            
            <Divider sx={{ my: 2 }}>or</Divider>
          </Box>
          
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
              disabled={isLoading || success}
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
              disabled={isLoading || success}
              helperText="Password must be at least 8 characters and include numbers and special characters"
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
              disabled={isLoading || success}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading || success}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <MuiLink component={Link} to="/login" variant="body2">
                Already have an account? Sign In
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
