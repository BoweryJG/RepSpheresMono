import React, { useState, useEffect } from 'react';
import { 
  Paper, TextField, Button, Grid, Typography, Box, 
  FormControl, InputLabel, Select, MenuItem, InputAdornment,
  Divider, Chip, IconButton, Collapse, FormHelperText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

function SearchForm({ 
  industries = [], 
  categories = [], 
  initialQuery = '', 
  initialFilters = {}, 
  onSearch = () => {} 
}) {
  const [query, setQuery] = useState(initialQuery || '');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState({
    industry: initialFilters.industry || '',
    category: initialFilters.category || '',
    sortBy: initialFilters.sortBy || '',
    minMarketSize: initialFilters.minMarketSize || '',
    minGrowthRate: initialFilters.minGrowthRate || ''
  });
  
  // Filter categories based on selected industry
  const filteredCategories = categories.filter(cat => {
    if (!filters.industry) return true;
    const catIndustry = cat.industry?.toLowerCase() || '';
    return catIndustry === filters.industry.toLowerCase();
  });
  
  // List of sorting options
  const sortOptions = [
    { value: 'marketSizeDesc', label: 'Highest Market Size' },
    { value: 'marketSizeAsc', label: 'Lowest Market Size' },
    { value: 'growthRateDesc', label: 'Highest Growth Rate' },
    { value: 'growthRateAsc', label: 'Lowest Growth Rate' },
    { value: 'nameAsc', label: 'Name (A-Z)' },
    { value: 'nameDesc', label: 'Name (Z-A)' }
  ];
  
  // Handle search submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clean up filters - remove empty values
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );
    
    onSearch({
      query,
      filters: cleanedFilters
    });
  };
  
  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset category when industry changes
    if (name === 'industry') {
      setFilters(prev => ({
        ...prev,
        category: ''
      }));
    }
  };
  
  // Clear all filters and search
  const handleClearAll = () => {
    setQuery('');
    setFilters({
      industry: '',
      category: '',
      sortBy: '',
      minMarketSize: '',
      minGrowthRate: ''
    });
  };
  
  // Count active filters
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(val => val !== '').length;
  };
  
  // Toggle filters expanded
  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };
  
  // Get category display name
  const getCategoryDisplayName = (category) => {
    if (!category) return '';
    
    const foundCategory = categories.find(cat => {
      const catValue = cat.category_value || cat.value || cat;
      return catValue === category;
    });
    
    if (foundCategory) {
      return foundCategory.category_name || foundCategory.name || foundCategory;
    }
    
    return category;
  };
  
  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <form onSubmit={handleSubmit}>
        {/* Main Search Bar */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search procedures..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: query && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setQuery('')}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ bgcolor: 'background.paper' }}
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Button
              variant="contained"
              fullWidth
              disableElevation
              color="primary"
              type="submit"
              startIcon={<SearchIcon />}
              sx={{ py: 1.5 }}
            >
              Search
            </Button>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Button
              variant="outlined"
              fullWidth
              disableElevation
              color="inherit"
              onClick={toggleFilters}
              startIcon={<FilterListIcon />}
              endIcon={filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ py: 1.5 }}
            >
              Filters 
              {getActiveFilterCount() > 0 && (
                <Chip 
                  size="small" 
                  label={getActiveFilterCount()} 
                  color="primary" 
                  sx={{ ml: 1 }}
                />
              )}
            </Button>
          </Grid>
        </Grid>
        
        {/* Advanced Filters */}
        <Collapse in={filtersExpanded}>
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 3 }}>
              <Chip label="Advanced Filters" />
            </Divider>
            
            <Grid container spacing={3}>
              {/* Industry Filter */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="industry-label">Industry</InputLabel>
                  <Select
                    labelId="industry-label"
                    value={filters.industry}
                    label="Industry"
                    onChange={(e) => handleFilterChange('industry', e.target.value)}
                  >
                    <MenuItem value="">All Industries</MenuItem>
                    {industries.map((industry, index) => (
                      <MenuItem key={index} value={industry.value || industry}>
                        {industry.label || industry}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Category Filter */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    value={filters.category}
                    label="Category"
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    disabled={filteredCategories.length === 0}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {filteredCategories.map((category, index) => {
                      const value = category.category_value || category.value || category;
                      const label = category.category_name || category.name || category;
                      return (
                        <MenuItem key={index} value={value}>
                          {label}
                        </MenuItem>
                      );
                    })}
                  </Select>
                  {filters.industry && filteredCategories.length === 0 && (
                    <FormHelperText>
                      No categories available for this industry
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              {/* Sort By Filter */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="sort-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-label"
                    value={filters.sortBy}
                    label="Sort By"
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <MenuItem value="">Default Sorting</MenuItem>
                    {sortOptions.map((option, index) => (
                      <MenuItem key={index} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Min Market Size Filter */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Minimum Market Size"
                  variant="outlined"
                  type="number"
                  placeholder="Enter minimum market size..."
                  value={filters.minMarketSize}
                  onChange={(e) => handleFilterChange('minMarketSize', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>
              
              {/* Min Growth Rate Filter */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Minimum Growth Rate"
                  variant="outlined"
                  type="number"
                  placeholder="Enter minimum growth rate..."
                  value={filters.minGrowthRate}
                  onChange={(e) => handleFilterChange('minGrowthRate', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                />
              </Grid>
            </Grid>
            
            {/* Filter Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button 
                color="inherit" 
                onClick={handleClearAll}
                sx={{ mr: 2 }}
              >
                Clear All
              </Button>
              
              <Button 
                variant="contained"
                disableElevation
                color="primary"
                type="submit"
                startIcon={<SearchIcon />}
              >
                Apply Filters
              </Button>
            </Box>
          </Box>
        </Collapse>
        
        {/* Active Filters Summary */}
        {getActiveFilterCount() > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Active filters:
            </Typography>
            
            {filters.industry && (
              <Chip 
                size="small" 
                label={`Industry: ${filters.industry}`}
                onDelete={() => handleFilterChange('industry', '')}
              />
            )}
            
            {filters.category && (
              <Chip 
                size="small" 
                label={`Category: ${getCategoryDisplayName(filters.category)}`}
                onDelete={() => handleFilterChange('category', '')}
              />
            )}
            
            {filters.sortBy && (
              <Chip 
                size="small" 
                label={`Sort: ${sortOptions.find(opt => opt.value === filters.sortBy)?.label || filters.sortBy}`}
                onDelete={() => handleFilterChange('sortBy', '')}
              />
            )}
            
            {filters.minMarketSize && (
              <Chip 
                size="small" 
                label={`Min Market Size: $${filters.minMarketSize}`}
                onDelete={() => handleFilterChange('minMarketSize', '')}
              />
            )}
            
            {filters.minGrowthRate && (
              <Chip 
                size="small" 
                label={`Min Growth Rate: ${filters.minGrowthRate}%`}
                onDelete={() => handleFilterChange('minGrowthRate', '')}
              />
            )}
          </Box>
        )}
      </form>
    </Paper>
  );
}

export default SearchForm;
