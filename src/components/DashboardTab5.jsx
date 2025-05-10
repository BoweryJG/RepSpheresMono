import { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip,
  Box,
  Tabs,
  Tab,
  Button,
  Divider,
  CircularProgress,
  Link
} from '@mui/material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { supabaseDataService } from '../services/supabase/supabaseDataService';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`company-tabpanel-${index}`}
      aria-labelledby={`company-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CompaniesTab = ({ isDental, COLORS }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailsView, setDetailsView] = useState(0);

  // Fetch company data when industry changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isDental) {
          const data = await supabaseDataService.getDentalCompanies();
          setCompanies(data);
        } else {
          const data = await supabaseDataService.getAestheticCompanies();
          setCompanies(data);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load company data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isDental]);

  // Calculate total market share
  const totalMarketShare = companies.reduce((sum, company) => sum + company.marketShare, 0);
  
  // Calculate average growth rate
  const avgGrowthRate = companies.length 
    ? companies.reduce((sum, company) => sum + company.growthRate, 0) / companies.length 
    : 0;

  // Prepare market share data for pie chart
  const marketShareData = companies.map((company, index) => ({
    name: company.name,
    value: company.marketShare,
    color: COLORS[index % COLORS.length]
  }));

  // Prepare growth rate data for bar chart
  const growthRateData = [...companies].sort((a, b) => b.growthRate - a.growthRate);

  // Handle tab change
  const handleDetailsChange = (event, newValue) => {
    setDetailsView(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Industry Overview */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title={`${isDental ? 'Dental' : 'Aesthetic'} Industry Key Players`} 
            subheader={`Analysis of top ${companies.length} companies by market share and growth`}
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Total Market Share Analyzed
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {totalMarketShare.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    of global {isDental ? 'dental' : 'aesthetic'} market
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Average Growth Rate
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {avgGrowthRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    year-over-year
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Number of Major Players
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {companies.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    top companies analyzed
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Market Share Visualization */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Market Share Distribution" />
          <CardContent sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={marketShareData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {marketShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Legend layout="vertical" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Growth Rate Visualization */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Company Growth Rates" />
          <CardContent sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={growthRateData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, Math.max(...companies.map(c => c.growthRate)) * 1.1]} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Legend />
                <Bar dataKey="growthRate" fill="#82ca9d" name="Annual Growth Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Company Details Tabs */}
      <Grid item xs={12}>
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={detailsView}
              onChange={handleDetailsChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Company Overview" />
              <Tab label="Key Offerings" />
              <Tab label="Market Data" />
            </Tabs>
          </Box>
          <TabPanel value={detailsView} index={0}>
            {/* Responsive table for desktop */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Company</strong></TableCell>
                      <TableCell><strong>Founded</strong></TableCell>
                      <TableCell><strong>Time in Market</strong></TableCell>
                      <TableCell><strong>Headquarters</strong></TableCell>
                      <TableCell><strong>Parent Company</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                      <TableCell><strong>Website</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.name}>
                        <TableCell>{company.name}</TableCell>
                        <TableCell>{company.founded}</TableCell>
                        <TableCell>{company.timeInMarket} years</TableCell>
                        <TableCell>{company.headquarters}</TableCell>
                        <TableCell>{company.parentCompany}</TableCell>
                        <TableCell sx={{ maxWidth: 300 }}>{company.description}</TableCell>
                        <TableCell>
                          <Link href={company.website} target="_blank" rel="noopener noreferrer">
                            Visit Website
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            
            {/* Card-based layout for mobile */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              {companies.map((company) => (
                <Card key={company.name} sx={{ mb: 2, p: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {company.name}
                  </Typography>
                  
                  <Grid container spacing={1} sx={{ mb: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Founded:</Typography>
                      <Typography variant="body2">{company.founded}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Time in Market:</Typography>
                      <Typography variant="body2">{company.timeInMarket} years</Typography>
                    </Grid>
                  </Grid>
                  
                  <Grid container spacing={1} sx={{ mb: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Headquarters:</Typography>
                      <Typography variant="body2">{company.headquarters}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Parent Company:</Typography>
                      <Typography variant="body2">{company.parentCompany || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="subtitle2" color="text.secondary">Description:</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{company.description}</Typography>
                  
                  <Button 
                    variant="outlined" 
                    size="small" 
                    component="a" 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    fullWidth
                  >
                    Visit Website
                  </Button>
                </Card>
              ))}
            </Box>
          </TabPanel>
          <TabPanel value={detailsView} index={1}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Desktop view */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Company</strong></TableCell>
                          <TableCell><strong>Key Offerings</strong></TableCell>
                          <TableCell><strong>Top Products</strong></TableCell>
                          <TableCell><strong>Employee Count</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {companies.map((company) => (
                          <TableRow key={company.name}>
                            <TableCell>{company.name}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {company.keyOfferings.map((offering, idx) => (
                                  <Chip
                                    key={idx}
                                    label={offering}
                                    size="small"
                                    sx={{ 
                                      backgroundColor: COLORS[idx % COLORS.length] + '40',
                                      color: 'text.primary',
                                      margin: '2px'
                                    }}
                                  />
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <ul style={{ margin: 0, paddingLeft: 16 }}>
                                {company.topProducts.map((product, idx) => (
                                  <li key={idx}>{product}</li>
                                ))}
                              </ul>
                            </TableCell>
                            <TableCell>{company.employeeCount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                
                {/* Mobile view */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  {companies.map((company) => (
                    <Card key={company.name} sx={{ mb: 2, p: 2 }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {company.name}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="text.secondary">
                        Employee Count:
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {company.employeeCount}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="text.secondary">
                        Key Offerings:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {company.keyOfferings.map((offering, idx) => (
                          <Chip
                            key={idx}
                            label={offering}
                            size="small"
                            sx={{ 
                              backgroundColor: COLORS[idx % COLORS.length] + '40',
                              color: 'text.primary',
                              margin: '2px'
                            }}
                          />
                        ))}
                      </Box>
                      
                      <Typography variant="subtitle2" color="text.secondary">
                        Top Products:
                      </Typography>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {company.topProducts.map((product, idx) => (
                          <li key={idx}>{product}</li>
                        ))}
                      </ul>
                    </Card>
                  ))}
                </Box>
              </>
            )}
          </TabPanel>
          <TabPanel value={detailsView} index={2}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Desktop view */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Company</strong></TableCell>
                          <TableCell><strong>Market Cap</strong></TableCell>
                          <TableCell><strong>Revenue</strong></TableCell>
                          <TableCell><strong>Market Share</strong></TableCell>
                          <TableCell><strong>Growth Rate</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {companies.map((company) => (
                          <TableRow key={company.name}>
                            <TableCell>{company.name}</TableCell>
                            <TableCell>{company.marketCap}</TableCell>
                            <TableCell>{company.revenue}</TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <Typography variant="body2">
                                  {company.marketShare.toFixed(1)}%
                                </Typography>
                                <Box 
                                  sx={{
                                    ml: 1,
                                    height: 10,
                                    width: `${company.marketShare * 2}px`,
                                    backgroundColor: COLORS[companies.indexOf(company) % COLORS.length],
                                    borderRadius: 1
                                  }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={`${company.growthRate.toFixed(1)}%`} 
                                color={company.growthRate > 10 ? "success" : "primary"}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                
                {/* Mobile view */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  {companies.map((company) => (
                    <Card key={company.name} sx={{ mb: 2, p: 2 }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {company.name}
                      </Typography>
                      
                      <Grid container spacing={1} sx={{ mb: 1 }}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Market Cap:</Typography>
                          <Typography variant="body2">{company.marketCap}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Revenue:</Typography>
                          <Typography variant="body2">{company.revenue}</Typography>
                        </Grid>
                      </Grid>
                      
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                        Market Share:
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 1
                        }}
                      >
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {company.marketShare.toFixed(1)}%
                        </Typography>
                        <Box 
                          sx={{
                            height: 10,
                            width: `${Math.min(company.marketShare * 3, 100)}%`,
                            backgroundColor: COLORS[companies.indexOf(company) % COLORS.length],
                            borderRadius: 1,
                            flexGrow: 1
                          }}
                        />
                      </Box>
                      
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                        Growth Rate:
                      </Typography>
                      <Chip 
                        label={`${company.growthRate.toFixed(1)}%`} 
                        color={company.growthRate > 10 ? "success" : "primary"}
                        size="small"
                      />
                    </Card>
                  ))}
                </Box>
              </>
            )}
          </TabPanel>
        </Card>
      </Grid>

      {/* Industry Insights */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Industry Insights" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>Key Trends</Typography>
                <ul>
                  {isDental ? (
                    <>
                      <li>Digital transformation across all segments</li>
                      <li>Consolidation of smaller providers through acquisitions</li>
                      <li>Increased focus on aesthetic dentistry</li>
                      <li>Growth in direct-to-consumer clear aligner market</li>
                      <li>Integration of AI for diagnostics and treatment planning</li>
                    </>
                  ) : (
                    <>
                      <li>Growth in non-invasive treatment options</li>
                      <li>Expanding male market segment</li>
                      <li>Increased focus on combined treatment protocols</li>
                      <li>Rise of specialized medical spas and clinics</li>
                      <li>Integration of digital imaging and simulation tools</li>
                    </>
                  )}
                </ul>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>Competitive Landscape</Typography>
                <Typography variant="body2" paragraph>
                  The {isDental ? 'dental' : 'aesthetic'} industry is characterized by 
                  {isDental 
                    ? " established players with long histories, though newer companies focused on digital solutions are gaining market share rapidly."
                    : " a mix of pharmaceutical giants and specialized companies, with significant consolidation through acquisitions in recent years."
                  }
                </Typography>
                <Typography variant="body2">
                  {isDental 
                    ? "Market leaders are investing heavily in CAD/CAM technology, 3D printing, and AI-powered diagnostics to maintain competitive advantage."
                    : "Energy-based device manufacturers and injectables companies are the fastest growing segments, with continuous innovation in treatment protocols and technologies."
                  }
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>Future Outlook</Typography>
                <Typography variant="body2" paragraph>
                  {isDental
                    ? "The dental industry is projected to continue strong growth driven by aging populations, increasing dental awareness, and technological advancements. Digital dentistry will become the standard, with practices increasingly adopting comprehensive digital workflows."
                    : "The aesthetic industry is expected to maintain double-digit growth, driven by expanding demographics, minimally invasive technologies, and increasing acceptance of aesthetic procedures across all age groups."
                  }
                </Typography>
                <Typography variant="body2">
                  Key growth drivers include {isDental 
                    ? "clear aligners, digital imaging, implants, and preventive care."
                    : "facial injectables, body contouring, and regenerative treatments."
                  }
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CompaniesTab;
