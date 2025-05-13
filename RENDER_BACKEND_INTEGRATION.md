# Render Backend Integration Guide

This document outlines the integration of the Market Insights frontend with the Render backend.

## Overview

The Market Insights frontend has been updated to use the Render backend API at `https://osbackend-zl1h.onrender.com`. This integration enables:

1. Storing and retrieving market data via the `/api/data/market_insights` endpoint
2. Checking module access via the `/api/modules/access` endpoint

## Implementation Details

### Files Modified

1. **src/services/marketInsightsApiService.js** (New)
   - Created a dedicated service for interacting with the market insights API endpoints
   - Implemented methods for storing and retrieving market data
   - Added module access check functionality

2. **src/services/backendService.js**
   - Added methods that use the new market insights API endpoints
   - Integrated with the marketInsightsApiService

3. **src/services/apiService.js**
   - Updated to always use the Render backend URL

4. **src/services/config.js**
   - Added API configuration constants for the Render backend
   - Defined endpoint paths for market insights and module access

5. **src/components/DashboardSupabaseUnified.jsx**
   - Updated to use the backendService for API interactions
   - Added code to store and retrieve market insights data
   - Implemented module access checking

### API Request Format

#### Storing Market Data
```javascript
fetch('https://osbackend-zl1h.onrender.com/api/data/market_insights', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: "user_email_or_id",
    data: { /* market insights data */ }
  })
});
```

#### Retrieving Market Data
```javascript
fetch('https://osbackend-zl1h.onrender.com/api/data/market_insights?userId=user_email_or_id');
```

#### Checking Module Access
```javascript
fetch('https://osbackend-zl1h.onrender.com/api/modules/access');
```

## Deployment Configuration

The Netlify deployment configuration in `netlify.toml` already includes the necessary environment variable:

```toml
[build.environment]
  VITE_API_BASE_URL = "https://osbackend-zl1h.onrender.com"
```

## Testing

To test the integration:

1. Deploy the frontend to Netlify
2. Verify that the dashboard loads data correctly
3. Check browser console for any API errors
4. Confirm that market insights data is being stored and retrieved

## Troubleshooting

If you encounter issues with the backend integration:

1. Check browser console for API errors
2. Verify that the Render backend is running and accessible
3. Confirm that the API endpoints are correctly formatted
4. Check that the userId parameter is being passed correctly

## Next Steps

1. Implement user authentication to secure the market insights data
2. Add more comprehensive error handling for API failures
3. Create a data synchronization mechanism for offline support
