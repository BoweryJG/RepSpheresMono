import { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Box,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  CircularProgress,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CardMedia,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ScannerIcon from '@mui/icons-material/Scanner';
import Print3Icon from '@mui/icons-material/Print';
import CloudIcon from '@mui/icons-material/Cloud';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import SearchIcon from '@mui/icons-material/Search';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TrendingIcon from '@mui/icons-material/TrendingUp';
import BusinessIcon from '@mui/icons-material/Business';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LanguageIcon from '@mui/icons-material/Language';

// Import our services
import { 
  fetchDentalNews, 
  fetchAestheticNews, 
  fetchCompanyNews, 
  fetchLocalIndustryNews,
  fetchTrendingTopics
} from '../services/newsService';

import { 
  fetchDentalInsights, 
  fetchAestheticInsights, 
  researchIndustryTopic,
  getMarketTrendAnalysis,
  getCompetitiveIntelligence
} from '../services/marketInsightsService';

const MarketNewsTab = ({ isDental }) => {
  // State for live news and insights
  const [news, setNews] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [researchQuery, setResearchQuery] = useState('');
  const [researchResults, setResearchResults] = useState(null);
  const [openResearchDialog, setOpenResearchDialog] = useState(false);
  const [researching, setResearching] = useState(false);
  const [newsTabValue, setNewsTabValue] = useState(0);
  const [companyNewsQuery, setCompanyNewsQuery] = useState('');
  const [companyNews, setCompanyNews] = useState([]);
  const [loadingCompanyNews, setLoadingCompanyNews] = useState(false);
  const [location, setLocation] = useState('New York');
  const [localNews, setLocalNews] = useState([]);
  const [loadingLocalNews, setLoadingLocalNews] = useState(false);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loadingTrends, setLoadingTrends] = useState(false);

  // Static data from market research
  const dentalChallenges2025 = [
    { 
      title: "Staffing Shortages", 
      description: "Continued difficulty in hiring and retaining dental assistants and hygienists, though recent data shows increasing graduation numbers from hygiene programs."
    },
    { 
      title: "Insurance Issues", 
      description: "Challenges with reimbursement rates and administrative burdens from insurance providers continue to be a major concern."
    },
    { 
      title: "Rising Overhead Costs", 
      description: "Substantial growth on the expense side, including equipment, supplies, and human capital costs, without corresponding increases in reimbursement rates."
    }
  ];

  const dentalTrends2025 = [
    {
      title: "Generative AI Integration",
      description: "18% of dental professionals already using AI with another 66% considering adoption - from analyzing x-rays and diagnostics to supporting workflows.",
      icon: <SmartToyIcon />
    },
    {
      title: "Digital Patient Experience",
      description: "78% of patients value personalized dental care guidance, and 90% find seeing their scan highly valuable. Technology-empowered patients are becoming the norm.",
      icon: <PersonIcon />
    },
    {
      title: "Intraoral Scanners Evolution",
      description: "IOS penetration at 57% in the US market. Scanners are evolving beyond digital impressions to become central to diagnostics, treatment planning, and patient communication.",
      icon: <ScannerIcon />
    },
    {
      title: "3D Printing Over Milling",
      description: "15% of dental practices now use 3D printers, with more practices having printers than mills for in-office workflows. Improved resins are driving adoption.",
      icon: <Print3Icon />
    },
    {
      title: "Cloud-Based Integration",
      description: "Cloud solutions connecting previously siloed dental technologies, enabling seamless data transfer and creating integrated practice management solutions.",
      icon: <CloudIcon />
    }
  ];

  const aestheticTrends2025 = [
    {
      title: "AI-Powered Aesthetic Planning",
      description: "AI tools that can visualize treatment outcomes and create personalized aesthetic treatment plans are gaining popularity.",
      icon: <SmartToyIcon />
    },
    {
      title: "Virtual Consultations",
      description: "Remote consultations and digital treatment planning becoming standard practice, with patients expecting digital-first experiences.",
      icon: <PersonIcon />
    },
    {
      title: "3D Facial Scanning",
      description: "Advanced 3D facial scanning technology enabling more precise aesthetic planning and better patient communication.",
      icon: <ScannerIcon />
    },
    {
      title: "Minimally Invasive Procedures",
      description: "Growing demand for less invasive procedures with shorter recovery times, supported by advanced technologies.",
      icon: <Print3Icon />
    },
    {
      title: "Integrated Digital Workflows",
      description: "Cloud-based platforms connecting all aspects of aesthetic practice from consultation to treatment and follow-up care.",
      icon: <CloudIcon />
    }
  ];

  // Fetch news and insights when the component mounts or when isDental changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLoadingTrends(true);
      try {
        // Fetch news based on industry
        const newsData = isDental 
          ? await fetchDentalNews()
          : await fetchAestheticNews();
        
        // Fetch insights based on industry
        const insightsData = isDental
          ? await fetchDentalInsights()
          : await fetchAestheticInsights();
        
        // Fetch trending topics
        const trendsData = await fetchTrendingTopics(isDental);
        
        setNews(newsData);
        setInsights(insightsData);
        setTrendingTopics(trendsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setLoadingTrends(false);
      }
    };

    fetchData();
  }, [isDental]);

  // Handle news tab change
  const handleNewsTabChange = (event, newValue) => {
    setNewsTabValue(newValue);
  };

  // Handle research dialog open
  const handleOpenResearchDialog = () => {
    setOpenResearchDialog(true);
  };

  // Handle research dialog close
  const handleCloseResearchDialog = () => {
    setOpenResearchDialog(false);
  };

  // Handle research query change
  const handleResearchQueryChange = (event) => {
    setResearchQuery(event.target.value);
  };

  // Handle research submission
  const handleResearchSubmit = async () => {
    if (!researchQuery.trim()) return;
    
    setResearching(true);
    try {
      const results = await researchIndustryTopic(researchQuery, isDental);
      setResearchResults(results);
    } catch (error) {
      console.error("Error researching topic:", error);
    } finally {
      setResearching(false);
    }
  };

  // Handle company news query change
  const handleCompanyNewsQueryChange = (event) => {
    setCompanyNewsQuery(event.target.value);
  };

  // Handle company news search
  const handleCompanyNewsSearch = async () => {
    if (!companyNewsQuery.trim()) return;
    
    setLoadingCompanyNews(true);
    try {
      const results = await fetchCompanyNews(companyNewsQuery, isDental);
      setCompanyNews(results);
    } catch (error) {
      console.error("Error fetching company news:", error);
    } finally {
      setLoadingCompanyNews(false);
    }
  };

  // Handle location change
  const handleLocationChange = (event) => {
    setLocation(event.target.value);
  };

  // Handle local news search
  const handleLocalNewsSearch = async () => {
    if (!location.trim()) return;
    
    setLoadingLocalNews(true);
    try {
      const results = await fetchLocalIndustryNews(location, isDental);
      setLocalNews(results);
    } catch (error) {
      console.error("Error fetching local news:", error);
    } finally {
      setLoadingLocalNews(false);
    }
  };

  const currentTrends = isDental ? dentalTrends2025 : aestheticTrends2025;
  const industryTitle = isDental ? "Dental Industry" : "Aesthetic Industry";

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title={`${industryTitle} Market News & Trends 2025`} 
            subheader="Latest insights from industry research and market analysis"
            action={
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<SearchIcon />}
                onClick={handleOpenResearchDialog}
              >
                Research Topic
              </Button>
            }
          />
          <CardContent>
            <Typography variant="body1" paragraph>
              The {industryTitle.toLowerCase()} landscape continues to evolve rapidly in 2025, with technological advancements and changing patient expectations driving significant shifts in how care is delivered and practices are managed.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Trending Topics */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title="Trending Topics" 
            subheader="Hot topics in the industry right now"
            avatar={
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <TrendingIcon />
              </Avatar>
            }
          />
          <CardContent>
            {loadingTrends ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : trendingTopics.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {trendingTopics.map((topic, index) => (
                  <Chip 
                    key={index}
                    label={topic.name}
                    color={index < 3 ? "secondary" : "default"}
                    variant={index < 3 ? "filled" : "outlined"}
                    icon={index < 3 ? <TrendingUpIcon /> : undefined}
                    onClick={() => {
                      setResearchQuery(topic.name);
                      setOpenResearchDialog(true);
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center">
                No trending topics available at the moment.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* News Tabs */}
      <Grid item xs={12}>
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={newsTabValue}
              onChange={handleNewsTabChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab icon={<NewspaperIcon />} label="Industry News" />
              <Tab icon={<BusinessIcon />} label="Company News" />
              <Tab icon={<LocationOnIcon />} label="Local News" />
            </Tabs>
          </Box>
          
          {/* Industry News Tab */}
          {newsTabValue === 0 && (
            <CardContent>
              <CardHeader 
                title="Latest Industry News" 
                subheader="Powered by Brave Search API"
                avatar={
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <NewspaperIcon />
                  </Avatar>
                }
              />
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : news.length > 0 ? (
                <List>
                  {news.map((item, index) => (
                    <Box key={index}>
                      <ListItem alignItems="flex-start">
                        {item.imageUrl && (
                          <Box sx={{ mr: 2, width: 100, height: 100, overflow: 'hidden' }}>
                            <img 
                              src={item.imageUrl} 
                              alt={item.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </Box>
                        )}
                        <ListItemText
                          primary={
                            <Link href={item.url} target="_blank" rel="noopener" underline="hover">
                              <Typography variant="h6" color="primary">
                                {item.title}
                              </Typography>
                            </Link>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {item.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Source: {item.source} • {item.date}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < news.length - 1 && <Divider component="li" />}
                    </Box>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  No news articles available at the moment. Please try again later.
                </Typography>
              )}
            </CardContent>
          )}
          
          {/* Company News Tab */}
          {newsTabValue === 1 && (
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Search Company News"
                  variant="outlined"
                  value={companyNewsQuery}
                  onChange={handleCompanyNewsQueryChange}
                  placeholder="Enter company name (e.g., Align Technology, Dentsply Sirona)"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={handleCompanyNewsSearch}
                          disabled={!companyNewsQuery.trim() || loadingCompanyNews}
                        >
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              
              {loadingCompanyNews ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : companyNews.length > 0 ? (
                <List>
                  {companyNews.map((item, index) => (
                    <Box key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          <BusinessIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Link href={item.url} target="_blank" rel="noopener" underline="hover">
                              <Typography variant="h6" color="primary">
                                {item.title}
                              </Typography>
                            </Link>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {item.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Source: {item.source} • {item.date}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < companyNews.length - 1 && <Divider component="li" />}
                    </Box>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  {companyNewsQuery ? 
                    "No company news found. Try another company name." : 
                    "Enter a company name to search for news."}
                </Typography>
              )}
            </CardContent>
          )}
          
          {/* Local News Tab */}
          {newsTabValue === 2 && (
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="location-select-label">Location</InputLabel>
                  <Select
                    labelId="location-select-label"
                    value={location}
                    onChange={handleLocationChange}
                    label="Location"
                  >
                    <MenuItem value="New York">New York</MenuItem>
                    <MenuItem value="Los Angeles">Los Angeles</MenuItem>
                    <MenuItem value="Chicago">Chicago</MenuItem>
                    <MenuItem value="Houston">Houston</MenuItem>
                    <MenuItem value="Phoenix">Phoenix</MenuItem>
                    <MenuItem value="Philadelphia">Philadelphia</MenuItem>
                    <MenuItem value="San Antonio">San Antonio</MenuItem>
                    <MenuItem value="San Diego">San Diego</MenuItem>
                    <MenuItem value="Dallas">Dallas</MenuItem>
                    <MenuItem value="San Jose">San Jose</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleLocalNewsSearch}
                    disabled={loadingLocalNews}
                    startIcon={<LocationOnIcon />}
                  >
                    Find Local {isDental ? "Dental" : "Aesthetic"} News
                  </Button>
                </Box>
              </Box>
              
              {loadingLocalNews ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : localNews.length > 0 ? (
                <List>
                  {localNews.map((item, index) => (
                    <Box key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          <LocationOnIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="h6" color="primary">
                              {item.name}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary">
                                {item.address}
                              </Typography>
                              {item.phone && (
                                <Typography variant="body2" color="text.secondary">
                                  Phone: {item.phone}
                                </Typography>
                              )}
                              {item.rating && (
                                <Typography variant="body2" color="text.secondary">
                                  Rating: {item.rating} ({item.reviewCount} reviews)
                                </Typography>
                              )}
                              {item.url && (
                                <Link href={item.url} target="_blank" rel="noopener" underline="hover">
                                  Visit Website
                                </Link>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                      {index < localNews.length - 1 && <Divider component="li" />}
                    </Box>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  {location ? 
                    `No local ${isDental ? "dental" : "aesthetic"} news found for ${location}. Try another location.` : 
                    "Select a location to find local news."}
                </Typography>
              )}
            </CardContent>
          )}
        </Card>
      </Grid>

      {isDental && (
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Top Challenges for Dental Practices in 2025" 
              subheader="Source: American Dental Association Health Policy Institute"
              avatar={
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <WarningIcon />
                </Avatar>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                {dentalChallenges2025.map((challenge, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="warning.main">
                          {challenge.title}
                        </Typography>
                        <Typography variant="body2">
                          {challenge.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}

      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title={`Top 5 ${industryTitle} Trends for 2025`}
            subheader="Source: Industry research and market analysis"
            avatar={
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <TrendingUpIcon />
              </Avatar>
            }
          />
          <CardContent>
            <List>
              {currentTrends.map((trend, index) => (
                <Box key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      {trend.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="h6" color="primary">
                          {trend.title}
                        </Typography>
                      }
                        secondary={
                        <Typography variant="body2" color="text.secondary">
                          {trend.description}
                        </Typography>
                      }
                    />
                    <Chip 
                      label={`Trend #${index + 1}`} 
                      color="primary" 
                      size="small" 
                      variant="outlined"
                    />
                  </ListItem>
                  {index < currentTrends.length - 1 && <Divider variant="inset" component="li" />}
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Live Industry Insights Section */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title="Industry Insights from the Web" 
            subheader="Powered by Firecrawl MCP"
            avatar={
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <AnalyticsIcon />
              </Avatar>
            }
          />
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : insights.length > 0 ? (
              <List>
                {insights.map((item, index) => (
                  <Box key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Typography variant="h6" color="success.main">
                            Insight from {item.source}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {item.insights}
                          </Typography>
                        }
                      />
                      {item.url && (
                        <Link href={item.url} target="_blank" rel="noopener">
                          <Button size="small" variant="outlined">
                            Source
                          </Button>
                        </Link>
                      )}
                    </ListItem>
                    {index < insights.length - 1 && <Divider component="li" />}
                  </Box>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center">
                No insights available at the moment. Please try again later.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title="Market Outlook" 
            subheader="Projected growth and opportunities"
          />
          <CardContent>
            <Typography variant="body1" paragraph>
              {isDental ? 
                "The dental industry is projected to see continued growth through 2025-2030, with digital technologies driving efficiency and new treatment possibilities. According to industry experts, we're entering a 'golden era' for oral health, with half the population not yet engaged with the oral health care system representing a huge opportunity for practices that can adapt to changing patient expectations and leverage new technologies effectively." 
                : 
                "The aesthetic industry is expected to maintain strong growth momentum through 2025-2030, driven by increasing consumer interest in minimally invasive procedures and technological advancements that make treatments more accessible. Practices that can deliver personalized, technology-enhanced experiences while maintaining natural-looking results are positioned to capture the growing market demand."
              }
            </Typography>
            <Typography variant="body1">
              Key growth areas include AI-assisted diagnostics and treatment planning, digital patient engagement tools, and integrated practice management solutions that streamline operations and enhance the patient experience.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Research Dialog */}
      <Dialog open={openResearchDialog} onClose={handleCloseResearchDialog} maxWidth="md" fullWidth>
        <DialogTitle>Research {industryTitle} Topic</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a specific topic to research in the {industryTitle.toLowerCase()}. Our AI will analyze multiple sources to provide you with comprehensive insights.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="research-query"
            label="Research Topic"
            type="text"
            fullWidth
            variant="outlined"
            value={researchQuery}
            onChange={handleResearchQueryChange}
            placeholder={`E.g., "Future of ${isDental ? 'dental implants' : 'non-invasive procedures'} in 2025"`}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && researchQuery.trim()) {
                handleResearchSubmit();
              }
            }}
          />
          
          {researching && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress />
            </Box>
          )}
          
          {researchResults && !researching && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Research Results</Typography>
              <Typography variant="body1" paragraph>{researchResults.summary}</Typography>
              
              {researchResults.keyFindings && researchResults.keyFindings.length > 0 && (
                <>
                  <Typography variant="subtitle1" gutterBottom>Key Findings:</Typography>
                  <List>
                    {researchResults.keyFindings.map((finding, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Chip label={index + 1} color="primary" size="small" />
                        </ListItemIcon>
                        <ListItemText primary={finding} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
              
              {researchResults.sources && researchResults.sources.length > 0 && (
                <>
                  <Typography variant="subtitle1" gutterBottom>Sources:</Typography>
                  <List dense>
                    {researchResults.sources.map((source, index) => (
                      <ListItem key={index}>
                        <ListItemText 
                          primary={
                            <Link href={source.url} target="_blank" rel="noopener" underline="hover">
                              {source.title || source.url}
                            </Link>
                          } 
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResearchDialog}>Close</Button>
          <Button 
            onClick={handleResearchSubmit} 
            variant="contained" 
            color="primary"
            disabled={!researchQuery.trim() || researching}
          >
            Research
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default MarketNewsTab;
