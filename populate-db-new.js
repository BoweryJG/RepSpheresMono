import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase URL or Anon Key in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to load data from JSON files
async function loadData() {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        
        // Load dental procedures
        const dentalPath = join(__dirname, 'src/data/dentalProcedures.js');
        const dentalModule = await import(dentalPath);
        const dentalProcedures = dentalModule.default || [];
        
        // Load aesthetic procedures
        const aestheticPath = join(__dirname, 'src/data/aestheticProcedures.js');
        const aestheticModule = await import(aestheticPath);
        const aestheticProcedures = aestheticModule.default || [];
        
        return { dentalProcedures, aestheticProcedures };
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

// Main function to populate the database
async function populateDatabase() {
    console.log('Starting database population...');
    
    try {
        // Load data from files
        const { dentalProcedures, aestheticProcedures } = await loadData();
        
        // Combine all procedures
        const allProcedures = [...dentalProcedures, ...aestheticProcedures];
        
        // Extract unique companies
        const companies = new Set();
        allProcedures.forEach(procedure => {
            if (procedure.companies && Array.isArray(procedure.companies)) {
                procedure.companies.forEach(company => {
                    companies.add(JSON.stringify({
                        name: company.name,
                        industry: company.industry || 'Dental',
                        services: company.services || ''
                    }));
                });
            }
        });

        console.log(`Found ${companies.size} unique companies`);
        
        // Insert companies
        const companyMap = new Map();
        const companyArray = Array.from(companies).map(JSON.parse);
        
        for (const company of companyArray) {
            try {
                console.log(`Inserting company: ${company.name}`);
                const { data, error } = await supabase
                    .from('companies')
                    .insert(company)
                    .select()
                    .single();
                
                if (error) {
                    if (error.code === '23505') { // Unique violation
                        console.log(`Company ${company.name} already exists, fetching ID...`);
                        const { data: existing } = await supabase
                            .from('companies')
                            .select('id')
                            .eq('name', company.name)
                            .single();
                        if (existing) {
                            companyMap.set(company.name, existing.id);
                            continue;
                        }
                    }
                    throw error;
                }
                
                if (data) {
                    companyMap.set(company.name, data.id);
                }
            } catch (error) {
                console.error(`Error inserting company ${company.name}:`, error);
                throw error;
            }
        }
        
        console.log('Inserting procedures...');
        
        // Insert procedures
        for (const procedure of allProcedures) {
            try {
                console.log(`Processing procedure: ${procedure.name}`);
                
                // Prepare procedure data (exclude companies as it's a relationship)
                const { companies: procCompanies, ...procedureData } = procedure;
                
                // Insert procedure
                const { data: procData, error: procError } = await supabase
                    .from('procedures')
                    .insert(procedureData)
                    .select()
                    .single();
                
                if (procError) {
                    if (procError.code === '23505') { // Unique violation
                        console.log(`Procedure ${procedure.name} already exists, skipping...`);
                        continue;
                    }
                    throw procError;
                }
                
                // Insert procedure-company relationships
                if (procCompanies && Array.isArray(procCompanies) && procData) {
                    console.log(`Linking ${procCompanies.length} companies to ${procedure.name}`);
                    
                    const procedureCompanies = procCompanies
                        .filter(company => companyMap.has(company.name))
                        .map(company => ({
                            procedure_id: procData.id,
                            company_id: companyMap.get(company.name)
                        }));
                    
                    if (procedureCompanies.length > 0) {
                        const { error: relError } = await supabase
                            .from('procedure_companies')
                            .insert(procedureCompanies);
                            
                        if (relError) {
                            console.error(`Error linking companies to ${procedure.name}:`, relError);
                        }
                    }
                }
                
            } catch (error) {
                console.error(`Error processing procedure ${procedure.name}:`, error);
                // Continue with next procedure even if one fails
                continue;
            }
        }
        
        console.log('✅ Database populated successfully!');
        return true;
        
    } catch (error) {
        console.error('❌ Error populating database:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        return false;
    }
}

// Run the population
populateDatabase().then(success => {
    process.exit(success ? 0 : 1);
});
