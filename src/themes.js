// themes.js - Award-winning, cosmic, and industry-specific MUI themes
import { createTheme } from '@mui/material/styles';

// Award-winning Google Fonts (add via index.html or @import in CSS):
// Inter, Playfair Display, Montserrat, Orbitron

// --- Dental Theme ---
export const dentalTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#34bdeb', contrastText: '#fff' }, // Blue
    secondary: { main: '#b2f2e9', contrastText: '#222' }, // Mint
    background: { default: '#f7fafc', paper: '#fff' },
    info: { main: '#a1e3fa' },
    success: { main: '#6ee7b7' },
    error: { main: '#f87171' },
    cosmic: { main: '#b3c6ff' }, // Subtle cosmic accent
  },
  typography: {
    fontFamily: 'Inter, Montserrat, Arial, sans-serif',
    h1: { fontWeight: 800, fontSize: 'clamp(2.2rem, 7vw, 3.5rem)', letterSpacing: '0.01em' },
    h2: { fontWeight: 700, fontSize: 'clamp(1.6rem, 5vw, 2.5rem)' },
    h3: { fontWeight: 700 },
    button: { fontWeight: 700, textTransform: 'uppercase' },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 8px 32px 0 rgba(52,189,235,0.10)',
          background: 'linear-gradient(135deg, #f7fafc 80%, #e0f7fa 100%)',
          border: '1.5px solid #b2f2e9',
          position: 'relative',
          overflow: 'hidden',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.7)',
          borderBottom: '2px solid #b2f2e9',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 700,
          letterSpacing: '0.05em',
          boxShadow: '0 2px 8px 0 rgba(52,189,235,0.10)',
        },
      },
    },
  },
});

// --- Aesthetic Theme ---
export const aestheticTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#f7b2d9', contrastText: '#5e2d79' }, // Blush
    secondary: { main: '#ffe6f7', contrastText: '#b46d9c' },
    background: { default: '#fff7fa', paper: '#fff' },
    info: { main: '#e0c3fc' },
    success: { main: '#ffe066' },
    error: { main: '#fa709a' },
    cosmic: { main: '#e0c3fc' },
  },
  typography: {
    fontFamily: 'Playfair Display, Montserrat, Arial, serif',
    h1: { fontWeight: 900, fontSize: 'clamp(2.2rem, 7vw, 3.5rem)', letterSpacing: '0.01em' },
    h2: { fontWeight: 700, fontSize: 'clamp(1.6rem, 5vw, 2.5rem)' },
    h3: { fontWeight: 700 },
    button: { fontWeight: 700, textTransform: 'uppercase' },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          boxShadow: '0 8px 32px 0 rgba(247,178,217,0.13)',
          background: 'linear-gradient(120deg, #fff7fa 80%, #f7b2d9 100%)',
          border: '1.5px solid #ffe6f7',
          position: 'relative',
          overflow: 'hidden',
          // Glassmorphism
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.8)',
          borderBottom: '2px solid #f7b2d9',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          fontWeight: 700,
          letterSpacing: '0.06em',
          boxShadow: '0 2px 8px 0 rgba(247,178,217,0.10)',
        },
      },
    },
  },
});

// --- Cosmic/Random Themes ---
const cosmicPalettes = [
  // Cosmic Neon
  {
    primary: { main: '#7f5af0', contrastText: '#fff' },
    secondary: { main: '#2cb67d', contrastText: '#fff' },
    background: { default: '#16161a', paper: '#1a1a2e' },
    info: { main: '#b8c1ec' },
    success: { main: '#2cb67d' },
    error: { main: '#ff5470' },
    cosmic: { main: '#fffae3' },
  },
  // Deep Space
  {
    primary: { main: '#1e90ff', contrastText: '#fff' },
    secondary: { main: '#ff61a6', contrastText: '#fff' },
    background: { default: '#0f2027', paper: '#2c5364' },
    info: { main: '#43cea2' },
    success: { main: '#faffd1' },
    error: { main: '#ff0844' },
    cosmic: { main: '#ffe29f' },
  },
  // Pop Culture
  {
    primary: { main: '#ff9800', contrastText: '#fff' },
    secondary: { main: '#9c27b0', contrastText: '#fff' },
    background: { default: '#22223b', paper: '#4a4e69' },
    info: { main: '#f2e9e4' },
    success: { main: '#c9ada7' },
    error: { main: '#f67280' },
    cosmic: { main: '#f8ad9d' },
  },
];

export const randomCosmicTheme = () => {
  const palette = cosmicPalettes[Math.floor(Math.random() * cosmicPalettes.length)];
  return createTheme({
    palette: {
      mode: 'dark',
      ...palette,
    },
    typography: {
      fontFamily: 'Orbitron, Montserrat, Arial, sans-serif',
      h1: { fontWeight: 900, fontSize: 'clamp(2.4rem, 8vw, 4rem)', letterSpacing: '0.03em', textTransform: 'uppercase' },
      h2: { fontWeight: 800, fontSize: 'clamp(1.8rem, 6vw, 2.8rem)' },
      h3: { fontWeight: 700 },
      button: { fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em' },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 32,
            boxShadow: '0 8px 32px 0 rgba(127,90,240,0.18)',
            background: 'linear-gradient(120deg, #16161a 80%, #7f5af0 100%)',
            border: '2px solid #b8c1ec',
            position: 'relative',
            overflow: 'hidden',
            // Cosmic overlay suggestion: add SVG starfield or animated gradient here
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            background: 'rgba(34,34,59,0.85)',
            borderBottom: '2px solid #7f5af0',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            fontWeight: 800,
            letterSpacing: '0.08em',
            boxShadow: '0 2px 12px 0 rgba(127,90,240,0.18)',
            background: 'linear-gradient(90deg, #7f5af0 60%, #2cb67d 100%)',
          },
        },
      },
    },
  });
};

// Helper to select theme by industry and apply visual mode
export const getThemeByIndustry = (industry, visualMode = 'default') => {
  // First get the base industry theme (data-specific)
  let baseTheme;
  if (industry === 'dental') {
    baseTheme = dentalTheme;
  } else if (industry === 'aesthetic') {
    baseTheme = aestheticTheme;
  } else {
    // Fallback to dental if industry is invalid
    baseTheme = dentalTheme;
  }
  
  // If cosmic visual mode is requested, apply cosmic visual styling while preserving the data theme
  if (visualMode === 'cosmic') {
    // Select a random cosmic palette
    const cosmicPalette = cosmicPalettes[Math.floor(Math.random() * cosmicPalettes.length)];
    
    return createTheme({
      ...baseTheme,
      palette: {
        ...baseTheme.palette,
        mode: 'dark',
        // Apply cosmic background colors but keep industry-specific primary/secondary colors
        background: cosmicPalette.background,
        info: cosmicPalette.info,
        success: cosmicPalette.success,
        error: cosmicPalette.error,
        cosmic: cosmicPalette.cosmic,
      },
      typography: {
        ...baseTheme.typography,
        fontFamily: 'Orbitron, Montserrat, Arial, sans-serif',
        h1: { 
          ...baseTheme.typography.h1,
          fontWeight: 900,
          letterSpacing: '0.03em',
          textTransform: 'uppercase'
        },
        h2: { 
          ...baseTheme.typography.h2,
          fontWeight: 800,
        },
        button: {
          ...baseTheme.typography.button,
          fontWeight: 800,
          letterSpacing: '0.07em',
        }
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 32,
              boxShadow: '0 8px 32px 0 rgba(127,90,240,0.18)',
              background: `linear-gradient(120deg, ${cosmicPalette.background.paper} 80%, ${baseTheme.palette.primary.main} 100%)`,
              border: `2px solid ${baseTheme.palette.primary.main}`,
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(12px)',
            },
          },
        },
        MuiCardHeader: {
          styleOverrides: {
            root: {
              background: 'rgba(34,34,59,0.85)',
              borderBottom: `2px solid ${baseTheme.palette.primary.main}`,
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 20,
              fontWeight: 800,
              letterSpacing: '0.08em',
              boxShadow: '0 2px 12px 0 rgba(127,90,240,0.18)',
              background: `linear-gradient(90deg, ${baseTheme.palette.primary.main} 60%, ${cosmicPalette.secondary.main} 100%)`,
            },
          },
        },
      },
    });
  }
  
  // Return the base theme unchanged if visualMode is 'default'
  return baseTheme;
};
