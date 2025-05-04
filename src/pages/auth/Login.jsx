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

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signInWithFacebook, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset any previous errors
    setLocalError('');
    
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }
    
    if (!validateEmail(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { success, error } = await signIn(email, password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setLocalError(error || 'Failed to sign in. Please check your credentials.');
        console.error('Login error:', error);
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
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
            Sign In
          </Typography>
          
          {(error || localError) && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {localError || error}
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
              Sign in with Google
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FacebookIcon />}
              onClick={handleFacebookSignIn}
              sx={{ mb: 2, color: '#1877F2', borderColor: '#1877F2' }}
            >
              Sign in with Facebook
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
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <MuiLink component={Link} to="/reset-password" variant="body2">
                Forgot password?
              </MuiLink>
              <MuiLink component={Link} to="/signup" variant="body2">
                {"Don't have an account? Sign Up"}
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
