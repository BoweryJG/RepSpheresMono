import React, { useState } from 'react';
import { 
  SupabaseProvider, 
  useSupabaseAuth,
  useSupabaseQuery, 
  useSupabaseMutation
} from '@repo/supabase-client';
import type { SupabaseClient, User, PostgrestError } from '@supabase/supabase-js';

// Define our own types for the procedures and categories
interface Procedure {
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

interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Define props interface for the component
interface SupabaseIntegrationProps {
  supabaseUrl?: string;
  supabaseKey?: string;
}

// Main component that wraps everything with the SupabaseProvider
export const MarketInsightsSupabaseExample: React.FC<SupabaseIntegrationProps> = ({ 
  supabaseUrl = '', 
  supabaseKey = '' 
}) => {
  return (
    <SupabaseProvider supabaseUrl={supabaseUrl} supabaseKey={supabaseKey}>
      <div className="market-insights-app">
        <h1>Market Insights</h1>
        <AuthSection />
        <div className="content">
          <CategoriesList />
          <ProceduresList />
          <AddProcedureForm />
        </div>
      </div>
    </SupabaseProvider>
  );
};

// Authentication section
const AuthSection: React.FC = () => {
  const { user, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return <div className="loading">Loading authentication...</div>;
  }

  return (
    <div className="auth-section">
      {user ? <UserProfile /> : <LoginForm />}
    </div>
  );
};

// User profile component
const UserProfile: React.FC = () => {
  const { user, signOut } = useSupabaseAuth();
  const userEmail = user ? (user as User).email : 'User';

  return (
    <div className="user-profile">
      <h2>Welcome, {userEmail}</h2>
      <button onClick={() => signOut()} className="logout-button">
        Log Out
      </button>
    </div>
  );
};

// Login form component
const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signInWithPassword, error, isLoading } = useSupabaseAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signInWithPassword(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Login</h2>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <div className="error">{(error as Error).message || 'Authentication error'}</div>}
      <button type="submit" disabled={isLoading} className="login-button">
        {isLoading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
};

// Categories list component
const CategoriesList: React.FC = () => {
  const { data, error, isLoading } = useSupabaseQuery((supabase: SupabaseClient) => 
    supabase.from('aesthetic_categories').select('*')
  );

  if (isLoading) {
    return <div className="loading">Loading categories...</div>;
  }

  if (error) {
    return <div className="error">Error loading categories: {(error as PostgrestError).message || 'Unknown error'}</div>;
  }

  const categories = data ? (data as Category[]) : [];

  return (
    <div className="categories-list">
      <h2>Categories</h2>
      <ul>
        {categories.map((category) => (
          <li key={category.id} className="category-item">
            <h3>{category.name}</h3>
            <p>{category.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Procedures list component with filtering
const ProceduresList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // Get all categories for the filter
  const { data: categoriesData } = useSupabaseQuery((supabase: SupabaseClient) => 
    supabase.from('aesthetic_categories').select('id, name')
  );
  
  const categories = categoriesData ? (categoriesData as Category[]) : [];
  
  // Get procedures with optional category filter
  const { data: proceduresData, isLoading, error, refetch } = useSupabaseQuery(
    (supabase: SupabaseClient) => {
      let query = supabase.from('aesthetic_procedures').select('*');
      
      if (selectedCategory !== null) {
        query = query.eq('category_id', selectedCategory);
      }
      
      return query;
    },
    [selectedCategory] // Re-fetch when selectedCategory changes
  );

  const procedures = proceduresData ? (proceduresData as Procedure[]) : [];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value === '' ? null : parseInt(value, 10));
  };

  if (isLoading) {
    return <div className="loading">Loading procedures...</div>;
  }

  if (error) {
    return <div className="error">Error loading procedures: {(error as PostgrestError).message || 'Unknown error'}</div>;
  }

  return (
    <div className="procedures-list">
      <div className="procedures-header">
        <h2>Procedures</h2>
        <div className="filter-controls">
          <label htmlFor="category-filter">Filter by Category:</label>
          <select 
            id="category-filter" 
            value={selectedCategory?.toString() || ''} 
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>
          <button onClick={() => refetch()} className="refresh-button">
            Refresh
          </button>
        </div>
      </div>
      
      <table className="procedures-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Average Cost</th>
            <th>Recovery Time</th>
            <th>Popularity</th>
          </tr>
        </thead>
        <tbody>
          {procedures.map((procedure) => (
            <tr key={procedure.id}>
              <td>{procedure.name}</td>
              <td>{procedure.description}</td>
              <td>${procedure.average_cost.toLocaleString()}</td>
              <td>{procedure.recovery_time}</td>
              <td>{procedure.popularity_score}/10</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {procedures.length === 0 && (
        <div className="no-data">No procedures found</div>
      )}
    </div>
  );
};

// Add procedure form component
const AddProcedureForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    average_cost: '',
    recovery_time: '',
    popularity_score: ''
  });
  
  // Get categories for the dropdown
  const { data: categoriesData } = useSupabaseQuery((supabase: SupabaseClient) => 
    supabase.from('aesthetic_categories').select('id, name')
  );
  
  const categories = categoriesData ? (categoriesData as Category[]) : [];
  
  // Use mutation hook for adding a procedure
  const { mutate, isLoading, error, data: newProcedure } = useSupabaseMutation(
    (supabase: SupabaseClient, variables: any) => 
      supabase.from('aesthetic_procedures').insert(variables).select().single()
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string values to appropriate types
    const procedureData = {
      name: formData.name,
      description: formData.description,
      category_id: parseInt(formData.category_id, 10),
      average_cost: parseFloat(formData.average_cost),
      recovery_time: formData.recovery_time,
      popularity_score: parseFloat(formData.popularity_score)
    };
    
    await mutate(procedureData);
    
    // Reset form if successful
    if (newProcedure) {
      setFormData({
        name: '',
        description: '',
        category_id: '',
        average_cost: '',
        recovery_time: '',
        popularity_score: ''
      });
    }
  };

  return (
    <div className="add-procedure-form">
      <h2>Add New Procedure</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category_id">Category</label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="average_cost">Average Cost ($)</label>
          <input
            id="average_cost"
            name="average_cost"
            type="number"
            min="0"
            step="0.01"
            value={formData.average_cost}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="recovery_time">Recovery Time</label>
          <input
            id="recovery_time"
            name="recovery_time"
            value={formData.recovery_time}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="popularity_score">Popularity Score (0-10)</label>
          <input
            id="popularity_score"
            name="popularity_score"
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={formData.popularity_score}
            onChange={handleChange}
            required
          />
        </div>
        
        {error && <div className="error">{(error as PostgrestError).message || 'Unknown error'}</div>}
        
        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? 'Adding...' : 'Add Procedure'}
        </button>
      </form>
    </div>
  );
};

// Rename the default export to match the import in MarketInsightsIntegration.jsx
// Using the MarketInsightsSupabaseExample component as the default export with the name SupabaseIntegration
const SupabaseIntegration = MarketInsightsSupabaseExample;
export default SupabaseIntegration;
