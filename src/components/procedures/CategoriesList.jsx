import React from 'react';
import { 
  List, ListItem, ListItemText, ListItemIcon, Typography, 
  Paper, Box, Divider, Chip, ListItemButton
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CategoryIcon from '@mui/icons-material/Category';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function CategoriesList({ 
  categories = [], 
  title = 'Categories', 
  maxHeight = 400,
  showCount = true
}) {
  // Group categories by industry if available
  const groupedCategories = categories.reduce((acc, category) => {
    const industry = category.industry || 'Other';
    if (!acc[industry]) {
      acc[industry] = [];
    }
    acc[industry].push(category);
    return acc;
  }, {});
  
  // Check if we have industry grouping
  const hasIndustryGroups = Object.keys(groupedCategories).length > 1;
  
  // Get category value and name
  const getCategoryValue = (category) => {
    return category.category_value || category.value || category;
  };
  
  const getCategoryName = (category) => {
    return category.category_name || category.name || category;
  };
  
  // Get category count if available
  const getCategoryCount = (category) => {
    return category.count || category.procedure_count || null;
  };
  
  // Render a single category item
  const renderCategoryItem = (category, index) => {
    const categoryValue = getCategoryValue(category);
    const categoryName = getCategoryName(category);
    const count = getCategoryCount(category);
    
    return (
      <ListItem 
        key={index} 
        disablePadding
        component={RouterLink}
        to={`/categories/${categoryValue}`}
        sx={{ 
          textDecoration: 'none', 
          color: 'inherit',
          borderRadius: 1,
          '&:hover': {
            bgcolor: 'action.hover',
          }
        }}
      >
        <ListItemButton>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <CategoryIcon color="primary" fontSize="small" />
          </ListItemIcon>
          
          <ListItemText 
            primary={categoryName} 
            primaryTypographyProps={{ 
              noWrap: true,
              sx: { fontWeight: 500 }
            }}
          />
          
          {showCount && count && (
            <Chip 
              size="small" 
              label={count} 
              color="primary" 
              variant="outlined"
              sx={{ ml: 1 }}
            />
          )}
          
          <ArrowForwardIosIcon 
            fontSize="small" 
            sx={{ ml: 1, fontSize: '0.8rem', color: 'text.secondary' }} 
          />
        </ListItemButton>
      </ListItem>
    );
  };
  
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <CategoryIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
      </Box>
      
      {/* Categories List */}
      <Box 
        sx={{ 
          maxHeight: maxHeight, 
          overflow: 'auto',
          p: 1
        }}
      >
        {categories.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No categories available
            </Typography>
          </Box>
        ) : hasIndustryGroups ? (
          // Render categories grouped by industry
          Object.entries(groupedCategories).map(([industry, industryCategories], groupIndex) => (
            <Box key={groupIndex} sx={{ mb: 2 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  px: 2, 
                  py: 1, 
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  textTransform: 'uppercase',
                  letterSpacing: 1
                }}
              >
                {industry}
              </Typography>
              
              <List dense disablePadding>
                {industryCategories.map((category, index) => (
                  renderCategoryItem(category, `${groupIndex}-${index}`)
                ))}
              </List>
            </Box>
          ))
        ) : (
          // Render flat list of categories
          <List dense disablePadding>
            {categories.map((category, index) => (
              renderCategoryItem(category, index)
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
}

export default CategoriesList;
