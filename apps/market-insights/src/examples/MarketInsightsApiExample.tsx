import React, { useEffect, useState } from 'react';
import { marketInsightsApi, MarketData, ProcedureData, NewsArticle } from '../services/market-insights-api';

/**
 * Example component demonstrating the use of the Market Insights API client
 */
const MarketInsightsApiExample: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<{ status: string; version: string } | null>(null);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [procedures, setProcedures] = useState<ProcedureData[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check API status
        const status = await marketInsightsApi.checkStatus();
        setApiStatus(status);

        // Fetch market data
        const marketDataResult = await marketInsightsApi.getMarketData();
        setMarketData(marketDataResult);

        // Fetch procedures
        const proceduresResult = await marketInsightsApi.getProcedures() as ProcedureData[];
        setProcedures(proceduresResult);

        // Fetch news
        const newsResult = await marketInsightsApi.getNews(undefined, 5);
        setNews(newsResult);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading data from Render backend...</div>;
  }

  if (error) {
    return (
      <div>
        <h2>Error connecting to Render backend</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Market Insights API Example</h1>
      
      {apiStatus && (
        <div>
          <h2>API Status</h2>
          <p>Status: {apiStatus.status}</p>
          <p>Version: {apiStatus.version}</p>
        </div>
      )}
      
      <h2>Market Data</h2>
      {marketData.length > 0 ? (
        <ul>
          {marketData.slice(0, 5).map((item) => (
            <li key={item.id}>
              <strong>{item.name}</strong> - {item.category}
              <br />
              Market Size: ${item.marketSize.toLocaleString()}
              <br />
              Growth: {item.growth}%
            </li>
          ))}
        </ul>
      ) : (
        <p>No market data available</p>
      )}
      
      <h2>Procedures</h2>
      {procedures.length > 0 ? (
        <ul>
          {procedures.slice(0, 5).map((procedure) => (
            <li key={procedure.id}>
              <strong>{procedure.name}</strong> - {procedure.category}
              <br />
              Average Cost: ${procedure.averageCost.toLocaleString()}
              <br />
              Growth Rate: {procedure.growthRate}%
            </li>
          ))}
        </ul>
      ) : (
        <p>No procedures available</p>
      )}
      
      <h2>Latest News</h2>
      {news.length > 0 ? (
        <ul>
          {news.map((article) => (
            <li key={article.id}>
              <strong>{article.title}</strong>
              <br />
              Source: {article.source} | Published: {new Date(article.publishedAt).toLocaleDateString()}
              <br />
              {article.summary && <p>{article.summary.substring(0, 150)}...</p>}
              <a href={article.url} target="_blank" rel="noopener noreferrer">Read more</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No news articles available</p>
      )}
      
      <div>
        <h2>API Actions</h2>
        <button onClick={async () => {
          try {
            setLoading(true);
            const status = await marketInsightsApi.checkStatus();
            setApiStatus(status);
            alert(`API Status: ${status.status}, Version: ${status.version}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
          } finally {
            setLoading(false);
          }
        }}>
          Check API Status
        </button>
        
        <button onClick={async () => {
          try {
            setLoading(true);
            const categories = await marketInsightsApi.getCategories();
            alert(`Available Categories: ${categories.join(', ')}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
          } finally {
            setLoading(false);
          }
        }}>
          Get Categories
        </button>
        
        <button onClick={async () => {
          const query = prompt('Enter search query:');
          if (query) {
            try {
              setLoading(true);
              const results = await marketInsightsApi.search(query);
              alert(`Found ${results.length} results for "${query}"`);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
              setLoading(false);
            }
          }
        }}>
          Search
        </button>
      </div>
    </div>
  );
};

export default MarketInsightsApiExample;
