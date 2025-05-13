-- Create a function to execute arbitrary SQL
-- This is used by various scripts to set up the database

CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Grant execute permission to authenticated users and anonymous users
GRANT EXECUTE ON FUNCTION public.execute_sql TO authenticated, anon;

-- Add a comment to the function
COMMENT ON FUNCTION public.execute_sql IS 'Executes arbitrary SQL. Use with caution as this has elevated privileges.';
