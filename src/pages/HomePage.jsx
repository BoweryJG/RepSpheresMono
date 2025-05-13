import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Paper, CircularProgress, Divider } from '@mui/material';
import { getFeaturedProcedures, getTrendingProcedures, getAllCategories } from '../services/procedureService';
import FeaturedProcedures from '../components/procedures/FeaturedProcedures';
import CategoriesList from '../components/procedures/CategoriesList';
import SearchForm from '../components/procedures/SearchForm';
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
            
            <Typography variant="body2">
              Our data is regularly updated to ensure you have access to the most current 
              market information for making informed business decisions.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default HomePage;
