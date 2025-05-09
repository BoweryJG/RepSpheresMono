/**
 * MCP Client for Supabase
 * This file registers the Supabase MCP server with the browser
 */

/**
 * Register the Supabase MCP server with the browser
 */
export const registerSupabaseMcp = () => {
  try {
    console.log('Registering Supabase MCP server...');
    
    // Create the MCP servers object if it doesn't exist
    if (!window.mcpServers) {
      window.mcpServers = {};
    }
    
    // Register the Supabase MCP server
    window.mcpServers.supabase = {
      callTool: async (toolName, args) => {
        try {
          console.log(`Calling Supabase MCP tool: ${toolName}`, args);
          
          // Make a request to the MCP server
          const response = await fetch('http://localhost:3333/mcp/tool', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              server_name: 'supabase',
              tool_name: toolName,
              arguments: args
            }),
          });
          
          if (!response.ok) {
            throw new Error(`MCP server responded with status: ${response.status}`);
          }
          
          const result = await response.json();
          console.log(`Supabase MCP tool ${toolName} result:`, result);
          return result;
        } catch (error) {
          console.error(`Error calling Supabase MCP tool ${toolName}:`, error);
          throw error;
        }
      },
      
      accessResource: async (uri) => {
        try {
          console.log(`Accessing Supabase MCP resource: ${uri}`);
          
          // Make a request to the MCP server
          const response = await fetch('http://localhost:3333/mcp/resource', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              server_name: 'supabase',
              uri: uri
            }),
          });
          
          if (!response.ok) {
            throw new Error(`MCP server responded with status: ${response.status}`);
          }
          
          const result = await response.json();
          console.log(`Supabase MCP resource ${uri} result:`, result);
          return result;
        } catch (error) {
          console.error(`Error accessing Supabase MCP resource ${uri}:`, error);
          throw error;
        }
      }
    };
    
    console.log('Supabase MCP server registered successfully');
    return true;
  } catch (error) {
    console.error('Error registering Supabase MCP server:', error);
    return false;
  }
};

// Export the client as a singleton
export const mcpClient = {
  registerSupabaseMcp
};
