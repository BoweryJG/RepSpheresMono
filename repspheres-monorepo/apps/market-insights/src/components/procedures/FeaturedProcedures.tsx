import React from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Procedure } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface FeaturedProceduresProps {
  procedures: Procedure[];
}

export const FeaturedProcedures: React.FC<FeaturedProceduresProps> = ({ procedures }) => {
  const navigate = useNavigate();

  const handleProcedureClick = (procedureId: string) => {
    navigate(`/procedure/${procedureId}`);
  };

  return (
    <Grid container spacing={3}>
      {procedures.map((procedure) => (
        <Grid item xs={12} sm={6} md={3} key={procedure.id}>
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
            onClick={() => handleProcedureClick(procedure.id)}
          >
            <CardMedia
              component="img"
              height="140"
              image={procedure.imageUrl || 'https://via.placeholder.com/300x140?text=Procedure'}
              alt={procedure.name}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h6" component="div">
                {procedure.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {procedure.description.length > 100 
                  ? `${procedure.description.substring(0, 100)}...` 
                  : procedure.description}
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <Typography variant="body1" fontWeight="bold">
                  {formatCurrency(procedure.averageCost)}
                </Typography>
                <Chip 
                  label={`${procedure.growthRate > 0 ? '+' : ''}${procedure.growthRate}%`}
                  color={procedure.growthRate > 0 ? "success" : "error"}
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
