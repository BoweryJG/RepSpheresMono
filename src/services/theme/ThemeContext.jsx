import { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { createLightTheme, createDarkTheme } from '../../theme';

// Create theme context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Check if dark mode is stored in localStorage
  const storedTheme = localStorage.getItem('themeMode');
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Initialize state with stored preference, system preference, or default to light
  const [darkMode, setDarkMode] = useState(
    storedTheme ? storedTheme === 'dark' : prefersDarkMode
  );
  
  // Create theme based on mode
  const theme = darkMode ? createDarkTheme() : createLightTheme();
  
  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };
  
  // Store theme preference in localStorage when it changes
  useEffect(() => {
    localStorage.setItem('themeMode', darkMode ? 'dark' : 'light');
  }, [darkMode]);
  
  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};
