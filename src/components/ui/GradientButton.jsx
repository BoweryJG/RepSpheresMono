import React from 'react';
import { Button, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * GradientButton - An enhanced Button component with gradient styling
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.color - Button color (primary, secondary, success, error, info, warning)
 * @param {string} props.variant - Button variant (contained, outlined, text)
 * @param {string} props.size - Button size (small, medium, large)
 * @param {boolean} props.fullWidth - Whether the button should take up the full width
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.startIcon - Icon to display at the start of the button
 * @param {React.ReactNode} props.endIcon - Icon to display at the end of the button
 * @param {Object} props.sx - Additional styles to apply to the button
 * @param {Object} props.rest - Additional props to pass to the Button component
 */
const GradientButton = ({
  children,
  color = 'primary',
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  onClick,
  startIcon,
  endIcon,
  sx = {},
  ...rest
}) => {
  const theme = useTheme();
  
  // Get the appropriate color from the theme
  const getColorFromTheme = () => {
    switch (color) {
      case 'secondary':
        return theme.palette.secondary;
      case 'success':
        return theme.palette.success;
      case 'error':
        return theme.palette.error;
      case 'info':
        return theme.palette.info;
      case 'warning':
        return theme.palette.warning;
      default:
        return theme.palette.primary;
    }
  };
  
  const colorObj = getColorFromTheme();
  
  // Define gradient styles based on variant
  const getGradientStyles = () => {
    if (variant === 'contained') {
      return {
        background: `linear-gradient(45deg, ${colorObj.main} 30%, ${colorObj.light} 90%)`,
        color: colorObj.contrastText,
        '&:hover': {
          background: `linear-gradient(45deg, ${colorObj.dark} 30%, ${colorObj.main} 90%)`,
          boxShadow: `0 4px 10px ${alpha(colorObj.main, 0.3)}`,
          transform: 'translateY(-1px)',
        },
      };
    } else if (variant === 'outlined') {
      return {
        background: 'transparent',
        border: `1px solid ${colorObj.main}`,
        color: colorObj.main,
        '&:hover': {
          background: alpha(colorObj.main, 0.05),
          borderColor: colorObj.dark,
          boxShadow: `0 2px 6px ${alpha(colorObj.main, 0.2)}`,
        },
      };
    } else {
      // Text variant
      return {
        background: 'transparent',
        color: colorObj.main,
        '&:hover': {
          background: alpha(colorObj.main, 0.05),
        },
      };
    }
  };
  
  // Size-specific styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: '4px 10px',
          fontSize: '0.8125rem',
        };
      case 'large':
        return {
          padding: '10px 22px',
          fontSize: '1rem',
        };
      default:
        return {
          padding: '8px 16px',
          fontSize: '0.875rem',
        };
    }
  };
  
  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      onClick={onClick}
      startIcon={startIcon}
      endIcon={endIcon}
      sx={{
        borderRadius: '6px',
        fontWeight: 500,
        transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
        boxShadow: variant === 'contained' ? `0 2px 5px ${alpha(colorObj.main, 0.2)}` : 'none',
        ...getGradientStyles(),
        ...getSizeStyles(),
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default GradientButton;
