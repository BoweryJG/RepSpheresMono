import React from 'react';
import { Card, CardContent, CardHeader, Box, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * GradientCard - An enhanced Card component with gradient styling
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.title - Card title
 * @param {string} props.subheader - Card subheader
 * @param {React.ReactNode} props.action - Action component to display in the header
 * @param {React.ReactNode} props.avatar - Avatar component to display in the header
 * @param {string} props.gradientColor - Base color for the gradient (defaults to theme primary color)
 * @param {Object} props.sx - Additional styles to apply to the card
 * @param {Object} props.headerSx - Additional styles to apply to the card header
 * @param {Object} props.contentSx - Additional styles to apply to the card content
 * @param {Object} props.rest - Additional props to pass to the Card component
 */
const GradientCard = ({
  children,
  title,
  subheader,
  action,
  avatar,
  gradientColor,
  sx = {},
  headerSx = {},
  contentSx = {},
  ...rest
}) => {
  const theme = useTheme();
  const color = gradientColor || theme.palette.primary.main;
  
  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        ...sx
      }}
      {...rest}
    >
      {/* Gradient background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.01)} 100%)`,
          zIndex: 0
        }}
      />
      
      {/* Card header with gradient accent */}
      {title && (
        <CardHeader
          title={title}
          subheader={subheader}
          action={action}
          avatar={avatar}
          sx={{
            position: 'relative',
            zIndex: 1,
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              background: `linear-gradient(to bottom, ${color}, ${alpha(color, 0.5)})`,
            },
            pl: 3, // Add padding to account for the gradient accent
            ...headerSx
          }}
        />
      )}
      
      {/* Card content */}
      <CardContent
        sx={{
          position: 'relative',
          zIndex: 1,
          ...contentSx
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
};

export default GradientCard;
