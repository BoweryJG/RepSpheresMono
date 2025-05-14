import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, styled } from '@mui/material';

// Extended button props
export interface ButtonProps extends MuiButtonProps {
  gradient?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  rounded?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

// Styled gradient button
const GradientButton = styled(MuiButton, {
  shouldForwardProp: (prop) => 
    prop !== 'gradient' && 
    prop !== 'rounded'
})<ButtonProps>(({ 
  theme, 
  gradient = 'primary',
  rounded = false,
}) => {
  const getGradient = () => {
    switch (gradient) {
      case 'secondary':
        return `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`;
      case 'info':
        return `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`;
      case 'success':
        return `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`;
      case 'warning':
        return `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 100%)`;
      case 'error':
        return `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`;
      case 'primary':
      default:
        return `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`;
    }
  };

  return {
    background: getGradient(),
    color: theme.palette.common.white,
    borderRadius: rounded ? '50px' : theme.shape.borderRadius,
    textTransform: 'none',
    '&:hover': {
      background: getGradient(),
      filter: 'brightness(1.1)',
    },
  };
});

/**
 * Button component
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'contained',
  color = 'primary',
  gradient,
  rounded = false,
  fullWidth = false,
  size = 'medium',
  startIcon,
  endIcon,
  sx,
  ...rest
}) => {
  // Use gradient button if gradient is specified
  if (gradient) {
    return (
      <GradientButton
        variant={variant}
        gradient={gradient}
        rounded={rounded}
        fullWidth={fullWidth}
        size={size}
        startIcon={startIcon}
        endIcon={endIcon}
        sx={sx}
        {...rest}
      >
        {children}
      </GradientButton>
    );
  }

  // Regular button
  return (
    <MuiButton
      variant={variant}
      color={color}
      fullWidth={fullWidth}
      size={size}
      startIcon={startIcon}
      endIcon={endIcon}
      sx={{
        borderRadius: rounded ? '50px' : undefined,
        textTransform: 'none',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
