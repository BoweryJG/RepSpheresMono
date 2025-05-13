import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Paper, Grid, Breadcrumbs } from '@mui/material';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { getProceduresByCategory, getAllCategories } from '../services/procedureService';
import FeaturedProcedures from '../components/procedures/FeaturedProcedures';
import CategoriesList from '../components/procedures/CategoriesList';
import CategoryIcon from '@mui/icons-material/Category';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

function CategoryPage() {
  const { categoryName } = useParams();
  const [procedures, setProcedures] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryInfo, setCategoryInfo] = useState(null);

  // Load category data and procedures
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      
      try {
        // Load all categories for the sidebar
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
        
        // Find the current category in the loaded categories
        const currentCategory = categoriesData.find(cat => {
          const catName = cat.category_name || cat.name || cat;
          const catValue = cat.category_value || cat.value || catName;
          return catValue.toLowerCase() === categoryName.toLowerCase();
        });
        
        if (currentCategory) {
          setCategoryInfo(currentCategory);
        }
        
        // Load procedures for this category
        const proceduresData = await getProceduresByCategory(categoryName);
        setProcedures(proceduresData);
      } catch (err) {
        console.error("Error loading category data:", err);
        setError("Failed to load category data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [categoryName]);

  // Format the category name for display
  const formatCategoryName = () => {
    if (categoryInfo) {
      return categoryInfo.category_name || categoryInfo.name || categoryInfo;
    }
    
    // If category info isn't loaded yet, format the URL parameter
    return categoryName
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get category description
  const getCategoryDescription = () => {
    if (categoryInfo && categoryInfo.description) {
      return categoryInfo.description;
    }
    return `Explore all procedures in the ${formatCategoryName()} category, including market sizes, growth rates, and detailed information.`;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          Home
        </RouterLink>
        <RouterLink to="/search" style={{ textDecoration: 'none', color: 'inherit' }}>
          Categories
        </RouterLink>
        <Typography color="text.primary">{formatCategoryName()}</Typography>
      </Breadcrumbs>
      
      <Grid container spacing={4}>
        {/* Left Sidebar */}
        <Grid item xs={12} md={3}>
          <CategoriesList 
            categories={categories} 
            title="All Categories" 
            maxHeight={600}
          />
        </Grid>
        
        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {/* Category Header */}
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2,
              backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CategoryIcon sx={{ fontSize: '2rem', mr: 2, color: 'primary.main' }} />
              <Typography variant="h3" component="h1">
                {formatCategoryName()}
              </Typography>
            </Box>
            
            <Typography variant="subtitle1" color="text.secondary" paragraph>
              {getCategoryDescription()}
            </Typography>
            
            {categoryInfo && categoryInfo.industry && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" component="span" sx={{ mr: 1 }}>
                  Industry:
                </Typography>
                <RouterLink 
                  to={`/search?industry=${categoryInfo.industry}`}
                  style={{ textDecoration: 'none' }}
                >
                  {categoryInfo.industry}
                </RouterLink>
              </Box>
            )}
          </Paper>
          
          {/* Loading or Error State */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText', mb: 4 }}>
              <Typography>{error}</Typography>
            </Paper>
          ) : (
            <>
              {/* Procedures Results */}
              {procedures.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', mb: 4 }}>
                  <Typography variant="h6" gutterBottom>No procedures found in this category</Typography>
                  <Typography color="text.secondary">
                    Try browsing a different category or using the search feature.
                  </Typography>
                </Paper>
              ) : (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {procedures.length} {procedures.length === 1 ? 'Procedure' : 'Procedures'} in {formatCategoryName()}
                  </Typography>
                  
                  <FeaturedProcedures 
                    procedures={procedures}
                    title=""
                    limit={50}
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default CategoryPage;
