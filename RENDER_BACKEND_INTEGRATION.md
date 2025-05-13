# Render Backend Integration Guide

This document provides information about the integration of the Market Insights frontend with the Render backend.

## Backend URL

The Market Insights frontend is now configured to use the following backend URL:

```
https://osbackend-zl1h.onrender.com
```

## API Endpoints

The following API endpoints are used by the frontend:

1. **Market Insights Data**
   - Endpoint: `/api/data/market_insights`
   - Methods: GET, POST
   - Purpose: Store and retrieve market insights data

2. **Module Access**
   - Endpoint: `/api/modules/access`
   - Method: GET
   - Purpose: Check module access (always returns true)

## API Request Format

### Storing Market Insights Data

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

### Retrieving Market Insights Data

```javascript
fetch('https://osbackend-zl1h.onrender.com/api/data/market_insights?userId=user_email_or_id');
```

## Implementation Notes

1. The module access endpoint (`/api/modules/access`) returns a 400 status code when accessed directly. However, our frontend code is configured to handle this by always returning `{ access: true }` regardless of the API response.

2. The market insights endpoints are working correctly for both storing and retrieving data.

3. The data structure returned by the market insights GET endpoint is:

```json
{
  "success": true,
  "data": {
    "id": "unique-id",
    "app_name": "market_insights",
    "user_id": "user_email_or_id",
    "data": { /* market insights data */ },
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

## Deployment Instructions

To deploy the updated frontend to Netlify:

1. Ensure all changes have been committed to the repository.

2. Run the deployment script:

```bash
./deploy-to-netlify.sh
```

3. Verify the deployment by accessing the Netlify URL and testing the functionality.

## Testing

You can test the backend integration using the provided test scripts:

1. `test-backend-connection.js` - Tests the basic connectivity to the backend endpoints.
2. `test-render-backend.js` - Tests the specific functionality of the market insights and module access endpoints.

Run the tests using:

```bash
node test-backend-connection.js
node test-render-backend.js
```
