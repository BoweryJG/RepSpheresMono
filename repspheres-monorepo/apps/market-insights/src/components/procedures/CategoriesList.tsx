import React from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Category } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';

interface CategoriesListProps {
  categories: Category[];
}

export const CategoriesList: React.FC<CategoriesListProps> = ({ categories }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <Grid container spacing={3}>
      {categories.map((category) => (
        <Grid item xs={12} sm={6} md={4} key={category.id}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              }
            }}
            onClick={() => handleCategoryClick(category.id)}
          >
            <CardMedia
              component="img"
              height="160"
              image={category.imageUrl || 'https://via.placeholder.com/400x160?text=Category'}
              alt={category.name}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h5" component="div">
                {category.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {category.description.length > 120 
                  ? `${category.description.substring(0, 120)}...` 
                  : category.description}
              </Typography>
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Market Size
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatCurrency(category.marketSize)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" align="right">
                    Procedures
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" align="right">
                    {formatNumber(category.procedureCount)}
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Chip 
                  label={`${category.growthRate > 0 ? '+' : ''}${category.growthRate}% Growth`}
                  color={category.growthRate > 0 ? "success" : "error"}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
