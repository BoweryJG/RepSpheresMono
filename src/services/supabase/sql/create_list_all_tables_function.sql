-- Function to list all tables in the database
-- This allows diagnostic tools to find all tables without needing elevated permissions

CREATE OR REPLACE FUNCTION public.list_all_tables()
RETURNS TABLE (tablename text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT table_name::text
  FROM information_schema.tables
  WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
  AND table_type = 'BASE TABLE'
  ORDER BY table_schema, table_name;
END;
$$;

-- Grant execute permission to authenticated users and anon
ALTER FUNCTION public.list_all_tables() SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.list_all_tables() TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_all_tables() TO anon;
