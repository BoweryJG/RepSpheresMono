import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFile } from 'fs/promises';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase URL or Anon Key in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to load JSON data
async function loadJSON(filePath) {
    try {
        const data = await readFile(new URL(filePath, import.meta.url), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error loading JSON from ${filePath}:`, error);
        throw error;
    }
}

async function populateDatabase() {
    try {
        console.log('Starting database population...');
        
        // Import the data files
        const dentalModule = await import('./src/data/dentalProcedures.js');
        const aestheticModule = await import('./src/data/aestheticProcedures.js');
        
        const dentalProcedures = dentalModule.default || [];
        const aestheticProcedures = aestheticModule.default || [];
        
        console.log(`Loaded ${dentalProcedures.length} dental procedures`);
        console.log(`Loaded ${aestheticProcedures.length} aesthetic procedures`);
        
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
                        description: company.services || ''
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
                
                // Check if company already exists
                const { data: existingCompany, error: fetchError } = await supabase
                    .from('companies')
                    .select('id')
                    .eq('name', company.name)
                    .single();
                
                if (existingCompany) {
                    console.log(`Company ${company.name} already exists, skipping...`);
                    companyMap.set(company.name, existingCompany.id);
                    continue;
                }
                
                // Insert new company
                const { data: newCompany, error: insertError } = await supabase
                    .from('companies')
                    .insert(company)
                    .select()
                    .single();
                
                if (insertError) throw insertError;
                
                console.log(`Inserted company: ${newCompany.name} (ID: ${newCompany.id})`);
                companyMap.set(company.name, newCompany.id);
                
            } catch (error) {
                console.error(`Error processing company ${company.name}:`, error);
                throw error;
            }
        }
        
        // Insert procedures and their relationships
        console.log('\nInserting procedures...');
        
        for (const procedure of allProcedures) {
            try {
                console.log(`Processing procedure: ${procedure.name}`);
                
                // Prepare procedure data (exclude companies as it's a relationship)
                const { companies: procCompanies, futureOutlook, ...procedureData } = procedure;
                
                // Add future_outlook if it exists
                if (futureOutlook !== undefined) {
                    procedureData.future_outlook = futureOutlook;
                }
                
                // Check if procedure already exists
                const { data: existingProcedure, error: fetchError } = await supabase
                    .from('procedures')
                    .select('id')
                    .eq('name', procedure.name)
                    .eq('category', procedure.category)
                    .single();
                
                let procedureId;
                
                if (existingProcedure) {
                    console.log(`Procedure ${procedure.name} (${procedure.category}) already exists, updating...`);
                    procedureId = existingProcedure.id;
                    
                    // Update existing procedure
                    const { error: updateError } = await supabase
                        .from('procedures')
                        .update(procedureData)
                        .eq('id', procedureId);
                        
                    if (updateError) throw updateError;
                    
                } else {
                    // Insert new procedure
                    const { data: newProcedure, error: insertError } = await supabase
                        .from('procedures')
                        .insert(procedureData)
                        .select()
                        .single();
                    
                    if (insertError) throw insertError;
                    
                    console.log(`Inserted procedure: ${newProcedure.name} (ID: ${newProcedure.id})`);
                    procedureId = newProcedure.id;
                }
                
                // Insert procedure-company relationships
                if (procCompanies && Array.isArray(procCompanies)) {
                    const relationships = procCompanies
                        .filter(company => companyMap.has(company.name))
                        .map(company => ({
                            procedure_id: procedureId,
                            company_id: companyMap.get(company.name)
                        }));
                    
                    if (relationships.length > 0) {
                        console.log(`Linking ${relationships.length} companies to procedure ${procedure.name}`);
                        
                        // Delete existing relationships to avoid duplicates
                        const { error: deleteError } = await supabase
                            .from('procedure_companies')
                            .delete()
                            .eq('procedure_id', procedureId);
                            
                        if (deleteError) console.error('Error deleting existing relationships:', deleteError);
                        
                        // Insert relationships in chunks to avoid hitting limits
                        const chunkSize = 10;
                        for (let i = 0; i < relationships.length; i += chunkSize) {
                            const chunk = relationships.slice(i, i + chunkSize);
                            const { error: relError } = await supabase
                                .from('procedure_companies')
                                .insert(chunk);
                            
                            if (relError) {
                                // Skip duplicate key errors (code 23505)
                                if (relError.code !== '23505') {
                                    throw relError;
                                }
                                console.log('  Skipped duplicate relationship');
                            }
                        }
                    }
                }
                
            } catch (error) {
                console.error(`Error processing procedure ${procedure.name}:`, error);
                // Continue with next procedure even if one fails
            }
        }
        
        console.log('\n✅ Database populated successfully!');
        return true;
        
    } catch (error) {
        console.error('❌ Error populating database:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        console.error('Error stack:', error.stack);
        return false;
    }
}

// Run the population
populateDatabase().then(success => {
    process.exit(success ? 0 : 1);
});
