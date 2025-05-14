import React, { useState, useEffect } from 'react';
import { 
  SupabaseProvider, 
  useSupabase, 
  useSupabaseAuth, 
  useSupabaseQuery, 
  useSupabaseMutation,
  useSupabaseRealtime,
  useSupabaseStorage,
  useSupabasePagination,
  useSupabaseInfiniteQuery
} from '../index';

// Example of a complete application using all Supabase client features
export const AdvancedSupabaseExample: React.FC = () => {
  // In a real app, these would come from environment variables
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

  return (
    <SupabaseProvider supabaseUrl={supabaseUrl} supabaseKey={supabaseKey}>
      <div className="app-container">
        <header>
          <h1>RepSpheres Advanced Example</h1>
          <AuthSection />
        </header>
        
        <main>
          <div className="dashboard-grid">
            <DataSection />
            <RealtimeSection />
            <StorageSection />
            <PaginationSection />
            <InfiniteScrollSection />
          </div>
        </main>
      </div>
    </SupabaseProvider>
  );
};

// Authentication section with login/logout functionality
const AuthSection: React.FC = () => {
  const { user, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return <div className="loading-indicator">Loading authentication...</div>;
  }

  return (
    <div className="auth-container">
      {user ? <UserProfile /> : <LoginForm />}
    </div>
  );
};

// User profile component showing user information and logout button
const UserProfile: React.FC = () => {
  const { user, signOut } = useSupabaseAuth();

  return (
    <div className="user-profile">
      <div className="user-info">
        <h3>Welcome, {user?.email}</h3>
        <p>User ID: {user?.id}</p>
        {user?.user_metadata && (
          <div className="user-metadata">
            {Object.entries(user.user_metadata).map(([key, value]) => (
              <p key={key}><strong>{key}:</strong> {String(value)}</p>
            ))}
          </div>
        )}
      </div>
      <button onClick={() => signOut()} className="logout-button">
        Log Out
      </button>
    </div>
  );
};

// Login form with email/password and OAuth options
const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { 
    signInWithPassword, 
    signUp, 
    signInWithOAuth,
    resetPassword,
    error, 
    isLoading 
  } = useSupabaseAuth();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await signUp(email, password);
    } else {
      await signInWithPassword(email, password);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github' | 'facebook' | 'twitter') => {
    await signInWithOAuth(provider);
  };

  const handleResetPassword = async () => {
    if (email) {
      await resetPassword(email);
      alert('Check your email for password reset instructions');
    } else {
      alert('Please enter your email address');
    }
  };

  return (
    <div className="auth-form-container">
      <h2>{isSignUp ? 'Sign Up' : 'Log In'}</h2>
      
      <form onSubmit={handleEmailAuth} className="auth-form">
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
        
        {error && <div className="error-message">{error.message}</div>}
        
        <div className="auth-actions">
          <button type="submit" disabled={isLoading} className="primary-button">
            {isLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
          
          <button 
            type="button" 
            onClick={() => setIsSignUp(!isSignUp)} 
            className="secondary-button"
          >
            {isSignUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
          </button>
          
          {!isSignUp && (
            <button 
              type="button" 
              onClick={handleResetPassword} 
              className="text-button"
            >
              Forgot Password?
            </button>
          )}
        </div>
      </form>
      
      <div className="oauth-section">
        <p>Or continue with:</p>
        <div className="oauth-buttons">
          <button onClick={() => handleOAuth('google')} className="oauth-button google">
            Google
          </button>
          <button onClick={() => handleOAuth('github')} className="oauth-button github">
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

// Data section demonstrating useSupabaseQuery and useSupabaseMutation
const DataSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');
  
  return (
    <div className="data-section card">
      <div className="card-header">
        <h2>Data Management</h2>
        <div className="tab-buttons">
          <button 
            className={activeTab === 'view' ? 'active' : ''} 
            onClick={() => setActiveTab('view')}
          >
            View Data
          </button>
          <button 
            className={activeTab === 'add' ? 'active' : ''} 
            onClick={() => setActiveTab('add')}
          >
            Add Data
          </button>
        </div>
      </div>
      
      <div className="card-content">
        {activeTab === 'view' ? <DataTable /> : <AddDataForm />}
      </div>
    </div>
  );
};

// Data table component using useSupabaseQuery
const DataTable: React.FC = () => {
  const [filter, setFilter] = useState('');
  
  // Query with filtering
  const { data, error, isLoading, refetch } = useSupabaseQuery(
    (supabase) => {
      let query = supabase.from('procedures').select('*');
      
      if (filter) {
        query = query.ilike('name', `%${filter}%`);
      }
      
      return query.order('name');
    },
    [filter] // Re-fetch when filter changes
  );

  if (isLoading) {
    return <div className="loading-indicator">Loading data...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error.message}</div>;
  }

  return (
    <div className="data-table-container">
      <div className="table-actions">
        <div className="search-box">
          <input
            type="text"
            placeholder="Filter by name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <button onClick={() => refetch()} className="refresh-button">
          Refresh
        </button>
      </div>
      
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item: any) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>{item.category_id}</td>
              <td>${item.average_cost?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {data?.length === 0 && (
        <div className="empty-state">No data found</div>
      )}
    </div>
  );
};

// Form to add new data using useSupabaseMutation
const AddDataForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    average_cost: ''
  });
  
  const { mutate, isLoading, error, data: newItem } = useSupabaseMutation(
    (supabase, variables) => 
      supabase.from('procedures').insert(variables).select().single()
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const procedureData = {
      name: formData.name,
      description: formData.description,
      category_id: parseInt(formData.category_id, 10),
      average_cost: parseFloat(formData.average_cost)
    };
    
    await mutate(procedureData);
    
    if (newItem) {
      setFormData({
        name: '',
        description: '',
        category_id: '',
        average_cost: ''
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="data-form">
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
        <label htmlFor="category_id">Category ID</label>
        <input
          id="category_id"
          name="category_id"
          type="number"
          value={formData.category_id}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="average_cost">Average Cost ($)</label>
        <input
          id="average_cost"
          name="average_cost"
          type="number"
          step="0.01"
          value={formData.average_cost}
          onChange={handleChange}
          required
        />
      </div>
      
      {error && <div className="error-message">{error.message}</div>}
      
      <button type="submit" disabled={isLoading} className="submit-button">
        {isLoading ? 'Adding...' : 'Add Item'}
      </button>
      
      {newItem && (
        <div className="success-message">
          Successfully added: {newItem.name}
        </div>
      )}
    </form>
  );
};

// Realtime section demonstrating useSupabaseRealtime
const RealtimeSection: React.FC = () => {
  const { data, error, channel } = useSupabaseRealtime('procedures', {
    event: '*',
    schema: 'public'
  });

  return (
    <div className="realtime-section card">
      <div className="card-header">
        <h2>Realtime Updates</h2>
        <div className="status-indicator">
          {channel ? 'Connected' : 'Connecting...'}
        </div>
      </div>
      
      <div className="card-content">
        {error ? (
          <div className="error-message">Error: {error.message}</div>
        ) : (
          <div className="realtime-list">
            <p>Changes will appear in real-time:</p>
            <ul>
              {data?.map((item: any) => (
                <li key={item.id} className="realtime-item">
                  <strong>{item.name}</strong>
                  <span className="item-details">
                    {item.description?.substring(0, 50)}
                    {item.description?.length > 50 ? '...' : ''}
                  </span>
                </li>
              ))}
            </ul>
            
            {(!data || data.length === 0) && (
              <div className="empty-state">
                No data yet. Try adding a new item.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Storage section demonstrating useSupabaseStorage
const StorageSection: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const { 
    uploadFile, 
    listFiles, 
    getPublicUrl, 
    removeFile, 
    isLoading, 
    error 
  } = useSupabaseStorage('public');

  // Load files on component mount
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const files = await listFiles();
        setFileList(files || []);
      } catch (err) {
        console.error('Error listing files:', err);
      }
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
    
    try {
      await uploadFile(`uploads/${file.name}`, file, { upsert: true });
      const files = await listFiles();
      setFileList(files || []);
      setFile(null);
    } catch (err) {
      console.error('Error uploading file:', err);
    }
  };

  const handleDelete = async (path: string) => {
    try {
      await removeFile(path);
      const files = await listFiles();
      setFileList(files || []);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  return (
    <div className="storage-section card">
      <div className="card-header">
        <h2>Storage Management</h2>
      </div>
      
      <div className="card-content">
        <div className="upload-area">
          <input 
            type="file" 
            onChange={handleFileChange} 
            disabled={isLoading}
          />
          <button 
            onClick={handleUpload} 
            disabled={!file || isLoading}
            className="upload-button"
          >
            {isLoading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
        
        {error && <div className="error-message">{error.message}</div>}
        
        <div className="files-list">
          <h3>Files</h3>
          {fileList.length > 0 ? (
            <ul>
              {fileList.map((fileItem) => (
                <li key={fileItem.name} className="file-item">
                  <span className="file-name">{fileItem.name}</span>
                  <div className="file-actions">
                    <a 
                      href={getPublicUrl(`uploads/${fileItem.name}`)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="view-link"
                    >
                      View
                    </a>
                    <button 
                      onClick={() => handleDelete(`uploads/${fileItem.name}`)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">No files uploaded yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Pagination section demonstrating useSupabasePagination
const PaginationSection: React.FC = () => {
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
        .from('procedures')
        .select('*', { count: 'exact' })
        .order('name')
        .range(from, to);
        
      return { data, error, count };
    },
    { pageSize: 5 }
  );

  if (isLoading) {
    return (
      <div className="pagination-section card">
        <div className="card-header">
          <h2>Paginated Data</h2>
        </div>
        <div className="card-content">
          <div className="loading-indicator">Loading data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pagination-section card">
        <div className="card-header">
          <h2>Paginated Data</h2>
        </div>
        <div className="card-content">
          <div className="error-message">Error: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pagination-section card">
      <div className="card-header">
        <h2>Paginated Data</h2>
      </div>
      
      <div className="card-content">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item: any) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {data?.length === 0 && (
          <div className="empty-state">No data found</div>
        )}
        
        <div className="pagination-controls">
          <button 
            onClick={previousPage} 
            disabled={page === 1}
            className="pagination-button"
          >
            Previous
          </button>
          
          <div className="pagination-info">
            Page {page} of {totalPages}
          </div>
          
          <button 
            onClick={nextPage} 
            disabled={page === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
        
        {totalPages > 1 && (
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`page-number ${pageNum === page ? 'active' : ''}`}
              >
                {pageNum}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Infinite scroll section demonstrating useSupabaseInfiniteQuery
const InfiniteScrollSection: React.FC = () => {
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
        .from('procedures')
        .select('*')
        .order('name')
        .range(from, to);
        
      return { data, error };
    },
    { pageSize: 5 }
  );

  // Intersection Observer for infinite scrolling
  const observerTarget = React.useRef<HTMLDivElement>(null);
  
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

  return (
    <div className="infinite-scroll-section card">
      <div className="card-header">
        <h2>Infinite Scroll</h2>
      </div>
      
      <div className="card-content">
        <div className="infinite-scroll-container">
          {data?.map((item: any) => (
            <div key={item.id} className="scroll-item">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
          ))}
          
          {isLoading && (
            <div className="loading-indicator">Loading more...</div>
          )}
          
          {error && (
            <div className="error-message">Error: {error.message}</div>
          )}
          
          {data?.length === 0 && !isLoading && (
            <div className="empty-state">No data found</div>
          )}
          
          {/* Intersection observer target */}
          {hasMore && <div ref={observerTarget} className="observer-target"></div>}
          
          {!hasMore && data?.length > 0 && (
            <div className="end-message">You've reached the end!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSupabaseExample;
