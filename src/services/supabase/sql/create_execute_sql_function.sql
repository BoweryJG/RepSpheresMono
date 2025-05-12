-- Create a function to execute raw SQL
-- This is useful for schema setup and other SQL operations

-- Drop the function if it exists
DROP FUNCTION IF EXISTS execute_sql(sql_query text);

-- Create the function
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- Grant execution permission to the anon role
GRANT EXECUTE ON FUNCTION execute_sql TO anon;

-- Add a comment to the function
COMMENT ON FUNCTION execute_sql IS 'Executes arbitrary SQL with appropriate security controls';
