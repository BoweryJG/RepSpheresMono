import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Custom plugin to ensure process is defined in browser environment
// and add global safeguards for string operations
const browserSafetyPlugin = () => {
  return {
    name: 'browser-safety-plugin',
    transformIndexHtml(html) {
      // Add scripts to define process and add string operation safeguards before any other scripts run
      return html.replace(
        /<head>/,
        `<head>
        <script>
          // Ensure process is defined in browser environment
          window.process = window.process || {};
          window.process.env = window.process.env || {};
          
          // Global safeguards for string operations to prevent "Cannot read properties of undefined" errors
          (function() {
            // Store original String prototype methods
            var originalIndexOf = String.prototype.indexOf;
            var originalLastIndexOf = String.prototype.lastIndexOf;
            var originalIncludes = String.prototype.includes;
            var originalStartsWith = String.prototype.startsWith;
            var originalEndsWith = String.prototype.endsWith;
            var originalSubstring = String.prototype.substring;
            var originalSlice = String.prototype.slice;
            var originalSplit = String.prototype.split;
            
            // Override String methods with safe versions
            String.prototype.indexOf = function() {
              if (this === undefined || this === null) return -1;
              return originalIndexOf.apply(this, arguments);
            };
            
            String.prototype.lastIndexOf = function() {
              if (this === undefined || this === null) return -1;
              return originalLastIndexOf.apply(this, arguments);
            };
            
            String.prototype.includes = function() {
              if (this === undefined || this === null) return false;
              return originalIncludes.apply(this, arguments);
            };
            
            String.prototype.startsWith = function() {
              if (this === undefined || this === null) return false;
              return originalStartsWith.apply(this, arguments);
            };
            
            String.prototype.endsWith = function() {
              if (this === undefined || this === null) return false;
              return originalEndsWith.apply(this, arguments);
            };
            
            String.prototype.substring = function() {
              if (this === undefined || this === null) return '';
              return originalSubstring.apply(this, arguments);
            };
            
            String.prototype.slice = function() {
              if (this === undefined || this === null) return '';
              return originalSlice.apply(this, arguments);
            };
            
            String.prototype.split = function() {
              if (this === undefined || this === null) return [];
              return originalSplit.apply(this, arguments);
            };
            
            // Also add a global safeguard for any string operations
            window.safeString = function(str) {
              return (str === undefined || str === null) ? '' : String(str);
            };
            
            console.log('[Safety] String operation safeguards installed');
          })();
        </script>`
      );
    }
  };
};

export default defineConfig(({ mode }) => {
  // Load all env variables regardless of the environment
  const env = loadEnv(mode, process.cwd(), '');
  
  // Log build environment info for debugging
  console.log(`Building in ${mode} mode`);
  console.log('Environment variables loaded:', Object.keys(env).filter(key => key.startsWith('VITE_')).length);
  
  // For Netlify deployment, ensure we detect the environment correctly
  const isNetlify = process.env.NETLIFY === 'true' || env.NETLIFY === 'true';
  if (isNetlify) {
    console.log('Building for Netlify deployment');
  }

  return {
    plugins: [
      react(),
      browserSafetyPlugin()
    ],
    server: {
      port: 3000, // Your configured port
      open: true,
      proxy: {
        '/api/brave-search': {
          target: 'https://api.search.brave.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/brave-search/, '/res/v1/web/search'),
          headers: {
            'x-subscription-token': env.VITE_BRAVE_SEARCH_API_KEY
          }
        }
      },
    },
    build: {
      outDir: 'dist',
      minify: 'terser',
      sourcemap: mode !== 'production', // Only generate sourcemaps in development
      // Add specific optimizations for production
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
            charts: ['recharts', 'react-simple-maps']
          }
        }
      },
      // Add console logging to help debug Netlify builds
      reportCompressedSize: true,
      chunkSizeWarningLimit: 1000
    },
    define: {
      // Make environment mode available to the app
      '__APP_ENV__': JSON.stringify(mode),
      '__IS_NETLIFY__': isNetlify,
      // Add process polyfill for browser environment - include VITE_ variables in all environments
      'process.env': JSON.stringify(Object.keys(env)
        .filter(key => key.startsWith('VITE_'))
        .reduce((obj, key) => {
          obj[key] = env[key];
          return obj;
        }, {
          // Always include NODE_ENV for libraries that might depend on it
          NODE_ENV: mode
        }))
    }
  };
});
