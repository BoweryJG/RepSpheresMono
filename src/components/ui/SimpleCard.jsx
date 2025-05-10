import React from 'react';
import { Paper, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';

// Create a styled Paper component with cosmic-themed styling
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  background: 'rgba(20, 20, 30, 0.8)',
  border: '1px solid rgba(75, 192, 200, 0.2)',
  backdropFilter: 'blur(10px)',
  padding: theme.spacing(4),
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 200, 255, 0.15) inset',
  transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
  overflow: 'hidden',
  position: 'relative',
  color: 'white',
  '&:hover': {
    boxShadow: '0 6px 35px rgba(0, 0, 0, 0.6), 0 0 25px rgba(0, 200, 255, 0.2) inset',
    transform: 'translateY(-2px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0, 200, 255, 0.6) 50%, rgba(0,0,0,0) 100%)',
  }
}));

const SimpleCard = ({ children, ...props }) => {
  return (
    <StyledPaper elevation={5} {...props}>
      {children}
    </StyledPaper>
  );
};

export default SimpleCard;
