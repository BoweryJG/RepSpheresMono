# RepSpheres Monorepo

This monorepo contains all RepSpheres applications and shared packages, providing a unified architecture for the entire platform.

## Overview

The RepSpheres monorepo consolidates multiple React applications into a single codebase, addressing connection problems between the Netlify frontend and Render backend, as well as routing issues between applications.

## Applications

The monorepo includes the following applications:

- **Market Insights**: Analytics and market data for aesthetic and dental procedures
- **Workspace**: Collaborative workspace for teams
- **Linguistics**: Language processing and analysis tools
- **SphereOS/CRM**: Customer relationship management system
- **Global RepSpheres**: Main application and portal

## Shared Packages

The monorepo includes the following shared packages:

- **api-gateway**: Unified API client for backend communication with resilience features
- **supabase-client**: Shared Supabase client with React integration
- **ui**: Shared UI components and design system
- **router**: Unified routing system for cross-application navigation
- **state**: Shared state management
- **types**: TypeScript type definitions shared across applications
- **utils**: Utility functions and helpers

## Project Structure

```
repspheres-monorepo/
├── apps/
│   ├── market-insights/     # Market Insights application
│   ├── workspace/           # Workspace application
│   ├── linguistics/         # Linguistics application
│   ├── crm/                 # SphereOS/CRM application
│   └── main/                # Global RepSpheres application
├── packages/
│   ├── api-gateway/         # API Gateway for backend communication
│   ├── supabase-client/     # Shared Supabase client
│   ├── ui/                  # Shared UI components
│   ├── router/              # Unified routing system
│   ├── state/               # Shared state management
│   ├── types/               # Shared TypeScript types
│   └── utils/               # Shared utility functions
├── docs/                    # Documentation
│   ├── migration-guides/    # Guides for migrating applications
│   └── api-integration/     # API integration documentation
└── scripts/                 # Build and utility scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/repspheres/repspheres-monorepo.git
cd repspheres-monorepo
```

2. Install dependencies:

```bash
npm install
```

3. Build all packages:

```bash
npm run build
```

### Development

To start development on a specific application:

```bash
# Start the Market Insights application
npm run dev --filter=market-insights
```

To work on a shared package:

```bash
# Start the UI package in watch mode
npm run dev --filter=ui
```

## Key Features

### API Gateway

The API Gateway provides a unified interface for all backend communication, with built-in resilience features:

- Automatic retry logic for transient failures
- Circuit breaker pattern to prevent cascading failures
- Request caching to reduce backend load
- Consistent error handling across all applications

[Learn more about the API Gateway](./docs/api-gateway-connection-solution.md)

### Supabase Client

The shared Supabase client provides:

- Consistent client configuration
- React integration through context and hooks
- TypeScript support with shared database types
- Higher-order components for class components

[Learn more about the Supabase Client](./docs/supabase-client-integration.md)

### Unified Routing

The router package enables seamless navigation between applications:

- Shared route definitions
- Cross-application navigation
- Route-based code splitting
- Deep linking support

### Shared UI Components

The UI package provides a consistent design system across all applications:

- Material UI based components
- Shared theming
- Responsive layouts
- Accessibility-focused design

## Application Migration

Each application is being migrated into the monorepo structure. See the migration guides for details:

- [Market Insights Migration Guide](./docs/migration-guides/market-insights-migration.md)

## Scripts

- `npm run build`: Build all packages and applications
- `npm run dev`: Start development mode for all packages and applications
- `npm run lint`: Run linting on all packages and applications
- `npm run test`: Run tests on all packages and applications
- `npm run clean`: Clean build artifacts

## Deployment

The monorepo is configured for deployment to Netlify (frontend) and Render (backend):

- Frontend applications are deployed to Netlify
- Backend services are deployed to Render
- Shared packages are published to a private npm registry

## Contributing

1. Create a new branch for your feature or bugfix
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
