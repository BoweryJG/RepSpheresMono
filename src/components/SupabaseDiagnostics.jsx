import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase/supabaseClient.js';

const SupabaseDiagnostics = () => {
  const [status, setStatus] = useState('Testing connection...');
  const [tables, setTables] = useState([]);
  const [dataPreview, setDataPreview] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tableToTest, setTableToTest] = useState('dental_procedures_simplified');

  // List of tables to check
  const tablesToCheck = [
    'dental_procedures_simplified',
    'aesthetic_procedures', 
    'companies',
    'dental_market_growth',
    'aesthetic_market_growth',
    'categories',
    'aesthetic_categories'
  ];

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        
        // Check connection to Supabase
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Connection error: ${sessionError.message}`);
        }
        
        setStatus('Connected to Supabase');
        
        // Check each table
        const tableStatus = [];
        
        for (const table of tablesToCheck) {
          try {
            const { count, error } = await supabase
              .from(table)
              .select('*', { count: 'exact', head: true });
              
            tableStatus.push({ 
              name: table, 
              exists: !error, 
              count: error ? 0 : count,
              error: error ? error.message : null 
            });
          } catch (err) {
            tableStatus.push({ 
              name: table, 
              exists: false, 
              count: 0,
              error: err.message 
            });
          }
        }
        
        setTables(tableStatus);
        
        // Get preview data from the selected table
        if (tableToTest) {
          await fetchTablePreview(tableToTest);
        }
      } catch (err) {
        setStatus('Connection failed');
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConnection();
  }, [tableToTest]);
  
  const fetchTablePreview = async (tableName) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(5);
        
      if (error) {
        throw error;
      }
      
      setDataPreview({
        table: tableName,
        records: data
      });
    } catch (err) {
      setDataPreview({
        table: tableName,
        error: err.message
      });
    }
  };
  
  const handleTableSelect = (e) => {
    setTableToTest(e.target.value);
  };
  
  const refreshData = () => {
    setIsLoading(true);
    fetchTablePreview(tableToTest);
  };
  
  const getStatusColor = () => {
    if (status.includes('Connected')) return 'text-green-500';
    if (status.includes('Testing')) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Supabase Diagnostics</h2>
      
      <div className="mb-6">
        <p className="font-semibold">Connection Status: 
          <span className={`ml-2 ${getStatusColor()}`}>{status}</span>
        </p>
        {error && <p className="text-red-400 mt-2">Error: {error}</p>}
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Tables</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tables.map(table => (
            <div 
              key={table.name} 
              className={`p-3 rounded ${table.exists ? 'bg-gray-700' : 'bg-red-900'}`}
            >
              <div className="flex justify-between">
                <span className="font-medium">{table.name}</span>
                {table.exists ? (
                  <span className="text-green-400">✓</span>
                ) : (
                  <span className="text-red-400">✗</span>
                )}
              </div>
              
              {table.exists ? (
                <p className="text-sm text-gray-300">Records: {table.count}</p>
              ) : (
                <p className="text-sm text-red-300">{table.error}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex items-center gap-4 mb-3">
          <h3 className="text-xl font-semibold">Preview Data</h3>
          
          <select 
            value={tableToTest}
            onChange={handleTableSelect}
            className="bg-gray-700 text-white px-3 py-1 rounded"
          >
            {tablesToCheck.map(table => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
          
          <button 
            onClick={refreshData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        <div className="bg-gray-900 p-4 rounded overflow-auto max-h-96">
          {isLoading ? (
            <p className="text-gray-400">Loading data...</p>
          ) : dataPreview.error ? (
            <p className="text-red-400">Error: {dataPreview.error}</p>
          ) : dataPreview.records && dataPreview.records.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  {Object.keys(dataPreview.records[0]).map(key => (
                    <th key={key} className="text-left py-2 px-2 text-gray-400">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataPreview.records.map((record, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    {Object.values(record).map((value, j) => (
                      <td key={j} className="py-2 px-2">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400">No data found in {dataPreview.table}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupabaseDiagnostics;
