import React, { useState, useEffect } from 'react';
import { 
  useSupabase, 
  useSupabaseAuth, 
  useSupabaseQuery, 
  useSupabaseMutation,
  useSupabaseRealtime,
  withSupabase,
  withSupabaseAuth,
  type WithSupabaseProps,
  type WithSupabaseAuthProps
} from '../index';

// Example 1: Basic Supabase Provider Usage
export const SupabaseProviderExample: React.FC = () => {
  return (
    <div>
      <h2>Supabase Provider Example</h2>
      <UserProfile />
      <DataDisplay />
    </div>
  );
};

// Example 2: Using the useSupabase hook
const UserProfile: React.FC = () => {
  const { user, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return <div>Loading user...</div>;
  }

  return (
    <div>
      <h3>User Profile</h3>
      {user ? (
        <div>
          <p>Email: {user.email}</p>
          <p>ID: {user.id}</p>
          <LogoutButton />
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  );
};

// Example 3: Using the useSupabaseAuth hook
const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signInWithPassword, error, isLoading } = useSupabaseAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signInWithPassword(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <div style={{ color: 'red' }}>{error.message}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  );
};

const LogoutButton: React.FC = () => {
  const { signOut, isLoading } = useSupabaseAuth();

  return (
    <button onClick={() => signOut()} disabled={isLoading}>
      {isLoading ? 'Logging out...' : 'Log out'}
    </button>
  );
};

// Example 4: Using the useSupabaseQuery hook
const DataDisplay: React.FC = () => {
  const { data, error, isLoading, refetch } = useSupabaseQuery(
    (supabase) => supabase.from('procedures').select('*').limit(10)
  );

  if (isLoading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h3>Procedures</h3>
      <button onClick={() => refetch()}>Refresh</button>
      <ul>
        {data?.map((item: any) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

// Example 5: Using the useSupabaseMutation hook
const CreateProcedureForm: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const { mutate, isLoading, error } = useSupabaseMutation(
    (supabase, variables) => 
      supabase.from('procedures').insert(variables).select()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutate({ name, description });
    setName('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Procedure</h3>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      {error && <div style={{ color: 'red' }}>{error.message}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add Procedure'}
      </button>
    </form>
  );
};

// Example 6: Using the useSupabaseRealtime hook
const RealtimeUpdates: React.FC = () => {
  const { data, error } = useSupabaseRealtime('procedures', {
    event: '*',
    schema: 'public'
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h3>Realtime Procedures</h3>
      <ul>
        {data?.map((item: any) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

// Example 7: Using the withSupabase HOC (Class Component)
interface ProcedureListProps extends WithSupabaseProps {
  limit?: number;
}

class ProcedureList extends React.Component<ProcedureListProps> {
  state = {
    procedures: [],
    isLoading: true,
    error: null
  };

  async componentDidMount() {
    const { supabase } = this.props;
    const { limit = 10 } = this.props;
    
    try {
      const { data, error } = await supabase
        .from('procedures')
        .select('*')
        .limit(limit);
        
      if (error) throw error;
      
      this.setState({ 
        procedures: data,
        isLoading: false
      });
    } catch (error) {
      this.setState({ 
        error,
        isLoading: false
      });
    }
  }

  render() {
    const { procedures, isLoading, error } = this.state;
    
    if (isLoading) return <div>Loading procedures...</div>;
    if (error) return <div>Error: {(error as Error).message}</div>;
    
    return (
      <div>
        <h3>Procedures (Class Component)</h3>
        <ul>
          {procedures.map((procedure: any) => (
            <li key={procedure.id}>{procedure.name}</li>
          ))}
        </ul>
      </div>
    );
  }
}

// Wrap the class component with the withSupabase HOC
const ProcedureListWithSupabase = withSupabase(ProcedureList);

// Example 8: Using the withSupabaseAuth HOC (Class Component)
interface AuthProfileProps extends WithSupabaseAuthProps {}

class AuthProfile extends React.Component<AuthProfileProps> {
  handleLogout = async () => {
    await this.props.signOut();
  };

  render() {
    const { user, isLoading } = this.props;
    
    if (isLoading) return <div>Loading user profile...</div>;
    
    return (
      <div>
        <h3>User Profile (Class Component)</h3>
        {user ? (
          <div>
            <p>Email: {user.email}</p>
            <p>ID: {user.id}</p>
            <button onClick={this.handleLogout}>Log out</button>
          </div>
        ) : (
          <p>Not logged in</p>
        )}
      </div>
    );
  }
}

// Wrap the class component with the withSupabaseAuth HOC
const AuthProfileWithSupabase = withSupabaseAuth(AuthProfile);

// Example 9: Complete example with all components
export const CompleteExample: React.FC = () => {
  return (
    <div>
      <h1>Supabase Client Example</h1>
      
      <UserProfile />
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <DataDisplay />
          <CreateProcedureForm />
        </div>
        
        <div style={{ flex: 1 }}>
          <RealtimeUpdates />
          <ProcedureListWithSupabase limit={5} />
          <AuthProfileWithSupabase />
        </div>
      </div>
    </div>
  );
};

export default CompleteExample;
