# Supabase Database Connection Troubleshooting Guide

## Connection Issues

If you're experiencing connection issues with your Supabase database in the Market Insights application, follow this guide to diagnose and fix common problems.

## Quick Diagnostics

Run these scripts to diagnose your Supabase connection issues:

```bash
# Check if the Supabase project is accessible
node src/services/supabase/checkProjectAvailability.js

# Run a complete database test including tables and RLS policies
node src/services/supabase/nodeDatabaseTest.js
```

## Common Issues and Solutions

### 1. Environment Variable Issues

Environment variables must be correctly configured in your `.env` file:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Check for:
- Missing or incorrect URL/Key
- Typos in variable names
- Extra spaces or quotes
- Using the wrong key type (anon key vs service_role key)

### 2. Row Level Security (RLS) Issues

When Row Level Security is enabled but no policies are defined, all access is denied. This is a common reason why data won't load even with correct credentials.

**Fix RLS Policies:**

```bash
# Run the RLS policy setup script
node src/services/supabase/runSetupRls.js
```

**Manual RLS Fix:**

If the script isn't working, you can manually set this up in the Supabase SQL Editor:

```sql
-- Enable RLS on a table (if not already enabled)
ALTER TABLE public.dental_procedures_simplified ENABLE ROW LEVEL SECURITY;

-- Create a policy allowing read access to everyone
CREATE POLICY "dental_procedures_simplified_anon_select"
ON public.dental_procedures_simplified
FOR SELECT
TO authenticated, anon
USING (true);

-- Repeat for other tables, changing the table name
```

### 3. Supabase Project Status Issues

Your Supabase project might:
- Be paused (needs to be resumed in Supabase dashboard)
- Be in maintenance mode
- Have expired billing
- Have reached resource limits

**Check:** Visit [https://app.supabase.com](https://app.supabase.com) and verify your project status.

### 4. Network-Related Issues

If you can't connect to your Supabase project:

- Check if you're behind a VPN that might block access
- Try connecting from a different network
- Check if your firewall is blocking connections
- Verify CORS settings in Supabase dashboard if using a dev server

### 5. Data Population Issues

If connection works but data isn't showing:

```bash
# Validate data exists in tables
node src/services/supabase/verifySupabaseData.js

# Re-run the data population process
node src/services/supabase/runFullDataProcess.js
```

## SQL Queries for Common Fixes

### Check Table Existence and Row Count

```sql
SELECT
  table_name,
  (SELECT count(*) FROM public.TABLENAME) as row_count
FROM
  information_schema.tables
WHERE
  table_schema = 'public'
  AND table_type = 'BASE TABLE';
```

### List All RLS Policies

```sql
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM
  pg_policies
WHERE
  schemaname = 'public'
ORDER BY
  tablename;
```

### Enable RLS and Create Policies for All Tables

```sql
-- Create a function to execute SQL that returns results
CREATE OR REPLACE FUNCTION public.execute_sql_with_results(sql_query TEXT)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE sql_query;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.execute_sql_with_results TO authenticated, anon;

-- Create a function to execute SQL without results
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.execute_sql TO authenticated, anon;
```

## Complete Reset

If you need to reset your database connection completely:

1. Check your environment variables one more time
2. Visit the Supabase dashboard and ensure your project is active
3. Run the setup scripts:

```bash
# Set up the schema and tables
node src/services/supabase/setupSchema.js

# Set up RLS policies
node src/services/supabase/runSetupRls.js

# Load initial data
node src/services/supabase/runFullDataProcess.js
```

## Need More Help?

If you've tried everything and still have issues, review browser console logs or server logs for more specific errors.
