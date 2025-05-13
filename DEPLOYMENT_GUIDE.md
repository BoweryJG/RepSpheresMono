# Market Insights Deployment Guide

This guide explains how to properly deploy the Market Insights application, addressing the issues that were causing Netlify deployment failures.

## Architecture Overview

The Market Insights application uses a three-tier architecture:

1. **Frontend (Netlify)**: React application that provides the user interface
2. **Backend API (Render)**: Node.js server that handles complex operations
3. **Database (Supabase)**: PostgreSQL database that stores all application data

## Recent Fixes

We've made the following changes to fix the deployment issues:

1. **Removed database setup from Netlify build process**:
   - Modified `netlify.toml` to remove the `setup-netlify` step from the build command
   - This prevents trying to set up database schema during frontend build

2. **Fixed JavaScript errors in Supabase client**:
   - Added a `safeIndexOf` method to prevent "Cannot read properties of undefined (reading 'indexOf')" errors
   - Enhanced string safety throughout the codebase

3. **Updated Vite configuration for top-level await support**:
   - Changed target from 'esnext' to 'es2022' for better browser compatibility
   - Set specific browser targets that support top-level await

4. **Created a backend database setup script**:
   - Added `setup-render-backend.js` for proper database setup on the backend
   - This script handles creating functions, views, and verifying data integrity

## Deployment Instructions

### 1. Frontend Deployment (Netlify)

The frontend should now deploy successfully with the following settings:

- **Build command**: `npm run build` (no setup-netlify step)
- **Publish directory**: `dist`
- **Environment variables**: Make sure all required environment variables are set in Netlify's UI:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_BASE_URL`
  - `VITE_BRAVE_SEARCH_API_KEY`
  - `VITE_GEMINI_API_KEY`

### 2. Backend Deployment (Render)

To properly set up your database schema:

1. Copy the `setup-render-backend.js` file to your backend repository
2. Add the following environment variables to your Render service:
   - `SUPABASE_URL` (same as `VITE_SUPABASE_URL`)
   - `SUPABASE_SERVICE_KEY` (this should be a service key with more privileges than the anon key)

3. Create an endpoint in your backend API to run the database setup:

```javascript
// Example endpoint in your Express backend
app.post('/api/admin/setup-database', async (req, res) => {
  try {
    // Require authentication for this endpoint
    if (!req.headers.authorization || req.headers.authorization !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { setupDatabase } = require('./setup-render-backend');
    await setupDatabase();
    
    res.json({ success: true, message: 'Database setup completed successfully' });
  } catch (error) {
    console.error('Database setup failed:', error);
    res.status(500).json({ error: 'Database setup failed', details: error.message });
  }
});
```

4. Alternatively, you can run the setup script during your backend service startup:

```javascript
// In your main server file
const { setupDatabase } = require('./setup-render-backend');

// Start the server
const app = express();
// ... configure your Express app ...

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Run database setup
  try {
    await setupDatabase();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
  }
});
```

### 3. Database (Supabase)

Make sure your Supabase project has:

1. The correct tables created (see the `ESSENTIAL_TABLES` list in `setup-render-backend.js`)
2. A service key created for backend operations (more privileged than the anon key)
3. Proper RLS (Row Level Security) policies configured for your tables

## Troubleshooting

If you encounter issues:

1. **Netlify build fails**: Check the build logs for specific errors. The most common issues are:
   - Missing environment variables
   - JavaScript errors in the build process
   - Incompatible browser targets

2. **Database setup fails**: Check the backend logs for specific errors. Common issues include:
   - Missing or incorrect Supabase credentials
   - Insufficient permissions for the service key
   - Existing tables or views with conflicting definitions

3. **Frontend can't connect to Supabase**: Check the browser console for errors. Common issues:
   - Incorrect Supabase URL or anon key
   - CORS issues
   - Network connectivity problems

## Best Practices

1. **Separation of concerns**:
   - Frontend (Netlify): User interface and simple data operations
   - Backend (Render): Complex operations, data processing, and database management
   - Database (Supabase): Data storage and simple queries

2. **Database setup**:
   - Always perform database schema setup from the backend, not the frontend
   - Use migrations for schema changes when possible
   - Verify data integrity regularly

3. **Environment variables**:
   - Keep sensitive keys in environment variables
   - Use different keys for development and production
   - Never expose service keys to the frontend

## Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Netlify Deployment Documentation](https://docs.netlify.com/configure-builds/overview/)
- [Render Documentation](https://render.com/docs)
