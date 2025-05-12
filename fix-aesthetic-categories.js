const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAestheticCategoriesIssue() {
  console.log('==================================================');
  console.log('🔧 FIXING AESTHETIC CATEGORIES ISSUE');
  console.log('==================================================');

  try {
    // 1. Check if aesthetic_categories table exists
    const { data: tableExists, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'aesthetic_categories')
      .eq('table_schema', 'public');
    
    if (checkError) {
      console.error('Error checking for aesthetic_categories table:', checkError);
      return;
    }

    // 2. Create the aesthetic_categories table if it doesn't exist
    if (!tableExists || tableExists.length === 0) {
      console.log('Creating aesthetic_categories table...');
      
      // Create the table using raw SQL
      const { error: createTableError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS aesthetic_categories (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS aesthetic_categories_name_idx ON aesthetic_categories(name);
        `
      });
      
      if (createTableError) {
        console.error('Error creating aesthetic_categories table:', createTableError);
        return;
      }
      
      console.log('✅ Successfully created aesthetic_categories table');
      
      // Insert default categories
      console.log('Inserting default aesthetic categories...');
      const { error: insertError } = await supabase.rpc('execute_sql', {
        sql_query: `
          INSERT INTO aesthetic_categories (name, description)
          VALUES 
            ('Facial', 'Facial aesthetic procedures'),
            ('Body', 'Body contouring and enhancement'),
            ('Skin', 'Skin treatments and rejuvenation'),
            ('Injectable', 'Injectable treatments such as Botox and fillers')
          ON CONFLICT (name) DO NOTHING;
        `
      });
      
      if (insertError) {
        console.error('Error inserting default categories:', insertError);
        return;
      }
      
      console.log('✅ Successfully inserted default aesthetic categories');
    } else {
      console.log('✅ aesthetic_categories table already exists');
    }
    
    // 3. Check if foreign key constraint exists for aesthetic_procedures
    console.log('Checking foreign key constraint for aesthetic_procedures...');
    
    const { data: fkExists, error: fkCheckError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'aesthetic_procedures'
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name = 'aesthetic_procedures_category_id_fkey';
      `
    });
    
    if (fkCheckError) {
      console.error('Error checking foreign key constraint:', fkCheckError);
      return;
    }
    
    // 4. Add foreign key constraint if it doesn't exist
    if (!fkExists || fkExists.length === 0) {
      console.log('Adding foreign key constraint to aesthetic_procedures...');
      
      // First drop any existing constraint
      const { error: dropFkError } = await supabase.rpc('execute_sql', {
        sql_query: `
          ALTER TABLE aesthetic_procedures 
          DROP CONSTRAINT IF EXISTS aesthetic_procedures_category_id_fkey;
        `
      });
      
      if (dropFkError) {
        console.error('Error dropping existing foreign key constraint:', dropFkError);
        return;
      }
      
      // Make sure category_id column exists and is correct type
      const { error: columnCheckError } = await supabase.rpc('execute_sql', {
        sql_query: `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'aesthetic_procedures'
              AND column_name = 'category_id'
            ) THEN
              ALTER TABLE aesthetic_procedures ADD COLUMN category_id INTEGER;
            ELSE
              ALTER TABLE aesthetic_procedures ALTER COLUMN category_id TYPE INTEGER USING category_id::INTEGER;
            END IF;
          END $$;
        `
      });
      
      if (columnCheckError) {
        console.error('Error checking/updating category_id column:', columnCheckError);
        return;
      }
      
      // Now add the foreign key constraint
      const { error: addFkError } = await supabase.rpc('execute_sql', {
        sql_query: `
          ALTER TABLE aesthetic_procedures
          ADD CONSTRAINT aesthetic_procedures_category_id_fkey
          FOREIGN KEY (category_id) REFERENCES aesthetic_categories(id);
        `
      });
      
      if (addFkError) {
        console.error('Error adding foreign key constraint:', addFkError);
        return;
      }
      
      console.log('✅ Successfully added foreign key constraint');
    } else {
      console.log('✅ Foreign key constraint already exists');
    }
    
    // 5. Update any null category_id values to point to a default category
    console.log('Updating any null category_id values...');
    
    const { error: updateNullError } = await supabase.rpc('execute_sql', {
      sql_query: `
        UPDATE aesthetic_procedures
        SET category_id = (SELECT id FROM aesthetic_categories WHERE name = 'Facial' LIMIT 1)
        WHERE category_id IS NULL;
      `
    });
    
    if (updateNullError) {
      console.error('Error updating null category_id values:', updateNullError);
      return;
    }
    
    console.log('✅ Successfully updated null category_id values');
    
    console.log('==================================================');
    console.log('✅ AESTHETIC CATEGORIES ISSUE FIXED SUCCESSFULLY');
    console.log('==================================================');
    
  } catch (error) {
    console.error('An unexpected error occurred:', error);
  }
}

// Execute the fix function
fixAestheticCategoriesIssue();
