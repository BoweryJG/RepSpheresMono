import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Custom plugin to ensure process is defined in browser environment
// and add enhanced global safeguards for string operations
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
          
          // Enhanced global safeguards for string operations to prevent "Cannot read properties of undefined" errors
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
            var originalMatch = String.prototype.match;
            var originalReplace = String.prototype.replace;
            var originalSearch = String.prototype.search;
            var originalToLowerCase = String.prototype.toLowerCase;
            var originalToUpperCase = String.prototype.toUpperCase;
            var originalTrim = String.prototype.trim;
            
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
            
            String.prototype.match = function() {
              if (this === undefined || this === null) return null;
              return originalMatch.apply(this, arguments);
            };
            
            String.prototype.replace = function() {
              if (this === undefined || this === null) return '';
              return originalReplace.apply(this, arguments);
            };
            
            String.prototype.search = function() {
              if (this === undefined || this === null) return -1;
              return originalSearch.apply(this, arguments);
            };
            
            String.prototype.toLowerCase = function() {
              if (this === undefined || this === null) return '';
              return originalToLowerCase.apply(this, arguments);
            };
            
            String.prototype.toUpperCase = function() {
              if (this === undefined || this === null) return '';
              return originalToUpperCase.apply(this, arguments);
            };
            
            String.prototype.trim = function() {
              if (this === undefined || this === null) return '';
              return originalTrim.apply(this, arguments);
            };
            
            // Also add a global safeguard for any string operations
            window.safeString = function(str) {
              return (str === undefined || str === null) ? '' : String(str);
            };
            
            // Add a global safeguard for object property access
            window.safeAccess = function(obj, path, defaultValue) {
              if (obj === undefined || obj === null) return defaultValue;
              
              var parts = path.split('.');
              var current = obj;
              
              for (var i = 0; i < parts.length; i++) {
                if (current === undefined || current === null) return defaultValue;
                current = current[parts[i]];
              }
              
              return current !== undefined && current !== null ? current : defaultValue;
            };
            
            console.log('[Safety] Enhanced string operation safeguards installed');
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
      chunkSizeWarningLimit: 1000,
      // Configure esbuild to support top-level await
      target: 'esnext', // Use esnext which fully supports top-level await
      // Explicitly set browser targets to modern browsers that support top-level await
      browserTarget: [
        'chrome >= 91',
        'edge >= 91',
        'firefox >= 90',
        'safari >= 15'
      ]
    },
    esbuild: {
      // Set target to esnext which fully supports top-level await
      target: 'esnext',
      // Ensure top-level await is supported
      supported: {
        'top-level-await': true
      },
      // Add additional safeguards for string operations
      legalComments: 'none',
      minifyIdentifiers: false,
      minifySyntax: true,
      minifyWhitespace: true,
      treeShaking: true,
      // Add specific handling for undefined values
      banner: `
        // Add safeguards for string operations
        if (typeof String.prototype.safeIndexOf !== 'function') {
          String.prototype.safeIndexOf = function(searchValue, fromIndex) {
            if (this === undefined || this === null) return -1;
            return String.prototype.indexOf.call(this, searchValue, fromIndex);
          };
        }
      `
    },
    optimizeDeps: {
      // Exclude setup-netlify.js from optimization to prevent it from being bundled
      exclude: ['setup-netlify.js']
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
