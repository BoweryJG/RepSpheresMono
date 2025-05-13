import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Paper, CircularProgress, Divider, Alert } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchProcedures, getAllCategories } from '../services/procedureService';
import FeaturedProcedures from '../components/procedures/FeaturedProcedures';
import CategoriesList from '../components/procedures/CategoriesList';
import SearchForm from '../components/procedures/SearchForm';

function SearchPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse query params
  const getQueryParams = () => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';
    
    // Extract filters
    const filters = {};
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'q') {
        filters[key] = value;
      }
    }
    
    return { query, filters };
  };
  
  // Initial search params
  const initialParams = getQueryParams();
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
        
        // If there are search params, perform search
        const { query, filters } = getQueryParams();
        if (query || Object.keys(filters).length > 0) {
          const results = await searchProcedures(query, filters);
          setSearchResults(results);
          setSearchPerformed(true);
        }
      } catch (err) {
        console.error('Error loading search page data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [location.search]);
  
  // Handle search submission
  const handleSearch = async (searchData) => {
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
    
    // Update URL with search params
    navigate({
      pathname: '/search',
      search: params.toString()
    });
    
    // Set search as performed
    setSearchPerformed(true);
  };
  
  // Get industries for search form
  const getIndustries = () => {
    const industries = [
      { value: 'dental', label: 'Dental' },
      { value: 'aesthetic', label: 'Aesthetic' }
    ];
    
    return industries;
  };
  
  // Get search title
  const getSearchTitle = () => {
    const { query, filters } = getQueryParams();
    
    if (query) {
      return `Search Results for "${query}"`;
    }
    
    if (filters.industry) {
      const industryName = filters.industry.charAt(0).toUpperCase() + filters.industry.slice(1);
      return `${industryName} Procedures`;
    }
    
    if (filters.category) {
      // Find category name
      const category = categories.find(cat => {
        const catValue = cat.category_value || cat.value || cat;
        return catValue === filters.category;
      });
      
      const categoryName = category ? 
        (category.category_name || category.name || category) : 
        filters.category;
        
      return `${categoryName} Procedures`;
    }
    
    if (filters.sortBy) {
      if (filters.sortBy === 'marketSizeDesc') return 'Largest Market Size Procedures';
      if (filters.sortBy === 'growthRateDesc') return 'Fastest Growing Procedures';
    }
    
    return 'All Procedures';
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
      {/* Search Form */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Search Procedures
        </Typography>
        
        <SearchForm 
          industries={getIndustries()}
          categories={categories}
          initialQuery={initialParams.query}
          initialFilters={initialParams.filters}
          onSearch={handleSearch}
        />
      </Paper>
      
      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Left Column - Search Results */}
        <Grid item xs={12} md={8}>
          {searchPerformed ? (
            <>
              <Typography variant="h5" component="h2" gutterBottom>
                {getSearchTitle()} {searchResults.length > 0 && `(${searchResults.length})`}
              </Typography>
              
              {searchResults.length === 0 ? (
                <Alert severity="info" sx={{ mb: 4 }}>
                  No procedures found matching your search criteria. Try adjusting your filters or search terms.
                </Alert>
              ) : (
                <FeaturedProcedures 
                  procedures={searchResults}
                  title=""
                  limit={20}
                />
              )}
            </>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Enter search criteria to find procedures
              </Typography>
              <Typography color="text.secondary">
                Use the search form above to find dental and aesthetic procedures.
              </Typography>
            </Paper>
          )}
        </Grid>
        
        {/* Right Column - Categories */}
        <Grid item xs={12} md={4}>
          <CategoriesList 
            categories={categories}
            title="Browse Categories"
            maxHeight={600}
          />
          
          {/* Search Tips */}
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              mt: 4, 
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>
              Search Tips
            </Typography>
            
            <Typography variant="body2" paragraph>
              • Use specific terms for more accurate results
            </Typography>
            
            <Typography variant="body2" paragraph>
              • Filter by industry to narrow down results
            </Typography>
            
            <Typography variant="body2" paragraph>
              • Sort by market size or growth rate to find trending procedures
            </Typography>
            
            <Typography variant="body2">
              • Set minimum market size or growth rate to find high-potential procedures
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default SearchPage;
