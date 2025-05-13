/**
 * Setup Views Script
 * 
 * This script creates the necessary views in the Supabase database for
 * the Market Insights dashboard to display data properly.
 */

import { supabaseClient } from './src/services/supabase/supabaseClient.js';
import dotenv from 'dotenv';
import colors from 'colors';

// Load environment variables
dotenv.config();

// Set up terminal colors
colors.setTheme({
  info: 'blue',
  success: 'green',
  warn: 'yellow',
  error: 'red',
  data: 'cyan',
  header: 'magenta'
});

/**
 * Create a view in the database
 * @param {string} viewName - Name of the view to create
 * @param {string} query - SQL query to use for the view
 * @param {boolean} dropIfExists - Whether to drop the view if it already exists
 */
async function createView(viewName, query, dropIfExists = true) {
  try {
    console.log(`Creating view: ${viewName}`.info);

    // Drop the view if it exists and dropIfExists is true
    if (dropIfExists) {
      const { error: dropError } = await supabaseClient.rpc('execute_sql', {
        sql_query: `DROP VIEW IF EXISTS ${viewName} CASCADE;`
      });

      if (dropError) {
        console.error(`Error dropping view ${viewName}:`.error, dropError);
        throw dropError;
      }
    }

    // Create the view
    const { error } = await supabaseClient.rpc('execute_sql', {
      sql_query: `CREATE VIEW ${viewName} AS ${query};`
    });

    if (error) {
      console.error(`Error creating view ${viewName}:`.error, error);
      throw error;
    }

    const { data, error: countError } = await supabaseClient.from(viewName).select('count()', { count: 'exact', head: true });
    
    if (countError) {
      console.error(`Error counting rows in view ${viewName}:`.error, countError);
      throw countError;
    }

    console.log(`✓ View ${viewName} created successfully`.success);
    return true;
  } catch (error) {
    console.error(`Failed to create view ${viewName}:`.error, error);
    return false;
  }
}

/**
 * Main function to execute the view setup
 */
async function setupViews() {
  console.log('\n' + '='.repeat(80).header);
  console.log('SETTING UP DATABASE VIEWS FOR MARKET INSIGHTS'.header);
  console.log('='.repeat(80).header + '\n');

  try {
    // Required views for the dashboard
    await createView(
      'v_dental_procedures',
      `SELECT 
        dp.id,
        dp.name,
        dp.description,
        dp.category_id,
        dc.name as category_label,
        dp.yearly_growth_percentage,
        dp.average_cost,
        dp.trends
      FROM 
        dental_procedures dp
      LEFT JOIN
        dental_categories dc ON dp.category_id = dc.id
      ORDER BY
        dp.name ASC`
    );

    await createView(
      'v_aesthetic_procedures',
      `SELECT 
        ap.id,
        ap.name,
        ap.description,
        ap.category_id,
        ac.name as category_label,
        ap.yearly_growth_percentage,
        ap.average_cost,
        ap.trends
      FROM 
        aesthetic_procedures ap
      LEFT JOIN
        aesthetic_categories ac ON ap.category_id = ac.id
      ORDER BY
        ap.name ASC`
    );

    await createView(
      'v_dental_companies',
      `SELECT 
        dc.id,
        dc.name,
        dc.dental_category_id,
        dcat.name as category_label,
        dc.headquarters,
        dc.website,
        dc.market_share_pct,
        dc.key_products
      FROM 
        dental_companies dc
      LEFT JOIN
        dental_categories dcat ON dc.dental_category_id = dcat.id
      ORDER BY
        dc.name ASC`
    );

    await createView(
      'v_aesthetic_companies',
      `SELECT 
        ac.id,
        ac.name,
        ac.aesthetic_category_id,
        acat.name as category_label,
        ac.headquarters,
        ac.website,
        ac.market_share_pct,
        ac.key_products
      FROM 
        aesthetic_companies ac
      LEFT JOIN
        aesthetic_categories acat ON ac.aesthetic_category_id = acat.id
      ORDER BY
        ac.name ASC`
    );

    await createView(
      'v_dental_market_growth',
      `SELECT 
        year::text,
        size::float
      FROM 
        dental_market_growth
      ORDER BY
        year ASC`
    );

    await createView(
      'v_aesthetic_market_growth',
      `SELECT 
        year::text,
        size::float
      FROM 
        aesthetic_market_growth
      ORDER BY
        year ASC`
    );

    await createView(
      'v_dental_news',
      `SELECT 
        id,
        title,
        summary,
        source,
        published_date,
        url,
        relevance_score
      FROM 
        dental_news
      ORDER BY
        published_date DESC`
    );

    await createView(
      'v_aesthetic_news',
      `SELECT 
        id,
        title,
        summary,
        source,
        published_date,
        url,
        relevance_score
      FROM 
        aesthetic_news
      ORDER BY
        published_date DESC`
    );

    await createView(
      'v_dental_events',
      `SELECT 
        id,
        title,
        description,
        event_date_start,
        event_date_end,
        location,
        city,
        country,
        website,
        registration_url
      FROM 
        dental_events
      ORDER BY
        event_date_start ASC`
    );

    await createView(
      'v_aesthetic_events',
      `SELECT 
        id,
        title,
        description,
        event_date_start,
        event_date_end,
        location,
        city,
        country,
        website,
        registration_url
      FROM 
        aesthetic_events
      ORDER BY
        event_date_start ASC`
    );

    await createView(
      'v_dental_trends',
      `SELECT 
        id,
        topic,
        description,
        keywords,
        relevance_score,
        trend_year
      FROM 
        dental_trends
      ORDER BY
        relevance_score DESC`
    );

    await createView(
      'v_aesthetic_trends',
      `SELECT 
        id,
        topic,
        description,
        keywords,
        relevance_score,
        trend_year
      FROM 
        aesthetic_trends
      ORDER BY
        relevance_score DESC`
    );

    // Create a helper view that lists all procedures
    await createView(
      'v_all_procedures',
      `SELECT 
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
        industry, name ASC`
    );

    console.log('\n' + '='.repeat(80).success);
    console.log('ALL VIEWS CREATED SUCCESSFULLY!'.success);
    console.log('='.repeat(80).success + '\n');

  } catch (error) {
    console.error('Error setting up views:'.error, error);
    process.exit(1);
  }
}

// Execute the setup
setupViews()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Uncaught error:'.error, error);
    process.exit(1);
  });
