# Supabase Client Integration Guide

This guide provides detailed information on how to use the shared Supabase client package (`@repo/supabase-client`) in the RepSpheres monorepo.

## Overview

The `@repo/supabase-client` package provides a unified way to interact with Supabase across all applications in the monorepo. It offers:

1. A consistent client configuration
2. React integration through context and hooks
3. TypeScript support with shared database types
4. Higher-order components for class components

## Installation

The package is already included in the monorepo, so you don't need to install it separately. Just make sure your app's `package.json` includes it as a dependency:

```json
{
  "dependencies": {
    "@repo/supabase-client": "*"
  }
}
```

## Basic Usage

### Direct Client Usage

For non-React code or services, you can use the `createSupabaseClient` function:

```typescript
import { createSupabaseClient } from '@repo/supabase-client';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

// Now use the client
const fetchData = async () => {
  const { data, error } = await supabase
    .from('table_name')
    .select('*');
  
  if (error) {
    console.error('Error fetching data:', error);
    return null;
  }
  
  return data;
};
```

### React Integration

For React components, wrap your application with the `SupabaseProvider`:

```tsx
// src/App.tsx
import React from 'react';
import { SupabaseProvider } from '@repo/supabase-client';

const App = () => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
  
  return (
    <SupabaseProvider supabaseUrl={supabaseUrl} supabaseKey={supabaseKey}>
      {/* Your app components */}
    </SupabaseProvider>
  );
};

export default App;
```

Then use the `useSupabase` hook in your components:

```tsx
// src/components/DataComponent.tsx
import React, { useEffect, useState } from 'react';
import { useSupabase } from '@repo/supabase-client';

const DataComponent = () => {
  const { supabase, isLoading, error } = useSupabase();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!isLoading && !error) {
        const { data: result, error: dataError } = await supabase
          .from('your_table')
          .select('*');
        
        if (dataError) {
          console.error('Error fetching data:', dataError);
        } else {
          setData(result || []);
        }
        
        setLoading(false);
      }
    };
    
    fetchData();
  }, [supabase, isLoading, error]);
  
  if (isLoading || loading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  return (
    <div>
      {/* Render your data */}
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};

export default DataComponent;
```

### For Class Components

If you're using class components, you can use the `withSupabase` higher-order component:

```tsx
import React, { Component } from 'react';
import { withSupabase } from '@repo/supabase-client';
import type { SupabaseClient } from '@repo/supabase-client';
import type { Database } from '@repo/supabase-client';

interface Props {
  supabase: SupabaseClient<Database>;
}

interface State {
  data: any[];
  loading: boolean;
  error: Error | null;
}

class DataComponentClass extends Component<Props, State> {
  state: State = {
    data: [],
    loading: true,
    error: null
  };
  
  async componentDidMount() {
    try {
      const { data, error } = await this.props.supabase
        .from('your_table')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      this.setState({
        data: data || [],
        loading: false
      });
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error : new Error('Unknown error'),
        loading: false
      });
    }
  }
  
  render() {
    const { data, loading, error } = this.state;
    
    if (loading) {
      return <div>Loading...</div>;
    }
    
    if (error) {
      return <div>Error: {error.message}</div>;
    }
    
    return (
      <div>
        {data.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>
    );
  }
}

// Wrap the component with the HOC
export default withSupabase(DataComponentClass);
```

## TypeScript Integration

The package includes TypeScript types for the database schema. Import and use them to get type safety:

```typescript
import type { Database } from '@repo/supabase-client';

// Type-safe table row
type AestheticProcedure = Database['public']['Tables']['aesthetic_procedures']['Row'];

// Type-safe function
const getProcedure = async (id: number): Promise<AestheticProcedure | null> => {
  const { data, error } = await supabase
    .from('aesthetic_procedures')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching procedure:', error);
    return null;
  }
  
  return data;
};
```

## Customizing the Supabase Client

You can customize the Supabase client by passing options to the `createSupabaseClient` function or the `SupabaseProvider`:

```typescript
// Direct client with options
const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'x-custom-header': 'custom-value'
    }
  }
});

// Or with the provider
<SupabaseProvider 
  supabaseUrl={supabaseUrl} 
  supabaseKey={supabaseKey}
  options={{
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }}
>
  {/* Your app components */}
</SupabaseProvider>
```

## Authentication

The Supabase client includes authentication capabilities. Here's how to use them:

```typescript
// Sign up
const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  return { data, error };
};

// Sign in
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  return { data, error };
};

// Sign out
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Get current user
const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};

// Get session
const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
};
```

## Real-time Subscriptions

You can use Supabase's real-time capabilities:

```tsx
import React, { useEffect, useState } from 'react';
import { useSupabase } from '@repo/supabase-client';

const RealtimeComponent = () => {
  const { supabase } = useSupabase();
  const [messages, setMessages] = useState<any[]>([]);
  
  useEffect(() => {
    // Initial fetch
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      setMessages(data || []);
    };
    
    fetchMessages();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages' 
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => 
              prev.map(message => 
                message.id === payload.new.id ? payload.new : message
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => 
              prev.filter(message => message.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();
    
    // Clean up subscription
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [supabase]);
  
  return (
    <div>
      <h2>Real-time Messages</h2>
      <ul>
        {messages.map(message => (
          <li key={message.id}>{message.content}</li>
        ))}
      </ul>
    </div>
  );
};

export default RealtimeComponent;
```

## Storage

You can use Supabase Storage for file uploads and downloads:

```typescript
// Upload file
const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .upload(path, file);
  
  return { data, error };
};

// Download file
const downloadFile = (bucket: string, path: string) => {
  const { data } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

// List files
const listFiles = async (bucket: string, path: string) => {
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .list(path);
  
  return { data, error };
};

// Delete file
const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase
    .storage
    .from(bucket)
    .remove([path]);
  
  return { error };
};
```

## Error Handling

The Supabase client returns errors in a consistent format. Here's how to handle them:

```typescript
const fetchData = async () => {
  try {
    const { data, error } = await supabase
      .from('your_table')
      .select('*');
    
    if (error) {
      // Handle Supabase error
      console.error('Supabase error:', error.message);
      
      // You can check error codes
      if (error.code === 'PGRST116') {
        console.error('Foreign key violation');
      }
      
      throw error;
    }
    
    return data;
  } catch (err) {
    // Handle other errors
    console.error('Unexpected error:', err);
    throw err;
  }
};
```

## Best Practices

1. **Environment Variables**: Always store Supabase credentials in environment variables, never hardcode them.

2. **Error Handling**: Always check for errors in Supabase responses.

3. **Type Safety**: Use the provided TypeScript types for better type safety.

4. **Connection Management**: Use the `SupabaseProvider` at the top level of your React application to ensure a single client instance.

5. **Clean Up Subscriptions**: Always clean up real-time subscriptions when components unmount.

6. **RLS Policies**: Ensure your Supabase tables have proper Row Level Security (RLS) policies.

7. **Batching Operations**: Use transactions for operations that need to be atomic.

## Troubleshooting

### Common Issues

1. **"useSupabase must be used within a SupabaseProvider"**
   - Make sure your component is wrapped with `SupabaseProvider`
   - Check that the provider is not conditionally rendered

2. **Authentication Issues**
   - Check that your Supabase URL and key are correct
   - Verify that the user has the necessary permissions

3. **TypeScript Errors**
   - Ensure you're importing types correctly
   - Check that your database schema types are up to date

4. **Real-time Subscription Not Working**
   - Verify that real-time is enabled for your Supabase project
   - Check that you're subscribing to the correct channel and table

## Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Supabase JavaScript Client](https://supabase.io/docs/reference/javascript/introduction)
- [Supabase Auth Documentation](https://supabase.io/docs/guides/auth)
- [Supabase Storage Documentation](https://supabase.io/docs/guides/storage)
- [Supabase Real-time Documentation](https://supabase.io/docs/guides/realtime)
