-- Create dental_procedures_simplified table based on dental_procedures structure
-- This table provides a simplified version of the dental procedures data

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.dental_procedures_simplified (
  id SERIAL PRIMARY KEY,
  procedure_name TEXT NOT NULL UNIQUE,
  category_id INTEGER REFERENCES dental_categories(id),
  yearly_growth_percentage NUMERIC(5,2) NOT NULL,
  market_size_2025_usd_millions NUMERIC(5,2) NOT NULL,
  age_range TEXT NOT NULL,
  recent_trends TEXT NOT NULL,
  future_outlook TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.dental_procedures_simplified ENABLE ROW LEVEL SECURITY;

-- Create access policy for public reading
CREATE POLICY IF NOT EXISTS "Allow public to read dental_procedures_simplified" 
ON public.dental_procedures_simplified 
FOR SELECT 
TO anon 
USING (true);

-- Create trigger to update the 'updated_at' timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_dental_procedures_simplified_updated_at ON public.dental_procedures_simplified;
CREATE TRIGGER update_dental_procedures_simplified_updated_at
BEFORE UPDATE ON public.dental_procedures_simplified
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Check if the dental_procedures table exists, and if so, copy data from it
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dental_procedures') THEN
        INSERT INTO public.dental_procedures_simplified
        (procedure_name, category_id, yearly_growth_percentage, market_size_2025_usd_millions, age_range, recent_trends, future_outlook)
        SELECT 
            procedure_name, 
            category_id, 
            yearly_growth_percentage, 
            market_size_2025_usd_millions, 
            age_range, 
            recent_trends, 
            future_outlook
        FROM public.dental_procedures
        ON CONFLICT (procedure_name) DO NOTHING;
    END IF;
END $$;

-- Comment on table and columns for better documentation
COMMENT ON TABLE public.dental_procedures_simplified IS 'Simplified version of dental procedures data containing core market analytics';
COMMENT ON COLUMN public.dental_procedures_simplified.procedure_name IS 'Name of the dental procedure';
COMMENT ON COLUMN public.dental_procedures_simplified.category_id IS 'Foreign key to dental_categories table';
COMMENT ON COLUMN public.dental_procedures_simplified.yearly_growth_percentage IS 'Annual growth rate in percentage';
COMMENT ON COLUMN public.dental_procedures_simplified.market_size_2025_usd_millions IS 'Projected market size in 2025 (USD millions)';
COMMENT ON COLUMN public.dental_procedures_simplified.age_range IS 'Primary age range for this procedure';
COMMENT ON COLUMN public.dental_procedures_simplified.recent_trends IS 'Recent market trends for this procedure';
COMMENT ON COLUMN public.dental_procedures_simplified.future_outlook IS 'Future market outlook for this procedure';
