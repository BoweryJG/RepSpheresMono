import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { getThemeByIndustry } from '../../themes';

// Create industry theme context
const IndustryThemeContext = createContext();

// Industry theme provider component
export const IndustryThemeProvider = ({ children }) => {
  // Check if industry preference is stored in localStorage
  const storedIndustry = localStorage.getItem('industryTheme');
  
  // Initialize state with stored preference or default to 'dental'
  const [industry, setIndustry] = useState(
    storedIndustry || 'dental'
  );
  
  // Create theme based on industry
  const theme = getThemeByIndustry(industry);
  
  // Function to change industry theme
  const changeIndustryTheme = (newIndustry) => {
    if (['dental', 'aesthetic', 'random'].includes(newIndustry)) {
      setIndustry(newIndustry);
    } else {
      console.warn(`Invalid industry theme: ${newIndustry}. Using default.`);
      setIndustry('dental');
    }
  };
  
  // Store industry preference in localStorage when it changes
  useEffect(() => {
    localStorage.setItem('industryTheme', industry);
  }, [industry]);
  
  return (
    <IndustryThemeContext.Provider value={{ industry, changeIndustryTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </IndustryThemeContext.Provider>
  );
};

// Custom hook to use industry theme
export const useIndustryTheme = () => {
  const context = useContext(IndustryThemeContext);
  if (!context) {
    throw new Error('useIndustryTheme must be used within an IndustryThemeProvider');
  }
  return context;
};
