import React, { useEffect, useState } from 'react';
import { SupabaseProvider, useSupabase, withSupabase } from '..';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

// Example component using the useSupabase hook
const ProceduresList = () => {
  const { supabase, isLoading, error } = useSupabase();
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProcedures = async () => {
      try {
        const { data, error } = await supabase
          .from('aesthetic_procedures')
          .select('*')
          .limit(10);
        
        if (error) {
          throw error;
        }
        
        setProcedures(data || []);
      } catch (err) {
        console.error('Error fetching procedures:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && !error) {
      fetchProcedures();
    }
  }, [supabase, isLoading, error]);

  if (isLoading || loading) {
    return <div>Loading procedures...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>Aesthetic Procedures</h2>
      <ul>
        {procedures.map((procedure) => (
          <li key={procedure.id}>
            {procedure.name} - {procedure.category}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Example component using the withSupabase HOC
interface CompanyListProps {
  supabase: SupabaseClient<Database>;
}

const CompanyListBase = ({ supabase }: CompanyListProps) => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .limit(10);
        
        if (error) {
          throw error;
        }
        
        setCompanies(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch companies'));
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [supabase]);

  if (loading) {
    return <div>Loading companies...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>Companies</h2>
      <ul>
        {companies.map((company) => (
          <li key={company.id}>
            {company.name} - {company.industry}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Apply the HOC
const CompanyList = withSupabase(CompanyListBase);

// Main example component
export const SupabaseExample = () => {
  // Replace with your actual Supabase credentials
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

  return (
    <SupabaseProvider supabaseUrl={supabaseUrl} supabaseKey={supabaseKey}>
      <div className="supabase-example">
        <h1>Supabase Client Example</h1>
        <ProceduresList />
        <CompanyList />
      </div>
    </SupabaseProvider>
  );
};

export default SupabaseExample;
