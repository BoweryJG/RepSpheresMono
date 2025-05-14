# Supabase Client Package

A comprehensive React-based client library for Supabase integration in the RepSpheres monorepo.

## Features

- 🔐 **Authentication**: Complete auth flow with email/password and OAuth providers
- 🔄 **Data Management**: Hooks for querying and mutating data
- ⚡ **Realtime**: Subscribe to database changes in real-time
- 📁 **Storage**: File upload, download, and management
- 📊 **Pagination**: Built-in pagination support
- 🔄 **Infinite Scrolling**: Support for infinite query patterns
- 🧩 **TypeScript**: Fully typed API for better developer experience
- 🧪 **Class Component Support**: HOCs for class component integration

## Installation

This package is part of the RepSpheres monorepo and is available as an internal dependency.

```bash
# From your app directory in the monorepo
npm install @repo/supabase-client
```

## Basic Usage

### Setting up the Provider

Wrap your application with the `SupabaseProvider` to make the Supabase client available throughout your app:

```tsx
import { SupabaseProvider } from '@repo/supabase-client';

const App = () => {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

  return (
    <SupabaseProvider supabaseUrl={supabaseUrl} supabaseKey={supabaseKey}>
      <YourApp />
    </SupabaseProvider>
  );
};
```

### Authentication

```tsx
import { useSupabaseAuth } from '@repo/supabase-client';

const AuthComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signInWithPassword, signUp, signOut, user, isLoading, error } = useSupabaseAuth();

  const handleSignIn = async (e) => {
    e.preventDefault();
    await signInWithPassword(email, password);
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <form onSubmit={handleSignIn}>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Email" 
          />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Password" 
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Sign In'}
          </button>
          {error && <p>{error.message}</p>}
        </form>
      )}
    </div>
  );
};
```

### Data Queries

```tsx
import { useSupabaseQuery } from '@repo/supabase-client';

const DataComponent = () => {
  const { data, error, isLoading, refetch } = useSupabaseQuery(
    (supabase) => supabase.from('table_name').select('*')
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {data?.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};
```

### Data Mutations

```tsx
import { useSupabaseMutation } from '@repo/supabase-client';

const FormComponent = () => {
  const [name, setName] = useState('');
  const { mutate, isLoading, error } = useSupabaseMutation(
    (supabase, variables) => supabase.from('table_name').insert(variables)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    await mutate({ name });
    setName('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Name" 
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </button>
      {error && <p>{error.message}</p>}
    </form>
  );
};
```

### Realtime Subscriptions

```tsx
import { useSupabaseRealtime } from '@repo/supabase-client';

const RealtimeComponent = () => {
  const { data, error } = useSupabaseRealtime('table_name', {
    event: '*', // 'INSERT', 'UPDATE', 'DELETE', or '*' for all
    schema: 'public'
  });

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Realtime Updates</h2>
      <ul>
        {data?.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};
```

### Storage Operations

```tsx
import { useSupabaseStorage } from '@repo/supabase-client';

const StorageComponent = () => {
  const [file, setFile] = useState(null);
  const { uploadFile, downloadFile, getPublicUrl, isLoading, error } = useSupabaseStorage('bucket_name');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    await uploadFile(`folder/${file.name}`, file);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file || isLoading}>
        {isLoading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <p>{error.message}</p>}
    </div>
  );
};
```

### Pagination

```tsx
import { useSupabasePagination } from '@repo/supabase-client';

const PaginatedComponent = () => {
  const { 
    data, 
    page, 
    totalPages, 
    isLoading, 
    error, 
    goToPage, 
    nextPage, 
    previousPage 
  } = useSupabasePagination(
    async (supabase, page, pageSize) => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await supabase
        .from('table_name')
        .select('*', { count: 'exact' })
        .range(from, to);
        
      return { data, error, count };
    },
    { pageSize: 10 }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <ul>
        {data?.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      
      <div>
        <button onClick={previousPage} disabled={page === 1}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={nextPage} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  );
};
```

### Infinite Scrolling

```tsx
import { useSupabaseInfiniteQuery } from '@repo/supabase-client';

const InfiniteScrollComponent = () => {
  const { 
    data, 
    isLoading, 
    error, 
    hasMore, 
    fetchNextPage 
  } = useSupabaseInfiniteQuery(
    async (supabase, page, pageSize) => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error } = await supabase
        .from('table_name')
        .select('*')
        .range(from, to);
        
      return { data, error };
    },
    { pageSize: 10 }
  );

  // Intersection Observer for infinite scrolling
  const observerTarget = React.useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [fetchNextPage, hasMore, isLoading]);

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <ul>
        {data?.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      
      {isLoading && <div>Loading more...</div>}
      
      {/* Intersection observer target */}
      {hasMore && <div ref={observerTarget} style={{ height: '10px' }}></div>}
    </div>
  );
};
```

### Class Component Support

For class components, we provide Higher-Order Components (HOCs):

```tsx
import { withSupabase, withSupabaseAuth, type WithSupabaseProps, type WithSupabaseAuthProps } from '@repo/supabase-client';

// Using withSupabase HOC
class DataComponent extends React.Component<WithSupabaseProps> {
  state = {
    data: [],
    loading: true,
    error: null
  };

  async componentDidMount() {
    const { supabase } = this.props;
    
    try {
      const { data, error } = await supabase.from('table_name').select('*');
      
      if (error) throw error;
      
      this.setState({ data, loading: false });
    } catch (error) {
      this.setState({ error, loading: false });
    }
  }

  render() {
    const { data, loading, error } = this.state;
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    
    return (
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    );
  }
}

// Wrap with HOC
const DataComponentWithSupabase = withSupabase(DataComponent);

// Using withSupabaseAuth HOC
class AuthComponent extends React.Component<WithSupabaseAuthProps> {
  handleSignOut = async () => {
    await this.props.signOut();
  };

  render() {
    const { user, isLoading } = this.props;
    
    if (isLoading) return <div>Loading...</div>;
    
    return (
      <div>
        {user ? (
          <div>
            <p>Welcome, {user.email}</p>
            <button onClick={this.handleSignOut}>Sign Out</button>
          </div>
        ) : (
          <p>Please sign in</p>
        )}
      </div>
    );
  }
}

// Wrap with HOC
const AuthComponentWithSupabase = withSupabaseAuth(AuthComponent);
```

## Advanced Usage

For more advanced usage examples, check out the example components in the package:

- `SupabaseExample.tsx`: Basic usage examples
- `AdvancedSupabaseExample.tsx`: Comprehensive examples showcasing all features

## API Reference

### Hooks

- `useSupabase()`: Access the Supabase client and auth state
- `useSupabaseAuth()`: Access authentication functionality
- `useSupabaseQuery()`: Execute Supabase queries with automatic loading and error handling
- `useSupabaseMutation()`: Execute Supabase mutations with automatic loading and error handling
- `useSupabaseRealtime()`: Subscribe to Supabase realtime changes
- `useSupabaseStorage()`: Work with Supabase storage
- `useSupabasePagination()`: Execute paginated queries
- `useSupabaseInfiniteQuery()`: Execute infinite scrolling queries

### Higher-Order Components

- `withSupabase()`: Inject Supabase client into a class component
- `withSupabaseAuth()`: Inject Supabase auth functionality into a class component

### Components

- `SupabaseProvider`: Provider component that wraps your app and makes Supabase client available

## Type Definitions

The package includes comprehensive TypeScript definitions for all components, hooks, and utilities. Import types directly from the package:

```tsx
import { 
  SupabaseClient, 
  Database, 
  WithSupabaseProps, 
  WithSupabaseAuthProps 
} from '@repo/supabase-client';
```

## Integration with Market Insights

For specific examples of how to integrate this package with the Market Insights application, refer to:

- `repspheres-monorepo/apps/market-insights/src/examples/SupabaseIntegration.tsx`

## Contributing

When contributing to this package, please ensure:

1. All hooks and components are properly typed
2. Examples are provided for new functionality
3. Tests are updated to cover new features
4. Documentation is updated to reflect changes

## License

Internal use only - RepSpheres Corporation
