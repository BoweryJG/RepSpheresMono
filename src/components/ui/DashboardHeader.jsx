import React from 'react';
import { Box, Typography, Fade } from '@mui/material';
import OpenDataBadge from './OpenDataBadge';

// Optional animated background (simple gradient shift)
const AnimatedBackground = () => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      background: 'linear-gradient(120deg, #A9D6E5 0%, #F7F7FF 50%, #FFD700 100%)',
      backgroundSize: '200% 200%',
      animation: 'gradientShift 8s ease-in-out infinite',
      borderRadius: 6,
      '@keyframes gradientShift': {
        '0%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
        '100%': { backgroundPosition: '0% 50%' },
      },
    }}
  />
);

export default function DashboardHeader() {
  return (
    <Box sx={{ position: 'relative', width: '100%', mb: 4, mt: 2 }}>
      <AnimatedBackground />
      <Fade in timeout={1200}>
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            mx: 'auto',
            px: { xs: 2, md: 6 },
            py: { xs: 3, md: 4 },
            maxWidth: 760,
            borderRadius: 6,
            background: 'rgba(255,255,255,0.70)',
            boxShadow: '0 8px 32px 0 rgba(44,62,80,0.13)',
            backdropFilter: 'blur(12px)',
            borderLeft: '6px solid #FFD700',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 1.5,
          }}
        >
          <OpenDataBadge />
          <Typography variant="h3" sx={{ color: '#2D3142', fontWeight: 800, mb: 0.5 }}>
            Market Insights for Dental & Aesthetic Leaders
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#2D3142', fontWeight: 500, mb: 1 }}>
            Data-driven intelligence for growth, strategy, and innovation.
          </Typography>
          <Typography variant="caption" sx={{ color: '#EF8354', fontWeight: 600, letterSpacing: 1 }}>
            Continuously Updated • Trusted by Industry Professionals
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
}
