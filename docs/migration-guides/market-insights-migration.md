# Market Insights Migration Guide

This guide explains how to migrate the Market Insights application from its standalone structure to the RepSpheres monorepo architecture.

## Overview

The Market Insights application is being migrated to the RepSpheres monorepo to:

1. Improve code sharing between applications
2. Standardize API communication with the Render backend
3. Solve cross-origin communication problems
4. Create a unified routing system
5. Implement shared state management

## Migration Steps

### 1. Project Structure

The Market Insights app has been moved to the following location in the monorepo:

```
repspheres-monorepo/
├── apps/
│   └── market-insights/       # Market Insights app code
└── packages/
    ├── api-gateway/          # Shared API communication layer
    ├── supabase-client/      # Shared Supabase client
    ├── ui/                   # Shared UI components
    └── router/               # Unified routing system
```

### 2. Dependencies

Update your dependencies to use the shared packages:

```diff
// package.json
{
  "dependencies": {
-   "@supabase/supabase-js": "^2.x.x",
+   "@repspheres/supabase-client": "workspace:*",
+   "@repspheres/api-gateway": "workspace:*",
+   "@repspheres/ui": "workspace:*",
+   "@repspheres/router": "workspace:*",
    // other dependencies...
  }
}
```

### 3. API Communication

Replace direct API calls with the new Market Insights API client:

```diff
// Before
- import { apiService } from '../services/apiService';
- 
- const fetchData = async () => {
-   try {
-     const response = await apiService.get('/market-data');
-     return response.data;
-   } catch (error) {
-     console.error('Error fetching data:', error);
-     throw error;
-   }
- };

// After
+ import { marketInsightsApi } from '@repspheres/market-insights/services/market-insights-api';
+ 
+ const fetchData = async () => {
+   try {
+     const marketData = await marketInsightsApi.getMarketData();
+     return marketData;
+   } catch (error) {
+     console.error('Error fetching data:', error);
+     throw error;
+   }
+ };
```

### 4. Supabase Integration

Replace direct Supabase client usage with the shared Supabase client:

```diff
// Before
- import { supabase } from '../services/supabase/supabaseClient';
- 
- const fetchProcedures = async () => {
-   const { data, error } = await supabase
-     .from('procedures')
-     .select('*');
-   
-   if (error) throw error;
-   return data;
- };

// After
+ import { supabaseClient } from '@repspheres/supabase-client';
+ 
+ const fetchProcedures = async () => {
+   const { data, error } = await supabaseClient
+     .from('procedures')
+     .select('*');
+   
+   if (error) throw error;
+   return data;
+ };
```

### 5. Routing

Update your routing to use the shared router:

```diff
// Before
- import { BrowserRouter, Routes, Route } from 'react-router-dom';
- 
- const AppRoutes = () => (
-   <BrowserRouter>
-     <Routes>
-       <Route path="/" element={<HomePage />} />
-       <Route path="/categories/:id" element={<CategoryPage />} />
-       <Route path="/procedures/:id" element={<ProcedureDetailsPage />} />
-       <Route path="*" element={<NotFoundPage />} />
-     </Routes>
-   </BrowserRouter>
- );

// After
+ import { AppRouter, Route } from '@repspheres/router';
+ import { routes } from './routes';
+ 
+ const AppRoutes = () => (
+   <AppRouter routes={routes} appName="market-insights">
+     <Route path="/" element={<HomePage />} />
+     <Route path="/categories/:id" element={<CategoryPage />} />
+     <Route path="/procedures/:id" element={<ProcedureDetailsPage />} />
+     <Route path="*" element={<NotFoundPage />} />
+   </AppRouter>
+ );
```

Define your routes in a separate file:

```typescript
// src/routes.ts
import { AppRouteConfig } from '@repspheres/router';

export const routes: AppRouteConfig[] = [
  {
    path: '/',
    component: 'HomePage',
    exact: true,
  },
  {
    path: '/categories/:id',
    component: 'CategoryPage',
  },
  {
    path: '/procedures/:id',
    component: 'ProcedureDetailsPage',
  },
  {
    path: '*',
    component: 'NotFoundPage',
  },
];
```

### 6. UI Components

Replace local UI components with shared components:

```diff
// Before
- import { SimpleCard } from '../components/ui/SimpleCard';
- import { GradientButton } from '../components/ui/GradientButton';

// After
+ import { Card, Button } from '@repspheres/ui';
```

### 7. Environment Variables

Update your environment variables to use the monorepo structure:

```diff
// Before
- VITE_SUPABASE_URL=https://your-project.supabase.co
- VITE_SUPABASE_ANON_KEY=your-anon-key
- VITE_RENDER_API_URL=https://osbackend-zl1h.onrender.com

// After
+ VITE_SUPABASE_URL=https://your-project.supabase.co
+ VITE_SUPABASE_ANON_KEY=your-anon-key
+ VITE_RENDER_API_URL=https://osbackend-zl1h.onrender.com
+ VITE_APP_NAME=market-insights
```

### 8. Build Configuration

Update your Vite configuration:

```diff
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
+ import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
+  resolve: {
+    alias: {
+      '@': resolve(__dirname, './src'),
+    },
+  },
+  build: {
+    outDir: '../../dist/apps/market-insights',
+  },
});
```

### 9. TypeScript Configuration

Update your TypeScript configuration:

```diff
// tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
+   "paths": {
+     "@/*": ["./src/*"],
+     "@repspheres/*": ["../../packages/*"]
+   }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Testing the Migration

After completing the migration steps, you should test the application to ensure everything is working correctly:

1. Start the development server:

```bash
# From the monorepo root
npm run dev -- --filter=market-insights
```

2. Test the API connection:

```bash
# From the monorepo root
npx ts-node scripts/test-render-connection.ts
```

3. Verify that all features are working correctly:
   - Check that market data is loading
   - Verify that procedures are displayed
   - Test the search functionality
   - Ensure that navigation works correctly

## Common Issues

### CORS Errors

If you encounter CORS errors, check that the API Gateway is correctly configured:

```typescript
// packages/api-gateway/src/gateway.ts
const apiGateway = createApiGateway({
  baseURL: process.env.VITE_RENDER_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Module Resolution Errors

If you encounter module resolution errors, check your TypeScript paths configuration:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@repspheres/*": ["../../packages/*"]
  }
}
```

### Build Errors

If you encounter build errors, check that all dependencies are correctly installed:

```bash
# From the monorepo root
npm install
```

## Next Steps

After successfully migrating the Market Insights app, you should:

1. Update the documentation
2. Add tests for the new API client
3. Optimize the build configuration
4. Implement CI/CD for the monorepo

## Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Router Documentation](https://reactrouter.com/en/main)
