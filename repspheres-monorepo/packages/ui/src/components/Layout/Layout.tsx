import React from 'react';
import { Box, Container, ContainerProps, styled } from '@mui/material';

// Extended layout props
export interface LayoutProps {
  children: React.ReactNode;
  maxWidth?: ContainerProps['maxWidth'];
  fullWidth?: boolean;
  fullHeight?: boolean;
  centered?: boolean;
  padding?: number | string;
  backgroundColor?: string;
  backgroundImage?: string;
}

// Styled layout container
const StyledContainer = styled(Container, {
  shouldForwardProp: (prop) => 
    prop !== 'fullWidth' && 
    prop !== 'fullHeight' && 
    prop !== 'centered' &&
    prop !== 'padding' &&
    prop !== 'backgroundColor' &&
    prop !== 'backgroundImage'
})<LayoutProps>(({ 
  fullWidth = false,
  fullHeight = false,
  centered = false,
  padding,
  backgroundColor,
  backgroundImage
}) => ({
  width: fullWidth ? '100%' : undefined,
  height: fullHeight ? '100vh' : undefined,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: centered ? 'center' : 'flex-start',
  alignItems: centered ? 'center' : 'stretch',
  padding: padding !== undefined ? padding : undefined,
  backgroundColor: backgroundColor,
  backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
  backgroundSize: backgroundImage ? 'cover' : undefined,
  backgroundPosition: backgroundImage ? 'center' : undefined,
}));

/**
 * Layout component
 */
export const Layout: React.FC<LayoutProps> = ({
  children,
  maxWidth = 'lg',
  fullWidth = false,
  fullHeight = false,
  centered = false,
  padding,
  backgroundColor,
  backgroundImage,
}) => {
  return (
    <StyledContainer
      maxWidth={fullWidth ? false : maxWidth}
      fullWidth={fullWidth}
      fullHeight={fullHeight}
      centered={centered}
      padding={padding}
      backgroundColor={backgroundColor}
      backgroundImage={backgroundImage}
    >
      <Box sx={{ width: '100%' }}>
        {children}
      </Box>
    </StyledContainer>
  );
};

export default Layout;
