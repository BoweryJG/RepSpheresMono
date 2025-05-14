import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Paper, CircularProgress, Divider, Button } from '@mui/material';
import { getFeaturedProcedures, getTrendingProcedures, getAllCategories } from '../services/procedureService';
import FeaturedProcedures from '../components/procedures/FeaturedProcedures';
import CategoriesList from '../components/procedures/CategoriesList';
import SearchForm from '../components/procedures/SearchForm';
import MarketInsightsAdapter from '../components/MarketInsightsAdapter';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [featuredDental, setFeaturedDental] = useState([]);
  const [featuredAesthetic, setFeaturedAesthetic] = useState([]);
  const [trendingProcedures, setTrendingProcedures] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [dentalData, aestheticData, trendingData, categoriesData] = await Promise.all([
          getFeaturedProcedures('dental', 4),
          getFeaturedProcedures('aesthetic', 4),
          getTrendingProcedures(null, 4),
          getAllCategories()
        ]);
        
        setFeaturedDental(dentalData);
        setFeaturedAesthetic(aestheticData);
        setTrendingProcedures(trendingData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error loading home page data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);
  
  // Handle search submission
  const handleSearch = (searchData) => {
    const { query, filters } = searchData;
    
    // Build query string
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    
    // Add filters to query string
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    // Navigate to search page with query params
    navigate({
      pathname: '/search',
      search: params.toString()
    });
  };
  
  // Get industries for search form
  const getIndustries = () => {
    const industries = [
      { value: 'dental', label: 'Dental' },
      { value: 'aesthetic', label: 'Aesthetic' }
    ];
    
    return industries;
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error Loading Data
          </Typography>
          <Typography>
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  // Get Supabase credentials from environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Always show Market Insights on the main page as a core feature
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Paper 
        elevation={3}
        sx={{ 
          p: { xs: 3, md: 6 }, 
          mb: 6, 
          borderRadius: 3,
          backgroundImage: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
          color: 'white'
        }}
      >
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Discover Advanced Procedures
        </Typography>
        
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 4,
            opacity: 0.9,
            maxWidth: '800px'
          }}
        >
          Explore the latest in dental and aesthetic innovations with comprehensive market insights
        </Typography>
        
        {/* Search Form */}
        <SearchForm 
          industries={getIndustries()}
          categories={categories}
          onSearch={handleSearch}
        />
      </Paper>
      
      {/* Market Insights Section - Featured prominently */}
      <Paper 
        elevation={4}
        sx={{ 
          p: { xs: 2, md: 4 }, 
          mb: 6, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)',
          boxShadow: '0 10px 20px rgba(123, 31, 162, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative background elements */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: -20, 
            right: -20, 
            width: 150, 
            height: 150, 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.12)',
            zIndex: 0
          }} 
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: -30, 
            left: 100, 
            width: 120, 
            height: 120, 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.08)',
            zIndex: 0
          }} 
        />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: { xs: 2, md: 3 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 }
          }}>
            <Box>
              <Typography 
                variant="h3" 
                component="h2" 
                sx={{ 
                  fontWeight: 700,
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                  mb: 1
                }}
              >
                Market Insights Dashboard
              </Typography>
              
              <Typography 
                variant="h6"
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  maxWidth: '800px',
                  fontWeight: '400'
                }}
              >
                Real-time market data and trends for dental and aesthetic procedures
              </Typography>
            </Box>
            
            <Button 
              variant="contained" 
              color="secondary"
              href="/market-insights"
              size="large"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.25)', 
                color: 'white',
                fontWeight: 'bold',
                px: 3,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.35)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.2)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              View Full Dashboard
            </Button>
          </Box>
          
          <Box sx={{ 
            bgcolor: 'white', 
            borderRadius: 2, 
            height: { xs: '500px', md: '600px' },
            overflow: 'auto',
            p: { xs: 2, md: 3 },
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: 'inset 0 2px 15px rgba(0,0,0,0.15)'
            }
          }}>
            <MarketInsightsAdapter 
              supabaseUrl={supabaseUrl}
              supabaseKey={supabaseKey}
            />
          </Box>
        </Box>
      </Paper>
      
      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Left Column - Featured Procedures */}
        <Grid item xs={12} md={8}>
          {/* Featured Dental Procedures */}
          <FeaturedProcedures 
            procedures={featuredDental}
            title="Featured Dental Procedures"
            showViewAll={true}
            viewAllLink="/search?industry=dental"
          />
          
          {/* Featured Aesthetic Procedures */}
          <FeaturedProcedures 
            procedures={featuredAesthetic}
            title="Featured Aesthetic Procedures"
            showViewAll={true}
            viewAllLink="/search?industry=aesthetic"
          />
          
          {/* Trending Procedures */}
          <FeaturedProcedures 
            procedures={trendingProcedures}
            title="Trending Procedures"
            showViewAll={true}
            viewAllLink="/search?sortBy=growthRateDesc"
          />
        </Grid>
        
        {/* Right Column - Categories */}
        <Grid item xs={12} md={4}>
          <CategoriesList 
            categories={categories}
            title="Browse Categories"
            maxHeight={600}
          />
          
          {/* About Section */}
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              mt: 4, 
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>
              About Market Insights
            </Typography>
            
            <Typography variant="body2" paragraph>
              Market Insights provides comprehensive data on dental and aesthetic procedures, 
              helping professionals stay informed about market trends, growth rates, and 
              emerging opportunities.
            </Typography>
            
            <Typography variant="body2" paragraph>
              Our data is regularly updated to ensure you have access to the most current 
              market information for making informed business decisions.
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: 2, 
                justifyContent: 'center',
                width: '100%' 
              }}>
                <Button
                  variant="contained"
                  color="primary"
                  component="a"
                  href="/dashboard"
                  fullWidth
                  sx={{
                    background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    textAlign: 'center',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #1565c0, #1976d2)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 12px rgba(25, 118, 210, 0.4)'
                    }
                  }}
                >
                  View Full Dashboard
                </Button>
                
                <Button
                  variant="contained"
                  color="secondary"
                  component="a"
                  href="/market-insights"
                  fullWidth
                  sx={{
                    background: 'linear-gradient(90deg, #7b1fa2, #ba68c8)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(123, 31, 162, 0.3)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    textAlign: 'center',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #6a1b9a, #9c27b0)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 12px rgba(123, 31, 162, 0.4)'
                    }
                  }}
                >
                  Explore Full Market Insights
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default HomePage;
