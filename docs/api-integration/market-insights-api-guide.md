# Market Insights API Integration Guide

This guide explains how to use the Market Insights API client to connect to the Render backend from any application in the RepSpheres monorepo.

## Overview

The Market Insights API client provides a robust interface for communicating with the Render backend API. It includes:

- Automatic retry logic for handling intermittent connection issues
- Request/response caching to improve performance
- Comprehensive error handling
- TypeScript interfaces for all data models

## Installation

The Market Insights API client is available as a module within the monorepo. To use it in your application:

1. Import the client from the Market Insights service:

```typescript
import { marketInsightsApi } from '@repspheres/market-insights/services/market-insights-api';
```

Or if you need specific types:

```typescript
import { 
  marketInsightsApi, 
  MarketData, 
  ProcedureData, 
  NewsArticle 
} from '@repspheres/market-insights/services/market-insights-api';
```

## Basic Usage

The API client provides methods for all available endpoints:

```typescript
// Check API status
const status = await marketInsightsApi.checkStatus();

// Get market data
const marketData = await marketInsightsApi.getMarketData();

// Get market data for a specific category
const dentalMarketData = await marketInsightsApi.getMarketData('dental');

// Get all procedures
const procedures = await marketInsightsApi.getProcedures();

// Get a specific procedure
const procedure = await marketInsightsApi.getProcedures('procedure-id-123');

// Get procedure categories
const categories = await marketInsightsApi.getCategories();

// Get company data
const companies = await marketInsightsApi.getCompanies();

// Get news articles
const news = await marketInsightsApi.getNews();

// Get news articles for a specific category with limit
const aestheticNews = await marketInsightsApi.getNews('aesthetic', 5);

// Search across all data
const searchResults = await marketInsightsApi.search('dental implants');
```

## Error Handling

The API client includes built-in error handling. Here's how to handle errors in your components:

```typescript
try {
  const data = await marketInsightsApi.getMarketData();
  // Process data
} catch (error) {
  console.error('API Error:', error);
  // Handle error (show error message, retry, etc.)
}
```

## React Component Integration

Here's an example of how to use the API client in a React component:

```typescript
import React, { useEffect, useState } from 'react';
import { marketInsightsApi, MarketData } from '@repspheres/market-insights/services/market-insights-api';

const MarketDataComponent: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MarketData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await marketInsightsApi.getMarketData();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Market Data</h2>
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.name} - {item.category}</li>
        ))}
      </ul>
    </div>
  );
};
```

## Advanced Usage

### Custom Configuration

The API client is configured with sensible defaults, but you can create a custom instance if needed:

```typescript
import { createMarketInsightsApi } from '@repspheres/market-insights/services/market-insights-api';

// Create a custom instance
const customApi = createMarketInsightsApi();
```

### Caching

The API client automatically caches GET requests for 5 minutes. The cache is stored in localStorage and is used to improve performance for repeated requests.

## Data Models

The API client includes TypeScript interfaces for all data models:

### MarketData

```typescript
interface MarketData {
  id: string;
  name: string;
  category: string;
  growth: number;
  marketSize: number;
  region?: string;
  year?: number;
}
```

### ProcedureData

```typescript
interface ProcedureData {
  id: string;
  name: string;
  category: string;
  description: string;
  averageCost: number;
  popularity: number;
  growthRate: number;
}
```

### CompanyData

```typescript
interface CompanyData {
  id: string;
  name: string;
  ticker?: string;
  marketCap?: number;
  revenue?: number;
  employees?: number;
  founded?: number;
  headquarters?: string;
  website?: string;
  description?: string;
}
```

### NewsArticle

```typescript
interface NewsArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary?: string;
  imageUrl?: string;
  category?: string;
  relevance?: number;
}
```

## Troubleshooting

### Connection Issues

If you're experiencing connection issues with the Render backend:

1. Check that the Render backend is running and accessible
2. Verify that your network connection is stable
3. Check for any CORS issues in the browser console
4. Ensure the API URL is correctly configured

### API Errors

Common API errors and their solutions:

- **401 Unauthorized**: Check authentication credentials
- **404 Not Found**: Verify the endpoint path is correct
- **500 Internal Server Error**: Contact the backend team

## Example Components

For complete examples of using the Market Insights API client, see:

- `apps/market-insights/src/examples/MarketInsightsApiExample.tsx`
- `apps/market-insights/src/examples/ApiGatewayExample.tsx`

## Further Help

If you need additional assistance with the Market Insights API client, please contact the Market Insights team or refer to the API documentation in the Render backend repository.
