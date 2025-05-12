# Supabase Integration Fix Guide

This guide explains how to troubleshoot and fix the issue where tables in the Market Insights Supabase database are not properly populating in the UI components.

## Issue Overview

The primary issue was that the UI was trying to access data from the `dental_procedures_simplified` table, but the data loader was inserting data into a differently named table (`dental_procedures`). This mismatch caused the UI components to show empty data.

## Files Changed

1. **src/services/supabase/dataLoader.js**
   - Updated `loadProcedures()` to insert data into the `dental_procedures_simplified` table
   - Updated `checkDataLoaded()` to check the existence of data in the `dental_procedures_simplified` table

2. **src/services/supabase/supabaseDataService.js**
   - Fixed method `getDentalProcedures()` to read from the `dental_procedures_simplified` table

## Diagnostic and Fix Tools (New)

Several diagnostic and fix tools have been created to help resolve this issue:

1. **src/services/supabase/simpleCheck.js**
   - A simple diagnostic tool that checks access to the `dental_procedures_simplified` table

2. **src/services/supabase/runSimpleCheck.js**
   - Runner script that executes the simpleCheck.js diagnostic tool

3. **src/services/supabase/sql/create_dental_procedures_simplified.sql**
   - SQL migration that creates the `dental_procedures_simplified` table if it doesn't exist
   - Copies data from the original `dental_procedures` table if it exists

4. **src/services/supabase/runMigrateTables.js**
   - Script to run the SQL migration scripts and verify that tables exist

## How to Fix the Issue

Follow these steps to fix the database issues:

### 1. Run the Database Migration

This will create the `dental_procedures_simplified` table if it doesn't exist:

```bash
node src/services/supabase/runMigrateTables.js
```

### 2. Verify Table Access

After running the migration, verify that the table is accessible:

```bash
node src/services/supabase/runSimpleCheck.js
```

### 3. Re-run Data Loading (If Needed)

If the simple check indicates there is no data in the table, run the data loader:

```bash
node src/services/supabase/runDataLoader.js
```

### 4. Verify Data in the UI

Restart your development server and check that the dashboard now shows the dental procedures data:

```bash
npm run dev
```

## Additional Troubleshooting

If issues persist, try the following:

1. Check your `.env` file to ensure Supabase credentials are correct
2. Run the full verification process:
   ```bash
   node src/services/supabase/verifySupabaseData.js
   ```
3. Use the Supabase dashboard to directly inspect the tables and their data
4. If you see data in Supabase but not in the UI, check for RLS (Row Level Security) policies that might be preventing access

## Common Issues and Solutions

1. **Authentication Error**: If you encounter authentication issues, make sure your VITE_SUPABASE_USER and VITE_SUPABASE_PASSWORD are correctly set in the .env file.

2. **"Relation does not exist" Error**: This means the table doesn't exist in the database. Run the migration script to create it.

3. **Empty Data**: If tables exist but have no data, run the data loader script to populate them.

4. **RLS Policy Issues**: Make sure the appropriate RLS policies are in place to allow your application to read from the tables.

## Verification

After fixing the issues, you should see:

1. Data in the `dental_procedures_simplified` table when checking via the Supabase dashboard
2. No error messages in the console when opening the Market Insights dashboard
3. Populated cards and charts in the dashboard UI showing dental procedure information

If you need additional help, check the Supabase documentation or reach out to the development team.
