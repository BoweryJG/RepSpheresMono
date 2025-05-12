-- File: supabase-functions.sql
-- Purpose: Create essential utility functions for Supabase
-- Run this directly in the Supabase SQL Editor

-- Basic version function to get database info
CREATE OR REPLACE FUNCTION public.version()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'version', version(),
    'server_version', current_setting('server_version'),
    'system_time', now()
  );
$$;

ALTER FUNCTION public.version() OWNER TO postgres;

-- Basic execute_sql function for non-select statements
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

ALTER FUNCTION public.execute_sql(text) OWNER TO postgres;

-- Function to execute SQL and return results
CREATE OR REPLACE FUNCTION public.execute_sql_with_results(sql_query text)
RETURNS TABLE (json_result json)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE sql_query;
END;
$$;

ALTER FUNCTION public.execute_sql_with_results(text) OWNER TO postgres;

-- Function to list all tables in the database with row counts
CREATE OR REPLACE FUNCTION public.list_all_tables()
RETURNS TABLE (
    schema_name text,
    table_name text,
    row_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
      n.nspname::text AS schema_name,
      c.relname::text AS table_name,
      CASE
          WHEN c.reltuples < 0 THEN 0::bigint
          ELSE c.reltuples::bigint
      END AS row_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r'
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
  ORDER BY n.nspname, c.relname;
END;
$$;

ALTER FUNCTION public.list_all_tables() OWNER TO postgres;

-- Grant access to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.version() TO authenticated;
GRANT EXECUTE ON FUNCTION public.version() TO anon;

GRANT EXECUTE ON FUNCTION public.execute_sql TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_sql TO anon;

GRANT EXECUTE ON FUNCTION public.execute_sql_with_results TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_sql_with_results TO anon;

GRANT EXECUTE ON FUNCTION public.list_all_tables TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_all_tables TO anon;
