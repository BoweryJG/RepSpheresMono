# RepSpheres Monorepo

A unified monorepo architecture for RepSpheres applications, designed to solve cross-origin communication problems, backend connection issues, and provide a consistent development experience across all applications.

## Project Structure

```
repspheres-monorepo/
├── apps/                  # Application-specific code
│   ├── api-client/        # API client application
│   ├── crm/               # CRM application
│   ├── linguistics/       # Linguistics application
│   ├── main/              # Main application (globalrepspheres)
│   ├── market-insights/   # Market Insights application
│   ├── state/             # State management application
│   ├── types/             # TypeScript types application
│   ├── ui/                # UI components application
│   ├── utils/             # Utilities application
│   └── workspace/         # Workspace application
│
└── packages/              # Shared code and services
    ├── api-gateway/       # API Gateway for unified backend communication
    ├── router/            # Shared routing system
    ├── supabase-client/   # Shared Supabase client
    ├── ui/                # Shared UI components
    └── utils/             # Shared utilities
```

## Key Features

- **Unified API Gateway**: Centralized communication layer between frontend applications and backend services
- **Shared Routing**: Seamless navigation between applications
- **Shared UI Components**: Consistent look and feel across all applications
- **Shared State Management**: Centralized state handling
- **Shared TypeScript Types**: Type consistency across applications
- **Shared Supabase Client**: Unified database access

## Getting Started

### Prerequisites

- Node.js 18+
- npm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/repspheres/repspheres-monorepo.git
cd repspheres-monorepo

# Install dependencies
npm install
```

### Development

```bash
# Start all applications in development mode
npm run dev

# Start a specific application
npm run dev -- --filter=market-insights

# Build all applications
npm run build

# Build a specific application
npm run build -- --filter=market-insights

# Run tests
npm test
```

## API Gateway

The API Gateway provides a unified interface for making HTTP requests to backend services. It handles:

- Authentication
- Error handling
- Retries
- Circuit breaking
- Request/response transformation
- Logging

### Usage

```typescript
import { ApiGateway } from '@repspheres/api-gateway';

const apiGateway = new ApiGateway({
  baseURL: 'https://osbackend-zl1h.onrender.com',
  timeout: 5000,
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
  },
});

// Make a GET request
const response = await apiGateway.get('/api/users');

if (response.success) {
  console.log('Users:', response.data);
} else {
  console.error('Error:', response.error);
}
```

See the [API Gateway README](./packages/api-gateway/README.md) for more details.

## Shared Router

The shared router provides a unified routing system for all applications. It handles:

- Cross-application navigation
- Route guards
- Route parameters
- Nested routes

### Usage

```typescript
import { Router, Route } from '@repspheres/router';

const AppRouter = () => (
  <Router>
    <Route path="/" component={Home} />
    <Route path="/market-insights" component={MarketInsights} />
    <Route path="/workspace" component={Workspace} />
  </Router>
);
```

## Shared UI Components

The shared UI components provide a consistent look and feel across all applications. They include:

- Buttons
- Cards
- Forms
- Layouts
- Navigation
- Tables

### Usage

```typescript
import { Button, Card } from '@repspheres/ui';

const MyComponent = () => (
  <Card title="My Card">
    <p>Card content</p>
    <Button variant="primary">Click Me</Button>
  </Card>
);
```

## Shared Supabase Client

The shared Supabase client provides unified database access across all applications. It handles:

- Authentication
- Data fetching
- Data mutations
- Realtime subscriptions

### Usage

```typescript
import { supabase } from '@repspheres/supabase-client';

// Fetch data
const { data, error } = await supabase
  .from('procedures')
  .select('*')
  .limit(10);

// Insert data
const { data, error } = await supabase
  .from('procedures')
  .insert([{ name: 'New Procedure', category_id: 1 }]);
```

## Integration with Existing Applications

The monorepo is designed to gradually integrate existing applications. The process involves:

1. Creating a new application in the `apps` directory
2. Moving the existing application code into the new directory
3. Updating imports to use the shared packages
4. Testing the application to ensure it works correctly
5. Deploying the application from the monorepo

## Deployment

The monorepo uses Turborepo for build orchestration and can be deployed to various platforms:

### Netlify

```bash
# Deploy all applications to Netlify
npm run deploy:netlify

# Deploy a specific application to Netlify
npm run deploy:netlify -- --filter=market-insights
```

### Render

```bash
# Deploy all applications to Render
npm run deploy:render

# Deploy a specific application to Render
npm run deploy:render -- --filter=market-insights
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
