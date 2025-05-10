import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { getThemeByIndustry } from '../../themes';

// Create industry theme context
const IndustryThemeContext = createContext();

// Industry theme provider component
export const IndustryThemeProvider = ({ children }) => {
  // Check if preferences are stored in localStorage
  const storedIndustry = localStorage.getItem('industryTheme');
  const storedVisualMode = localStorage.getItem('visualMode');
  
  // Initialize states with stored preferences or defaults
  const [industry, setIndustry] = useState(
    storedIndustry || 'dental'
  );
  
  const [visualMode, setVisualMode] = useState(
    storedVisualMode || 'default'
  );
  
  // Create theme based on industry and visual mode
  const theme = getThemeByIndustry(industry, visualMode);
  
  // Function to change industry theme
  const changeIndustryTheme = (newIndustry) => {
    if (['dental', 'aesthetic'].includes(newIndustry)) {
      setIndustry(newIndustry);
    } else {
      console.warn(`Invalid industry theme: ${newIndustry}. Using default.`);
      setIndustry('dental');
    }
  };
  
  // Function to toggle cosmic visual mode
  const toggleCosmicMode = () => {
    setVisualMode(prev => prev === 'default' ? 'cosmic' : 'default');
  };
  
  // Store preferences in localStorage when they change
  useEffect(() => {
    localStorage.setItem('industryTheme', industry);
  }, [industry]);
  
  useEffect(() => {
    localStorage.setItem('visualMode', visualMode);
  }, [visualMode]);
  
  return (
    <IndustryThemeContext.Provider value={{ 
      industry, 
      changeIndustryTheme, 
      visualMode, 
      toggleCosmicMode,
      isCosmicMode: visualMode === 'cosmic'
    }}>
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
