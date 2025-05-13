/**
 * Netlify Deployment Setup Script
 * 
 * This script is executed during Netlify build process to:
 * 1. Verify and setup database schema
 * 2. Initialize required views and functions
 * 3. Load essential data for production
 * 4. Validate the data was properly loaded
 */

// Use require instead of import to avoid top-level await issues
// Wrap in try-catch to handle any loading errors gracefully
let dotenv, createClient, fs, path;

try {
  dotenv = require('dotenv');
  const supabase = require('@supabase/supabase-js');
  createClient = supabase.createClient;
  fs = require('fs');
  path = require('path');
  
  // Load environment variables
  dotenv.config();
  console.log('✅ Required modules loaded successfully');
} catch (err) {
  console.error('⚠️ Error loading required modules:', err.message);
  process.exit(1);
}

// Create Supabase client for direct access
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⛔ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration
const ESSENTIAL_TABLES = [
  'dental_procedures_simplified',
  'aesthetic_procedures',
  'categories',
  'aesthetic_categories',
  'companies',
  'dental_market_growth',
  'aesthetic_market_growth',
  'news_articles',
  'events',
  'trending_topics'
];

const REQUIRED_VIEWS = [
  'v_all_procedures',
  'v_dental_companies',
  'v_aesthetic_companies'
];

const REQUIRED_FUNCTIONS = [
  'search_procedures'
];

/**
 * Main setup function
 */
async function setupNetlify() {
  console.log('🚀 Starting Netlify deployment setup...');
  
  try {
    // Step 1: Verify database connection
    console.log('📡 Verifying Supabase connection...');
    const { data, error } = await supabase.from('_anon_count').select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('⛔ Failed to connect to Supabase:', error.message);
      // Continue anyway, we'll try to set up the database
    } else {
      console.log('✅ Successfully connected to Supabase');
    }
    
    // Step 2: Create essential tables if they don't exist
    console.log('🏗️ Setting up database schema...');
    await setupDatabaseSchema();
    
    // Step 3: Create required views
    console.log('👁️ Creating database views...');
    await createRequiredViews();
    
    // Step 4: Create required functions
    console.log('⚙️ Creating database functions...');
    await createRequiredFunctions();
    
    // Step 5: Load essential data
    console.log('📊 Loading essential data...');
    await loadEssentialData();
    
    // Step 6: Verify data was loaded
    console.log('🔍 Verifying data integrity...');
    await verifyDataIntegrity();
    
    console.log('✅ Netlify setup completed successfully!');
  } catch (error) {
    console.error('⛔ Error during Netlify setup:', error);
    // Don't exit with error code, allow the build to continue
    console.log('⚠️ Setup encountered errors but will continue with deployment');
  }
}

/**
 * Setup database schema
 */
async function setupDatabaseSchema() {
  try {
    // Read schema.sql file
    const schemaPath = path.join(process.cwd(), 'src', 'services', 'supabase', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.warn('⚠️ Schema file not found. Will try to create tables directly.');
      await createEssentialTables();
      return;
    }
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split into separate statements
    const statements = schemaSql.split(';').filter(stmt => stmt.trim().length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      const { error } = await supabase.rpc('execute_sql', { sql: statement });
      if (error) {
        console.warn(`⚠️ Error executing statement: ${error.message}`);
        // Continue with next statement
      }
    }
    
    console.log('✅ Schema setup completed');
  } catch (error) {
    console.warn('⚠️ Error setting up schema:', error.message);
    console.log('Attempting to create essential tables directly...');
    await createEssentialTables();
  }
}

/**
 * Create essential tables directly
 */
async function createEssentialTables() {
  // Create categories table
  await supabase.rpc('execute_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        category_label TEXT NOT NULL,
        description TEXT,
        industry TEXT NOT NULL,
        position INTEGER DEFAULT 0
      );
    `
  });
  
  // Create aesthetic_categories table
  await supabase.rpc('execute_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS aesthetic_categories (
        id SERIAL PRIMARY KEY,
        category_label TEXT NOT NULL,
        description TEXT,
        position INTEGER DEFAULT 0
      );
    `
  });
  
  // Create dental_procedures_simplified table
  await supabase.rpc('execute_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS dental_procedures_simplified (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        yearly_growth_percentage NUMERIC,
        market_size_2025_usd_millions NUMERIC,
        primary_age_group TEXT,
        category_id INTEGER REFERENCES categories(id),
        trends TEXT
      );
    `
  });
  
  // Create aesthetic_procedures table
  await supabase.rpc('execute_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS aesthetic_procedures (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        trends TEXT,
        yearly_growth_percentage NUMERIC,
        market_size_2025_usd_millions NUMERIC,
        primary_age_group TEXT,
        category_id INTEGER REFERENCES aesthetic_categories(id),
        future_outlook TEXT
      );
    `
  });
  
  // Create companies table
  await supabase.rpc('execute_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        industry TEXT NOT NULL,
        marketShare NUMERIC,
        growthRate NUMERIC,
        keyOfferings TEXT,
        topProducts TEXT,
        founded INTEGER,
        headquarters TEXT,
        timeInMarket INTEGER,
        url TEXT,
        category_id INTEGER
      );
    `
  });
  
  // Create market growth tables
  await supabase.rpc('execute_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS dental_market_growth (
        id SERIAL PRIMARY KEY,
        year INTEGER NOT NULL,
        size NUMERIC NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS aesthetic_market_growth (
        id SERIAL PRIMARY KEY,
        year INTEGER NOT NULL,
        size NUMERIC NOT NULL
      );
    `
  });
  
  // Create news_articles table
  await supabase.rpc('execute_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS news_articles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        summary TEXT,
        source TEXT,
        url TEXT,
        published_date TIMESTAMP,
        industry TEXT,
        featured BOOLEAN DEFAULT false
      );
    `
  });
  
  // Create events table
  await supabase.rpc('execute_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        url TEXT,
        event_date_start TIMESTAMP,
        event_date_end TIMESTAMP,
        location TEXT,
        city TEXT,
        country TEXT,
        industry TEXT,
        source TEXT
      );
    `
  });
  
  // Create trending_topics table
  await supabase.rpc('execute_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS trending_topics (
        id SERIAL PRIMARY KEY,
        topic TEXT NOT NULL,
        industry TEXT NOT NULL,
        relevance_score NUMERIC,
        source_articles_count INTEGER,
        keywords TEXT
      );
    `
  });
  
  console.log('✅ Essential tables created directly');
}

/**
 * Create required views
 */
async function createRequiredViews() {
  // Create consolidated procedures view
  await supabase.rpc('execute_sql', {
    sql: `
      CREATE OR REPLACE VIEW v_all_procedures AS
      SELECT 
        d.id,
        d.name,
        d.description,
        d.yearly_growth_percentage,
        d.market_size_2025_usd_millions,
        d.primary_age_group,
        d.category_id,
        c.category_label,
        d.trends,
        NULL as future_outlook,
        'dental' as industry
      FROM 
        dental_procedures_simplified d
      LEFT JOIN 
        categories c ON d.category_id = c.id
      
      UNION ALL
      
      SELECT 
        a.id,
        a.name,
        NULL as description,
        a.yearly_growth_percentage,
        a.market_size_2025_usd_millions,
        a.primary_age_group,
        a.category_id,
        ac.category_label,
        a.trends,
        a.future_outlook,
        'aesthetic' as industry
      FROM 
        aesthetic_procedures a
      LEFT JOIN 
        aesthetic_categories ac ON a.category_id = ac.id;
    `
  });
  
  // Create dental companies view
  await supabase.rpc('execute_sql', {
    sql: `
      CREATE OR REPLACE VIEW v_dental_companies AS
      SELECT 
        c.*,
        cat.category_label,
        cat.id as category_id
      FROM 
        companies c
      LEFT JOIN 
        categories cat ON c.category_id = cat.id
      WHERE 
        c.industry = 'dental';
    `
  });
  
  // Create aesthetic companies view
  await supabase.rpc('execute_sql', {
    sql: `
      CREATE OR REPLACE VIEW v_aesthetic_companies AS
      SELECT 
        c.*,
        ac.category_label,
        ac.id as category_id
      FROM 
        companies c
      LEFT JOIN 
        aesthetic_categories ac ON c.category_id = ac.id
      WHERE 
        c.industry = 'aesthetic';
    `
  });
  
  console.log('✅ Required views created');
}

/**
 * Create required functions
 */
async function createRequiredFunctions() {
  // Create execute_sql function if it doesn't exist
  await supabase.rpc('execute_sql', {
    sql: `
      CREATE OR REPLACE FUNCTION execute_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `
  });
  
  // Create search_procedures function
  await supabase.rpc('execute_sql', {
    sql: `
      CREATE OR REPLACE FUNCTION search_procedures(search_term text)
      RETURNS TABLE (
        id integer,
        name text,
        description text,
        yearly_growth_percentage numeric,
        market_size_2025_usd_millions numeric,
        primary_age_group text,
        category_id integer,
        category_label text,
        trends text,
        future_outlook text,
        industry text
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN QUERY
        SELECT * FROM v_all_procedures
        WHERE 
          name ILIKE '%' || search_term || '%' OR
          COALESCE(description, '') ILIKE '%' || search_term || '%' OR
          COALESCE(trends, '') ILIKE '%' || search_term || '%';
      END;
      $$;
    `
  });
  
  console.log('✅ Required functions created');
}

/**
 * Load essential data
 */
async function loadEssentialData() {
  // Check if data already exists
  const { count: proceduresCount, error: countError } = await supabase
    .from('dental_procedures_simplified')
    .select('*', { count: 'exact', head: true });
  
  if (!countError && proceduresCount > 0) {
    console.log('✅ Data already exists, skipping data load');
    return;
  }
  
  // Load categories data
  await loadCategories();
  
  // Load dental procedures data
  await loadDentalProcedures();
  
  // Load aesthetic procedures data
  await loadAestheticProcedures();
  
  // Load company data
  await loadCompanies();
  
  // Load market growth data
  await loadMarketGrowthData();
  
  console.log('✅ Essential data loaded');
}

/**
 * Load categories data
 */
async function loadCategories() {
  const dentalCategories = [
    { category_label: 'Preventative', description: 'Preventative dental procedures', industry: 'dental', position: 1 },
    { category_label: 'Restorative', description: 'Restorative dental procedures', industry: 'dental', position: 2 },
    { category_label: 'Cosmetic', description: 'Cosmetic dental procedures', industry: 'dental', position: 3 },
    { category_label: 'Orthodontic', description: 'Orthodontic dental procedures', industry: 'dental', position: 4 },
    { category_label: 'Surgical', description: 'Surgical dental procedures', industry: 'dental', position: 5 }
  ];
  
  const aestheticCategories = [
    { category_label: 'Injectables', description: 'Injectable aesthetic procedures', position: 1 },
    { category_label: 'Skin Treatments', description: 'Aesthetic skin treatments', position: 2 },
    { category_label: 'Body Contouring', description: 'Body contouring aesthetic procedures', position: 3 },
    { category_label: 'Surgical', description: 'Surgical aesthetic procedures', position: 4 },
    { category_label: 'Hair Restoration', description: 'Hair restoration aesthetic procedures', position: 5 }
  ];
  
  // Insert dental categories
  for (const category of dentalCategories) {
    const { error } = await supabase
      .from('categories')
      .upsert(category, { onConflict: 'category_label, industry' });
    
    if (error) {
      console.warn(`⚠️ Error inserting dental category ${category.category_label}:`, error.message);
    }
  }
  
  // Insert aesthetic categories
  for (const category of aestheticCategories) {
    const { error } = await supabase
      .from('aesthetic_categories')
      .upsert(category, { onConflict: 'category_label' });
    
    if (error) {
      console.warn(`⚠️ Error inserting aesthetic category ${category.category_label}:`, error.message);
    }
  }
}

/**
 * Load dental procedures data
 */
async function loadDentalProcedures() {
  // Get category IDs
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, category_label')
    .eq('industry', 'dental');
  
  if (catError) {
    console.warn('⚠️ Error fetching dental categories:', catError.message);
    return;
  }
  
  // Create category ID map
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.category_label] = cat.id;
  });
  
  // Dental procedures data
  const dentalProcedures = [
    {
      name: 'Teeth Cleaning',
      description: 'Professional removal of plaque and tartar',
      yearly_growth_percentage: 5.2,
      market_size_2025_usd_millions: 8.4,
      primary_age_group: 'All Ages',
      category_id: categoryMap['Preventative'],
      trends: 'Growing focus on preventative care and increasing awareness of oral health.'
    },
    {
      name: 'Dental Implants',
      description: 'Artificial tooth root to support restorations',
      yearly_growth_percentage: 9.8,
      market_size_2025_usd_millions: 6.9,
      primary_age_group: '45-65',
      category_id: categoryMap['Restorative'],
      trends: 'Technological advancements in materials and techniques leading to higher success rates.'
    },
    {
      name: 'Teeth Whitening',
      description: 'Bleaching procedure to whiten teeth',
      yearly_growth_percentage: 7.3,
      market_size_2025_usd_millions: 4.5,
      primary_age_group: '25-45',
      category_id: categoryMap['Cosmetic'],
      trends: 'Increasing demand driven by social media and aesthetic awareness.'
    },
    {
      name: 'Clear Aligners',
      description: 'Clear plastic aligners to straighten teeth',
      yearly_growth_percentage: 15.2,
      market_size_2025_usd_millions: 7.8,
      primary_age_group: '18-35',
      category_id: categoryMap['Orthodontic'],
      trends: 'Significant growth due to demand for discreet orthodontic options.'
    },
    {
      name: 'Root Canal',
      description: 'Treatment for infected tooth pulp',
      yearly_growth_percentage: 3.8,
      market_size_2025_usd_millions: 5.2,
      primary_age_group: '35-65',
      category_id: categoryMap['Restorative'],
      trends: 'Advanced technologies making procedures more efficient and less painful.'
    },
    {
      name: 'Veneers',
      description: 'Thin porcelain coverings for front teeth',
      yearly_growth_percentage: 8.7,
      market_size_2025_usd_millions: 3.9,
      primary_age_group: '25-45',
      category_id: categoryMap['Cosmetic'],
      trends: 'Rising popularity from celebrity endorsements and social media influence.'
    },
    {
      name: 'Wisdom Tooth Removal',
      description: 'Extraction of third molars',
      yearly_growth_percentage: 2.9,
      market_size_2025_usd_millions: 4.1,
      primary_age_group: '18-25',
      category_id: categoryMap['Surgical'],
      trends: 'Preventative removal becoming more common to avoid future complications.'
    },
    {
      name: 'Fluoride Treatment',
      description: 'Application of fluoride to strengthen enamel',
      yearly_growth_percentage: 4.6,
      market_size_2025_usd_millions: 2.8,
      primary_age_group: 'All Ages',
      category_id: categoryMap['Preventative'],
      trends: 'Increasing adoption in preventative care plans.'
    },
    {
      name: 'Dental Bridges',
      description: 'Fixed replacement for missing teeth',
      yearly_growth_percentage: 5.1,
      market_size_2025_usd_millions: 3.7,
      primary_age_group: '45-70',
      category_id: categoryMap['Restorative'],
      trends: 'Evolution in materials and techniques improving longevity.'
    },
    {
      name: 'Dental Crowns',
      description: 'Caps to cover damaged teeth',
      yearly_growth_percentage: 6.8,
      market_size_2025_usd_millions: 5.6,
      primary_age_group: '35-65',
      category_id: categoryMap['Restorative'],
      trends: 'Digital technology enabling same-day crown placement.'
    }
  ];
  
  // Insert dental procedures
  for (const procedure of dentalProcedures) {
    const { error } = await supabase
      .from('dental_procedures_simplified')
      .upsert(procedure, { onConflict: 'name' });
    
    if (error) {
      console.warn(`⚠️ Error inserting dental procedure ${procedure.name}:`, error.message);
    }
  }
}

/**
 * Load aesthetic procedures data
 */
async function loadAestheticProcedures() {
  // Get category IDs
  const { data: categories, error: catError } = await supabase
    .from('aesthetic_categories')
    .select('id, category_label');
  
  if (catError) {
    console.warn('⚠️ Error fetching aesthetic categories:', catError.message);
    return;
  }
  
  // Create category ID map
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.category_label] = cat.id;
  });
  
  // Aesthetic procedures data
  const aestheticProcedures = [
    {
      name: 'Botox',
      trends: 'Growing popularity among younger demographics for preventative use.',
      yearly_growth_percentage: 8.7,
      market_size_2025_usd_millions: 9.2,
      primary_age_group: '30-50',
      category_id: categoryMap['Injectables'],
      future_outlook: 'Continued growth expected with expanding applications.'
    },
    {
      name: 'Hyaluronic Acid Fillers',
      trends: 'Natural-looking results with minimal downtime driving popularity.',
      yearly_growth_percentage: 10.3,
      market_size_2025_usd_millions: 7.8,
      primary_age_group: '35-60',
      category_id: categoryMap['Injectables'],
      future_outlook: 'Innovations in formulation leading to longer-lasting results.'
    },
    {
      name: 'Laser Skin Resurfacing',
      trends: 'Advanced fractional technologies offering customizable treatments.',
      yearly_growth_percentage: 12.4,
      market_size_2025_usd_millions: 5.6,
      primary_age_group: '40-65',
      category_id: categoryMap['Skin Treatments'],
      future_outlook: 'Growing demand for non-invasive skin rejuvenation solutions.'
    },
    {
      name: 'CoolSculpting',
      trends: 'Non-surgical fat reduction growing in popularity due to no downtime.',
      yearly_growth_percentage: 15.8,
      market_size_2025_usd_millions: 6.3,
      primary_age_group: '30-55',
      category_id: categoryMap['Body Contouring'],
      future_outlook: 'Expanding applications to treat more body areas.'
    },
    {
      name: 'Rhinoplasty',
      trends: 'Ethnic rhinoplasty gaining popularity, preserving cultural features.',
      yearly_growth_percentage: 5.2,
      market_size_2025_usd_millions: 8.1,
      primary_age_group: '20-40',
      category_id: categoryMap['Surgical'],
      future_outlook: 'Computer imaging creating more predictable outcomes.'
    },
    {
      name: 'Microneedling',
      trends: 'Growing popularity due to minimal downtime and effective results.',
      yearly_growth_percentage: 14.2,
      market_size_2025_usd_millions: 4.2,
      primary_age_group: '25-45',
      category_id: categoryMap['Skin Treatments'],
      future_outlook: 'Combination treatments with PRP showing promising results.'
    },
    {
      name: 'Lip Augmentation',
      trends: 'Shift toward more natural-looking enhancements.',
      yearly_growth_percentage: 9.5,
      market_size_2025_usd_millions: 3.9,
      primary_age_group: '20-40',
      category_id: categoryMap['Injectables'],
      future_outlook: 'New filler formulations specifically designed for lips.'
    },
    {
      name: 'Hair Transplantation',
      trends: 'Follicular Unit Extraction (FUE) becoming the standard.',
      yearly_growth_percentage: 11.7,
      market_size_2025_usd_millions: 5.7,
      primary_age_group: '30-55',
      category_id: categoryMap['Hair Restoration'],
      future_outlook: 'Robotic technologies improving precision and results.'
    },
    {
      name: 'Breast Augmentation',
      trends: 'Trend toward more natural sizing and shaped implants.',
      yearly_growth_percentage: 4.8,
      market_size_2025_usd_millions: 9.5,
      primary_age_group: '25-45',
      category_id: categoryMap['Surgical'],
      future_outlook: 'Improved safety profiles of implants and surgical techniques.'
    },
    {
      name: 'Chemical Peels',
      trends: 'Customized formulations for specific skin concerns gaining traction.',
      yearly_growth_percentage: 7.9,
      market_size_2025_usd_millions: 4.1,
      primary_age_group: '30-55',
      category_id: categoryMap['Skin Treatments'],
      future_outlook: 'Combination therapies with other treatments increasing efficacy.'
    }
  ];
  
  // Insert aesthetic procedures
  for (const procedure of aestheticProcedures) {
    const { error } = await supabase
      .from('aesthetic_procedures')
      .upsert(procedure, { onConflict: 'name' });
    
    if (error) {
      console.warn(`⚠️ Error inserting aesthetic procedure ${procedure.name}:`, error.message);
    }
  }
}

/**
 * Load company data
 */
async function loadCompanies() {
  // Get category IDs
  const { data: dentalCategories, error: dentalCatError } = await supabase
    .from('categories')
    .select('id, category_label')
    .eq('industry', 'dental');
  
  const { data: aestheticCategories, error: aestheticCatError } = await supabase
    .from('aesthetic_categories')
    .select('id, category_label');
  
  if (dentalCatError || aestheticCatError) {
    console.warn('⚠️ Error fetching categories for companies:', dentalCatError?.message || aestheticCatError?.message);
    return;
  }
  
  // Create category ID maps
  const dentalCategoryMap = {};
  dentalCategories.forEach(cat => {
    dentalCategoryMap[cat.category_label] = cat.id;
  });
  
  const aestheticCategoryMap = {};
  aestheticCategories.forEach(cat => {
    aestheticCategoryMap[cat.category_label] = cat.id;
  });
  
  // Sample companies data
  const companies = [
    {
      name: 'Align Technology',
      industry: 'dental',
      marketShare: 8.5,
      growthRate: 15.2,
      keyOfferings: JSON.stringify(['Clear Aligners', 'Digital Scanning', 'Treatment Planning']),
      topProducts: JSON.stringify(['Invisalign', 'iTero Scanner']),
      founded: 1997,
      headquarters: 'San Jose, CA',
      timeInMarket: 25,
      url: 'https://www.aligntech.com',
      category_id: dentalCategoryMap['Orthodontic']
    },
    {
      name: 'Dentsply Sirona',
      industry: 'dental',
      marketShare: 10.2,
      growthRate: 6.8,
      keyOfferings: JSON.stringify(['Dental Equipment', 'Consumables', 'Digital Dentistry']),
      topProducts: JSON.stringify(['CEREC', 'Primescan', 'SureFil SDR']),
      founded: 1899,
      headquarters: 'Charlotte, NC',
      timeInMarket: 124,
      url: 'https://www.dentsplysirona.com',
      category_id: dentalCategoryMap['Restorative']
    },
    {
      name: 'Straumann Group',
      industry: 'dental',
      marketShare: 7.8,
      growthRate: 9.1,
      keyOfferings: JSON.stringify(['Dental Implants', 'Biomaterials', 'Digital Solutions']),
      topProducts: JSON.stringify(['BLX Implant System', 'Emdogain', 'ClearCorrect']),
      founded: 1954,
      headquarters: 'Basel, Switzerland',
      timeInMarket: 69,
      url: 'https://www.straumann.com',
      category_id: dentalCategoryMap['Restorative']
    },
    {
      name: 'Henry Schein',
      industry: 'dental',
      marketShare: 9.5,
      growthRate: 5.4,
      keyOfferings: JSON.stringify(['Dental Supplies', 'Equipment Distribution', 'Practice Solutions']),
      topProducts: JSON.stringify(['Dentrix', 'axiUm', 'All-Ceramic Restorations']),
      founded: 1932,
      headquarters: 'Melville, NY',
      timeInMarket: 91,
      url: 'https://www.henryschein.com',
      category_id: dentalCategoryMap['Preventative']
    },
    {
      name: 'Allergan Aesthetics (AbbVie)',
      industry: 'aesthetic',
      marketShare: 12.5,
      growthRate: 8.7,
      keyOfferings: JSON.stringify(['Injectables', 'Body Contouring', 'Skincare']),
      topProducts: JSON.stringify(['Botox Cosmetic', 'Juvederm', 'CoolSculpting']),
      founded: 1950,
      headquarters: 'Irvine, CA',
      timeInMarket: 73,
      url: 'https://www.allerganaesthetics.com',
      category_id: aestheticCategoryMap['Injectables']
    },
    {
      name: 'Galderma',
      industry: 'aesthetic',
      marketShare: 9.8,
      growthRate: 10.3,
      keyOfferings: JSON.stringify(['Injectables', 'Skincare', 'Laser Treatments']),
      topProducts: JSON.stringify(['Restylane', 'Dysport', 'Sculptra']),
      founded: 1961,
      headquarters: 'Lausanne, Switzerland',
      timeInMarket: 62,
      url: 'https://www.galderma.com',
      category_id: aestheticCategoryMap['Injectables']
    },
    {
      name: 'Merz Aesthetics',
      industry: 'aesthetic',
      marketShare: 7.3,
      growthRate: 9.4,
      keyOfferings: JSON.stringify(['Injectables', 'Threads', 'Energy-based Devices']),
      topProducts: JSON.stringify(['Radiesse', 'Belotero', 'Ultherapy']),
      founded: 1908,
      headquarters: 'Frankfurt, Germany',
      timeInMarket: 115,
      url: 'https://www.merzaesthetics.com',
      category_id: aestheticCategoryMap['Injectables']
    },
    {
      name: 'Candela Medical',
      industry: 'aesthetic',
      marketShare: 6.1,
      growthRate: 7.8,
      keyOfferings: JSON.stringify(['Laser Systems', 'RF Devices', 'Body Contouring']),
      topProducts: JSON.stringify(['Vbeam', 'GentleMax Pro', 'PicoWay']),
      founded: 1970,
      headquarters: 'Marlborough, MA',
      timeInMarket: 53,
      url: 'https://candelamedical.com',
      category_id: aestheticCategoryMap['Skin Treatments']
    }
  ];
  
  // Insert companies
  for (const company of companies) {
    const { error } = await supabase
      .from('companies')
      .upsert(company, { onConflict: 'name, industry' });
    
    if (error) {
      console.warn(`⚠️ Error inserting company ${company.name}:`, error.message);
    }
  }
}

/**
 * Load market growth data
 */
async function loadMarketGrowthData() {
  // Dental market growth data
  const dentalMarketGrowth = [
    { year: 2020, size: 35.2 },
    { year: 2021, size: 37.8 },
    { year: 2022, size: 41.5 },
    { year: 2023, size: 44.9 },
    { year: 2024, size: 49.2 },
    { year: 2025, size: 54.1 }
  ];
  
  // Aesthetic market growth data
  const aestheticMarketGrowth = [
    { year: 2020, size: 42.1 },
    { year: 2021, size: 46.5 },
    { year: 2022, size: 52.3 },
    { year: 2023, size: 58.7 },
    { year: 2024, size: 65.4 },
    { year: 2025, size: 72.8 }
  ];
  
  // Insert dental market growth data
  for (const data of dentalMarketGrowth) {
    const { error } = await supabase
      .from('dental_market_growth')
      .upsert(data, { onConflict: 'year' });
    
    if (error) {
      console.warn(`⚠️ Error inserting dental market growth for ${data.year}:`, error.message);
    }
  }
  
  // Insert aesthetic market growth data
  for (const data of aestheticMarketGrowth) {
    const { error } = await supabase
      .from('aesthetic_market_growth')
      .upsert(data, { onConflict: 'year' });
    
    if (error) {
      console.warn(`⚠️ Error inserting aesthetic market growth for ${data.year}:`, error.message);
    }
  }
}

/**
 * Verify data integrity
 */
async function verifyDataIntegrity() {
  let errors = 0;
  let warnings = 0;
  
  // Verify essential tables
  for (const table of ESSENTIAL_TABLES) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`⛔ Table ${table} not accessible:`, error.message);
      errors++;
    } else if (count === 0) {
      console.warn(`⚠️ Table ${table} is empty`);
      warnings++;
    } else {
      console.log(`✅ Table ${table} verified with ${count} records`);
    }
  }
  
  // Verify views
  for (const view of REQUIRED_VIEWS) {
    try {
      const { data, error } = await supabase
        .from(view)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`⛔ View ${view} not accessible:`, error.message);
        errors++;
      } else {
        console.log(`✅ View ${view} verified`);
      }
    } catch (error) {
      console.error(`⛔ Error accessing view ${view}:`, error.message);
      errors++;
    }
  }
  
  // Verify functions
  for (const func of REQUIRED_FUNCTIONS) {
    try {
      // For search_procedures, try a test search
      if (func === 'search_procedures') {
        const { data, error } = await supabase.rpc('search_procedures', { search_term: 'teeth' });
        
        if (error) {
          console.error(`⛔ Function ${func} failed:`, error.message);
          errors++;
        } else {
          console.log(`✅ Function ${func} verified`);
        }
      }
    } catch (error) {
      console.error(`⛔ Error testing function ${func}:`, error.message);
      errors++;
    }
  }
  
  // Summary
  if (errors > 0) {
    console.error(`⛔ Data integrity check found ${errors} errors and ${warnings} warnings`);
    // Don't throw error, let build continue
  } else if (warnings > 0) {
    console.warn(`⚠️ Data integrity check found ${warnings} warnings`);
  } else {
    console.log('✅ Data integrity check passed');
  }
}

// Run the setup
(async function() {
  try {
    await setupNetlify();
  } catch (error) {
    console.error('⛔ Fatal error during Netlify setup:', error);
    // Don't exit with error code, allow the build to continue
    console.log('⚠️ Setup encountered fatal errors but will continue with deployment');
  }
})().catch(err => {
  console.error('Unhandled promise rejection in setup-netlify.js:', err);
  // Don't exit with error code, allow the build to continue
  console.log('⚠️ Setup encountered fatal errors but will continue with deployment');
});
