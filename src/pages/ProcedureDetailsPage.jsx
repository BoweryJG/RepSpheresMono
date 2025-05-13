import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Paper, Breadcrumbs } from '@mui/material';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { getProcedureDetails } from '../services/procedureService';
import ProcedureDetails from '../components/procedures/ProcedureDetails';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

function ProcedureDetailsPage() {
  const { id } = useParams();
  const [procedure, setProcedure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProcedureDetails() {
      setLoading(true);
      setError(null);
      
      try {
        const procedureData = await getProcedureDetails(id);
        setProcedure(procedureData);
      } catch (err) {
        console.error("Error loading procedure details:", err);
        setError("Failed to load procedure details. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    loadProcedureDetails();
  }, [id]);

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
          Procedures
        </RouterLink>
        {procedure && procedure.normalized_category && (
          <RouterLink 
            to={`/categories/${procedure.normalized_category}`} 
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {procedure.normalized_category}
          </RouterLink>
        )}
        <Typography color="text.primary">
          {procedure ? procedure.procedure_name : 'Loading...'}
        </Typography>
      </Breadcrumbs>
      
      {/* Error State */}
      {error && (
        <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText', mb: 4 }}>
          <Typography>{error}</Typography>
        </Paper>
      )}
      
      {/* Procedure Details Component */}
      <ProcedureDetails procedure={procedure} loading={loading} />
    </Container>
  );
}

export default ProcedureDetailsPage;
