import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
// Import the adapter component instead of directly importing from monorepo
import MarketInsightsAdapter from './MarketInsightsAdapter';

/**
 * MarketInsightsIntegration Component
 * 
 * This component integrates the Market Insights dashboard from the monorepo
 * into the main application.
 * 
 * Now using the enhanced MarketInsightsAdapter that leverages the supabaseAdmin client
 * with service role permissions for better data access.
 */
const MarketInsightsIntegration = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate loading time for the integration
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Market Insights Dashboard
      </Typography>
      
      <Box sx={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: 2, 
        p: 3,
        backgroundColor: '#fff'
      }}>
        {/* Use the adapter component with built-in supabaseAdmin client */}
        <MarketInsightsAdapter />
      </Box>
    </Box>
  );
};

export default MarketInsightsIntegration;
