import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GradientButton } from '../ui/GradientButton';

const SearchForm = ({ defaultQuery = '', defaultFilters = {}, className = '' }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(defaultQuery);
  const [filters, setFilters] = useState({
    industry: defaultFilters.industry || '',
    category: defaultFilters.category || '',
    sort: defaultFilters.sort || 'relevance'
  });

  const industries = [
    { id: '', name: 'All Industries' },
    { id: 'dental', name: 'Dental' },
    { id: 'aesthetic', name: 'Aesthetic' }
  ];

  const sortOptions = [
    { id: 'relevance', name: 'Relevance' },
    { id: 'name_asc', name: 'Name (A-Z)' },
    { id: 'name_desc', name: 'Name (Z-A)' }
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const searchParams = new URLSearchParams();
    if (query.trim()) {
      searchParams.append('q', query.trim());
    }
    
    if (filters.industry) {
      searchParams.append('industry', filters.industry);
    }
    
    if (filters.category) {
      searchParams.append('category', filters.category);
    }
    
    if (filters.sort !== 'relevance') {
      searchParams.append('sort', filters.sort);
    }

    navigate({
      pathname: '/search',
      search: searchParams.toString()
    });
  };

  return (
    <form 
      className={`search-form ${className}`} 
      onSubmit={handleSubmit}
    >
      <div className="search-input-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search for procedures..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <GradientButton 
          type="submit" 
          className="search-button"
        >
          Search
        </GradientButton>
      </div>

      <div className="search-filters">
        <div className="filter-group">
          <label htmlFor="industry">Industry:</label>
          <select
            id="industry"
            name="industry"
            value={filters.industry}
            onChange={handleFilterChange}
          >
            {industries.map(industry => (
              <option key={industry.id} value={industry.id}>
                {industry.name}
              </option>
            ))}
          </select>
        </div>

        {defaultFilters.category && (
          <div className="filter-group">
            <input
              type="hidden"
              name="category"
              value={defaultFilters.category}
            />
            <div className="active-filter">
              Category: {defaultFilters.category} 
              <button 
                type="button" 
                className="remove-filter"
                onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="filter-group">
          <label htmlFor="sort">Sort by:</label>
          <select
            id="sort"
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );
};

export default SearchForm;
