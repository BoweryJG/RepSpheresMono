# Supabase Client Package

A shared Supabase client package for the RepSpheres monorepo.

## Features

- React context provider for Supabase
- TypeScript support with database type definitions
- Hooks for easy access to Supabase client
- Direct client creation for non-React environments

## Installation

This package is part of the RepSpheres monorepo and is installed automatically when you install the monorepo dependencies.

```bash
# From the root of the monorepo
npm install
```

## Usage

### In React Components

```tsx
import { SupabaseProvider, useSupabase } from '@repo/supabase-client';

// Wrap your app with the provider
function App() {
  return (
    <SupabaseProvider 
      supabaseUrl={process.env.SUPABASE_URL} 
      supabaseKey={process.env.SUPABASE_KEY}
    >
      <YourApp />
    </SupabaseProvider>
  );
}

// Use the hook in your components
function YourComponent() {
  const { supabase, isLoading, error } = useSupabase();
  
  // Use supabase client
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('your_table')
      .select('*');
    
    // Handle data and error
  };
  
  return (
    // Your component JSX
  );
}
```

### In Non-React Environments

```ts
import { createSupabaseClient } from '@repo/supabase-client';

const supabase = createSupabaseClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Use supabase client
const fetchData = async () => {
  const { data, error } = await supabase
    .from('your_table')
    .select('*');
  
  // Handle data and error
};
```

## Type Safety

This package includes TypeScript definitions for your Supabase database schema. The `Database` type is exported from the package and can be used to ensure type safety when working with Supabase.

## Development Notes

- TypeScript errors in example files are expected during development and will be resolved when the package is built and used in a project.
- The package uses React context to provide the Supabase client to components.
- The `useSupabase` hook returns the Supabase client, loading state, and error state.

## API Reference

### `SupabaseProvider`

React context provider for Supabase.

```tsx
<SupabaseProvider 
  supabaseUrl="https://your-supabase-url.supabase.co" 
  supabaseKey="your-supabase-anon-key"
>
  {children}
</SupabaseProvider>
```

### `useSupabase`

React hook to access the Supabase client.

```tsx
const { supabase, isLoading, error } = useSupabase();
```

### `createSupabaseClient`

Function to create a Supabase client in non-React environments.

```ts
const supabase = createSupabaseClient(
  "https://your-supabase-url.supabase.co",
  "your-supabase-anon-key"
);
```

## Integration with API Gateway

This package is designed to work seamlessly with the API Gateway package to provide a unified data access layer for the RepSpheres applications.
