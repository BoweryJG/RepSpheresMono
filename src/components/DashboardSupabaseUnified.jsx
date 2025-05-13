import React, { useEffect, useState } from 'react';
import { 
  getDentalProcedures, 
  getAestheticProcedures, 
  getDentalCompanies,
  getAestheticCompanies,
  getMarketGrowthData,
  getNewsArticles,
  getUpcomingEvents,
  getTrendingTopics
} from '../services/supabase/unifiedSupabaseService';
import { Box, Typography, CircularProgress, Grid, Paper, Tabs, Tab } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GradientCard from './ui/GradientCard';
import SimpleCard from './ui/SimpleCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useIndustryTheme } from '../services/theme/IndustryThemeContext';

function DashboardSupabaseUnified() {
  const theme = useTheme();
  const { setIndustry, industryTheme } = useIndustryTheme();
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [dentalProcedures, setDentalProcedures] = useState([]);
  const [aestheticProcedures, setAestheticProcedures] = useState([]);
  const [dentalCompanies, setDentalCompanies] = useState([]);
  const [aestheticCompanies, setAestheticCompanies] = useState([]);
  const [dentalGrowthData, setDentalGrowthData] = useState([]);
  const [aestheticGrowthData, setAestheticGrowthData] = useState([]);
  const [dentalNews, setDentalNews] = useState([]);
  const [aestheticNews, setAestheticNews] = useState([]);
  const [dentalEvents, setDentalEvents] = useState([]);
  const [aestheticEvents, setAestheticEvents] = useState([]);
  const [dentalTopics, setDentalTopics] = useState([]);
  const [aestheticTopics, setAestheticTopics] = useState([]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setIndustry(newValue === 0 ? 'dental' : 'aesthetic');
  };
  
  // Load all data
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load procedures
        const dental = await getDentalProcedures();
        const aesthetic = await getAestheticProcedures();
        setDentalProcedures(dental);
        setAestheticProcedures(aesthetic);
        
        // Load companies
        const dentalComp = await getDentalCompanies();
        const aestheticComp = await getAestheticCompanies();
        setDentalCompanies(dentalComp);
        setAestheticCompanies(aestheticComp);
        
        // Load market growth data
        const dentalGrowth = await getMarketGrowthData('dental');
        const aestheticGrowth = await getMarketGrowthData('aesthetic');
        setDentalGrowthData(dentalGrowth);
        setAestheticGrowthData(aestheticGrowth);
        
        // Load news articles
        const dentalNewsData = await getNewsArticles('dental');
        const aestheticNewsData = await getNewsArticles('aesthetic');
        setDentalNews(dentalNewsData);
        setAestheticNews(aestheticNewsData);
        
        // Load events
        const dentalEventsData = await getUpcomingEvents('dental');
        const aestheticEventsData = await getUpcomingEvents('aesthetic');
        setDentalEvents(dentalEventsData);
        setAestheticEvents(aestheticEventsData);
        
        // Load trending topics
        const dentalTopicsData = await getTrendingTopics('dental');
        const aestheticTopicsData = await getTrendingTopics('aesthetic');
        setDentalTopics(dentalTopicsData);
        setAestheticTopics(aestheticTopicsData);
        
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadAllData();
  }, []);
  
  // Current industry data based on active tab
  const currentProcedures = activeTab === 0 ? dentalProcedures : aestheticProcedures;
  const currentCompanies = activeTab === 0 ? dentalCompanies : aestheticCompanies;
  const currentGrowthData = activeTab === 0 ? dentalGrowthData : aestheticGrowthData;
  const currentNews = activeTab === 0 ? dentalNews : aestheticNews;
  const currentEvents = activeTab === 0 ? dentalEvents : aestheticEvents;
  const currentTopics = activeTab === 0 ? dentalTopics : aestheticTopics;
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: industryTheme.primary }} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading market insights...
        </Typography>
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Typography variant="body1">
          Please check your connection and try again.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Market Insights Dashboard
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTabs-indicator': {
              backgroundColor: industryTheme.primary,
            },
          }}
        >
          <Tab 
            label="Dental Industry" 
            sx={{ 
              '&.Mui-selected': { color: theme.palette.mode === 'dark' ? '#81c0ff' : '#1976d2' }
            }}
          />
          <Tab 
            label="Aesthetic Industry" 
            sx={{ 
              '&.Mui-selected': { color: theme.palette.mode === 'dark' ? '#ff9eb5' : '#d81b60' }
            }}
          />
        </Tabs>
      </Paper>
      
      {/* Market Overview */}
      <Typography variant="h5" gutterBottom>
        Market Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <GradientCard 
            title={`${activeTab === 0 ? 'Dental' : 'Aesthetic'} Industry Market Growth`}
            subtitle="Market Size in USD Billions"
            height={300}
          >
            {currentGrowthData && currentGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={currentGrowthData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.mode === 'dark' ? '#555' : '#ddd'} />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#fff',
                      borderColor: theme.palette.mode === 'dark' ? '#555' : '#ddd'
                    }} 
                    formatter={(value) => [`${value.toFixed(1)} B`, 'Market Size']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="size" 
                    stroke={industryTheme.primary} 
                    activeDot={{ r: 8 }} 
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', pt: 10 }}>
                No market growth data available
              </Typography>
            )}
          </GradientCard>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Grid container spacing={3} direction="column">
            <Grid item>
              <SimpleCard title="Total Procedures">
                <Typography variant="h2" sx={{ color: industryTheme.primary, textAlign: 'center' }}>
                  {currentProcedures?.length || 0}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                  Tracked procedures in our database
                </Typography>
              </SimpleCard>
            </Grid>
            <Grid item>
              <SimpleCard title="Top Companies">
                <Typography variant="h2" sx={{ color: industryTheme.primary, textAlign: 'center' }}>
                  {currentCompanies?.length || 0}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                  Leading industry companies
                </Typography>
              </SimpleCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      
      {/* Procedures & Companies Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <SimpleCard title={`Top ${activeTab === 0 ? 'Dental' : 'Aesthetic'} Procedures`}>
            {currentProcedures && currentProcedures.length > 0 ? (
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {currentProcedures.slice(0, 5).map((procedure, index) => (
                  <Box 
                    key={procedure.id || index} 
                    sx={{ 
                      p: 2, 
                      mb: 1, 
                      borderRadius: 1,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      }
                    }}
                  >
                    <Typography variant="h6">{procedure.name}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {procedure.description || procedure.trends || 'No description available'}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Category: {procedure.category_label || 'Uncategorized'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Growth: {procedure.yearly_growth_percentage ? `${procedure.yearly_growth_percentage}%` : 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', p: 3 }}>
                No procedures available
              </Typography>
            )}
          </SimpleCard>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <SimpleCard title={`Leading ${activeTab === 0 ? 'Dental' : 'Aesthetic'} Companies`}>
            {currentCompanies && currentCompanies.length > 0 ? (
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {currentCompanies.slice(0, 5).map((company, index) => (
                  <Box 
                    key={company.id || index} 
                    sx={{ 
                      p: 2, 
                      mb: 1, 
                      borderRadius: 1,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      }
                    }}
                  >
                    <Typography variant="h6">{company.name}</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Market Share: {company.marketShare ? `${company.marketShare}%` : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Growth Rate: {company.growthRate ? `${company.growthRate}%` : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">
                          Category: {company.category_label || 'General'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', p: 3 }}>
                No company data available
              </Typography>
            )}
          </SimpleCard>
        </Grid>
      </Grid>
      
      {/* News & Events */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <SimpleCard title={`Recent ${activeTab === 0 ? 'Dental' : 'Aesthetic'} Industry News`}>
            {currentNews && currentNews.length > 0 ? (
              <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
                {currentNews.slice(0, 5).map((article, index) => (
                  <Box 
                    key={article.id || index} 
                    sx={{ 
                      p: 2, 
                      mb: 1, 
                      borderRadius: 1,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      }
                    }}
                  >
                    <Typography variant="h6">{article.title}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {article.summary || 'No summary available'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Source: {article.source || 'Unknown'} | 
                      Date: {article.published_date ? new Date(article.published_date).toLocaleDateString() : 'Unknown'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', p: 3 }}>
                No news articles available
              </Typography>
            )}
          </SimpleCard>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <SimpleCard title={`Upcoming ${activeTab === 0 ? 'Dental' : 'Aesthetic'} Industry Events`}>
            {currentEvents && currentEvents.length > 0 ? (
              <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
                {currentEvents.slice(0, 5).map((event, index) => (
                  <Box 
                    key={event.id || index} 
                    sx={{ 
                      p: 2, 
                      mb: 1, 
                      borderRadius: 1,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      }
                    }}
                  >
                    <Typography variant="h6">{event.title}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {event.description || 'No description available'}
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Date: {event.event_date_start ? new Date(event.event_date_start).toLocaleDateString() : 'TBD'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Location: {event.location || event.city || 'TBD'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', p: 3 }}>
                No upcoming events
              </Typography>
            )}
          </SimpleCard>
        </Grid>
      </Grid>
      
      {/* Trending Topics */}
      <Typography variant="h5" gutterBottom>
        Trending Topics
      </Typography>
      
      <SimpleCard title={`Latest ${activeTab === 0 ? 'Dental' : 'Aesthetic'} Industry Trends`}>
        {currentTopics && currentTopics.length > 0 ? (
          <Grid container spacing={2} sx={{ p: 1 }}>
            {currentTopics.slice(0, 6).map((topic, index) => (
              <Grid item xs={12} sm={6} md={4} key={topic.id || index}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 2, 
                    height: '100%',
                    backgroundColor: index === 0 
                      ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                      : theme.palette.background.paper,
                    borderLeft: index === 0 ? `4px solid ${industryTheme.primary}` : 'none'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 1 }}>{topic.topic}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Relevance: {topic.relevance_score ? `${Math.round(topic.relevance_score * 100) / 100}/10` : 'N/A'}
                  </Typography>
                  {topic.keywords && (
                    <Typography variant="body2" color="textSecondary">
                      Keywords: {topic.keywords}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', p: 3 }}>
            No trending topics available
          </Typography>
        )}
      </SimpleCard>
      
      <Box sx={{ textAlign: 'center', mt: 5, mb: 3, opacity: 0.7 }}>
        <Typography variant="body2">
          © 2025 Market Insights Dashboard • Powered by Supabase
        </Typography>
      </Box>
    </Box>
  );
}

export default DashboardSupabaseUnified;
