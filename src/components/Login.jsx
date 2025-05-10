import { useState, useEffect } from 'react';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  signInWithFacebook, 
  handleOAuthRedirect,
  isAuthenticated 
} from '../services/supabase/supabaseAuth';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  Snackbar,
  Divider,
  Tab,
  Tabs,
  Link,
  alpha
} from '@mui/material';
import SimpleCard from './ui/SimpleCard';
import GradientButton from './ui/GradientButton';
import { useTheme } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Login = ({ onLoginSuccess }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [tabValue, setTabValue] = useState(0);
  // 0 = Sign In, 1 = Sign Up

  // Handle OAuth redirect on component mount
  useEffect(() => {
    const checkOAuthRedirect = async () => {
      // Check if we have a hash fragment, which indicates an OAuth redirect
      if (window.location.hash) {
        setLoading(true);
        const result = await handleOAuthRedirect();
        setLoading(false);
        
        if (result.success && result.session) {
          setSnackbarMessage('Login successful!');
          setSnackbarOpen(true);
          
          // Wait a moment before redirecting
          setTimeout(() => {
            onLoginSuccess(result.session.user);
          }, 1500);
        }
      }
    };
    
    checkOAuthRedirect();
  }, [onLoginSuccess]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError(null); // Clear any errors when switching tabs
  };

  const validateSignUp = () => {
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (tabValue === 0) {
        // Sign In
        const result = await signInWithEmail(email, password);
        if (result.success) {
          setSnackbarMessage('Login successful!');
          setSnackbarOpen(true);
          
          // Wait a moment before redirecting
          setTimeout(() => {
            onLoginSuccess(result.user);
          }, 1500);
        } else {
          setError(result.error || 'Failed to sign in');
        }
      } else {
        // Sign Up
        if (!validateSignUp()) {
          setLoading(false);
          return;
        }
        
        const result = await signUpWithEmail(email, password);
        if (result.success) {
          if (result.emailConfirmationRequired) {
            setSnackbarMessage('Please check your email to confirm your account');
            setSnackbarOpen(true);
            setTabValue(0); // Switch back to sign in tab
          } else {
            setSnackbarMessage('Registration successful!');
            setSnackbarOpen(true);
            
            // Wait a moment before redirecting
            setTimeout(() => {
              onLoginSuccess(result.user);
            }, 1500);
          }
        } else {
          setError(result.error || 'Failed to sign up');
        }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        // The user will be redirected to Google's auth page
        // After successful auth, they'll be redirected back to our app
        window.location.href = result.url;
      } else {
        setError(result.error || 'Failed to sign in with Google');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signInWithFacebook();
      if (result.success) {
        // The user will be redirected to Facebook's auth page
        // After successful auth, they'll be redirected back to our app
        window.location.href = result.url;
      } else {
        setError(result.error || 'Failed to sign in with Facebook');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ 
      pt: 8,
      pb: 4,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <SimpleCard sx={{ px: 4, py: 3, width: '100%' }}>
          <Box 
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <Box 
              sx={{
                mb: 3.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* RepSpheres Logo with Market Insights */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 500,
                    fontSize: '1.7rem',
                    background: 'linear-gradient(90deg, #47e5bc 10%, #00b0ff 90%)',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    textShadow: '0 0 20px rgba(0, 176, 255, 0.5)',
                    letterSpacing: '0.5px',
                    mb: 1
                  }}
                >
                  Rep<Box component="span" sx={{ fontWeight: 700 }}>Spheres</Box>
                </Typography>
              </Box>
              <Typography 
                variant="h6"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '3px',
                  fontSize: '0.9rem',
                  background: 'linear-gradient(90deg, #ffffff 20%, #a0e4f1 80%)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  opacity: 0.85
                }}
              >
                MARKET INSIGHTS
              </Typography>
            </Box>
        
          <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 400, color: '#a0e4f1' }}>
            Portal Access
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Authentication options */}
          <Box sx={{ width: '100%', mb: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={loading}
              sx={{ 
                mb: 1, 
                py: 1.2,
                textTransform: 'none',
                borderColor: '#dadce0',
                color: '#3c4043',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: '#f6f9fe',
                  borderColor: '#d2e3fc'
                }
              }}
            >
              Sign in with Google
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FacebookIcon />}
              onClick={handleFacebookSignIn}
              disabled={loading}
              sx={{ 
                mb: 2, 
                py: 1.2,
                textTransform: 'none',
                borderColor: '#dadce0',
                color: '#3c4043',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: '#f6f9fe',
                  borderColor: '#d2e3fc'
                }
              }}
            >
              Sign in with Facebook
            </Button>
          
            <Divider sx={{ 
              mb: 2,
              mt: 1,
              '&::before, &::after': {
                borderColor: '#dadce0',
              }
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#5f6368',
                  px: 1
                }}
              >
                OR
              </Typography>
            </Divider>
        </Box>

          {/* Tab navigation between Sign In and Sign Up */}
          <Box sx={{ 
            width: '100%', 
            borderBottom: 1, 
            borderColor: '#dadce0',
            mb: 1
          }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }
              }}
            >
              <Tab label="Sign in" id="auth-tab-0" aria-controls="auth-tabpanel-0" />
              <Tab label="Create account" id="auth-tab-1" aria-controls="auth-tabpanel-1" />
            </Tabs>
          </Box>

          {/* Sign In Panel */}
          <TabPanel value={tabValue} index={0}>
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                variant="outlined"
                size="small"
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
                disabled={loading}
                variant="outlined"
                size="small"
              />
              <GradientButton
                type="submit"
                fullWidth
                startColor="#47e5bc"
                endColor="#00b0ff"
                sx={{ 
                  mt: 3, 
                  mb: 2
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Access Portal'
                )}
              </GradientButton>
            </Box>
          </TabPanel>
        
          {/* Sign Up Panel */}
          <TabPanel value={tabValue} index={1}>
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="signup-email"
                label="Email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                variant="outlined"
                size="small"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="signup-password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                helperText="Use 6 or more characters"
                variant="outlined"
                size="small"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm"
                type="password"
                id="confirm-password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                variant="outlined"
                size="small"
              />
              <GradientButton
                type="submit"
                fullWidth
                startColor="#00b0ff"
                endColor="#47e5bc"
                sx={{ 
                  mt: 3, 
                  mb: 2
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Create Portal Access'
                )}
              </GradientButton>
            </Box>
          </TabPanel>
        
          <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
              mt: 2,
              fontSize: '0.75rem',
              color: 'rgba(160, 228, 241, 0.7)'
            }}
          >
            By accessing the portal, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Box>
      </SimpleCard>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default Login;
