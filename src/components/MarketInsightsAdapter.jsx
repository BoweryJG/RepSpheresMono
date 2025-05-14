import React from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { createClient } from '@supabase/supabase-js';
import './MarketInsightsAdapter.css';

/**
 * MarketInsightsAdapter Component
 * 
 * This component serves as an adapter for the Market Insights dashboard,
 * providing a simplified version that works with the main application without
 * requiring the monorepo's package aliases.
 */
const MarketInsightsAdapter = ({ supabaseUrl, supabaseKey }) => {
  // Create a Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  const [categories, setCategories] = React.useState([]);
  const [procedures, setProcedures] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedCategory, setSelectedCategory] = React.useState(null);

  // Fetch categories and procedures on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('aesthetic_categories')
          .select('*');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch procedures
        let query = supabase.from('aesthetic_procedures').select('*');
        if (selectedCategory !== null) {
          query = query.eq('category_id', selectedCategory);
        }
        
        const { data: proceduresData, error: proceduresError } = await query;
        
        if (proceduresError) throw proceduresError;
        setProcedures(proceduresData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase, selectedCategory]);

  // Handle category filter change
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value === '' ? null : parseInt(value, 10));
  };

  // Safe access to properties with null/undefined checks
  const safeAccess = (obj, property, defaultValue = 'N/A') => {
    return obj && obj[property] !== undefined && obj[property] !== null 
      ? obj[property] 
      : defaultValue;
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
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Market Insights Dashboard
      </Typography>
      
      <Box sx={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: 2, 
        p: 3,
        backgroundColor: '#fff'
      }}>
        {/* Categories List */}
        <div className="categories-list">
          <h2>Categories</h2>
          <ul>
            {categories.map((category) => (
              <li key={category.id} className="category-item">
                <h3>{category.name || 'Unnamed Category'}</h3>
                <p>{category.description || 'No description available'}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Procedures List */}
        <div className="procedures-list">
          <div className="procedures-header">
            <h2>Procedures</h2>
            <div className="filter-controls">
              <label htmlFor="category-filter">Filter by Category:</label>
              <select 
                id="category-filter" 
                value={selectedCategory?.toString() || ''} 
                onChange={handleCategoryChange}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button onClick={() => {
                setLoading(true);
                // Re-fetch data with the current filter
                const fetchData = async () => {
                  try {
                    let query = supabase.from('aesthetic_procedures').select('*');
                    if (selectedCategory !== null) {
                      query = query.eq('category_id', selectedCategory);
                    }
                    
                    const { data: proceduresData, error: proceduresError } = await query;
                    
                    if (proceduresError) throw proceduresError;
                    setProcedures(proceduresData || []);
                  } catch (err) {
                    console.error('Error fetching data:', err);
                    setError(err.message || 'Failed to fetch data');
                  } finally {
                    setLoading(false);
                  }
                };
                fetchData();
              }} className="refresh-button">
                Refresh
              </button>
            </div>
          </div>
          
          <table className="procedures-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Average Cost</th>
                <th>Recovery Time</th>
                <th>Popularity</th>
              </tr>
            </thead>
            <tbody>
              {procedures.map((procedure, index) => (
                <tr key={procedure.id || index}>
                  <td>{safeAccess(procedure, 'name')}</td>
                  <td>{safeAccess(procedure, 'description', 'No description available')}</td>
                  <td>{procedure && procedure.average_cost ? `$${procedure.average_cost.toLocaleString()}` : 'N/A'}</td>
                  <td>{safeAccess(procedure, 'recovery_time')}</td>
                  <td>{procedure && procedure.popularity_score ? `${procedure.popularity_score}/10` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {procedures.length === 0 && (
            <div className="no-data">No procedures found</div>
          )}
        </div>
      </Box>
    </Box>
  );
};

export default MarketInsightsAdapter;
