import { createTheme } from '@mui/material/styles';

// Create light theme
const createLightTheme = () => createTheme({
  palette: {
    primary: {
      main: '#0277bd', // Deeper blue - more professional
      light: '#58a5f0',
      dark: '#004c8c',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7b1fa2', // Rich purple
      light: '#ae52d4',
      dark: '#4a0072',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    background: {
      default: '#f8f9fa', // Lighter background for better contrast
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#5f6368',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.00714em',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      letterSpacing: '0.00938em',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      letterSpacing: '0.01071em',
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.02857em',
      textTransform: 'none', // More modern approach without all-caps
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      letterSpacing: '0.03333em',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 500,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 8, // More rounded corners throughout
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#bdbdbd',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#9e9e9e',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          padding: '8px 16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
          '&:hover': {
            boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #0277bd 30%, #58a5f0 90%)',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #7b1fa2 30%, #ae52d4 90%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
          borderRadius: '12px',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 20px 8px',
          background: 'linear-gradient(to right, rgba(2, 119, 189, 0.05), rgba(88, 165, 240, 0.05))',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        },
        title: {
          fontSize: '1.2rem',
          fontWeight: 600,
          color: '#0277bd',
        },
        subheader: {
          fontSize: '0.875rem',
          color: '#5f6368',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '20px',
          '&:last-child': {
            paddingBottom: 20,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: '16px',
          '&.MuiChip-colorPrimary': {
            background: 'linear-gradient(45deg, #0277bd 30%, #58a5f0 90%)',
          },
          '&.MuiChip-colorSecondary': {
            background: 'linear-gradient(45deg, #7b1fa2 30%, #ae52d4 90%)',
          },
        },
        icon: {
          color: 'inherit',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'none',
          minWidth: 'auto',
          padding: '12px 16px',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            color: '#0277bd',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: '3px',
          borderRadius: '3px 3px 0 0',
          background: 'linear-gradient(45deg, #0277bd 30%, #58a5f0 90%)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          marginBottom: '4px',
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#0277bd',
          minWidth: '40px',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
        },
        colorDefault: {
          background: 'linear-gradient(45deg, #0277bd 30%, #58a5f0 90%)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            transition: 'box-shadow 0.2s ease',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            },
            '&.Mui-focused': {
              boxShadow: '0 2px 10px rgba(2, 119, 189, 0.15)',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#0277bd',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          margin: '16px 0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        },
        elevation2: {
          boxShadow: '0 3px 12px rgba(0,0,0,0.1)',
        },
        elevation3: {
          boxShadow: '0 5px 15px rgba(0,0,0,0.12)',
        },
      },
    },
  },
});

// Create dark theme
const createDarkTheme = () => createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#58a5f0', // Lighter blue for dark mode
      light: '#8cd8ff',
      dark: '#0277bd',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ae52d4', // Lighter purple for dark mode
      light: '#e17fff',
      dark: '#7b1fa2',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50',
      light: '#80e27e',
      dark: '#087f23',
    },
    info: {
      main: '#03a9f4',
      light: '#67daff',
      dark: '#007ac1',
    },
    warning: {
      main: '#ff9800',
      light: '#ffc947',
      dark: '#c66900',
    },
    error: {
      main: '#ef5350',
      light: '#ff867c',
      dark: '#b61827',
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1e1e1e',   // Slightly lighter dark for cards
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.00714em',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      letterSpacing: '0.00938em',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      letterSpacing: '0.01071em',
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      letterSpacing: '0.03333em',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 500,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#333333',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#666666',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#888888',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          padding: '8px 16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.24), 0 1px 2px rgba(0,0,0,0.36)',
          transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
          '&:hover': {
            boxShadow: '0 3px 6px rgba(0,0,0,0.32), 0 3px 6px rgba(0,0,0,0.46)',
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #0277bd 30%, #58a5f0 90%)',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #7b1fa2 30%, #ae52d4 90%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 20px 8px',
          background: 'linear-gradient(to right, rgba(2, 119, 189, 0.15), rgba(88, 165, 240, 0.15))',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        },
        title: {
          fontSize: '1.2rem',
          fontWeight: 600,
          color: '#58a5f0',
        },
        subheader: {
          fontSize: '0.875rem',
          color: '#b0b0b0',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '20px',
          '&:last-child': {
            paddingBottom: 20,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: '16px',
          '&.MuiChip-colorPrimary': {
            background: 'linear-gradient(45deg, #0277bd 30%, #58a5f0 90%)',
          },
          '&.MuiChip-colorSecondary': {
            background: 'linear-gradient(45deg, #7b1fa2 30%, #ae52d4 90%)',
          },
        },
        icon: {
          color: 'inherit',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'none',
          minWidth: 'auto',
          padding: '12px 16px',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            color: '#58a5f0',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: '3px',
          borderRadius: '3px 3px 0 0',
          background: 'linear-gradient(45deg, #0277bd 30%, #58a5f0 90%)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          marginBottom: '4px',
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#58a5f0',
          minWidth: '40px',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        },
        colorDefault: {
          background: 'linear-gradient(45deg, #0277bd 30%, #58a5f0 90%)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            transition: 'box-shadow 0.2s ease',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            },
            '&.Mui-focused': {
              boxShadow: '0 2px 10px rgba(88, 165, 240, 0.25)',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#58a5f0',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          margin: '16px 0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        },
        elevation2: {
          boxShadow: '0 3px 12px rgba(0,0,0,0.25)',
        },
        elevation3: {
          boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        },
      },
    },
  },
});

// Export theme creation functions
export { createLightTheme, createDarkTheme };

// Default theme (light)
const theme = createLightTheme();
export default theme;
