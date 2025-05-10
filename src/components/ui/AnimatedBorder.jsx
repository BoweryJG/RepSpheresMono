import { Box } from '@mui/material';
import React from 'react';

const AnimatedBorder = ({ children, thickness = '4px', speed = '8s', borderRadius = '24px' }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: borderRadius,
        padding: thickness,
        isolation: 'isolate',
        background: `linear-gradient(90deg, 
          rgba(239, 131, 84, 1) 0%,
          rgba(255, 215, 0, 1) 25%, 
          rgba(169, 214, 229, 1) 50%,
          rgba(45, 49, 66, 1) 75%,
          rgba(239, 131, 84, 1) 100%)`,
        backgroundSize: '400% 400%',
        animation: `gradientShift ${speed} linear infinite`,
        boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'inherit',
          borderRadius: 'inherit',
          filter: 'blur(12px)',
          opacity: 0.7,
          zIndex: -1,
        },
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '400% 50%' }
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          backgroundColor: theme => theme.palette.background.paper,
          borderRadius: `calc(${borderRadius} - ${thickness})`,
          height: '100%',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AnimatedBorder;
