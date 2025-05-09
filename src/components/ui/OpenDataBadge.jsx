import React from 'react';
import { Box, Typography } from '@mui/material';

export default function OpenDataBadge() {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 2,
        py: 0.5,
        borderRadius: 6,
        background: 'linear-gradient(90deg, #FFD700 0%, #EF8354 100%)',
        color: '#2D3142',
        fontWeight: 800,
        fontSize: 18,
        letterSpacing: 1,
        boxShadow: '0 2px 8px 0 rgba(239,131,84,0.08)',
        mb: 2,
        mr: 2,
        textTransform: 'uppercase',
        border: '2px solid #FFD700',
      }}
    >
      <Typography component="span" sx={{ fontWeight: 900, mr: 1, fontSize: 18 }}>
        OPEN DATA
      </Typography>
      <span role="img" aria-label="globe">🌐</span>
    </Box>
  );
}
