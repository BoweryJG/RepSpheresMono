import { useState } from 'react';
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import { populateSupabaseData } from '../../services/supabase/populateData';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * Button component to trigger data population in Supabase
 */
export default function DataPopulationButton() {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handlePopulateData = async () => {
    setLoading(true);
    try {
      const result = await populateSupabaseData();
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Successfully populated data in Supabase!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: `Error populating data: ${result.error}`,
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Unexpected error: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
        onClick={handlePopulateData}
        disabled={loading}
      >
        {loading ? 'Populating Data...' : 'Populate Data'}
      </Button>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
