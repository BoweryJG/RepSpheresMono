/**
 * MCP Supabase Service
 * This service provides methods to interact with Supabase using the Model Context Protocol (MCP)
 */

/**
 * Initialize the Supabase MCP service
 * @returns {Promise<Object>} Result of the initialization
 */
export const initializeSupabaseMcp = async () => {
  try {
    console.log('Initializing Supabase MCP service...');
    
    // Check if the MCP server is available
    if (!window.mcpServers || !window.mcpServers.supabase) {
      console.error('Supabase MCP server not found');
      return { success: false, error: 'Supabase MCP server not found' };
    }
    
    console.log('Supabase MCP server found');
    return { success: true };
  } catch (error) {
    console.error('Error initializing Supabase MCP service:', error);
    return { success: false, error: error.message };
  }
};

/**
 * List all projects in Supabase
 * @returns {Promise<Array>} List of projects
 */
export const listProjects = async () => {
  try {
    const result = await window.mcpServers.supabase.callTool('list_projects', {});
    return result;
  } catch (error) {
    console.error('Error listing projects:', error);
    throw error;
  }
};

/**
 * Get project details
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Project details
 */
export const getProject = async (projectId) => {
  try {
    const result = await window.mcpServers.supabase.callTool('get_project', {
      id: projectId
    });
    return result;
  } catch (error) {
    console.error('Error getting project:', error);
    throw error;
  }
};

/**
 * List all tables in a project
 * @param {string} projectId - Project ID
 * @param {Array<string>} schemas - List of schemas to include
 * @returns {Promise<Array>} List of tables
 */
export const listTables = async (projectId, schemas = ['public']) => {
  try {
    const result = await window.mcpServers.supabase.callTool('list_tables', {
      project_id: projectId,
      schemas: schemas
    });
    return result;
  } catch (error) {
    console.error('Error listing tables:', error);
    throw error;
  }
};

/**
 * Execute SQL query
 * @param {string} projectId - Project ID
 * @param {string} query - SQL query to execute
 * @returns {Promise<Object>} Query result
 */
export const executeSql = async (projectId, query) => {
  try {
    const result = await window.mcpServers.supabase.callTool('execute_sql', {
      project_id: projectId,
      query: query
    });
    return result;
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
};

/**
 * Get project URL
 * @param {string} projectId - Project ID
 * @returns {Promise<string>} Project URL
 */
export const getProjectUrl = async (projectId) => {
  try {
    const result = await window.mcpServers.supabase.callTool('get_project_url', {
      project_id: projectId
    });
    return result;
  } catch (error) {
    console.error('Error getting project URL:', error);
    throw error;
  }
};

/**
 * Get anonymous API key
 * @param {string} projectId - Project ID
 * @returns {Promise<string>} Anonymous API key
 */
export const getAnonKey = async (projectId) => {
  try {
    const result = await window.mcpServers.supabase.callTool('get_anon_key', {
      project_id: projectId
    });
    return result;
  } catch (error) {
    console.error('Error getting anonymous API key:', error);
    throw error;
  }
};

// Export the service as a singleton
export const mcpSupabaseService = {
  initialize: initializeSupabaseMcp,
  listProjects,
  getProject,
  listTables,
  executeSql,
  getProjectUrl,
  getAnonKey
};
