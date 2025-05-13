-- Create the v_all_procedures view
CREATE OR REPLACE VIEW v_all_procedures AS
SELECT 
  'dental' as industry,
  dp.id,
  dp.name,
  dp.description,
  dp.yearly_growth_percentage
FROM 
  dental_procedures dp
UNION ALL
SELECT 
  'aesthetic' as industry,
  ap.id,
  ap.name,
  ap.description,
  ap.yearly_growth_percentage
FROM 
  aesthetic_procedures ap
ORDER BY
  industry, name ASC;

-- Create the v_dental_companies view
CREATE OR REPLACE VIEW v_dental_companies AS
SELECT 
  c.id,
  c.name,
  c.industry,
  c.description,
  c.headquarters,
  c.website,
  c.market_share as market_share_pct,
  c.key_offerings as key_products
FROM 
  companies c
WHERE
  c.industry = 'dental'
ORDER BY
  c.name ASC;

-- Create the v_aesthetic_companies view
CREATE OR REPLACE VIEW v_aesthetic_companies AS
SELECT 
  c.id,
  c.name,
  c.industry,
  c.description,
  c.headquarters,
  c.website,
  c.market_share as market_share_pct,
  c.key_offerings as key_products
FROM 
  companies c
WHERE
  c.industry = 'aesthetic'
ORDER BY
  c.name ASC;

-- Grant access to the views
GRANT SELECT ON v_all_procedures TO authenticated, anon;
GRANT SELECT ON v_dental_companies TO authenticated, anon;
GRANT SELECT ON v_aesthetic_companies TO authenticated, anon;

-- Create the search_procedures function
CREATE OR REPLACE FUNCTION search_procedures(search_term TEXT)
RETURNS TABLE (
  industry TEXT,
  id INTEGER,
  name TEXT,
  description TEXT,
  yearly_growth_percentage NUMERIC
)
LANGUAGE SQL
AS $$
  SELECT 
    'dental' as industry,
    dp.id,
    dp.name,
    dp.description,
    dp.yearly_growth_percentage
  FROM 
    dental_procedures dp
  WHERE
    dp.name ILIKE '%' || search_term || '%'
    OR dp.description ILIKE '%' || search_term || '%'
  UNION ALL
  SELECT 
    'aesthetic' as industry,
    ap.id,
    ap.name,
    ap.description,
    ap.yearly_growth_percentage
  FROM 
    aesthetic_procedures ap
  WHERE
    ap.name ILIKE '%' || search_term || '%'
    OR ap.description ILIKE '%' || search_term || '%'
  ORDER BY
    industry, name ASC;
$$;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION search_procedures TO authenticated, anon;
