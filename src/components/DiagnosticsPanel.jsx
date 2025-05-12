import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Collapse, CircularProgress, Alert, Divider, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { netlifyDiagnosticsService } from '../services/netlifyDiagnosticsService';

/**
 * Diagnostics Panel Component
 * 
 * A collapsible panel that displays diagnostic information about the application,
 * particularly useful for troubleshooting Netlify deployment issues.
 */
const DiagnosticsPanel = () => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Run diagnostics when expanded
  useEffect(() => {
    if (expanded && !results) {
      runDiagnostics();
    }
  }, [expanded]);

  // Run diagnostics
  const runDiagnostics = async () => {
    try {
      setLoading(true);
      setError(null);
      const diagnosticsResults = await netlifyDiagnosticsService.runHealthCheck();
      setResults(diagnosticsResults);
    } catch (err) {
      setError(err.message);
      console.error('Diagnostics error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset and run diagnostics again
  const handleRefresh = () => {
    setResults(null);
    runDiagnostics();
  };

  // Toggle expansion
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Get status chip for a check
  const getStatusChip = (status) => {
    if (!status) return <Chip size="small" label="Unknown" color="default" />;
    
    switch(status.toLowerCase()) {
      case 'healthy':
        return <Chip size="small" label="Healthy" color="success" />;
      case 'unhealthy':
        return <Chip size="small" label="Unhealthy" color="error" />;
      case 'skipped':
        return <Chip size="small" label="Skipped" color="warning" />;
      case 'error':
        return <Chip size="small" label="Error" color="error" />;
      default:
        return <Chip size="small" label={status} color="default" />;
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        mt: 2,
        p: 1,
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        backgroundColor: expanded ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.85)',
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: 'pointer',
          px: 1
        }} 
        onClick={toggleExpanded}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HealthAndSafetyIcon color="primary" />
          <Typography variant="subtitle1">
            System Diagnostics
          </Typography>
          
          {results && !loading && (
            <Chip 
              size="small" 
              label={
                results.checks?.supabase?.status === 'healthy' && 
                results.checks?.netlifyFunction?.status !== 'unhealthy'
                  ? 'All Systems Operational'
                  : 'Issues Detected'
              }
              color={
                results.checks?.supabase?.status === 'healthy' && 
                results.checks?.netlifyFunction?.status !== 'unhealthy'
                  ? 'success'
                  : 'warning'
              }
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        
        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Box>

      {/* Expandable Content */}
      <Collapse in={expanded}>
        <Divider sx={{ my: 1 }} />
        
        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography>Running diagnostics...</Typography>
          </Box>
        )}
        
        {/* Results */}
        {results && !loading && (
          <Box sx={{ p: 1 }}>
            {/* Environment Info */}
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Environment Information
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip 
                size="small" 
                label={`Mode: ${results.environment.mode}`} 
                color="default" 
                variant="outlined"
              />
              <Chip 
                size="small" 
                label={`Netlify: ${results.environment.isNetlify ? 'Yes' : 'No'}`} 
                color={results.environment.isNetlify ? 'primary' : 'default'} 
                variant="outlined"
              />
            </Box>
            
            {/* Checks */}
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Connectivity Status
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">Supabase Connection:</Typography>
                {getStatusChip(results.checks?.supabase?.status)}
              </Box>
              
              {results.checks?.supabase?.error && (
                <Typography variant="body2" color="error" sx={{ mb: 1, fontSize: '0.8rem' }}>
                  Error: {results.checks.supabase.error}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">Netlify Functions:</Typography>
                {getStatusChip(results.checks?.netlifyFunction?.status)}
              </Box>
              
              {results.checks?.netlifyFunction?.error && (
                <Typography variant="body2" color="error" sx={{ mb: 1, fontSize: '0.8rem' }}>
                  Error: {results.checks.netlifyFunction.error}
                </Typography>
              )}
            </Box>
            
            {/* Environment Variables Status */}
            {results.checks?.netlifyFunction?.environmentInfo && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Environment Variables
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">VITE_SUPABASE_URL:</Typography>
                    <Chip 
                      size="small" 
                      label={results.checks.netlifyFunction.environmentInfo.envVars?.viteSupabaseUrlSet ? 'Set' : 'Missing'} 
                      color={results.checks.netlifyFunction.environmentInfo.envVars?.viteSupabaseUrlSet ? 'success' : 'error'} 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">VITE_SUPABASE_ANON_KEY:</Typography>
                    <Chip 
                      size="small" 
                      label={results.checks.netlifyFunction.environmentInfo.envVars?.viteSupabaseAnonKeySet ? 'Set' : 'Missing'} 
                      color={results.checks.netlifyFunction.environmentInfo.envVars?.viteSupabaseAnonKeySet ? 'success' : 'error'} 
                    />
                  </Box>
                </Box>
              </>
            )}
            
            {/* Performance */}
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Performance
            </Typography>
            <Box sx={{ mb: 2 }}>
              {results.checks?.supabase?.latency && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Supabase Latency:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {results.checks.supabase.latency}
                  </Typography>
                </Box>
              )}
              {results.checks?.netlifyFunction?.latency && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Netlify Function Latency:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {results.checks.netlifyFunction.latency}
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Last Updated */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Last updated: {new Date(results.timestamp).toLocaleTimeString()}
              </Typography>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={handleRefresh}
                startIcon={loading ? <CircularProgress size={16} /> : null}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
          </Box>
        )}
      </Collapse>
    </Paper>
  );
};

export default DiagnosticsPanel;
