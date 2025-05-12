# Supabase Troubleshooting Guide

This guide helps diagnose and fix common issues with Supabase data in the Market Insights application. If you're experiencing problems with data not appearing in the UI or encountering database errors, the tools and instructions here can help.

## Quick Fix

If you're experiencing data display issues, run the automated repair script:

```bash
npm run fix-supabase
```

This script will:
1. Test your Supabase connection
2. Diagnose database issues
3. Fix common problems automatically
4. Provide guidance for manual fixes if needed

## Common Issues

### 1. No Data Showing in UI

If dashboards or tables are empty, this is typically caused by one of these issues:

- **Missing Database Connection**: Your .env file may be missing Supabase credentials
- **Missing Tables**: The required database tables don't exist
- **Empty Tables**: Tables exist but contain no data
- **RLS Policies**: Row Level Security isn't configured correctly

### 2. Authentication Issues

If you see authentication errors:

- Check your .env file contains the correct Supabase credentials
- Ensure your Supabase project is active
- Verify your user has proper permissions

### 3. Debugging Client-Side

Check your browser's developer console for errors like:

- `Error: Database error: relation "dental_procedures" does not exist`
- `Error: User is not authenticated`
- `Error: The resource was not found`

## Diagnostic Tools

This project includes several diagnostic tools:

### Test Database Connection

```bash
npm run test-db
```

Checks if your application can connect to Supabase and verifies basic table access.

### Setup Diagnostics

```bash
npm run setup-diagnostics
```

Installs helper functions in your Supabase database to assist with diagnostics.

### Verify Supabase Data

```bash
node src/services/supabase/verifySupabaseData.js
```

Performs comprehensive verification of your database structure and data.

### Fix Data Issues

```bash
npm run fix-data
```

Attempts to fix identified data issues automatically.

## Manual Setup

If automatic tools don't resolve your issues, you can manually set up your database:

### 1. Set up Environment Variables

Create a `.env` file in the project root with:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_USER=your-email@example.com
VITE_SUPABASE_PASSWORD=your-password
```

### 2. Create Database Schema

```bash
npm run setup-schema
```

### 3. Load Initial Data

```bash
npm run load-procedures
```

### 4. Verify Data was Loaded

```bash
npm run verify-data
```

## Database Structure

The Market Insights application relies on these essential tables:

- **dental_procedures**: Core dental procedures data
- **aesthetic_procedures**: Core aesthetic procedures data
- **categories**: Category classifications for procedures
- **companies**: Company data
- **market_trends**: Market trend data
- **news_articles**: News article data

## Row Level Security (RLS)

For the application to function properly, Row Level Security policies must allow:

- Public read access to all core data tables
- Write access for authenticated users

If RLS is configured incorrectly, data may exist but won't be visible in the UI.

## Advanced: Direct SQL Access

For direct access to the database:

1. Visit your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to the SQL Editor
4. Run queries to check or fix data:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Check dental procedures count
SELECT COUNT(*) FROM dental_procedures;

-- Fix RLS policies
ALTER TABLE public.dental_procedures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.dental_procedures
  FOR SELECT USING (true);
```

## Getting Further Help

If you continue to experience issues after following these steps, please:

1. Run the full diagnostics: `npm run fix-supabase`
2. Copy the output
3. Share the results with the development team for further assistance
