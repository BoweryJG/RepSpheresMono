import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import dentalProcedures from './src/data/dentalProcedures.js';
import aestheticProcedures from './src/data/aestheticProcedures.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateDatabase() {
    try {
        console.log('Starting database population...');
        
        // First create companies
        const companies = new Set();
        
        // Extract companies from both datasets
        dentalProcedures.forEach(proc => {
            proc.companies?.forEach(company => {
                companies.add(JSON.stringify({
                    name: company.name,
                    industry: 'Dental',
                    services: company.services
                }));
            });
        });

        aestheticProcedures.forEach(proc => {
            proc.companies?.forEach(company => {
                companies.add(JSON.stringify({
                    name: company.name,
                    industry: 'Aesthetic',
                    services: company.services
                }));
            });
        });

        // Convert to array of objects
        const uniqueCompanies = Array.from(companies).map(JSON.parse);
        
        console.log('Companies to insert:', JSON.stringify(uniqueCompanies, null, 2));

        // Insert companies in batches to avoid hitting request size limits
        const batchSize = 10;
        let companyData = [];
        let companyError = null;
        
        for (let i = 0; i < uniqueCompanies.length; i += batchSize) {
            const batch = uniqueCompanies.slice(i, i + batchSize);
            console.log(`Inserting companies batch ${i / batchSize + 1}...`);
            
            const { data, error } = await supabase
                .from('market_insights.companies')
                .insert(batch)
                .select();
            
            if (error) {
                companyError = error;
                break;
            }
            
            companyData = [...companyData, ...data];
        }

        if (companyError) {
            console.error('Error inserting companies:', companyError);
            throw companyError;
        }

        // Create lookup map for company IDs
        const companyMap = new Map();
        companyData.forEach(company => {
            companyMap.set(company.name, company.id);
        });

        // Insert procedures and their relationships
        const allProcedures = [...dentalProcedures, ...aestheticProcedures];
        
        // Log first few procedures for debugging
        console.log('Sample procedure data:', JSON.stringify(allProcedures.slice(0, 2), null, 2));

        for (const procedure of allProcedures) {
            console.log(`Processing procedure: ${procedure.name}`);
            // Insert procedure
            const { data: procData, error: procError } = await supabase
                .from('market_insights.procedures')
                .insert([{
                    name: procedure.name,
                    category: procedure.category,
                    type: procedure.type || 'Procedure',
                    growth_rate: procedure.growth,
                    market_size_2025: procedure.marketSize2025,
                    primary_age_group: procedure.primaryAgeGroup,
                    trends: procedure.trends,
                    future_outlook: procedure.futureOutlook
                }])
                .select();

            if (procError) {
                console.error(`Error inserting procedure ${procedure.name}:`, procError);
                throw procError;
            }

            // Insert procedure-company relationships
            const procId = procData[0]?.id;
            
            if (!procId) {
                console.error('No procedure ID returned for:', procedure.name);
                return;
            }
            
            if (!procedure.companies || !Array.isArray(procedure.companies)) {
                console.log(`No companies associated with procedure: ${procedure.name}`);
                return;
            }
            
            console.log(`Processing ${procedure.companies.length} companies for procedure: ${procedure.name}`);
            procedure.companies.forEach(company => {
                const companyId = companyMap.get(company.name);
                if (companyId) {
                    supabase
                        .from('market_insights.procedure_companies')
                        .insert({
                            procedure_id: procId,
                            company_id: companyId,
                            service_description: company.services
                        });
                }
            });
        }

        console.log('✅ Database populated successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error populating database:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        return false;
    }
}

// Run the population
populateDatabase();
