# Supabase Client Integration Guide

This guide provides detailed instructions for integrating the Supabase client package into applications within the RepSpheres monorepo.

## Overview

The `@repo/supabase-client` package provides a comprehensive set of tools for interacting with Supabase in React applications. It includes:

- Type-safe client creation
- React hooks for data fetching and mutations
- Authentication utilities
- Realtime subscriptions
- Storage operations
- Higher-order components for class components

## Getting Started

### Installation

The package is available as an internal dependency within the monorepo:

```bash
# From your app directory
npm install @repo/supabase-client
```

### Basic Setup

To use the Supabase client in your application, you need to wrap your app with the `SupabaseProvider`:

```tsx
// src/App.tsx
import React from 'react';
import { SupabaseProvider } from '@repo/supabase-client';

const App: React.FC = () => {
  // Get these from environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <SupabaseProvider supabaseUrl={supabaseUrl} supabaseKey={supabaseKey}>
      <YourApp />
    </SupabaseProvider>
  );
};

export default App;
```

## Authentication

### User Authentication

The package provides a `useSupabaseAuth` hook for handling user authentication:

```tsx
import React, { useState } from 'react';
import { useSupabaseAuth } from '@repo/supabase-client';

const LoginComponent: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signInWithPassword, signUp, signOut, user, isLoading, error } = useSupabaseAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signInWithPassword(email, password);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp(email, password);
  };

  if (user) {
    return (
      <div>
        <p>Welcome, {user.email}</p>
        <button onClick={() => signOut()}>Sign Out</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin}>
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
        {isLoading ? 'Loading...' : 'Login'}
      </button>
      <button type="button" onClick={handleSignUp} disabled={isLoading}>
        Sign Up
      </button>
      {error && <p>{error.message}</p>}
    </form>
  );
};
```

### OAuth Authentication

The package also supports OAuth authentication:

```tsx
import React from 'react';
import { useSupabaseAuth } from '@repo/supabase-client';

const OAuthLoginComponent: React.FC = () => {
  const { signInWithOAuth, isLoading } = useSupabaseAuth();

  const handleGoogleLogin = async () => {
    await signInWithOAuth('google');
  };

  const handleGithubLogin = async () => {
    await signInWithOAuth('github');
  };

  return (
    <div>
      <button onClick={handleGoogleLogin} disabled={isLoading}>
        Login with Google
      </button>
      <button onClick={handleGithubLogin} disabled={isLoading}>
        Login with GitHub
      </button>
    </div>
  );
};
```

### Password Reset

```tsx
import React, { useState } from 'react';
import { useSupabaseAuth } from '@repo/supabase-client';

const PasswordResetComponent: React.FC = () => {
  const [email, setEmail] = useState('');
  const { resetPassword, isLoading, error } = useSupabaseAuth();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(email);
  };

  return (
    <form onSubmit={handleResetPassword}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Reset Password'}
      </button>
      {error && <p>{error.message}</p>}
    </form>
  );
};
```

## Data Fetching

### Basic Queries

The `useSupabaseQuery` hook provides a simple way to fetch data from Supabase:

```tsx
import React from 'react';
import { useSupabaseQuery } from '@repo/supabase-client';
import { Procedure } from '../types';

const ProceduresList: React.FC = () => {
  const { data, isLoading, error, refetch } = useSupabaseQuery<Procedure[]>(
    (supabase) => supabase.from('procedures').select('*')
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      <ul>
        {data?.map((procedure) => (
          <li key={procedure.id}>{procedure.name}</li>
        ))}
      </ul>
    </div>
  );
};
```

### Parameterized Queries

You can pass dependencies to the `useSupabaseQuery` hook to re-fetch data when they change:

```tsx
import React, { useState } from 'react';
import { useSupabaseQuery } from '@repo/supabase-client';
import { Procedure } from '../types';

const FilteredProceduresList: React.FC = () => {
  const [categoryId, setCategoryId] = useState<number | null>(null);
  
  const { data, isLoading, error } = useSupabaseQuery<Procedure[]>(
    (supabase) => {
      let query = supabase.from('procedures').select('*');
      
      if (categoryId !== null) {
        query = query.eq('category_id', categoryId);
      }
      
      return query;
    },
    [categoryId] // Re-fetch when categoryId changes
  );

  // Component rendering...
};
```

### Data Mutations

The `useSupabaseMutation` hook provides a way to modify data:

```tsx
import React, { useState } from 'react';
import { useSupabaseMutation } from '@repo/supabase-client';
import { Procedure } from '../types';

const AddProcedureForm: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const { mutate, isLoading, error } = useSupabaseMutation<Procedure>(
    (supabase, variables) => 
      supabase.from('procedures').insert(variables).select().single()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await mutate({
      name,
      description,
      category_id: 1 // Example category ID
    });
    
    // Reset form
    setName('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add Procedure'}
      </button>
      {error && <p>{error.message}</p>}
    </form>
  );
};
```

## Realtime Subscriptions

The `useSupabaseRealtime` hook provides a way to subscribe to realtime changes:

```tsx
import React from 'react';
import { useSupabaseRealtime } from '@repo/supabase-client';
import { Procedure } from '../types';

const RealtimeProceduresList: React.FC = () => {
  const { data, error } = useSupabaseRealtime<Procedure>('procedures', {
    event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
    schema: 'public'
  });

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Realtime Procedures</h2>
      <ul>
        {data?.map((procedure) => (
          <li key={procedure.id}>{procedure.name}</li>
        ))}
      </ul>
    </div>
  );
};
```

## Storage Operations

The `useSupabaseStorage` hook provides a way to interact with Supabase Storage:

```tsx
import React, { useState, useEffect } from 'react';
import { useSupabaseStorage } from '@repo/supabase-client';

const FileUploadComponent: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  
  const { 
    uploadFile, 
    downloadFile, 
    listFiles, 
    getPublicUrl, 
    removeFile, 
    isLoading, 
    error 
  } = useSupabaseStorage('images');

  // Load files on component mount
  useEffect(() => {
    const loadFiles = async () => {
      const files = await listFiles();
      setFileList(files || []);
    };
    
    loadFiles();
  }, [listFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    await uploadFile(`uploads/${file.name}`, file);
    const files = await listFiles();
    setFileList(files || []);
    setFile(null);
  };

  const handleDelete = async (path: string) => {
    await removeFile(path);
    const files = await listFiles();
    setFileList(files || []);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file || isLoading}>
        {isLoading ? 'Uploading...' : 'Upload'}
      </button>
      
      {error && <p>{error.message}</p>}
      
      <h3>Files</h3>
      <ul>
        {fileList.map((fileItem) => (
          <li key={fileItem.name}>
            {fileItem.name}
            <a 
              href={getPublicUrl(`uploads/${fileItem.name}`)} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View
            </a>
            <button onClick={() => handleDelete(`uploads/${fileItem.name}`)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

## Pagination

The `useSupabasePagination` hook provides a way to paginate through data:

```tsx
import React from 'react';
import { useSupabasePagination } from '@repo/supabase-client';
import { Procedure } from '../types';

const PaginatedProceduresList: React.FC = () => {
  const { 
    data, 
    page, 
    totalPages, 
    isLoading, 
    error, 
    goToPage, 
    nextPage, 
    previousPage 
  } = useSupabasePagination<Procedure>(
    async (supabase, page, pageSize) => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await supabase
        .from('procedures')
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
        {data?.map((procedure) => (
          <li key={procedure.id}>{procedure.name}</li>
        ))}
      </ul>
      
      <div>
        <button onClick={previousPage} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={nextPage} disabled={page === totalPages}>
          Next
        </button>
      </div>
      
      <div>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => goToPage(pageNum)}
            disabled={pageNum === page}
          >
            {pageNum}
          </button>
        ))}
      </div>
    </div>
  );
};
```

## Infinite Scrolling

The `useSupabaseInfiniteQuery` hook provides a way to implement infinite scrolling:

```tsx
import React, { useEffect, useRef } from 'react';
import { useSupabaseInfiniteQuery } from '@repo/supabase-client';
import { Procedure } from '../types';

const InfiniteScrollProceduresList: React.FC = () => {
  const { 
    data, 
    isLoading, 
    error, 
    hasMore, 
    fetchNextPage 
  } = useSupabaseInfiniteQuery<Procedure>(
    async (supabase, page, pageSize) => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error } = await supabase
        .from('procedures')
        .select('*')
        .range(from, to);
        
      return { data, error };
    },
    { pageSize: 10 }
  );

  // Intersection Observer for infinite scrolling
  const observerTarget = useRef<HTMLDivElement>(null);
  
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
        {data?.map((procedure) => (
          <li key={procedure.id}>{procedure.name}</li>
        ))}
      </ul>
      
      {isLoading && <div>Loading more...</div>}
      
      {/* Intersection observer target */}
      {hasMore && <div ref={observerTarget} style={{ height: '10px' }}></div>}
    </div>
  );
};
```

## Class Component Support

For class components, the package provides higher-order components (HOCs):

### withSupabase HOC

```tsx
import React from 'react';
import { withSupabase, WithSupabaseProps } from '@repo/supabase-client';
import { Procedure } from '../types';

interface ProceduresListProps extends WithSupabaseProps {
  categoryId?: number;
}

class ProceduresList extends React.Component<ProceduresListProps> {
  state = {
    procedures: [] as Procedure[],
    loading: true,
    error: null as Error | null
  };

  async componentDidMount() {
    await this.fetchProcedures();
  }

  async componentDidUpdate(prevProps: ProceduresListProps) {
    if (prevProps.categoryId !== this.props.categoryId) {
      await this.fetchProcedures();
    }
  }

  async fetchProcedures() {
    const { supabase, categoryId } = this.props;
    
    try {
      this.setState({ loading: true });
      
      let query = supabase.from('procedures').select('*');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      this.setState({
        procedures: data,
        loading: false,
        error: null
      });
    } catch (error) {
      this.setState({
        loading: false,
        error: error as Error
      });
    }
  }

  render() {
    const { procedures, loading, error } = this.state;
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    
    return (
      <ul>
        {procedures.map((procedure) => (
          <li key={procedure.id}>{procedure.name}</li>
        ))}
      </ul>
    );
  }
}

// Wrap with HOC
export default withSupabase(ProceduresList);
```

### withSupabaseAuth HOC

```tsx
import React from 'react';
import { withSupabaseAuth, WithSupabaseAuthProps } from '@repo/supabase-client';

class AuthComponent extends React.Component<WithSupabaseAuthProps> {
  state = {
    email: '',
    password: ''
  };

  handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ email: e.target.value });
  };

  handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ password: e.target.value });
  };

  handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = this.state;
    await this.props.signInWithPassword(email, password);
  };

  handleSignOut = async () => {
    await this.props.signOut();
  };

  render() {
    const { user, isLoading, error } = this.props;
    const { email, password } = this.state;
    
    if (isLoading) return <div>Loading...</div>;
    
    if (user) {
      return (
        <div>
          <p>Welcome, {user.email}</p>
          <button onClick={this.handleSignOut}>Sign Out</button>
        </div>
      );
    }
    
    return (
      <form onSubmit={this.handleLogin}>
        <input
          type="email"
          value={email}
          onChange={this.handleEmailChange}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={this.handlePasswordChange}
          placeholder="Password"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Login'}
        </button>
        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

// Wrap with HOC
export default withSupabaseAuth(AuthComponent);
```

## Advanced Usage

### Direct Client Access

In some cases, you may need direct access to the Supabase client:

```tsx
import React from 'react';
import { useSupabase } from '@repo/supabase-client';

const DirectClientComponent: React.FC = () => {
  const { supabase } = useSupabase();
  
  const handleCustomQuery = async () => {
    const { data, error } = await supabase
      .from('procedures')
      .select('*')
      .order('name', { ascending: true })
      .limit(5);
      
    // Process data...
  };
  
  return (
    <button onClick={handleCustomQuery}>
      Run Custom Query
    </button>
  );
};
```

### Combining Hooks

You can combine multiple hooks for more complex use cases:

```tsx
import React, { useState } from 'react';
import { 
  useSupabaseQuery, 
  useSupabaseMutation, 
  useSupabaseAuth 
} from '@repo/supabase-client';
import { Procedure, Category } from '../types';

const ProcedureManager: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const { user } = useSupabaseAuth();
  
  // Fetch categories
  const { 
    data: categories 
  } = useSupabaseQuery<Category[]>(
    (supabase) => supabase.from('categories').select('*')
  );
  
  // Fetch procedures based on selected category
  const { 
    data: procedures, 
    refetch: refetchProcedures 
  } = useSupabaseQuery<Procedure[]>(
    (supabase) => {
      let query = supabase.from('procedures').select('*');
      
      if (selectedCategoryId !== null) {
        query = query.eq('category_id', selectedCategoryId);
      }
      
      return query;
    },
    [selectedCategoryId]
  );
  
  // Mutation for adding a procedure
  const { 
    mutate: addProcedure 
  } = useSupabaseMutation<Procedure>(
    (supabase, variables) => 
      supabase.from('procedures')
        .insert({ ...variables, created_by: user?.id })
        .select()
        .single()
  );
  
  // Mutation for deleting a procedure
  const { 
    mutate: deleteProcedure 
  } = useSupabaseMutation<{ id: number }>(
    (supabase, variables) => 
      supabase.from('procedures')
        .delete()
        .eq('id', variables.id)
  );
  
  const handleAddProcedure = async (procedureData: Partial<Procedure>) => {
    await addProcedure(procedureData);
    refetchProcedures();
  };
  
  const handleDeleteProcedure = async (id: number) => {
    await deleteProcedure({ id });
    refetchProcedures();
  };
  
  // Component rendering...
};
```

## TypeScript Integration

The package is fully typed, providing type safety for all operations:

```tsx
// Define your database schema types
export interface Procedure {
  id: number;
  name: string;
  description: string;
  category_id: number;
  average_cost: number;
  recovery_time: string;
  popularity_score: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Use the types with the hooks
const { data: procedures } = useSupabaseQuery<Procedure[]>(
  (supabase) => supabase.from('procedures').select('*')
);
```

## Best Practices

### 1. Centralize Client Configuration

Create a central configuration file for your Supabase client:

```tsx
// src/services/supabase-config.ts
import { SupabaseProvider } from '@repo/supabase-client';

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_ANON_KEY
};

export const SupabaseProviderWithConfig: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SupabaseProvider 
      supabaseUrl={supabaseConfig.url} 
      supabaseKey={supabaseConfig.key}
    >
      {children}
    </SupabaseProvider>
  );
};
```

### 2. Create Custom Hooks

Create custom hooks for common operations:

```tsx
// src/hooks/useProcedures.ts
import { useSupabaseQuery, useSupabaseMutation } from '@repo/supabase-client';
import { Procedure } from '../types';

export function useProcedures(categoryId?: number) {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useSupabaseQuery<Procedure[]>(
    (supabase) => {
      let query = supabase.from('procedures').select('*');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      return query;
    },
    [categoryId]
  );
  
  const { 
    mutate: addProcedure, 
    isLoading: isAdding 
  } = useSupabaseMutation<Procedure>(
    (supabase, variables) => 
      supabase.from('procedures').insert(variables).select().single()
  );
  
  const { 
    mutate: updateProcedure, 
    isLoading: isUpdating 
  } = useSupabaseMutation<Procedure>(
    (supabase, variables) => 
      supabase.from('procedures')
        .update(variables)
        .eq('id', variables.id)
        .select()
        .single()
  );
  
  const { 
    mutate: deleteProcedure, 
    isLoading: isDeleting 
  } = useSupabaseMutation<{ id: number }>(
    (supabase, variables) => 
      supabase.from('procedures').delete().eq('id', variables.
