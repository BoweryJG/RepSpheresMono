import React, { Component } from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * Error Boundary component to catch JavaScript errors in child component tree.
 * This prevents a broken UI when errors occur in production.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You could also log the error to a reporting service here
    // reportErrorToService(error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  }

  handleBackToHome = () => {
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            
            <Typography variant="h4" gutterBottom sx={{ color: 'error.main' }}>
              Something went wrong
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              The application has encountered an unexpected error. This could be due to network issues, 
              configuration problems, or a temporary service outage.
            </Typography>

            {/* Display error details if in development */}
            {import.meta.env.DEV && this.state.error && (
              <Box sx={{ textAlign: 'left', mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Error Details (visible in development only):
                </Typography>
                <Typography variant="body2" component="pre" sx={{ 
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: 'error.main',
                  fontFamily: 'monospace'
                }}>
                  {this.state.error.toString()}
                </Typography>
                {this.state.errorInfo && (
                  <Typography variant="body2" component="pre" sx={{ 
                    mt: 2,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: 'text.secondary',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem'
                  }}>
                    {this.state.errorInfo.componentStack}
                  </Typography>
                )}
              </Box>
            )}
            
            <Box sx={{ mt: 4 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={this.handleRefresh}
                sx={{ mr: 2 }}
              >
                Refresh Page
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={this.handleBackToHome}
              >
                Back to Home
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
