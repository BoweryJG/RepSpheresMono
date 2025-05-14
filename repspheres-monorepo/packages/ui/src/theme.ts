import { createTheme, ThemeOptions } from '@mui/material/styles';

// Define theme interface
export interface ThemeConfig {
  mode?: 'light' | 'dark';
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  borderRadius?: number;
  spacing?: number;
}

// Default theme values
const defaultThemeConfig: ThemeConfig = {
  mode: 'light',
  primaryColor: '#3f51b5', // Indigo
  secondaryColor: '#f50057', // Pink
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  borderRadius: 4,
  spacing: 8
};

/**
 * Create a customized Material-UI theme
 */
export const createCustomTheme = (config: ThemeConfig = {}): ReturnType<typeof createTheme> => {
  // Merge default config with provided config
  const mergedConfig = { ...defaultThemeConfig, ...config };
  
  // Create theme options
  const themeOptions: ThemeOptions = {
    palette: {
      mode: mergedConfig.mode,
      primary: {
        main: mergedConfig.primaryColor!
      },
      secondary: {
        main: mergedConfig.secondaryColor!
      }
    },
    typography: {
      fontFamily: mergedConfig.fontFamily
    },
    shape: {
      borderRadius: mergedConfig.borderRadius
    },
    spacing: mergedConfig.spacing,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            overflow: 'hidden'
          }
        }
      }
    }
  };

  // Create and return the theme
  return createTheme(themeOptions);
};

// Default theme
export const defaultTheme = createCustomTheme();

export default defaultTheme;
