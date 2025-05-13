import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProceduresByCategory } from '../services/procedureService';
import FeaturedProcedures from '../components/procedures/FeaturedProcedures';
import SearchForm from '../components/procedures/SearchForm';

function CategoryPage() {
  const { categoryName } = useParams();
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategoryProcedures = async () => {
      if (!categoryName) return;
      
      try {
        setLoading(true);
        const categoryData = await getProceduresByCategory(categoryName);
        setProcedures(categoryData);
      } catch (err) {
        console.error('Error loading category procedures:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryProcedures();
  }, [categoryName]);

  const decodedCategoryName = decodeURIComponent(categoryName);

  return (
    <div className="category-page">
      <div className="category-header">
        <h1>{decodedCategoryName} Procedures</h1>
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>

      <div className="search-container">
        <SearchForm 
          className="category-search" 
          defaultFilters={{ category: decodedCategoryName }}
        />
      </div>
      
      {loading ? (
        <div className="loading-container">
          <h2>Loading procedures...</h2>
        </div>
      ) : error ? (
        <div className="error-container">
          <h2>Error Loading Procedures</h2>
          <p>{error}</p>
        </div>
      ) : (
        <div className="category-content">
          {procedures.length === 0 ? (
            <div className="no-procedures">
              <h2>No Procedures Found</h2>
              <p>There are no procedures in this category at the moment.</p>
            </div>
          ) : (
            <FeaturedProcedures 
              procedures={procedures} 
              title={`${procedures.length} Procedures in ${decodedCategoryName}`} 
              className="category-procedures"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;
