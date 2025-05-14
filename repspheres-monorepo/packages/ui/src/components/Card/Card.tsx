import React from 'react';
import { Card as MuiCard, CardProps as MuiCardProps, styled } from '@mui/material';

// Extended card props
export interface CardProps extends MuiCardProps {
  gradient?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  bordered?: boolean;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  elevation?: number;
}

// Styled gradient card
const GradientCard = styled(MuiCard, {
  shouldForwardProp: (prop) => 
    prop !== 'gradient' && 
    prop !== 'bordered' && 
    prop !== 'borderColor' &&
    prop !== 'borderWidth' &&
    prop !== 'borderRadius'
})<CardProps>(({ 
  theme, 
  gradient = 'primary',
  bordered = false,
  borderColor,
  borderWidth = 1,
  borderRadius,
  elevation = 1
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
    boxShadow: elevation ? theme.shadows[elevation] : 'none',
    borderRadius: borderRadius || theme.shape.borderRadius,
    border: bordered ? `${borderWidth}px solid ${borderColor || theme.palette.divider}` : 'none',
    overflow: 'hidden',
  };
});

/**
 * Card component
 */
export const Card: React.FC<CardProps> = ({
  children,
  gradient,
  bordered = false,
  borderColor,
  borderWidth = 1,
  borderRadius,
  elevation = 1,
  sx,
  ...rest
}) => {
  // Use gradient card if gradient is specified
  if (gradient) {
    return (
      <GradientCard
        gradient={gradient}
        bordered={bordered}
        borderColor={borderColor}
        borderWidth={borderWidth}
        borderRadius={borderRadius}
        elevation={elevation}
        sx={sx}
        {...rest}
      >
        {children}
      </GradientCard>
    );
  }

  // Regular card
  return (
    <MuiCard
      elevation={elevation}
      sx={{
        borderRadius: borderRadius,
        border: bordered ? `${borderWidth}px solid ${borderColor || 'divider'}` : 'none',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </MuiCard>
  );
};

export default Card;
