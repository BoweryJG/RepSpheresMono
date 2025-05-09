import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CardHeader, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Chip, Divider, TextField, MenuItem, 
  Select, FormControl, InputLabel, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, IconButton, Tabs, Tab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BusinessIcon from '@mui/icons-material/Business';

import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis
} from 'recharts';

// Removed direct import of static data
// Using data passed as props from Dashboard.jsx

const MetropolitanMarketsTab = ({ isDental, COLORS, metropolitanMarkets }) => {
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [sortDirection, setSortDirection] = useState('asc');
  const [regionFilter, setRegionFilter] = useState('All');
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailTabValue, setDetailTabValue] = useState(0);
  
  // Event handlers
  const handleMarketClick = (market) => {
    setSelectedMarket(market);
    setDetailDialogOpen(true);
  };
  
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
  };
  
  const handleDetailTabChange = (event, newValue) => {
    setDetailTabValue(newValue);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleRegionFilterChange = (event) => {
    setRegionFilter(event.target.value);
  };
  
  // Get region from metro name
  const getRegionFromMetro = (metro) => {
    const city = metro.split(',')[0].toLowerCase();
    
    if (city.includes('new york') || city.includes('boston') || city.includes('philadelphia')) {
      return 'Northeast';
    } else if (city.includes('los angeles') || city.includes('san francisco') || city.includes('seattle')) {
      return 'West Coast';
    } else if (city.includes('dallas') || city.includes('houston') || city.includes('miami')) {
      return 'South';
    } else if (city.includes('chicago') || city.includes('detroit')) {
      return 'Midwest';
    } else if (city.includes('phoenix') || city.includes('austin')) {
      return 'Southwest';
    } else {
      return 'Other';
    }
  };
  
  // Data preparation
  const filteredMarkets = metropolitanMarkets.filter(market => {
    const matchesSearch = market.metro.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = regionFilter === 'All' || getRegionFromMetro(market.metro) === regionFilter;
    return matchesSearch && matchesRegion;
  });
  
  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'rank') comparison = a.rank - b.rank;
    else if (sortBy === 'metro') comparison = a.metro.localeCompare(b.metro);
    else if (sortBy === 'marketSize2023') comparison = a.marketSize2023 - b.marketSize2023;
    else if (sortBy === 'marketSize2030') comparison = a.marketSize2030 - b.marketSize2030;
    else if (sortBy === 'growthRate') comparison = a.growthRate - b.growthRate;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Top markets
  const topGrowthMarkets = [...metropolitanMarkets]
    .sort((a, b) => b.growthRate - a.growthRate)
    .slice(0, 5);

  const topSizeMarkets = [...metropolitanMarkets]
    .sort((a, b) => b.marketSize2023 - a.marketSize2023)
    .slice(0, 5);
  
  return (
    <Grid container spacing={3}>
      {/* Regional Chart */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Metropolitan Market Distribution" />
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={[
                  { region: "Northeast", value: 6.4 },
                  { region: "West Coast", value: 7.3 },
                  { region: "South", value: 5.9 },
                  { region: "Midwest", value: 4.8 },
                  { region: "Southwest", value: 3.8 }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Market Size ($B)" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Market Growth Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Top 5 Markets by Growth Rate" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topGrowthMarkets} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="metro" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="growthRate" name="Growth Rate (%)" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Market Size Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Top 5 Markets by Size" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSizeMarkets} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="metro" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="marketSize2023" name="Market Size ($B)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Markets Table */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Metropolitan Markets" />
          <CardContent>
            <Box sx={{ mb: 2 }}>
              <TextField 
                label="Search" 
                size="small" 
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ mr: 2 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Region</InputLabel>
                <Select
                  value={regionFilter}
                  onChange={handleRegionFilterChange}
                  label="Region"
                >
                  <MenuItem value="All">All Regions</MenuItem>
                  <MenuItem value="Northeast">Northeast</MenuItem>
                  <MenuItem value="West Coast">West Coast</MenuItem>
                  <MenuItem value="South">South</MenuItem>
                  <MenuItem value="Midwest">Midwest</MenuItem>
                  <MenuItem value="Southwest">Southwest</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Metro Area</TableCell>
                    <TableCell>Market Size 2023 ($B)</TableCell>
                    <TableCell>Growth Rate (%)</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedMarkets.slice(0, 10).map((market) => (
                    <TableRow key={market.rank}>
                      <TableCell>{market.rank}</TableCell>
                      <TableCell>{market.metro}</TableCell>
                      <TableCell>${market.marketSize2023.toFixed(1)}B</TableCell>
                      <TableCell>{market.growthRate}%</TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleMarketClick(market)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Detail Dialog */}
      {selectedMarket && (
        <Dialog open={detailDialogOpen} onClose={handleCloseDetailDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{selectedMarket.metro} Market Details</Typography>
              <IconButton onClick={handleCloseDetailDialog}><CloseIcon /></IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="text.secondary">Rank</Typography>
                  <Typography variant="h5" gutterBottom>#{selectedMarket.rank}</Typography>
                  
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2 }}>Market Size (2023)</Typography>
                  <Typography variant="h5" gutterBottom>${selectedMarket.marketSize2023.toFixed(1)}B</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="text.secondary">Growth Rate</Typography>
                  <Typography variant="h5" gutterBottom>{selectedMarket.growthRate}%</Typography>
                  
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2 }}>Key Procedures</Typography>
                  <Box sx={{ mt: 1 }}>
                    {selectedMarket.keyProcedures.map((proc, idx) => (
                      <Chip 
                        key={idx}
                        label={proc}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5, backgroundColor: COLORS[idx % COLORS.length] + '40' }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
            
            <Divider />
            
            <Tabs value={detailTabValue} onChange={handleDetailTabChange} sx={{ my: 2 }}>
              <Tab label="Growth Projection" />
              <Tab label="Market Details" />
            </Tabs>
            
            {detailTabValue === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>Market Size Projection</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[
                      { year: 2023, size: selectedMarket.marketSize2023 },
                      { year: 2025, size: selectedMarket.marketSize2023 * (1 + selectedMarket.growthRate / 100 * 2) },
                      { year: 2030, size: selectedMarket.marketSize2030 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="size" name="Market Size ($B)" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
            
            {detailTabValue === 1 && (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row"><strong>Insurance Coverage</strong></TableCell>
                      <TableCell>{selectedMarket.insuranceCoverage}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row"><strong>Provider Density</strong></TableCell>
                      <TableCell>{selectedMarket.providerDensity} per 10k population</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row"><strong>Disposable Income</strong></TableCell>
                      <TableCell>{selectedMarket.disposableIncome}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetailDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Grid>
  );
};

export default MetropolitanMarketsTab;
