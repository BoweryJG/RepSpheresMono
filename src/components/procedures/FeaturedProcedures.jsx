import React from 'react';
import { 
  Grid, Typography, Box, Card, CardContent, CardActionArea, 
  Chip, Divider, Paper, Button, CardMedia, CardActions
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SpaIcon from '@mui/icons-material/Spa';

function FeaturedProcedures({ 
  procedures = [], 
  title = 'Featured Procedures', 
  limit = 4,
  showViewAll = false,
  viewAllLink = '/search'
}) {
  // Limit the number of procedures to display
  const displayProcedures = procedures.slice(0, limit);
  
  // Format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'N/A';
    
    // Format as currency with appropriate suffix (K, M, B)
    const num = parseFloat(value);
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };
  
  // Format growth rate
  const formatGrowthRate = (value) => {
    if (!value && value !== 0) return 'N/A';
    return `${parseFloat(value).toFixed(1)}%`;
  };
  
  // Get industry icon
  const getIndustryIcon = (industry) => {
    if (!industry) return <CategoryIcon />;
    
    switch (industry.toLowerCase()) {
      case 'dental':
        return <MedicalServicesIcon />;
      case 'aesthetic':
        return <SpaIcon />;
      default:
        return <CategoryIcon />;
    }
  };
  
  // Get growth rate color based on value
  const getGrowthRateColor = (rate) => {
    if (!rate && rate !== 0) return 'default';
    const value = parseFloat(rate);
    if (value >= 10) return 'success';
    if (value >= 5) return 'primary';
    if (value >= 0) return 'info';
    return 'error';
  };
  
  // Truncate text to a specific length
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      {/* Section Header */}
      {title && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            {title}
          </Typography>
          
          {showViewAll && procedures.length > 0 && (
            <Button 
              component={RouterLink} 
              to={viewAllLink}
              color="primary"
            >
              View All
            </Button>
          )}
        </Box>
      )}
      
      {/* Procedures Grid */}
      {displayProcedures.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No procedures available
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {displayProcedures.map((procedure, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                {/* Card Header with Industry */}
                <Box 
                  sx={{ 
                    p: 1.5, 
                    bgcolor: procedure.industry === 'dental' ? 'info.light' : 'secondary.light',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Box sx={{ mr: 1 }}>
                    {getIndustryIcon(procedure.industry)}
                  </Box>
                  <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                    {procedure.industry || 'General'}
                  </Typography>
                </Box>
                
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Procedure Name */}
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 600,
                      mb: 1,
                      lineHeight: 1.3
                    }}
                  >
                    {procedure.procedure_name}
                  </Typography>
                  
                  {/* Category */}
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      icon={<CategoryIcon />}
                      label={procedure.normalized_category || 'Uncategorized'} 
                      size="small"
                      component={RouterLink}
                      to={`/categories/${procedure.normalized_category}`}
                      clickable
                    />
                  </Box>
                  
                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    paragraph
                    sx={{ mb: 2, flexGrow: 1 }}
                  >
                    {truncateText(procedure.description, 120)}
                  </Typography>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  {/* Market Size */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoneyIcon color="primary" sx={{ mr: 1, fontSize: '1.2rem' }} />
                    <Typography variant="body2" component="span" sx={{ mr: 1, fontWeight: 500 }}>
                      Market Size:
                    </Typography>
                    <Typography variant="body2" component="span">
                      {formatCurrency(procedure.market_size)}
                    </Typography>
                  </Box>
                  
                  {/* Growth Rate */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon 
                      color={getGrowthRateColor(procedure.growth_rate)} 
                      sx={{ mr: 1, fontSize: '1.2rem' }} 
                    />
                    <Typography variant="body2" component="span" sx={{ mr: 1, fontWeight: 500 }}>
                      Growth Rate:
                    </Typography>
                    <Chip 
                      label={formatGrowthRate(procedure.growth_rate)} 
                      size="small"
                      color={getGrowthRateColor(procedure.growth_rate)}
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button 
                    component={RouterLink}
                    to={`/procedures/${procedure.id}`}
                    size="small" 
                    color="primary"
                    fullWidth
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default FeaturedProcedures;
