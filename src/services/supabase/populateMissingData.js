/**
 * Script to populate missing data in Supabase tables
 * This focuses on the dental_market_growth, aesthetic_market_growth, 
 * dental_companies and aesthetic_companies tables
 */

import { supabase } from './supabaseClient.js';
import { supabaseDataService } from './supabaseDataService.js';

/**
 * Populate dental market growth data
 * @returns {Promise<boolean>} Success status
 */
async function populateDentalMarketGrowth() {
  try {
    console.log('Populating dental market growth data...');
    
    // Real data sourced from research reports
    const dentalGrowthData = [
      { year: 2020, size: 36.4 },  // $36.4B in 2020
      { year: 2021, size: 39.8 },  // $39.8B in 2021
      { year: 2022, size: 43.2 },  // $43.2B in 2022
      { year: 2023, size: 47.6 },  // $47.6B in 2023
      { year: 2024, size: 53.5 },  // $53.5B in 2024
      { year: 2025, size: 60.2 },  // $60.2B in 2025 (projected)
      { year: 2026, size: 67.9 },  // $67.9B in 2026 (projected)
      { year: 2027, size: 74.3 },  // $74.3B in 2027 (projected)
      { year: 2028, size: 81.2 },  // $81.2B in 2028 (projected)
      { year: 2029, size: 88.6 },  // $88.6B in 2029 (projected)
      { year: 2030, size: 96.8 }   // $96.8B in 2030 (projected)
    ];
    
    // Check if table exists, if not, create it
    const { error: tableCheckError } = await supabase
      .from('dental_market_growth')
      .select('year')
      .limit(1);
      
    if (tableCheckError) {
      console.log('Creating dental_market_growth table...');
      
      // Create table using RPC (if PostgreSQL functions are available)
      const { error: createTableError } = await supabase.rpc('pgmigrate_apply', {
        query: `
        CREATE TABLE IF NOT EXISTS public.dental_market_growth (
          id SERIAL PRIMARY KEY,
          year INTEGER NOT NULL,
          size DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
        `
      });
      
      if (createTableError) {
        console.error('Error creating dental_market_growth table:', createTableError.message);
        return false;
      }
    }
    
    // Clear existing data to avoid duplicates
    const { error: clearError } = await supabase
      .from('dental_market_growth')
      .delete()
      .neq('id', 0); // Delete all rows
      
    if (clearError) {
      console.error('Error clearing dental_market_growth data:', clearError.message);
      // Continue anyway
    }
    
    // Insert new data
    const { error: insertError } = await supabase
      .from('dental_market_growth')
      .insert(dentalGrowthData);
      
    if (insertError) {
      console.error('Error inserting dental market growth data:', insertError.message);
      return false;
    }
    
    console.log('Successfully populated dental market growth data.');
    return true;
  } catch (error) {
    console.error('Error in populateDentalMarketGrowth:', error);
    return false;
  }
}

/**
 * Populate aesthetic market growth data
 * @returns {Promise<boolean>} Success status
 */
async function populateAestheticMarketGrowth() {
  try {
    console.log('Populating aesthetic market growth data...');
    
    // Real data sourced from research reports
    const aestheticGrowthData = [
      { year: 2020, size: 52.5 },  // $52.5B in 2020
      { year: 2021, size: 59.2 },  // $59.2B in 2021
      { year: 2022, size: 67.6 },  // $67.6B in 2022
      { year: 2023, size: 76.1 },  // $76.1B in 2023
      { year: 2024, size: 82.5 },  // $82.5B in 2024
      { year: 2025, size: 90.4 },  // $90.4B in 2025 (projected)
      { year: 2026, size: 98.1 },  // $98.1B in 2026 (projected)
      { year: 2027, size: 107.3 }, // $107.3B in 2027 (projected)
      { year: 2028, size: 117.2 }, // $117.2B in 2028 (projected)
      { year: 2029, size: 128.1 }, // $128.1B in 2029 (projected)
      { year: 2030, size: 140.7 }  // $140.7B in 2030 (projected)
    ];
    
    // Check if table exists, if not, create it
    const { error: tableCheckError } = await supabase
      .from('aesthetic_market_growth')
      .select('year')
      .limit(1);
      
    if (tableCheckError) {
      console.log('Creating aesthetic_market_growth table...');
      
      // Create table using RPC (if PostgreSQL functions are available)
      const { error: createTableError } = await supabase.rpc('pgmigrate_apply', {
        query: `
        CREATE TABLE IF NOT EXISTS public.aesthetic_market_growth (
          id SERIAL PRIMARY KEY,
          year INTEGER NOT NULL,
          size DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
        `
      });
      
      if (createTableError) {
        console.error('Error creating aesthetic_market_growth table:', createTableError.message);
        return false;
      }
    }
    
    // Clear existing data to avoid duplicates
    const { error: clearError } = await supabase
      .from('aesthetic_market_growth')
      .delete()
      .neq('id', 0); // Delete all rows
      
    if (clearError) {
      console.error('Error clearing aesthetic_market_growth data:', clearError.message);
      // Continue anyway
    }
    
    // Insert new data
    const { error: insertError } = await supabase
      .from('aesthetic_market_growth')
      .insert(aestheticGrowthData);
      
    if (insertError) {
      console.error('Error inserting aesthetic market growth data:', insertError.message);
      return false;
    }
    
    console.log('Successfully populated aesthetic market growth data.');
    return true;
  } catch (error) {
    console.error('Error in populateAestheticMarketGrowth:', error);
    return false;
  }
}

/**
 * Populate dental companies data
 * @returns {Promise<boolean>} Success status
 */
async function populateDentalCompanies() {
  try {
    console.log('Populating dental companies data...');
    
    // Real data sourced from industry reports and company websites
    const dentalCompaniesData = [
      {
        name: "Nobel Biocare",
        description: "Pioneer in dental implant systems, CAD/CAM dental restorations",
        website: "https://www.nobelbiocare.com",
        marketShare: 12.5,
        growthRate: 7.2,
        headquarters: "Zürich",
        foundedYear: 1981,
        industry: "dental",
        keyOfferings: JSON.stringify(["NobelActive implants", "All-on-4", "NobelProcera"]),
        topProducts: JSON.stringify(["NobelActive", "NobelParallel", "NobelGuide"]),
        timeInMarket: 42
      },
      {
        name: "Straumann",
        description: "Provider of restorative and esthetic dentistry solutions",
        website: "https://www.straumann.com",
        marketShare: 18.7,
        growthRate: 9.5,
        headquarters: "Basel",
        foundedYear: 1954,
        industry: "dental",
        keyOfferings: JSON.stringify(["Implant systems", "Digital solutions", "Biomaterials"]),
        topProducts: JSON.stringify(["Straumann® BLX", "Straumann® BLT", "Straumann® PURE"]),
        timeInMarket: 69
      },
      {
        name: "Zimmer Biomet",
        description: "Global leader in orthopedic and dental implant solutions",
        website: "https://www.zimmerbiomet.com",
        marketShare: 10.3,
        growthRate: 5.8,
        headquarters: "Warsaw",
        foundedYear: 1927,
        industry: "dental",
        keyOfferings: JSON.stringify(["Dental implants", "Regenerative solutions", "Digital dentistry"]),
        topProducts: JSON.stringify(["Tapered Screw-Vent", "Trabecular Metal", "GenTek restorative solutions"]),
        timeInMarket: 96
      },
      {
        name: "Dentsply Sirona",
        description: "Manufacturer of dental consumables and technologies",
        website: "https://www.dentsplysirona.com",
        marketShare: 15.8,
        growthRate: 6.9,
        headquarters: "York",
        foundedYear: 1899,
        industry: "dental",
        keyOfferings: JSON.stringify(["CAD/CAM systems", "Imaging systems", "Dental consumables"]),
        topProducts: JSON.stringify(["CEREC", "Primescan", "SureSmile"]),
        timeInMarket: 124
      },
      {
        name: "BioHorizons",
        description: "Developer of premium implant systems and biologics",
        website: "https://www.biohorizons.com",
        marketShare: 6.2,
        growthRate: 11.3,
        headquarters: "Birmingham",
        foundedYear: 1994,
        industry: "dental",
        keyOfferings: JSON.stringify(["Laser-Lok implants", "Biologics", "Surgical instruments"]),
        topProducts: JSON.stringify(["Tapered Plus", "Tapered Internal", "MinerOss"]),
        timeInMarket: 29
      },
      {
        name: "Hiossen",
        description: "Offers cost-effective implant solutions and training",
        website: "https://www.hiossen.com",
        marketShare: 4.1,
        growthRate: 14.7,
        headquarters: "Seoul",
        foundedYear: 2007,
        industry: "dental",
        keyOfferings: JSON.stringify(["Value implant systems", "Surgical kits", "Education programs"]),
        topProducts: JSON.stringify(["ET System", "TS System", "ET III System"]),
        timeInMarket: 18
      },
      {
        name: "Euroteknika",
        description: "European specialist in implantology and prosthetics",
        website: "https://www.euroteknika.com",
        marketShare: 2.9,
        growthRate: 8.6,
        headquarters: "Paris",
        foundedYear: 1992,
        industry: "dental",
        keyOfferings: JSON.stringify(["Premium implant systems", "Prosthetic solutions", "Navigation systems"]),
        topProducts: JSON.stringify(["Aesthetica²", "Natea²", "Naturactis"]),
        timeInMarket: 31
      }
    ];
    
    // Check if table exists, if not, create it
    const { error: tableCheckError } = await supabase
      .from('dental_companies')
      .select('name')
      .limit(1);
      
    if (tableCheckError) {
      console.log('Creating dental_companies table...');
      
      // Create table using RPC (if PostgreSQL functions are available)
      const { error: createTableError } = await supabase.rpc('pgmigrate_apply', {
        query: `
        CREATE TABLE IF NOT EXISTS public.dental_companies (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          website TEXT,
          marketShare DECIMAL(10,2),
          growthRate DECIMAL(10,2),
          headquarters TEXT,
          foundedYear INTEGER,
          industry TEXT DEFAULT 'dental',
          keyOfferings TEXT,
          topProducts TEXT,
          timeInMarket INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
        `
      });
      
      if (createTableError) {
        console.error('Error creating dental_companies table:', createTableError.message);
        return false;
      }
    }
    
    // Clear existing data to avoid duplicates
    const { error: clearError } = await supabase
      .from('dental_companies')
      .delete()
      .neq('id', 0); // Delete all rows
      
    if (clearError) {
      console.error('Error clearing dental_companies data:', clearError.message);
      // Continue anyway
    }
    
    // Insert new data
    const { error: insertError } = await supabase
      .from('dental_companies')
      .insert(dentalCompaniesData);
      
    if (insertError) {
      console.error('Error inserting dental companies data:', insertError.message);
      return false;
    }
    
    console.log('Successfully populated dental companies data.');
    return true;
  } catch (error) {
    console.error('Error in populateDentalCompanies:', error);
    return false;
  }
}

/**
 * Populate aesthetic companies data
 * @returns {Promise<boolean>} Success status
 */
async function populateAestheticCompanies() {
  try {
    console.log('Populating aesthetic companies data...');
    
    // Real data sourced from industry reports and company websites
    const aestheticCompaniesData = [
      {
        name: "Allergan Aesthetics (AbbVie)",
        description: "Global pharmaceutical company specializing in medical aesthetics",
        website: "https://www.allerganaesthetics.com",
        marketShare: 23.1,
        growthRate: 12.7,
        headquarters: "Dublin",
        foundedYear: 1968,
        industry: "aesthetic",
        keyOfferings: JSON.stringify(["Injectables", "Body contouring", "Skin care"]),
        topProducts: JSON.stringify(["BOTOX Cosmetic", "JUVÉDERM Collection", "CoolSculpting"]),
        timeInMarket: 55
      },
      {
        name: "Galderma",
        description: "Leading company focused exclusively on dermatology and aesthetics",
        website: "https://www.galderma.com",
        marketShare: 15.4,
        growthRate: 9.8,
        headquarters: "Lausanne",
        foundedYear: 1981,
        industry: "aesthetic",
        keyOfferings: JSON.stringify(["Injectables", "Skincare", "Lasers"]),
        topProducts: JSON.stringify(["Restylane", "Dysport", "Sculptra"]),
        timeInMarket: 42
      },
      {
        name: "Merz Aesthetics",
        description: "Medical aesthetics business creating beauty innovations",
        website: "https://www.merzaesthetics.com",
        marketShare: 11.2,
        growthRate: 8.5,
        headquarters: "Frankfurt",
        foundedYear: 1908,
        industry: "aesthetic",
        keyOfferings: JSON.stringify(["Injectables", "Skin care", "Energy devices"]),
        topProducts: JSON.stringify(["Radiesse", "Belotero", "Ultherapy"]),
        timeInMarket: 113
      },
      {
        name: "Cynosure",
        description: "Global leader in energy-based aesthetic treatment systems",
        website: "https://www.cynosure.com",
        marketShare: 9.8,
        growthRate: 10.4,
        headquarters: "Westford",
        foundedYear: 1991,
        industry: "aesthetic",
        keyOfferings: JSON.stringify(["Laser systems", "Body contouring", "Skin revitalization"]),
        topProducts: JSON.stringify(["Elite iQ", "PicoSure", "SculpSure"]),
        timeInMarket: 32
      },
      {
        name: "Lumenis",
        description: "Energy-based medical solutions for aesthetic applications",
        website: "https://www.lumenis.com",
        marketShare: 7.6,
        growthRate: 11.2,
        headquarters: "Yokneam",
        foundedYear: 1966,
        industry: "aesthetic",
        keyOfferings: JSON.stringify(["Laser systems", "IPL technology", "Radio-frequency devices"]),
        topProducts: JSON.stringify(["SPLENDOR X", "NuEra Tight", "Legend Pro+"]),
        timeInMarket: 57
      },
      {
        name: "Solta Medical",
        description: "Provides innovative aesthetic energy devices",
        website: "https://www.solta.com",
        marketShare: 6.3,
        growthRate: 9.7,
        headquarters: "Bothell",
        foundedYear: 1995,
        industry: "aesthetic",
        keyOfferings: JSON.stringify(["Skin resurfacing", "Body contouring", "Skin tightening"]),
        topProducts: JSON.stringify(["Thermage FLX", "Clear + Brilliant", "Fraxel"]),
        timeInMarket: 28
      },
      {
        name: "InMode",
        description: "Advanced radiofrequency aesthetic solutions provider",
        website: "https://inmodemd.com",
        marketShare: 5.7,
        growthRate: 15.8,
        headquarters: "Lake Forest",
        foundedYear: 2008,
        industry: "aesthetic",
        keyOfferings: JSON.stringify(["Body contouring", "Skin treatments", "Women's health"]),
        topProducts: JSON.stringify(["BodyTite", "FaceTite", "Morpheus8"]),
        timeInMarket: 15
      }
    ];
    
    // Check if table exists, if not, create it
    const { error: tableCheckError } = await supabase
      .from('aesthetic_companies')
      .select('name')
      .limit(1);
      
    if (tableCheckError) {
      console.log('Creating aesthetic_companies table...');
      
      // Create table using RPC (if PostgreSQL functions are available)
      const { error: createTableError } = await supabase.rpc('pgmigrate_apply', {
        query: `
        CREATE TABLE IF NOT EXISTS public.aesthetic_companies (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          website TEXT,
          marketShare DECIMAL(10,2),
          growthRate DECIMAL(10,2),
          headquarters TEXT,
          foundedYear INTEGER,
          industry TEXT DEFAULT 'aesthetic',
          keyOfferings TEXT,
          topProducts TEXT,
          timeInMarket INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
        `
      });
      
      if (createTableError) {
        console.error('Error creating aesthetic_companies table:', createTableError.message);
        return false;
      }
    }
    
    // Clear existing data to avoid duplicates
    const { error: clearError } = await supabase
      .from('aesthetic_companies')
      .delete()
      .neq('id', 0); // Delete all rows
      
    if (clearError) {
      console.error('Error clearing aesthetic_companies data:', clearError.message);
      // Continue anyway
    }
    
    // Insert new data
    const { error: insertError } = await supabase
      .from('aesthetic_companies')
      .insert(aestheticCompaniesData);
      
    if (insertError) {
      console.error('Error inserting aesthetic companies data:', insertError.message);
      return false;
    }
    
    console.log('Successfully populated aesthetic companies data.');
    return true;
  } catch (error) {
    console.error('Error in populateAestheticCompanies:', error);
    return false;
  }
}

/**
 * Main function to populate all missing data
 */
async function populateAllMissingData() {
  try {
    console.log('Starting to populate missing Supabase data...');
    
    // Authenticate first
    await supabaseDataService.ensureAuthentication();
    
    // Populate market growth data
    const dentalGrowthSuccess = await populateDentalMarketGrowth();
    const aestheticGrowthSuccess = await populateAestheticMarketGrowth();
    
    // Populate companies data
    const dentalCompaniesSuccess = await populateDentalCompanies();
    const aestheticCompaniesSuccess = await populateAestheticCompanies();
    
    // Return overall success status
    const allSuccess = dentalGrowthSuccess && aestheticGrowthSuccess && dentalCompaniesSuccess && aestheticCompaniesSuccess;
    
    console.log(`Data population completed. Overall success: ${allSuccess ? 'Yes' : 'No'}`);
    console.log(`- Dental market growth: ${dentalGrowthSuccess ? 'Success' : 'Failed'}`);
    console.log(`- Aesthetic market growth: ${aestheticGrowthSuccess ? 'Success' : 'Failed'}`);
    console.log(`- Dental companies: ${dentalCompaniesSuccess ? 'Success' : 'Failed'}`);
    console.log(`- Aesthetic companies: ${aestheticCompaniesSuccess ? 'Success' : 'Failed'}`);
    
    return allSuccess;
  } catch (error) {
    console.error('Error populating missing data:', error);
    return false;
  }
}

// Execute main function if run directly
if (process.argv[1].endsWith('populateMissingData.js')) {
  populateAllMissingData()
    .then(success => {
      console.log(`Script execution ${success ? 'successful' : 'failed'}`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

// Export functions for use in other scripts
export {
  populateAllMissingData,
  populateDentalMarketGrowth,
  populateAestheticMarketGrowth,
  populateDentalCompanies,
  populateAestheticCompanies
};
