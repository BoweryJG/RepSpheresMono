import React, { useEffect, useState } from 'react';
import { SupabaseProvider, useSupabase, createSupabaseClient } from '@repo/supabase-client';
import type { Database } from '@repo/supabase-client';

// Example component using the useSupabase hook
const MarketInsightsDashboard = () => {
  const { supabase, isLoading, error } = useSupabase();
  const [aestheticData, setAestheticData] = useState<any[]>([]);
  const [dentalData, setDentalData] = useState<any[]>([]);
  const [newsData, setNewsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch aesthetic procedures
        const { data: aestheticProcedures, error: aestheticError } = await supabase
          .from('aesthetic_procedures')
          .select('*')
          .limit(5);
        
        if (aestheticError) throw aestheticError;
        setAestheticData(aestheticProcedures || []);
        
        // Fetch dental procedures
        const { data: dentalProcedures, error: dentalError } = await supabase
          .from('dental_procedures')
          .select('*')
          .limit(5);
        
        if (dentalError) throw dentalError;
        setDentalData(dentalProcedures || []);
        
        // Fetch market news
        const { data: marketNews, error: newsError } = await supabase
          .from('market_news')
          .select('*')
          .order('published_date', { ascending: false })
          .limit(5);
        
        if (newsError) throw newsError;
        setNewsData(marketNews || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && !error) {
      fetchData();
    }
  }, [supabase, isLoading, error]);

  if (isLoading || loading) {
    return <div className="loading">Loading market insights data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }

  return (
    <div className="market-insights-dashboard">
      <h1>Market Insights Dashboard</h1>
      
      <section className="dashboard-section">
        <h2>Aesthetic Procedures</h2>
        <div className="data-grid">
          {aestheticData.map((procedure) => (
            <div key={procedure.id} className="data-card">
              <h3>{procedure.name}</h3>
              <p>Category: {procedure.category}</p>
              <p>Average Cost: ${procedure.average_cost?.toLocaleString()}</p>
              <p>Popularity Score: {procedure.popularity_score}</p>
            </div>
          ))}
        </div>
      </section>
      
      <section className="dashboard-section">
        <h2>Dental Procedures</h2>
        <div className="data-grid">
          {dentalData.map((procedure) => (
            <div key={procedure.id} className="data-card">
              <h3>{procedure.name}</h3>
              <p>Category: {procedure.category}</p>
              <p>Average Cost: ${procedure.average_cost?.toLocaleString()}</p>
              <p>Insurance Coverage: {procedure.insurance_coverage ? 'Yes' : 'No'}</p>
            </div>
          ))}
        </div>
      </section>
      
      <section className="dashboard-section">
        <h2>Latest Market News</h2>
        <div className="news-list">
          {newsData.map((news) => (
            <div key={news.id} className="news-item">
              <h3>{news.title}</h3>
              <p className="news-meta">
                Source: {news.source} | Published: {new Date(news.published_date).toLocaleDateString()}
              </p>
              <p>{news.summary}</p>
              <a href={news.url} target="_blank" rel="noopener noreferrer">Read more</a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// Direct client usage example
export const directClientExample = () => {
  // This example shows how to use the client directly without the React context
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
  
  const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
  
  // Example function to fetch market growth data
  const fetchMarketGrowthData = async () => {
    const { data, error } = await supabase
      .from('aesthetic_market_growth')
      .select('*')
      .order('year', { ascending: true });
      
    if (error) {
      console.error('Error fetching market growth data:', error);
      return null;
    }
    
    return data;
  };
  
  return {
    fetchMarketGrowthData
  };
};

// Main integration component
export const SupabaseIntegration = () => {
  // Replace with your actual Supabase credentials
  // In a real app, these would be loaded from environment variables
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

  return (
    <SupabaseProvider supabaseUrl={supabaseUrl} supabaseKey={supabaseKey}>
      <div className="supabase-integration">
        <MarketInsightsDashboard />
      </div>
    </SupabaseProvider>
  );
};

export default SupabaseIntegration;
