import { useState } from 'react';
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
  Button
} from '@mui/material';
import { useTheme } from '@mui/material';
import { useAuth } from '../services/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';

import ProceduresOverviewTab from './DashboardTab1';
import MarketAnalysisTab from './DashboardTab2';
import PatientDemographicsTab from './DashboardTab3';
import GrowthPredictionsTab from './DashboardTab4';
import CompaniesTab from './DashboardTab5';
import MetropolitanMarketsTab from './DashboardTab6';
import MarketNewsTab from './MarketNewsTab';

// Colors for graphs and charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

// Import dataset files (will be created separately)
import { 
  dentalProcedures, 
  dentalCategories, 
  dentalMarketGrowth, 
  dentalDemographics, 
  dentalGenderDistribution 
} from '../data/dentalProcedures';

import { 
  aestheticProcedures, 
  aestheticCategories, 
  aestheticMarketGrowth, 
  aestheticDemographics, 
  aestheticGenderDistribution 
} from '../data/aestheticProcedures';

export default function Dashboard() {
  const theme = useTheme();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isDental, setIsDental] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Handle logout
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  
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
    const totalMarketSize = proceduresInCategory.reduce((sum, proc) => sum + proc.marketSize2025, 0);
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
  const topGrowthProcedures = [...allProcedures].sort((a, b) => b.growth - a.growth).slice(0, 5);
  const topMarketSizeProcedures = [...allProcedures].sort((a, b) => b.marketSize2025 - a.marketSize2025).slice(0, 5);
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header with toggle switch */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom color="primary">
            {industryTitle} Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {industryDescription}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>
      
      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Market Size {isDental ? "(Dental)" : "(Aesthetic)"}
              </Typography>
              <Typography variant="h3" color="primary">
                ${isDental ? "60.2B" : "83.9B"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Projected for 2025
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Growth Rate
              </Typography>
              <Typography variant="h3" color="primary">
                {isDental ? "9.6%" : "13.8%"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Year-over-year
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Procedures
              </Typography>
              <Typography variant="h3" color="primary">
                {allProcedures.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across {currentCategories.length} categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Patient Demographic
              </Typography>
              <Typography variant="h3" color="primary">
                {isDental ? "50-64" : "35-49"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Largest age group by percentage
              </Typography>
            </CardContent>
          </Card>
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
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="PROCEDURES OVERVIEW" />
          <Tab label="MARKET ANALYSIS" />
          <Tab label="PATIENT DEMOGRAPHICS" />
          <Tab label="GROWTH PREDICTIONS" />
          <Tab label="COMPANIES" />
          <Tab label="METROPOLITAN MARKETS" />
          <Tab label="MARKET NEWS" />
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
  );
}
