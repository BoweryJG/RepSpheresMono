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
  
  // State to control the visibility of the Market Insights preview
  const [showMarketInsights, setShowMarketInsights] = useState(false);
  
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
      
      {/* Market Insights Preview Section */}
      {showMarketInsights && (
        <Paper 
          elevation={3}
          sx={{ 
            p: 3, 
            mb: 6, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                fontWeight: 700,
                color: 'white'
              }}
            >
              Market Insights Preview
            </Typography>
            <Button 
              variant="contained" 
              color="secondary"
              onClick={() => setShowMarketInsights(false)}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              Hide Preview
            </Button>
          </Box>
          
          <Box sx={{ 
            bgcolor: 'white', 
            borderRadius: 2, 
            height: '400px', 
            overflow: 'auto',
            p: 2
          }}>
            <MarketInsightsAdapter 
              supabaseUrl={supabaseUrl}
              supabaseKey={supabaseKey}
            />
          </Box>
        </Paper>
      )}
      
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
              {!showMarketInsights && (
                <Button 
                  variant="contained" 
                  color="secondary"
                  onClick={() => setShowMarketInsights(true)}
                  sx={{ 
                    background: 'linear-gradient(90deg, #7b1fa2, #ba68c8)',
                    color: 'white',
                    mb: 2,
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  Show Market Insights Preview
                </Button>
              )}
              <a 
                href="/dashboard" 
                style={{ 
                  textDecoration: 'none', 
                  display: 'inline-block',
                  background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                View Market Insights Dashboard
              </a>
              
              <a 
                href="/market-insights" 
                style={{ 
                  textDecoration: 'none', 
                  display: 'inline-block',
                  background: 'linear-gradient(90deg, #7b1fa2, #ba68c8)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                Explore Full Market Insights
              </a>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default HomePage;
