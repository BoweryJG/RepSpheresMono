import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Switch, 
  FormControlLabel,
  Paper,
  Tab,
  Tabs,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Divider,
  Button,
  useMediaQuery,
  IconButton,
  Tooltip,
  Chip,
  Badge
} from '@mui/material';
import { useTheme } from '@mui/material';

import { useThemeMode } from '../services/theme/ThemeContext';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import CloudDoneIcon from '@mui/icons-material/CloudDone';

// Import custom UI components
import GradientCard from './ui/GradientCard';
import AnimatedCounter from './ui/AnimatedCounter';
import GradientButton from './ui/GradientButton';

import ProceduresOverviewTab from './DashboardTab1';
import MarketAnalysisTab from './DashboardTab2';
import PatientDemographicsTab from './DashboardTab3';
import GrowthPredictionsTab from './DashboardTab4';
import CompaniesTab from './DashboardTab5';
import MetropolitanMarketsTab from './DashboardTab6';
import MarketNewsTab from './MarketNewsTab';

// Colors for graphs and charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

import { supabaseDataService } from '../services/supabase/supabaseDataService';
// Removed all mock/static data imports. All data is now fetched live from Supabase.

import OpenDataBadge from './ui/OpenDataBadge';
import DashboardHeader from './ui/DashboardHeader';
import DashboardTicker from './ui/DashboardTicker';

export default function Dashboard({ mcpEnabled = false }) {
  const theme = useTheme();
  
  const { darkMode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const [isDental, setIsDental] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Handle logout
  
  
  // Handle industry toggle switch
  const handleIndustryChange = () => {
    setIsDental(!isDental);
    setCategoryFilter('All'); // Reset category filter when changing industries
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle category filter change
  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
  };
  
  // State for live data
  const [dentalProcedures, setDentalProcedures] = useState([]);
  const [aestheticProcedures, setAestheticProcedures] = useState([]);
  const [dentalCategories, setDentalCategories] = useState([]);
  const [aestheticCategories, setAestheticCategories] = useState([]);
  const [dentalMarketGrowth, setDentalMarketGrowth] = useState([]);
  const [aestheticMarketGrowth, setAestheticMarketGrowth] = useState([]);
  const [dentalDemographics, setDentalDemographics] = useState([]);
  const [aestheticDemographics, setAestheticDemographics] = useState([]);
  const [dentalGenderDistribution, setDentalGenderDistribution] = useState([]);
  const [aestheticGenderDistribution, setAestheticGenderDistribution] = useState([]);
  const [metropolitanMarkets, setMetropolitanMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchData = async () => {
      try {
        const [
          dentalProcs, 
          aestheticProcs, 
          dentalCats, 
          aestheticCats,
          dentalGrowth,
          aestheticGrowth,
          dentalDemo,
          aestheticDemo,
          dentalGender,
          aestheticGender,
          markets
        ] = await Promise.all([
          supabaseDataService.getDentalProcedures(),
          supabaseDataService.getAestheticProcedures(),
          supabaseDataService.getDentalCategories(),
          supabaseDataService.getAestheticCategories(),
          supabaseDataService.getDentalMarketGrowth(),
          supabaseDataService.getAestheticMarketGrowth(),
          supabaseDataService.getDentalDemographics(),
          supabaseDataService.getAestheticDemographics(),
          supabaseDataService.getDentalGenderDistribution(),
          supabaseDataService.getAestheticGenderDistribution(),
          supabaseDataService.getMetropolitanMarkets()
        ]);
        
        setDentalProcedures(dentalProcs);
        setAestheticProcedures(aestheticProcs);
        setDentalCategories(dentalCats);
        setAestheticCategories(aestheticCats);
        setDentalMarketGrowth(dentalGrowth);
        setAestheticMarketGrowth(aestheticGrowth);
        setDentalDemographics(dentalDemo);
        setAestheticDemographics(aestheticDemo);
        setDentalGenderDistribution(dentalGender);
        setAestheticGenderDistribution(aestheticGender);
        setMetropolitanMarkets(markets);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data from Supabase:', err);
        setError(err.message || 'Failed to load data from Supabase.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get current data based on selected industry
  const allProcedures = isDental ? dentalProcedures : aestheticProcedures;
  const currentCategories = isDental ? dentalCategories : aestheticCategories;
  const currentMarketGrowth = isDental ? dentalMarketGrowth : aestheticMarketGrowth;
  const currentDemographics = isDental ? dentalDemographics : aestheticDemographics;
  const currentGenderDistribution = isDental ? dentalGenderDistribution : aestheticGenderDistribution;

  // Apply category filter if not "All"
  const currentProcedures = categoryFilter === 'All' 
    ? allProcedures 
    : allProcedures.filter(proc => proc.category === categoryFilter);

  // Get industry title and description
  const industryTitle = isDental ? "Dental Industry" : "Aesthetic Industry";
  const industryDescription = isDental 
    ? "Comprehensive analysis of all dental procedures: growth metrics, patient demographics, and future trends." 
    : "In-depth examination of aesthetic procedures including injectables, body contouring, and advanced skin treatments.";

  // Calculate category distribution data
  const categoryData = currentCategories.map(category => {
    const proceduresInCategory = allProcedures.filter(proc => proc.category === category);
    const totalMarketSize = proceduresInCategory.reduce((sum, proc) => sum + (proc.marketSize2025 || 0), 0);
    return {
      name: category,
      marketSize: totalMarketSize,
      count: proceduresInCategory.length
    };
  }).sort((a, b) => b.marketSize - a.marketSize);

  // Prepare data for treemap
  const treemapData = {
    name: 'Procedures',
    children: currentCategories.map(category => {
      return {
        name: category,
        children: allProcedures
          .filter(proc => proc.category === category)
          .map(proc => ({
            name: proc.name,
            size: proc.marketSize2025,
            growth: proc.growth
          }))
      };
    })
  };

  // Calculate top procedures by growth and market size
  const topGrowthProcedures = [...allProcedures].sort((a, b) => (b.growth || 0) - (a.growth || 0)).slice(0, 5);
  const topMarketSizeProcedures = [...allProcedures].sort((a, b) => (b.marketSize2025 || 0) - (a.marketSize2025 || 0)).slice(0, 5);
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography variant="h5" color="primary">Loading dashboard data...</Typography>
        </Box>
      </Container>
    );
  }
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography variant="h5" color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <DashboardHeader />
      <DashboardTicker />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

      {/* Header with toggle switches */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        mb: 3,
        gap: isMobile ? 2 : 0
      }}>
        <Box>
          <Typography 
            variant={isMobile ? "h4" : "h3"} 
            component="h1" 
            gutterBottom 
            color="primary"
          >
            {industryTitle} Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {industryDescription}
          </Typography>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          justifyContent: isMobile ? 'flex-start' : 'flex-end',
          width: isMobile ? '100%' : 'auto'
        }}>
          <FormControlLabel
            control={
              <Switch 
                checked={!isDental}
                onChange={handleIndustryChange}
                color="primary"
              />
            }
            label={isDental ? "Switch to Aesthetic" : "Switch to Dental"}
          />
          <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton onClick={toggleTheme} color="primary">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          
          {mcpEnabled && (
            <Tooltip title="Connected to Supabase via MCP">
              <Chip
                icon={<CloudDoneIcon />}
                label="MCP Connected"
                color="success"
                size="small"
                variant="outlined"
              />
            </Tooltip>
          )}
        </Box>
      </Box>
      
      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <GradientCard
            title="Total Market Size"
            subheader="Projected for 2025"
            gradientColor={theme.palette.primary.main}
          >
            <AnimatedCounter
              value={isDental ? 60.2 : 83.9}
              prefix="$"
              suffix="B"
              variant="h3"
              color="primary"
              sx={{ my: 1 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {isDental ? "Dental industry" : "Aesthetic industry"} market size
            </Typography>
          </GradientCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <GradientCard
            title="Average Growth Rate"
            subheader="Year-over-year"
            gradientColor={theme.palette.success.main}
          >
            <AnimatedCounter
              value={isDental ? 9.6 : 13.8}
              suffix="%"
              variant="h3"
              color="success"
              sx={{ my: 1 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {isDental ? "4.2%" : "5.7%"} higher than previous year
            </Typography>
          </GradientCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <GradientCard
            title="Total Procedures"
            subheader={`Across ${currentCategories.length} categories`}
            gradientColor={theme.palette.info.main}
          >
            <AnimatedCounter
              value={allProcedures.length}
              variant="h3"
              color="info"
              sx={{ my: 1 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {isDental ? "12" : "8"} new procedures since 2024
            </Typography>
          </GradientCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <GradientCard
            title="Key Patient Demographic"
            subheader="Largest age group by percentage"
            gradientColor={theme.palette.secondary.main}
          >
            <Typography variant="h3" color="secondary" sx={{ fontWeight: 600, my: 1 }}>
              {isDental ? "50-64" : "35-49"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Represents {isDental ? "32%" : "41%"} of all patients
            </Typography>
          </GradientCard>
        </Grid>
      </Grid>
      
      {/* Category Filter */}
      <Box sx={{ mb: 4 }}>
        <FormControl fullWidth>
          <InputLabel id="category-filter-label">Category Filter</InputLabel>
          <Select
            labelId="category-filter-label"
            id="category-filter"
            value={categoryFilter}
            label="Category Filter"
            onChange={handleCategoryChange}
          >
            <MenuItem value="All">All Categories</MenuItem>
            {currentCategories.map((category) => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      {/* Tabs Navigation */}
      <Paper sx={{ mb: 4, overflow: 'auto' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          allowScrollButtonsMobile
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={isMobile ? "PROCEDURES" : "PROCEDURES OVERVIEW"} />
          <Tab label={isMobile ? "MARKET" : "MARKET ANALYSIS"} />
          <Tab label={isMobile ? "DEMOGRAPHICS" : "PATIENT DEMOGRAPHICS"} />
          <Tab label={isMobile ? "GROWTH" : "GROWTH PREDICTIONS"} />
          <Tab label="COMPANIES" />
          <Tab label={isMobile ? "MARKETS" : "METROPOLITAN MARKETS"} />
          <Tab label="NEWS" />
        </Tabs>
      </Paper>
      
      {/* Tab Content */}
      {tabValue === 0 && (
        <ProceduresOverviewTab 
          currentProcedures={currentProcedures} 
          currentCategories={currentCategories} 
          COLORS={COLORS} 
        />
      )}
      
      {tabValue === 1 && (
        <MarketAnalysisTab 
          currentMarketGrowth={currentMarketGrowth}
          topMarketSizeProcedures={topMarketSizeProcedures}
          categoryData={categoryData}
          treemapData={treemapData}
          industryTitle={industryTitle}
          COLORS={COLORS}
        />
      )}
      
      {tabValue === 2 && (
        <PatientDemographicsTab 
          currentDemographics={currentDemographics}
          currentGenderDistribution={currentGenderDistribution}
          currentProcedures={currentProcedures}
          currentCategories={currentCategories}
          isDental={isDental}
          COLORS={COLORS}
        />
      )}
      
      {tabValue === 3 && (
        <GrowthPredictionsTab 
          topGrowthProcedures={topGrowthProcedures}
          currentProcedures={currentProcedures}
          categoryData={categoryData}
          currentCategories={currentCategories}
          isDental={isDental}
          COLORS={COLORS}
          allProcedures={allProcedures}
        />
      )}
      
      {tabValue === 4 && (
        <CompaniesTab 
          isDental={isDental}
          COLORS={COLORS}
        />
      )}
      
      {tabValue === 5 && (
        <MetropolitanMarketsTab 
          isDental={isDental}
          COLORS={COLORS}
          metropolitanMarkets={metropolitanMarkets}
        />
      )}
      
      {tabValue === 6 && (
        <MarketNewsTab 
          isDental={isDental}
        />
      )}
      
      {/* Footer */}
      <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Dental & Aesthetic Industry Analysis Dashboard — Data updated May 2025
        </Typography>
      </Box>
    </Container>
    </>
  );
}
