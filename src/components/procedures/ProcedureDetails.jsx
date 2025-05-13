import React from 'react';
import { 
  Typography, Box, Paper, Grid, Chip, Divider, 
  CircularProgress, List, ListItem, ListItemText, 
  ListItemIcon, Card, CardContent, Button
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SpaIcon from '@mui/icons-material/Spa';
import BusinessIcon from '@mui/icons-material/Business';
import BarChartIcon from '@mui/icons-material/BarChart';
import InfoIcon from '@mui/icons-material/Info';
import { Link as RouterLink } from 'react-router-dom';

function ProcedureDetails({ procedure, loading }) {
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
  
  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // No procedure data
  if (!procedure) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Procedure not found</Typography>
        <Typography color="text.secondary">
          The requested procedure could not be found or has been removed.
        </Typography>
        <Button 
          component={RouterLink} 
          to="/search" 
          variant="contained" 
          sx={{ mt: 3 }}
        >
          Browse Procedures
        </Button>
      </Paper>
    );
  }
  
  return (
    <Grid container spacing={4}>
      {/* Main Content */}
      <Grid item xs={12} md={8}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            mb: 4
          }}
        >
          {/* Header with Industry */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mb: 2
            }}
          >
            <Chip 
              icon={getIndustryIcon(procedure.industry)}
              label={procedure.industry || 'General'} 
              color="primary"
              sx={{ mr: 2, textTransform: 'capitalize' }}
            />
            
            <Chip 
              icon={<CategoryIcon />}
              label={procedure.normalized_category || 'Uncategorized'} 
              component={RouterLink}
              to={`/categories/${procedure.normalized_category}`}
              clickable
              variant="outlined"
            />
          </Box>
          
          {/* Procedure Name */}
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              mb: 3
            }}
          >
            {procedure.procedure_name}
          </Typography>
          
          {/* Description */}
          <Typography variant="body1" paragraph>
            {procedure.description || 'No description available.'}
          </Typography>
          
          {/* Additional Details */}
          {procedure.additional_details && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Additional Details
              </Typography>
              <Typography variant="body1" paragraph>
                {procedure.additional_details}
              </Typography>
            </>
          )}
          
          {/* Benefits */}
          {procedure.benefits && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Benefits
              </Typography>
              <List dense>
                {procedure.benefits.split('\n').map((benefit, index) => (
                  benefit.trim() && (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <InfoIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={benefit.trim()} />
                    </ListItem>
                  )
                ))}
              </List>
            </>
          )}
          
          {/* Risks */}
          {procedure.risks && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Risks and Considerations
              </Typography>
              <List dense>
                {procedure.risks.split('\n').map((risk, index) => (
                  risk.trim() && (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <InfoIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={risk.trim()} />
                    </ListItem>
                  )
                ))}
              </List>
            </>
          )}
        </Paper>
      </Grid>
      
      {/* Sidebar */}
      <Grid item xs={12} md={4}>
        {/* Market Information */}
        <Card 
          elevation={2} 
          sx={{ 
            borderRadius: 2,
            mb: 3,
            overflow: 'visible'
          }}
        >
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'primary.main', 
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <BarChartIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Market Information
            </Typography>
          </Box>
          
          <CardContent>
            {/* Market Size */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Market Size
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoneyIcon 
                  color="primary" 
                  sx={{ 
                    fontSize: '2rem',
                    mr: 1
                  }} 
                />
                <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
                  {formatCurrency(procedure.market_size)}
                </Typography>
              </Box>
            </Box>
            
            {/* Growth Rate */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Annual Growth Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon 
                  color={getGrowthRateColor(procedure.growth_rate)} 
                  sx={{ 
                    fontSize: '2rem',
                    mr: 1
                  }} 
                />
                <Typography 
                  variant="h5" 
                  component="span" 
                  sx={{ 
                    fontWeight: 600,
                    color: `${getGrowthRateColor(procedure.growth_rate)}.main`
                  }}
                >
                  {formatGrowthRate(procedure.growth_rate)}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Market Trends */}
            {procedure.market_trends && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Market Trends
                </Typography>
                <Typography variant="body2">
                  {procedure.market_trends}
                </Typography>
              </Box>
            )}
            
            {/* Target Demographics */}
            {procedure.target_demographics && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Target Demographics
                </Typography>
                <Typography variant="body2">
                  {procedure.target_demographics}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
        
        {/* Related Companies */}
        {procedure.related_companies && procedure.related_companies.length > 0 && (
          <Card 
            elevation={2} 
            sx={{ 
              borderRadius: 2,
              mb: 3
            }}
          >
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: 'secondary.main', 
                color: 'secondary.contrastText',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <BusinessIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                Related Companies
              </Typography>
            </Box>
            
            <CardContent>
              <List dense disablePadding>
                {procedure.related_companies.map((company, index) => (
                  <ListItem key={index} divider={index < procedure.related_companies.length - 1}>
                    <ListItemIcon>
                      <BusinessIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={company.name} 
                      secondary={company.role || 'Provider'}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
        
        {/* Related Procedures */}
        {procedure.related_procedures && procedure.related_procedures.length > 0 && (
          <Card 
            elevation={2} 
            sx={{ 
              borderRadius: 2
            }}
          >
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: 'info.main', 
                color: 'info.contrastText',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <CategoryIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                Related Procedures
              </Typography>
            </Box>
            
            <CardContent>
              <List dense disablePadding>
                {procedure.related_procedures.map((relatedProc, index) => (
                  <ListItem 
                    key={index} 
                    divider={index < procedure.related_procedures.length - 1}
                    component={RouterLink}
                    to={`/procedures/${relatedProc.id}`}
                    sx={{ 
                      textDecoration: 'none', 
                      color: 'inherit',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    <ListItemIcon>
                      {getIndustryIcon(relatedProc.industry)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={relatedProc.procedure_name} 
                      secondary={relatedProc.normalized_category}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </Grid>
    </Grid>
  );
}

export default ProcedureDetails;
