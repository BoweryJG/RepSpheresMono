import { useState, useEffect } from 'react';
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
  Alert
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
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Treemap,
  ScatterChart,
  Scatter
} from 'recharts';

import { supabaseDataService } from '../services/supabase/supabaseDataService';
import CompaniesTab from './DashboardTab5';
import MetropolitanMarketsTab from './DashboardTab6';
import MarketNewsTab from './MarketNewsTab';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

export default function DashboardSupabase() {
  const theme = useTheme();
  const [isDental, setIsDental] = useState(true);
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
  
  // Fetch data from Supabase on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
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
      }
    }
    
    fetchData();
  }, []);
  
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
  
  // If there was an error, show an error message
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1">
          Unable to load market data from the database. Please check your connection and try again.
        </Typography>
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
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="subtitle1">
          This dashboard is using real-time data from Supabase database!
        </Typography>
      </Alert>
      
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
                    <Tooltip formatter={(value) => [`${value}%`, 'Growth Rate']} />
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
                    <Tooltip formatter={(value) => [`$${value}B`, 'Market Size']} />
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
                              sx={{ backgroundColor: COLORS[currentCategories.indexOf(procedure.category) % COLORS.length] + '40', 
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
                    <Tooltip formatter={(value) => [`$${value}B`, 'Market Size']} />
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
                    <Tooltip formatter={(value) => [`$${value}B`, 'Market Size']} />
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
                    <Tooltip formatter={(value) => [`$${value.toFixed(1)}B`, 'Market Size']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Market Size Distribution by Procedure and Category" />
              <CardContent sx={{ height: 500 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={treemapData}
                    dataKey="size"
                    aspectRatio={4/3}
                    stroke="#fff"
                    fill="#8884d8"
                  >
                    <Tooltip 
                      formatter={(value, name, props) => [`$${value.toFixed(1)}B`, name]} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div style={{ 
                              backgroundColor: '#fff', 
                              padding: '10px', 
                              border: '1px solid #ccc',
                              borderRadius: '4px'
                            }}>
                              <p><strong>{data.name}</strong></p>
                              {data.size && <p>Market Size: ${data.size.toFixed(1)}B</p>}
                              {data.growth && <p>Growth Rate: {data.growth}%</p>}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </Treemap>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Tab 3: Patient Demographics */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Patient Age Distribution" />
              <CardContent sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={currentDemographics}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ageGroup" />
                    <YAxis domain={[0, 40]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Legend />
                    <Bar dataKey="percentage" fill="#8884d8" name="Percentage of Patients (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Gender Distribution" />
              <CardContent sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentGenderDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      <Cell fill="#0088FE" />
                      <Cell fill="#FF8042" />
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Tab 4: Growth Predictions */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Top 5 Procedures by Growth Rate" />
              <CardContent sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topGrowthProcedures}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 20]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Growth Rate']} />
                    <Legend />
                    <Bar dataKey="growth" fill="#8884d8" name="Annual Growth Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Growth vs. Market Size" />
              <CardContent sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid />
                    <XAxis 
                      type="number" 
                      dataKey="marketSize2025" 
                      name="Market Size" 
                      domain={[0, 12]}
                      label={{ value: 'Market Size (Billion USD)', position: 'bottom', offset: 0 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="growth" 
                      name="Growth Rate" 
                      domain={[0, 20]}
                      label={{ value: 'Growth Rate (%)', angle: -90, position: 'left' }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name, props) => {
                        return name === 'Growth Rate' 
                          ? [`${value}%`, name] 
                          : [`$${value}B`, 'Market Size'];
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div style={{ 
                              backgroundColor: '#fff', 
                              padding: '10px', 
                              border: '1px solid #ccc',
                              borderRadius: '4px'
                            }}>
                              <p><strong>{data.name}</strong></p>
                              <p>Market Size: ${data.marketSize2025}B</p>
                              <p>Growth Rate: {data.growth}%</p>
                              <p>Category: {data.category}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Scatter 
                      name="Procedures" 
                      data={currentProcedures} 
                      fill="#8884d8" 
                      shape="circle"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
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
      
      {/* Footer */}
      <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Dental & Aesthetic Industry Analysis Dashboard — Data loaded from Supabase
        </Typography>
      </Box>
    </Container>
  );
}
