# Market Insights Migration Guide

This guide provides step-by-step instructions for migrating the Market Insights application to the RepSpheres monorepo architecture.

## Overview

The migration process involves:

1. Moving core components to the monorepo structure
2. Updating imports to use shared packages
3. Testing integration with shared services
4. Ensuring proper configuration for the monorepo environment

## Prerequisites

- Node.js 16+ and npm 8+
- Access to the RepSpheres monorepo repository
- Access to the original Market Insights repository

## Migration Steps

### 1. Project Setup

The basic monorepo structure has already been set up with:

- Turborepo configuration
- Basic package structure
- Shared packages for common functionality

Ensure you have the latest version of the monorepo by running:

```bash
git pull origin main
npm install
```

### 2. Component Migration

#### 2.1 Core Components

Move the following core components from the original Market Insights app to the monorepo:

| Original Path | New Path |
|---------------|----------|
| `src/components/procedures/*` | `repspheres-monorepo/apps/market-insights/src/components/procedures/*` |
| `src/pages/*` | `repspheres-monorepo/apps/market-insights/src/pages/*` |
| `src/services/*` | `repspheres-monorepo/apps/market-insights/src/services/*` |

When migrating components:

1. Convert JavaScript (`.jsx`) files to TypeScript (`.tsx`)
2. Add proper type definitions
3. Update imports to use the monorepo package structure

Example of converting a component:

**Original (JavaScript):**

```jsx
// src/components/procedures/FeaturedProcedures.jsx
import React, { useState, useEffect } from 'react';
import { fetchProcedures } from '../../services/procedureService';

export const FeaturedProcedures = () => {
  const [procedures, setProcedures] = useState([]);
  
  useEffect(() => {
    const loadProcedures = async () => {
      const data = await fetchProcedures();
      setProcedures(data);
    };
    
    loadProcedures();
  }, []);
  
  return (
    <div className="featured-procedures">
      <h2>Featured Procedures</h2>
      <ul>
        {procedures.map(procedure => (
          <li key={procedure.id}>{procedure.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default FeaturedProcedures;
```

**Migrated (TypeScript):**

```tsx
// repspheres-monorepo/apps/market-insights/src/components/procedures/FeaturedProcedures.tsx
import React, { useState, useEffect } from 'react';
import { fetchProcedures } from '../../services/procedureService';
import { Procedure } from '../../types';
import { Card } from '@repo/ui';

export const FeaturedProcedures: React.FC = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  
  useEffect(() => {
    const loadProcedures = async () => {
      const data = await fetchProcedures();
      setProcedures(data);
    };
    
    loadProcedures();
  }, []);
  
  return (
    <div className="featured-procedures">
      <h2>Featured Procedures</h2>
      <div className="procedures-grid">
        {procedures.map(procedure => (
          <Card key={procedure.id}>
            <h3>{procedure.name}</h3>
            <p>{procedure.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProcedures;
```

#### 2.2 Shared UI Components

Identify UI components that can be shared across applications and move them to the shared UI package:

1. Identify reusable components in `src/components/ui/`
2. Move them to `repspheres-monorepo/packages/ui/src/components/`
3. Update the components to use TypeScript and follow the package's structure
4. Export them from the package's entry point

### 3. Service Integration

#### 3.1 Supabase Integration

Replace direct Supabase client usage with the shared Supabase client package:

**Original:**

```jsx
// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**Migrated:**

```tsx
// repspheres-monorepo/apps/market-insights/src/services/api-client.ts
import { createSupabaseClient } from '@repo/supabase-client';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
```

For React components, use the provided hooks:

**Original:**

```jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const ProceduresList = () => {
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProcedures = async () => {
      try {
        const { data, error } = await supabase
          .from('procedures')
          .select('*');
          
        if (error) throw error;
        setProcedures(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProcedures();
  }, []);
  
  // Component rendering...
};
```

**Migrated:**

```tsx
import React from 'react';
import { useSupabaseQuery } from '@repo/supabase-client';
import { Procedure } from '../types';

const ProceduresList: React.FC = () => {
  const { data: procedures, isLoading, error } = useSupabaseQuery<Procedure[]>(
    (supabase) => supabase.from('procedures').select('*')
  );
  
  // Component rendering with the same loading/error handling...
};
```

#### 3.2 API Gateway Integration

Replace direct API calls with the API Gateway package:

**Original:**

```jsx
// src/services/marketInsightsApiService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const fetchMarketData = async (category) => {
  try {
    const response = await axios.get(`${API_URL}/market-data?category=${category}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
};
```

**Migrated:**

```tsx
// repspheres-monorepo/apps/market-insights/src/services/market-insights-api.ts
import { createApiClient } from '@repo/api-gateway';
import { MarketData } from '../types';

const apiClient = createApiClient({
  baseURL: process.env.API_URL || '',
  retries: 3,
  timeout: 5000
});

export const fetchMarketData = async (category: string): Promise<MarketData[]> => {
  return apiClient.get(`/market-data`, { params: { category } });
};
```

### 4. Routing Integration

Update the application to use the shared router package:

**Original:**

```jsx
// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProcedureDetailsPage from './pages/ProcedureDetailsPage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/procedure/:id" element={<ProcedureDetailsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
```

**Migrated:**

```tsx
// repspheres-monorepo/apps/market-insights/src/App.tsx
import React from 'react';
import { AppRouter, RouteConfig } from '@repo/router';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProcedureDetailsPage from './pages/ProcedureDetailsPage';
import NotFoundPage from './pages/NotFoundPage';
import { routes } from './routes';

const App: React.FC = () => {
  return (
    <AppRouter 
      routes={routes}
      notFoundComponent={NotFoundPage}
      appName="market-insights"
    />
  );
};

export default App;
```

With routes defined in a separate file:

```tsx
// repspheres-monorepo/apps/market-insights/src/routes.ts
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
    path: '/category/:id',
    component: CategoryPage
  },
  {
    path: '/procedure/:id',
    component: ProcedureDetailsPage
  }
];
```

### 5. Styling and Theming

Update the application to use the shared theme:

**Original:**

```jsx
// src/theme.js
export const theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    // ...
  },
  // ...
};
```

**Migrated:**

```tsx
// repspheres-monorepo/apps/market-insights/src/theme.ts
import { baseTheme } from '@repo/ui';

export const theme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    primary: '#007bff',
    secondary: '#6c757d',
    // App-specific overrides...
  },
  // ...
};
```

### 6. Configuration Updates

#### 6.1 Package.json

Update the `package.json` file to include the necessary dependencies and scripts:

```json
{
  "name": "market-insights",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest run"
  },
  "dependencies": {
    "@repo/supabase-client": "*",
    "@repo/api-gateway": "*",
    "@repo/router": "*",
    "@repo/ui": "*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.3",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5",
    "vitest": "^0.34.1"
  }
}
```

#### 6.2 TypeScript Configuration

Ensure the `tsconfig.json` file is properly configured:

```json
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
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### 6.3 Vite Configuration

Configure Vite for the monorepo environment:

```ts
// repspheres-monorepo/apps/market-insights/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### 7. Testing the Migration

After completing the migration steps:

1. Run the development server:

```bash
cd repspheres-monorepo
npm run dev -- --filter=market-insights
```

2. Verify that all components render correctly
3. Test all functionality to ensure it works as expected
4. Check for any console errors or warnings

### 8. Common Issues and Solutions

#### 8.1 Import Path Issues

**Problem:** Components fail to import from shared packages.

**Solution:** Ensure the package is properly exported from its entry point and that the import path is correct.

#### 8.2 Type Errors

**Problem:** TypeScript errors when migrating from JavaScript.

**Solution:** Add proper type definitions for all variables, props, and function parameters/returns.

#### 8.3 Environment Variables

**Problem:** Environment variables not being recognized.

**Solution:** Update environment variable references to use the Vite format:

```tsx
// Old
const apiUrl = process.env.REACT_APP_API_URL;

// New
const apiUrl = import.meta.env.VITE_API_URL;
```

#### 8.4 Build Errors

**Problem:** Build fails in the monorepo environment.

**Solution:** Check for circular dependencies, ensure all required packages are installed, and verify that the build configuration is correct.

### 9. Next Steps

After successfully migrating the Market Insights app:

1. Update documentation to reflect the new structure
2. Create integration tests to ensure compatibility with other apps
3. Optimize build and deployment processes
4. Consider migrating more shared functionality to the common packages

## Conclusion

By following this guide, you should be able to successfully migrate the Market Insights application to the RepSpheres monorepo architecture. This migration enables better code sharing, consistent styling, and improved development workflows across all RepSpheres applications.

For any issues not covered in this guide, please refer to the monorepo documentation or contact the development team.
