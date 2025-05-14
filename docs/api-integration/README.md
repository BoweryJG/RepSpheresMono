# RepSpheres API Integration

This directory contains documentation and examples for API integrations in the RepSpheres monorepo.

## Overview

The RepSpheres monorepo includes several applications that need to communicate with backend services. To facilitate this communication, we've implemented a robust API integration layer that handles:

- Connection to the Render backend
- Error handling and retries
- Caching for improved performance
- Type safety with TypeScript

## Available Integrations

### Market Insights API

The Market Insights API client provides a robust interface for communicating with the Render backend API. See the [Market Insights API Guide](./market-insights-api-guide.md) for detailed documentation.

### API Gateway

The API Gateway package provides a unified interface for all API communications in the monorepo. It handles:

- Request/response processing
- Error handling
- Retries for failed requests
- Caching
- Authentication

## Testing Connections

To test the connection to the Render backend, you can use the provided test script:

```bash
# Navigate to the monorepo root
cd /path/to/repspheres-monorepo

# Run the test script
npx ts-node scripts/test-render-connection.ts
```

This script will verify that all API endpoints are accessible and functioning correctly.

## Example Components

For examples of how to use the API clients in React components, see:

- `apps/market-insights/src/examples/MarketInsightsApiExample.tsx`
- `apps/market-insights/src/examples/ApiGatewayExample.tsx`

## Troubleshooting

If you encounter issues with API connections:

1. Check that the Render backend is running and accessible
2. Verify your network connection
3. Check for CORS issues in the browser console
4. Ensure the API URL is correctly configured

For more detailed troubleshooting steps, see the specific API client documentation.

## Contributing

When adding new API integrations to the monorepo:

1. Follow the established patterns for API clients
2. Add comprehensive TypeScript types
3. Implement error handling and retries
4. Add tests for all new functionality
5. Document the API client in this directory

## Further Resources

- [API Gateway Documentation](../api-gateway-connection-solution.md)
- [Market Insights Migration Guide](../migration-guides/market-insights-migration.md)
