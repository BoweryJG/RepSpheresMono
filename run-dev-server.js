/**
 * Development Server Starter
 * 
 * This script starts the Vite development server and ensures the MCP server is running
 * to provide Supabase integration through MCP in development mode.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if MCP config exists
const mcpConfigPath = path.join(__dirname, 'mcp-config.json');
if (!fs.existsSync(mcpConfigPath)) {
  console.error('ERROR: mcp-config.json not found. Please create this file first.');
  process.exit(1);
}

// Start MCP server
console.log('Starting MCP server...');
const mcpServer = spawn('node', ['start-mcp-server.js'], {
  stdio: 'inherit',
  detached: true
});

// Give the MCP server time to start
setTimeout(() => {
  console.log('Starting Vite development server...');
  
  // Start Vite development server
  const viteServer = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit'
  });
  
  viteServer.on('error', (error) => {
    console.error('Failed to start development server:', error);
    process.exit(1);
  });
  
  // Handle termination
  process.on('SIGINT', () => {
    console.log('Shutting down servers...');
    
    // Kill MCP server process group
    if (mcpServer.pid) {
      process.kill(-mcpServer.pid);
    }
    
    // Kill Vite server
    if (viteServer.pid) {
      process.kill(viteServer.pid);
    }
    
    process.exit(0);
  });
}, 2000); // Wait 2 seconds for MCP server to start

console.log('Press Ctrl+C to stop all servers');
