import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import dentalProcedures from '../../data/dentalProcedures.js';
import aestheticProcedures from '../../data/aestheticProcedures.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateDatabase() {
    try {
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

        // Insert companies
        const { data: companyData, error: companyError } = await supabase
            .from('market_insights.companies')
            .insert(uniqueCompanies)
            .select();

        if (companyError) throw companyError;

        // Create lookup map for company IDs
        const companyMap = new Map();
        companyData.forEach(company => {
            companyMap.set(company.name, company.id);
        });

        // Insert procedures and their relationships
        const allProcedures = [...dentalProcedures, ...aestheticProcedures];

        for (const procedure of allProcedures) {
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

            if (procError) throw procError;

            // Insert procedure-company relationships
            const procId = procData[0].id;
            procedure.companies?.forEach(company => {
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

        console.log('Database populated successfully!');
        return true;
    } catch (error) {
        console.error('Error populating database:', error);
        return false;
    }
}

// Run the population
populateDatabase();
