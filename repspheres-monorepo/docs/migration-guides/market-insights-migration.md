# Market Insights Migration Guide

This guide outlines the process for migrating the Market Insights application into the RepSpheres monorepo structure.

## Overview

The migration process involves:

1. Setting up the application structure in the monorepo
2. Moving the existing code into the new structure
3. Updating imports to use shared packages
4. Testing the migrated application
5. Deploying from the monorepo

## Prerequisites

- Access to the existing Market Insights repository
- Access to the RepSpheres monorepo repository
- Node.js 18+ and npm 8+
- Understanding of the application's architecture and dependencies

## Step 1: Prepare the Monorepo Structure

The Market Insights application will be located in the `apps/market-insights` directory of the monorepo. The shared code will be in the `packages` directory.

```
repspheres-monorepo/
├── apps/
│   └── market-insights/    # Market Insights application
└── packages/
    ├── api-gateway/        # Shared API Gateway
    ├── router/             # Shared routing
    ├── supabase-client/    # Shared Supabase client
    ├── ui/                 # Shared UI components
    └── utils/              # Shared utilities
```

## Step 2: Set Up the Application Configuration

1. Create the necessary configuration files in the `apps/market-insights` directory:

   - `package.json`: Application dependencies and scripts
   - `tsconfig.json`: TypeScript configuration
   - `vite.config.ts`: Vite configuration
   - `.env.example`: Example environment variables

2. Configure the application to use the shared packages:

   ```json
   // apps/market-insights/package.json
   {
     "name": "@repspheres/market-insights",
     "version": "0.1.0",
     "private": true,
     "scripts": {
       "dev": "vite",
       "build": "tsc && vite build",
       "preview": "vite preview",
       "test": "vitest run",
       "lint": "eslint src --ext ts,tsx"
     },
     "dependencies": {
       "@repspheres/api-gateway": "workspace:*",
       "@repspheres/router": "workspace:*",
       "@repspheres/supabase-client": "workspace:*",
       "@repspheres/ui": "workspace:*",
       "@repspheres/utils": "workspace:*",
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

   ```typescript
   // apps/market-insights/vite.config.ts
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   import path from 'path';

   export default defineConfig({
     plugins: [react()],
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
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

   ```json
   // apps/market-insights/tsconfig.json
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
       "baseUrl": ".",
       "paths": {
         "@/*": ["src/*"]
       }
     },
     "include": ["src"],
     "references": [{ "path": "./tsconfig.node.json" }]
   }
   ```

## Step 3: Migrate the Application Code

1. Create the basic directory structure:

   ```
   apps/market-insights/
   ├── public/
   ├── src/
   │   ├── assets/
   │   ├── components/
   │   ├── hooks/
   │   ├── pages/
   │   ├── services/
   │   ├── types/
   │   ├── utils/
   │   ├── App.tsx
   │   ├── main.tsx
   │   └── vite-env.d.ts
   ├── .env.example
   ├── index.html
   ├── package.json
   ├── tsconfig.json
   ├── tsconfig.node.json
   └── vite.config.ts
   ```

2. Copy the existing application code from the Market Insights repository to the corresponding directories in the monorepo.

3. Update imports to use the shared packages:

   - Replace direct API calls with the API Gateway
   - Replace direct Supabase calls with the shared Supabase client
   - Replace UI components with shared UI components where applicable
   - Update routing to use the shared router

4. Example of updating API calls:

   **Before:**
   ```typescript
   // src/services/marketInsightsApiService.js
   import axios from 'axios';

   const API_URL = 'https://osbackend-zl1h.onrender.com';

   export const getCategories = async () => {
     try {
       const response = await axios.get(`${API_URL}/api/categories`);
       return response.data;
     } catch (error) {
       console.error('Error fetching categories:', error);
       throw error;
     }
   };
   ```

   **After:**
   ```typescript
   // src/services/api-client.ts
   import { ApiGateway } from '@repspheres/api-gateway';
   import { ApiGatewayConfig } from '@repspheres/api-gateway/src/types';

   export class MarketInsightsApiClient {
     private apiGateway: ApiGateway;
     private static instance: MarketInsightsApiClient;

     constructor(config: ApiGatewayConfig) {
       this.apiGateway = new ApiGateway(config);
     }

     public static getInstance(config?: ApiGatewayConfig): MarketInsightsApiClient {
       if (!MarketInsightsApiClient.instance) {
         if (!config) {
           throw new Error('Configuration is required when creating the first instance');
         }
         MarketInsightsApiClient.instance = new MarketInsightsApiClient(config);
       }
       return MarketInsightsApiClient.instance;
     }

     public async getCategories(): Promise<any[]> {
       const response = await this.apiGateway.get('/api/categories');
       
       if (!response.success) {
         throw new Error(`Failed to get categories: ${response.error?.message}`);
       }
       
       return response.data;
     }
   }

   export default MarketInsightsApiClient.getInstance({
     baseURL: 'https://osbackend-zl1h.onrender.com',
     timeout: 10000,
   });
   ```

5. Example of updating Supabase calls:

   **Before:**
   ```typescript
   // src/services/supabase/supabaseClient.js
   import { createClient } from '@supabase/supabase-js';

   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

   export const supabase = createClient(supabaseUrl, supabaseKey);
   ```

   **After:**
   ```typescript
   // src/services/supabase-client.ts
   import { supabase } from '@repspheres/supabase-client';

   export default supabase;
   ```

## Step 4: Update the Application Entry Point

1. Update the `index.html` file:

   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <link rel="icon" type="image/svg+xml" href="/src/assets/market-insights-logo.svg" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Market Insights</title>
     </head>
     <body>
       <div id="root"></div>
       <script type="module" src="/src/main.tsx"></script>
     </body>
   </html>
   ```

2. Update the `main.tsx` file:

   ```typescript
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import App from './App';
   import './index.css';

   ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
       <App />
     </React.StrictMode>
   );
   ```

3. Update the `App.tsx` file to use the shared router:

   ```typescript
   import React from 'react';
   import { Router, Route } from '@repspheres/router';
   import HomePage from './pages/HomePage';
   import CategoryPage from './pages/CategoryPage';
   import ProcedureDetailsPage from './pages/ProcedureDetailsPage';
   import SearchPage from './pages/SearchPage';
   import NotFoundPage from './pages/NotFoundPage';

   const App: React.FC = () => {
     return (
       <Router>
         <Route path="/" component={HomePage} />
         <Route path="/category/:id" component={CategoryPage} />
         <Route path="/procedure/:id" component={ProcedureDetailsPage} />
         <Route path="/search" component={SearchPage} />
         <Route path="*" component={NotFoundPage} />
       </Router>
     );
   };

   export default App;
   ```

## Step 5: Test the Migrated Application

1. Install dependencies:

   ```bash
   cd repspheres-monorepo
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev -- --filter=market-insights
   ```

3. Test all functionality to ensure it works correctly:
   - Navigation between pages
   - API calls
   - Supabase integration
   - UI components

4. Fix any issues that arise during testing.

## Step 6: Deploy the Application

1. Build the application:

   ```bash
   npm run build -- --filter=market-insights
   ```

2. Deploy to Netlify:

   ```bash
   npm run deploy:netlify -- --filter=market-insights
   ```

## Troubleshooting

### Common Issues

1. **Module not found errors**:
   - Check that all imports are correctly updated to use the shared packages
   - Ensure the package is listed in the dependencies in `package.json`

2. **Type errors**:
   - Update type definitions to match the shared packages
   - Use the shared types from `@repspheres/types` where applicable

3. **API Gateway connection issues**:
   - Check that the API Gateway is correctly configured with the right base URL
   - Ensure that the API endpoints match the expected format

4. **Supabase client issues**:
   - Verify that the Supabase client is correctly initialized with the right credentials
   - Check that the table names and column names match the expected format

## Next Steps

After successfully migrating the Market Insights application, consider:

1. Refactoring components to use the shared UI library
2. Improving error handling with the API Gateway
3. Enhancing the application with features from other applications in the monorepo
4. Contributing to the shared packages to improve functionality for all applications

## Resources

- [RepSpheres Monorepo README](../../README.md)
- [API Gateway Documentation](../../packages/api-gateway/README.md)
- [Shared Router Documentation](../../packages/router/README.md)
- [Shared Supabase Client Documentation](../../packages/supabase-client/README.md)
- [Shared UI Components Documentation](../../packages/ui/README.md)
