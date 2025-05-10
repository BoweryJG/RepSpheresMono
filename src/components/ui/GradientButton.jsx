import React from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

// Create a styled button with custom props for gradient colors
const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'startColor' && prop !== 'endColor'
})(({ theme, startColor, endColor }) => ({
  background: `linear-gradient(90deg, ${startColor || '#00e676'} 0%, ${endColor || '#00b0ff'} 100%)`,
  color: 'white',
  fontWeight: 600,
  padding: theme.spacing(1.5, 4),
  borderRadius: '50px',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  border: 'none',
  '&:hover': {
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(1px)',
  },
  '&.Mui-disabled': {
    background: `linear-gradient(90deg, ${theme.palette.grey[400]} 0%, ${theme.palette.grey[600]} 100%)`,
    color: theme.palette.grey[100],
  }
}));

const GradientButton = ({ 
  children, 
  startColor, 
  endColor, 
  ...props 
}) => {
  return (
    <StyledButton 
      startColor={startColor} 
      endColor={endColor}
      disableElevation
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default GradientButton;
