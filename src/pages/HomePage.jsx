import React, { useState, useEffect } from 'react';
import { getFeaturedProcedures, getTrendingProcedures, getAllCategories } from '../services/procedureService';
import FeaturedProcedures from '../components/procedures/FeaturedProcedures';
import CategoriesList from '../components/procedures/CategoriesList';
import SearchForm from '../components/procedures/SearchForm';

function HomePage() {
  const [featuredDental, setFeaturedDental] = useState([]);
  const [featuredAesthetic, setFeaturedAesthetic] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [dentalData, aestheticData, categoriesData] = await Promise.all([
          getFeaturedProcedures('dental', 4),
          getFeaturedProcedures('aesthetic', 4),
          getAllCategories()
        ]);
        
        setFeaturedDental(dentalData);
        setFeaturedAesthetic(aestheticData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error loading home page data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading market insights...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Data</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Discover Advanced Procedures</h1>
        <p>Explore the latest in dental and aesthetic innovations</p>
        <div className="search-container">
          <SearchForm className="hero-search" />
        </div>
      </section>
      
      <section className="featured-section">
        <FeaturedProcedures 
          procedures={featuredDental} 
          title="Featured Dental Procedures" 
          className="dental-procedures"
        />
      </section>
      
      <section className="featured-section aesthetic">
        <FeaturedProcedures 
          procedures={featuredAesthetic} 
          title="Featured Aesthetic Procedures" 
          className="aesthetic-procedures"
        />
      </section>
      
      <section className="categories-section">
        <CategoriesList 
          categories={categories} 
          title="Browse by Category" 
          className="home-categories"
        />
      </section>
    </div>
  );
}

export default HomePage;
