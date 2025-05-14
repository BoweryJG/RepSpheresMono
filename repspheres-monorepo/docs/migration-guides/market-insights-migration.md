# Market Insights Migration Guide

This guide provides step-by-step instructions for migrating the Market Insights application from a standalone project to the RepSpheres monorepo architecture.

## Overview

The migration process involves:

1. Setting up the application structure in the monorepo
2. Migrating the source code
3. Updating dependencies
4. Configuring shared packages
5. Integrating with the unified API Gateway
6. Setting up Supabase client integration
7. Testing the migrated application

## Prerequisites

- Access to the original Market Insights repository
- Access to the RepSpheres monorepo
- Node.js 18+ and npm/yarn installed
- Supabase project credentials

## Step 1: Project Structure Setup

The Market Insights app should be structured as follows in the monorepo:

```
repspheres-monorepo/
├── apps/
│   └── market-insights/
│       ├── public/
│       ├── src/
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
└── packages/
    ├── api-gateway/
    ├── supabase-client/
    ├── ui/
    └── router/
```

## Step 2: Dependency Configuration

Update the `package.json` in `apps/market-insights/` to use the shared packages:

```json
{
  "name": "@repo/market-insights",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "test": "jest"
  },
  "dependencies": {
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.14.16",
    "@mui/material": "^5.14.17",
    "@repo/api-gateway": "*",
    "@repo/router": "*",
    "@repo/supabase-client": "*",
    "@repo/ui": "*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^7.0.0"
  },
  "devDependencies": {
    "@types/jest": "^29.5.6",
    "@types/node": "^20.8.9",
    "@types/react": "^18.2.33",
    "@types/react-dom": "^18.2.14",
    "@typescript-eslint/eslint-plugin": "^6.9.1",
    "@typescript-eslint/parser": "^6.9.1",
    "@vitejs/plugin-react": "^4.1.0",
    "eslint": "^8.52.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "typescript": "^5.2.2",
    "vite": "^4.5.0"
  }
}
```

## Step 3: Migrating Source Code

1. Copy the source files from the original Market Insights project to `apps/market-insights/src/`
2. Convert JavaScript files to TypeScript where applicable
3. Update imports to use the shared packages

Example of updating imports:

```typescript
// Before
import { createClient } from '@supabase/supabase-js';
import { Button } from '../components/ui/Button';

// After
import { createSupabaseClient } from '@repo/supabase-client';
import { Button } from '@repo/ui';
```

## Step 4: Supabase Client Integration

Replace the direct Supabase client usage with the shared client from `@repo/supabase-client`:

### Before:

```javascript
// src/services/supabase/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### After:

```typescript
// src/services/supabase/supabaseClient.ts
import { createSupabaseClient } from '@repo/supabase-client';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
```

For React components, use the provided hooks and context:

```tsx
// src/components/ProceduresList.tsx
import React, { useEffect, useState } from 'react';
import { useSupabase } from '@repo/supabase-client';
import type { Database } from '@repo/supabase-client';

export const ProceduresList = () => {
  const { supabase, isLoading, error } = useSupabase();
  const [procedures, setProcedures] = useState<Database['public']['Tables']['aesthetic_procedures']['Row'][]>([]);
  
  useEffect(() => {
    const fetchProcedures = async () => {
      if (!isLoading && !error) {
        const { data } = await supabase
          .from('aesthetic_procedures')
          .select('*')
          .limit(10);
        
        setProcedures(data || []);
      }
    };
    
    fetchProcedures();
  }, [supabase, isLoading, error]);
  
  // Render procedures...
};
```

Wrap your app with the `SupabaseProvider`:

```tsx
// src/App.tsx
import React from 'react';
import { SupabaseProvider } from '@repo/supabase-client';
import { AppRoutes } from './routes';

const App = () => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
  
  return (
    <SupabaseProvider supabaseUrl={supabaseUrl} supabaseKey={supabaseKey}>
      <AppRoutes />
    </SupabaseProvider>
  );
};

export default App;
```

## Step 5: API Gateway Integration

Replace direct API calls with the API Gateway:

### Before:

```javascript
// src/services/marketInsightsApiService.js
import axios from 'axios';

const API_URL = 'https://osbackend-zl1h.onrender.com';

export const fetchMarketData = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/market-data`);
    return response.data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
};
```

### After:

```typescript
// src/services/api-client.ts
import { createApiClient } from '@repo/api-gateway';

const apiClient = createApiClient({
  baseURL: 'https://osbackend-zl1h.onrender.com',
  timeout: 10000,
  retries: 3
});

export const fetchMarketData = async () => {
  try {
    const response = await apiClient.get('/api/market-data');
    return response.data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
};
```

## Step 6: UI Component Integration

Replace custom UI components with shared components from the UI package:

### Before:

```jsx
// src/components/ui/GradientButton.jsx
import React from 'react';
import styled from '@emotion/styled';

const StyledButton = styled.button`
  background: linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%);
  border-radius: 3px;
  border: 0;
  color: white;
  height: 48px;
  padding: 0 30px;
  box-shadow: 0 3px 5px 2px rgba(255, 105, 135, .3);
`;

export const GradientButton = ({ children, ...props }) => (
  <StyledButton {...props}>{children}</StyledButton>
);
```

### After:

```tsx
// src/components/SomeComponent.tsx
import React from 'react';
import { GradientButton } from '@repo/ui';

export const SomeComponent = () => (
  <div>
    <GradientButton>Click Me</GradientButton>
  </div>
);
```

## Step 7: Routing Integration

Update the routing to use the shared router package:

### Before:

```jsx
// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProcedureDetailsPage from './pages/ProcedureDetailsPage';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/category/:categoryId" element={<CategoryPage />} />
      <Route path="/procedure/:procedureId" element={<ProcedureDetailsPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
```

### After:

```tsx
// src/routes.ts
import { RouteConfig } from '@repo/router';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProcedureDetailsPage from './pages/ProcedureDetailsPage';

export const routes: RouteConfig[] = [
  {
    path: '/',
    component: HomePage,
    exact: true
  },
  {
    path: '/category/:categoryId',
    component: CategoryPage
  },
  {
    path: '/procedure/:procedureId',
    component: ProcedureDetailsPage
  }
];
```

```tsx
// src/App.tsx
import React from 'react';
import { AppRouter } from '@repo/router';
import { SupabaseProvider } from '@repo/supabase-client';
import { routes } from './routes';

const App = () => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
  
  return (
    <SupabaseProvider supabaseUrl={supabaseUrl} supabaseKey={supabaseKey}>
      <AppRouter routes={routes} />
    </SupabaseProvider>
  );
};

export default App;
```

## Step 8: Environment Variables

Create a `.env` file in the `apps/market-insights/` directory:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 9: Testing the Migration

1. Build the shared packages:

```bash
cd repspheres-monorepo
npm run build
```

2. Start the Market Insights app:

```bash
cd apps/market-insights
npm run dev
```

3. Verify that:
   - The app loads correctly
   - Supabase data is fetched and displayed
   - API calls work through the API Gateway
   - Routing works as expected
   - UI components are displayed correctly

## Troubleshooting

### Common Issues

1. **Module not found errors**:
   - Ensure all shared packages are built
   - Check import paths are correct
   - Verify package names in package.json

2. **TypeScript errors**:
   - Update type definitions
   - Use proper type imports from shared packages

3. **Supabase connection issues**:
   - Verify environment variables are set correctly
   - Check Supabase project is active
   - Ensure RLS policies are configured properly

4. **API Gateway errors**:
   - Check API endpoint configuration
   - Verify Render backend is running
   - Check network connectivity

## Next Steps

After successful migration:

1. Update documentation
2. Set up CI/CD pipelines
3. Implement cross-app navigation
4. Optimize build configurations
5. Set up shared state management

## Resources

- [Supabase Client Integration Guide](../supabase-client-integration.md)
- [API Gateway Connection Solution](../api-gateway-connection-solution.md)
- [Monorepo README](../../README.md)
