import React from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';

function NotFoundPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper 
        elevation={3}
        sx={{ 
          p: 5, 
          textAlign: 'center',
          borderRadius: 3,
          bgcolor: 'background.paper'
        }}
      >
        <ErrorOutlineIcon 
          color="error" 
          sx={{ 
            fontSize: 100,
            mb: 3
          }} 
        />
        
        <Typography variant="h2" component="h1" gutterBottom>
          404
        </Typography>
        
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            component={RouterLink}
            to="/"
            startIcon={<HomeIcon />}
          >
            Go to Home
          </Button>
          
          <Button 
            variant="outlined" 
            color="primary" 
            size="large"
            component={RouterLink}
            to="/search"
            startIcon={<SearchIcon />}
          >
            Search Procedures
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default NotFoundPage;
