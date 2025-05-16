import { useState, useEffect, useCallback } from 'react';
import { useIndustryTheme } from '../services/theme/IndustryThemeContext';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
import VerifiedIcon from '@mui/icons-material/Verified';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import WarningIcon from '@mui/icons-material/Warning';
import { refreshAllData } from '../refreshData';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Switch, 
  FormControlLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  Chip,
  Divider,
  useTheme,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  IconButton,
  Badge,
  Tooltip,
  Snackbar
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  Treemap,
  ScatterChart,
  Scatter
} from 'recharts';

import { supabaseDataService } from '../services/supabase/supabaseDataService';

let runFullVerification = async () => {
  console.warn('runFullVerification is not available in the browser');
  return { success: false, error: 'This function is only available server-side' };
};

if (typeof window === 'undefined') {
  // Dynamic import for server-side only
  import('../server/utils/verifySupabaseData.js')
    .then(module => {
      runFullVerification = module.runFullVerification;
    })
    .catch(err => {
      console.error('Failed to load verifySupabaseData:', err);
    });
}

import CompaniesTab from './DashboardTab5';
import MetropolitanMarketsTab from './DashboardTab6';
import MarketNewsTab from './MarketNewsTab';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

export default function DashboardSupabase({ user }) {
  const theme = useTheme();
  const { industry, changeIndustryTheme, toggleCosmicMode, isCosmicMode } = useIndustryTheme();
  const isDental = industry === 'dental';
  const [tabValue, setTabValue] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Data states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  
  // State for verification dialog
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  
  // State for data diagnostics
  const [dataStatus, setDataStatus] = useState({
    connection: null,
    tablesOk: null,
    dataOk: null,
    lastVerified: null
  });
  
  // State for manual data reload
  const [isReloading, setIsReloading] = useState(false);
  const [reloadNotification, setReloadNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Function to run data verification
  const verifyData = useCallback(async () => {
    try {
      setVerificationLoading(true);
      console.log('Running data verification...');
      
      const result = await runFullVerification();
      setVerificationResult(result);
      
      // Update data status
      setDataStatus({
        connection: result.connection.success,
        tablesOk: result.tables?.success,
        dataOk: result.data?.success,
        lastVerified: new Date().toISOString()
      });
      
      setVerificationLoading(false);
      return result;
    } catch (err) {
      console.error('Error during data verification:', err);
      setVerificationLoading(false);
      return { success: false, error: err.message };
    }
  }, []);
  
  // Function to trigger manual data reload
  const handleDataReload = useCallback(async () => {
    try {
      setIsReloading(true);
      setReloadNotification({
        open: true,
        message: 'Reloading data from source...',
        severity: 'info'
      });
      
      // Try to verify and reload data
      await supabaseDataService.verifyAndReloadDataIfNeeded();
      
      // Fetch all data again
      await fetchData();
      
      setReloadNotification({
        open: true,
        message: 'Data successfully reloaded!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error reloading data:', err);
      setReloadNotification({
        open: true,
        message: `Error reloading data: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setIsReloading(false);
    }
  }, []);
  
  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching market data from Supabase...');
      
      // Fetch all needed data
      const dentalProcs = await supabaseDataService.getDentalProcedures();
      const aestheticProcs = await supabaseDataService.getAestheticProcedures();
      const dentalCats = await supabaseDataService.getDentalCategories();
      const aestheticCats = await supabaseDataService.getAestheticCategories();
      const dentalGrowth = await supabaseDataService.getDentalMarketGrowth();
      const aestheticGrowth = await supabaseDataService.getAestheticMarketGrowth();
      const dentalDemo = await supabaseDataService.getDentalDemographics();
      const aestheticDemo = await supabaseDataService.getAestheticDemographics();
      const dentalGender = await supabaseDataService.getDentalGenderDistribution();
      const aestheticGender = await supabaseDataService.getAestheticGenderDistribution();
      const markets = await supabaseDataService.getMetropolitanMarkets();
      
      // Check for empty data
      if (dentalProcs.length === 0 && aestheticProcs.length === 0) {
        console.warn('Warning: Both dental and aesthetic procedures are empty');
        // Don't set error, but update data status
        await verifyData();
      }
      
      // Update state with fetched data
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
      console.error('Error fetching data:', err);
      setError('Failed to load market data. Please try again later.');
      setLoading(false);
      
      // Run verification to diagnose the issue
      await verifyData();
    }
  }, [verifyData]);
  
  // Fetch data from Supabase on component mount
  useEffect(() => {
    // Initial data fetch
    fetchData();
    
    // Also run verification
    verifyData();
  }, [fetchData, verifyData]);
  
  // Handle industry toggle switch
  const handleIndustryChange = () => {
    const newIndustry = isDental ? 'aesthetic' : 'dental';
    changeIndustryTheme(newIndustry);
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
  
  // Get status badge color
  const getStatusColor = (status) => {
    if (status === true) return 'success';
    if (status === false) return 'error';
    return 'warning';
  };
  
  // If still loading, show a loading indicator
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading market data from Supabase...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  // If there was an error, show an error message with diagnostic options
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => setVerificationDialogOpen(true)}
              startIcon={<StorageIcon />}
            >
              Diagnose
            </Button>
          }
        >
          {error}
        </Alert>
        
        <Card>
          <CardHeader title="Connection Diagnostics" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1">
                  Unable to load market data from the database. Here are some troubleshooting options:
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<RefreshIcon />}
                  onClick={fetchData}
                >
                  Retry Connection
                </Button>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Button 
                  variant="contained" 
                  color="primary"
                  fullWidth
                  startIcon={<StorageIcon />}
                  onClick={handleDataReload}
                  disabled={isReloading}
                >
                  {isReloading ? 'Reloading Data...' : 'Reload Data'}
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last diagnostic: {dataStatus.lastVerified ? new Date(dataStatus.lastVerified).toLocaleString() : 'Never'}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                  <Chip 
                    icon={dataStatus.connection ? <VerifiedIcon /> : <SyncProblemIcon />} 
                    label={`Connection: ${dataStatus.connection ? 'Success' : 'Failed'}`}
                    color={getStatusColor(dataStatus.connection)}
                    size="small"
                  />
                  <Chip 
                    icon={dataStatus.tablesOk ? <VerifiedIcon /> : <SyncProblemIcon />} 
                    label={`Tables: ${dataStatus.tablesOk ? 'OK' : 'Issue'}`}
                    color={getStatusColor(dataStatus.tablesOk)}
                    size="small"
                  />
                  <Chip 
                    icon={dataStatus.dataOk ? <VerifiedIcon /> : <SyncProblemIcon />} 
                    label={`Data: ${dataStatus.dataOk ? 'Valid' : 'Invalid'}`}
                    color={getStatusColor(dataStatus.dataOk)}
                    size="small"
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {/* Verification Dialog */}
        <Dialog
          open={verificationDialogOpen}
          onClose={() => setVerificationDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Database Diagnostics
            {verificationLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}
          </DialogTitle>
          <DialogContent>
            {verificationResult ? (
              <Box>
                <DialogContentText>
                  Overall diagnosis: {verificationResult.success ? 'Healthy' : 'Issues detected'}
                </DialogContentText>
                
                <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>Connection</Typography>
                <Typography color={verificationResult.connection.success ? 'success.main' : 'error.main'}>
                  {verificationResult.connection.success ? 'Connection successful' : verificationResult.connection.error}
                </Typography>
                
                {verificationResult.tables && (
                  <>
                    <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>Tables</Typography>
                    <TableContainer component={Paper} sx={{ mt: 1 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Table</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Row Count</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(verificationResult.tables.tables).map(([table, info]) => (
                            <TableRow key={table}>
                              <TableCell>{table}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={info.exists ? 'Exists' : 'Missing'} 
                                  color={info.exists ? 'success' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{info.rows}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
                
                {verificationResult.data && (
                  <>
                    <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>Data Validation</Typography>
                    <TableContainer component={Paper} sx={{ mt: 1 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Table</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Row Count</TableCell>
                            <TableCell>Sample</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(verificationResult.data.data).map(([table, info]) => (
                            <TableRow key={table}>
                              <TableCell>{table}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={info.valid ? 'Valid' : 'Invalid'} 
                                  color={info.valid ? 'success' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{info.count || 0}</TableCell>
                              <TableCell>{info.sample || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Last verified: {new Date().toLocaleString()}
                </Typography>
              </Box>
            ) : (
              <DialogContentText>
                Run a diagnosis to check the database connection and data status.
              </DialogContentText>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => verifyData()} disabled={verificationLoading}>
              Run Diagnosis
            </Button>
            <Button onClick={() => handleDataReload()} disabled={isReloading}>
              Reload Data
            </Button>
            <Button onClick={() => setVerificationDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }
  
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
  
  // Calculate data quality score
  const hasData = allProcedures.length > 0;
  const hasMissingCategories = allProcedures.some(proc => !proc.category);
  const isLowDataCount = allProcedures.length < 5;
  
  let dataQualityStatus = 'success';
  let dataQualityMessage = 'Data Quality: Good';
  
  if (!hasData) {
    dataQualityStatus = 'error';
    dataQualityMessage = 'Data Quality: Missing Data';
  } else if (hasMissingCategories || isLowDataCount) {
    dataQualityStatus = 'warning';
    dataQualityMessage = 'Data Quality: Incomplete';
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Alert severity="info" sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1">
            This dashboard is using real-time data from Supabase database!
          </Typography>
          
          <Tooltip title={dataQualityMessage}>
            <Chip
              icon={
                dataQualityStatus === 'success' ? <VerifiedIcon /> :
                dataQualityStatus === 'warning' ? <WarningIcon /> :
                <SyncProblemIcon />
              }
              label={allProcedures.length > 0 ? `${allProcedures.length} Procedures` : 'No Data'}
              color={dataQualityStatus}
              size="small"
              onClick={() => setVerificationDialogOpen(true)}
              sx={{ cursor: 'pointer', ml: 1 }}
            />
          </Tooltip>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Verify Database Connection">
            <Chip
              icon={<StorageIcon />}
              label="Diagnose"
              color="secondary"
              onClick={() => setVerificationDialogOpen(true)}
              sx={{ cursor: 'pointer' }}
            />
          </Tooltip>
          
          <Chip
            icon={<RefreshIcon />}
            label="Refresh Data"
            color="primary"
            onClick={async () => {
              setIsReloading(true);
              try {
                await refreshAllData();
                // Re-fetch data after refresh
                window.location.reload();
              } catch (err) {
                console.error('Error refreshing data:', err);
                setError('Failed to refresh data. Please try again later.');
                setIsReloading(false);
              }
            }}
            disabled={isReloading}
            sx={{ cursor: 'pointer' }}
          />
        </Box>
      </Alert>
      
      {/* Header with toggle switches */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom color="primary">
            {industryTitle} Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {industryDescription}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
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
          
          {/* Cosmic Theme Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={isCosmicMode}
                onChange={toggleCosmicMode}
                color="secondary"
                icon={<WbTwilightIcon />}
                checkedIcon={<WbTwilightIcon />}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <WbTwilightIcon fontSize="small" />
                <Typography variant="body2">
                  {isCosmicMode ? "Disable Cosmic Mode" : "Enable Cosmic Mode"}
                </Typography>
              </Box>
            }
          />
        </Box>
      </Box>
      
      {/* Display warning if data is incomplete */}
      {hasData && (hasMissingCategories || isLowDataCount) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            {hasMissingCategories ? 'Some procedures are missing category data. ' : ''}
            {isLowDataCount ? 'Low procedure count detected. ' : ''}
            Consider refreshing the data or checking the database connection.
          </Typography>
        </Alert>
      )}
      
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
          <Tab label="Procedures Overview" />
          <Tab label="Market Analysis" />
          <Tab label="Patient Demographics" />
          <Tab label="Growth Predictions" />
          <Tab label="Companies" />
          <Tab label="Metropolitan Markets" />
          <Tab label="News" />
        </Tabs>
      </Paper>
      
      {/* Tab Content */}
      {/* Tab 1: Procedures Overview */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Procedure Growth Rates (%)" />
              <CardContent sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={currentProcedures}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 20]} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                    <RechartsTooltip formatter={(value) => [`${value}%`, 'Growth Rate']} />
                    <Legend />
                    <Bar dataKey="growth" fill="#8884d8" name="Annual Growth Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Market Size by Procedure (2025 Projected, $B)" />
              <CardContent sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={currentProcedures}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 10]} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                    <RechartsTooltip formatter={(value) => [`$${value}B`, 'Market Size']} />
                    <Legend />
                    <Bar dataKey="marketSize2025" fill="#82ca9d" name="Market Size (Billion USD)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Procedures Detail" />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Procedure</strong></TableCell>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell><strong>Growth Rate (%)</strong></TableCell>
                        <TableCell><strong>Market Size 2025 ($B)</strong></TableCell>
                        <TableCell><strong>Primary Age Group</strong></TableCell>
                        <TableCell><strong>Current Trends</strong></TableCell>
                        <TableCell><strong>Future Outlook</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentProcedures.map((procedure) => (
                        <TableRow key={procedure.name}>
                          <TableCell>{procedure.name}</TableCell>
                          <TableCell>
                            <Chip 
                              label={procedure.category} 
                              size="small"
                              sx={{ backgroundColor: currentCategories ? COLORS[currentCategories.indexOf(procedure.category) % COLORS.length] + '40' : '#ccc', 
                                   color: 'text.primary' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={`${procedure.growth}%`} 
                              color={procedure.growth > 10 ? "success" : "primary"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>${procedure.marketSize2025}B</TableCell>
                          <TableCell>{procedure.primaryAgeGroup}</TableCell>
                          <TableCell>{procedure.trends}</TableCell>
                          <TableCell>{procedure.futureOutlook}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Tab 2: Market Analysis */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title={`${industryTitle} Market Growth (2020-2030, $B)`} />
              <CardContent sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={currentMarketGrowth}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorSize" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => [`$${value}B`, 'Market Size']} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="size" 
                      stroke="#8884d8" 
                      fillOpacity={1} 
                      fill="url(#colorSize)" 
                      name="Market Size (Billion USD)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Top Procedures by Market Size (2025)" />
              <CardContent sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topMarketSizeProcedures}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 12]} />
                    <RechartsTooltip formatter={(value) => [`$${value}B`, 'Market Size']} />
                    <Legend />
                    <Bar dataKey="marketSize2025" fill="#82ca9d" name="Market Size (Billion USD)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Category Market Distribution 2025" />
              <CardContent sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="marketSize"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`$${value.toFixed(1)}B`, 'Market Size']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Add other tabs back */}
          
        </Grid>
      )}
      
      {/* Tab 3, 4, 5, 6 implementation omitted for brevity but would follow the same pattern */}
      
      {/* Tab 3: Patient Demographics */}
      {tabValue === 2 && (
        <CompaniesTab 
          isDental={isDental}
          COLORS={COLORS}
        />
      )}
      
      {/* Tab 4: Growth Predictions */}
      {tabValue === 3 && (
        <CompaniesTab 
          isDental={isDental}
          COLORS={COLORS}
        />
      )}
      
      {/* Tab 5: Companies */}
      {tabValue === 4 && (
        <CompaniesTab 
          isDental={isDental}
          COLORS={COLORS}
        />
      )}
      
      {/* Tab 6: Metropolitan Markets */}
      {tabValue === 5 && (
        <MetropolitanMarketsTab 
          isDental={isDental}
          COLORS={COLORS}
          metropolitanMarkets={metropolitanMarkets}
        />
      )}
      
      {/* Tab 7: News */}
      {tabValue === 6 && (
        <MarketNewsTab 
          isDental={isDental}
        />
      )}
      
      {/* Verification dialog */}
      <Dialog
        open={verificationDialogOpen}
        onClose={() => setVerificationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Database Diagnostics
          {verificationLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}
        </DialogTitle>
        <DialogContent>
          {verificationResult ? (
            <Box>
              <DialogContentText>
                Overall diagnosis: {verificationResult.success ? 'Healthy' : 'Issues detected'}
              </DialogContentText>
              
              <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>Connection</Typography>
              <Typography color={verificationResult.connection.success ? 'success.main' : 'error.main'}>
                {verificationResult.connection.success ? 'Connection successful' : verificationResult.connection.error}
              </Typography>
              
              {/* Tables and data sections */}
            </Box>
          ) : (
            <DialogContentText>
              Run a diagnosis to check the database connection and data status.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => verifyData()} disabled={verificationLoading}>
            Run Diagnosis
          </Button>
          <Button onClick={() => handleDataReload()} disabled={isReloading}>
            Reload Data
          </Button>
          <Button onClick={() => setVerificationDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification snackbar */}
      <Snackbar
        open={reloadNotification.open}
        autoHideDuration={6000}
        onClose={() => setReloadNotification({...reloadNotification, open: false})}
      >
        <Alert 
          onClose={() => setReloadNotification({...reloadNotification, open: false})} 
          severity={reloadNotification.severity}
          sx={{ width: '100%' }}
        >
          {reloadNotification.message}
        </Alert>
      </Snackbar>
      
      {/* Footer */}
      <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Dental & Aesthetic Industry Analysis Dashboard — Data loaded from Supabase
        </Typography>
      </Box>
    </Container>
  );
}
