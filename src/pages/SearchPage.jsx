import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { searchProcedures } from '../services/procedureService';
import SearchForm from '../components/procedures/SearchForm';
import FeaturedProcedures from '../components/procedures/FeaturedProcedures';

function SearchPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get filters from URL params
  const initialFilters = {
    industry: searchParams.get('industry') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'relevance'
  };

  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const searchResults = await searchProcedures(query, initialFilters);
        setResults(searchResults);
      } catch (err) {
        console.error('Error searching procedures:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, location.search]);

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search Procedures</h1>
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>

      <div className="search-container">
        <SearchForm 
          className="search-page-form" 
          defaultQuery={query}
          defaultFilters={initialFilters}
        />
      </div>
      
      <div className="search-results-container">
        {loading ? (
          <div className="loading-container">
            <h2>Searching...</h2>
          </div>
        ) : error ? (
          <div className="error-container">
            <h2>Error Searching Procedures</h2>
            <p>{error}</p>
          </div>
        ) : (
          <div className="results-section">
            <h2>Search Results {query ? `for "${query}"` : ''}</h2>
            {results.length === 0 ? (
              <div className="no-results">
                <p>No procedures found matching your search criteria.</p>
                <p>Try using different keywords or removing some filters.</p>
              </div>
            ) : (
              <FeaturedProcedures 
                procedures={results} 
                title={`${results.length} Results Found`} 
                className="search-results"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
