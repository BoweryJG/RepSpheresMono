import { useState } from 'react';
import { signInWithEmail } from '../services/demoAuth';
import { Button, CircularProgress, Tooltip } from '@mui/material';
import GradientButton from './ui/GradientButton';

/**
 * A button that automatically logs in users with a demo account
 */
const DemoLoginButton = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // Sign in with a demo email address (no password needed with our demoAuth)
      const result = await signInWithEmail('demo@example.com');
      
      if (result.success) {
        // Short delay for UX
        setTimeout(() => {
          onLoginSuccess(result.user);
          setLoading(false);
        }, 800);
      } else {
        console.error('Demo login failed:', result.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error with demo login:', error);
      setLoading(false);
    }
  };

  return (
    <Tooltip title="Instant access with demo account" arrow>
      <GradientButton
        onClick={handleDemoLogin}
        fullWidth
        startColor="#f57c00" 
        endColor="#ff9800"
        disabled={loading}
        sx={{ 
          mt: 1,
          mb: 2,
          fontWeight: 'bold',
          letterSpacing: '0.5px'
        }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Instant Demo Access'
        )}
      </GradientButton>
    </Tooltip>
  );
};

export default DemoLoginButton;
