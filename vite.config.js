import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Custom plugin to ensure process is defined in browser environment
const browserSafetyPlugin = () => {
  return {
    name: 'browser-safety-plugin',
    transformIndexHtml(html) {
      // Add scripts to define process before any other scripts run
      return html.replace(
        /<head>/,
        `<head>
        <script>
          // Ensure process is defined in browser environment
          window.process = window.process || {};
          window.process.env = window.process.env || {};
        </script>`
      );
    }
  };
};

// Custom plugin to exclude Node.js-only packages from browser bundle
const nodeModulesExcludePlugin = () => {
  const nodeOnlyPackages = ['colors'];
  
  return {
    name: 'node-modules-exclude-plugin',
    resolveId(source) {
      // Check for both 'colors' and any import starting with 'colors/'
      // Also handle the case where .js extension is included in the import
      const normalizedSource = source.endsWith('.js') ? source.slice(0, -3) : source;
      
      if (nodeOnlyPackages.includes(normalizedSource) || 
          nodeOnlyPackages.some(pkg => normalizedSource.startsWith(`${pkg}/`))) {
        // Return an empty module for Node.js-only packages
        return { id: 'virtual:empty-module-' + normalizedSource.replace(/\//g, '-'), external: false };
      }
      return null;
    },
    load(id) {
      if (id.startsWith('virtual:empty-module-')) {
        const source = id.replace('virtual:empty-module-', '').replace(/-/g, '/');
        
        // Special case for colors/safe.js which is imported in some files
        if (source === 'colors/safe') {
          return `
            // Mock implementation of colors/safe
            const colors = {
              red: (text) => text,
              green: (text) => text,
              yellow: (text) => text,
              blue: (text) => text,
              magenta: (text) => text,
              cyan: (text) => text,
              white: (text) => text,
              gray: (text) => text,
              grey: (text) => text,
              black: (text) => text,
              rainbow: (text) => text,
              zebra: (text) => text,
              america: (text) => text,
              trap: (text) => text,
              random: (text) => text,
              zalgo: (text) => text,
              enable: () => {},
              disable: () => {},
              bold: { 
                red: (text) => text,
                green: (text) => text,
                yellow: (text) => text,
                blue: (text) => text,
                magenta: (text) => text,
                cyan: (text) => text,
                white: (text) => text
              }
            };
            
            // Add chaining support
            colors.red.bold = colors.red;
            colors.green.bold = colors.green;
            colors.yellow.bold = colors.yellow;
            colors.blue.bold = colors.blue;
            colors.magenta.bold = colors.magenta;
            colors.cyan.bold = colors.cyan;
            colors.white.bold = colors.white;
            
            export default colors;
            export const red = colors.red;
            export const green = colors.green;
            export const yellow = colors.yellow;
            export const blue = colors.blue;
            export const magenta = colors.magenta;
            export const cyan = colors.cyan;
            export const white = colors.white;
            export const gray = colors.gray;
            export const grey = colors.grey;
            export const black = colors.black;
            export const rainbow = colors.rainbow;
            export const zebra = colors.zebra;
            export const america = colors.america;
            export const trap = colors.trap;
            export const random = colors.random;
            export const zalgo = colors.zalgo;
          `;
        }
        
        // Default case for other modules
        return `
          export default {};
          export const red = (text) => text;
          export const green = (text) => text;
          export const yellow = (text) => text;
          export const blue = (text) => text;
          export const magenta = (text) => text;
          export const cyan = (text) => text;
          export const white = (text) => text;
          export const gray = (text) => text;
          export const grey = (text) => text;
          export const black = (text) => text;
          export const rainbow = (text) => text;
          export const zebra = (text) => text;
          export const america = (text) => text;
          export const trap = (text) => text;
          export const random = (text) => text;
          export const zalgo = (text) => text;
        `;
      }
      return null;
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
      browserSafetyPlugin(),
      nodeModulesExcludePlugin()
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
      target: 'es2022', // Use es2022 which supports top-level await and is compatible with more browsers
      // Explicitly set browser targets to browsers that support top-level await
      browserTarget: ['chrome90', 'firefox90', 'safari15', 'edge90']
    },
    esbuild: {
      // Set target to es2022 which supports top-level await and is compatible with more browsers
      target: 'es2022',
      // Ensure top-level await is supported
      supported: {
        'top-level-await': true
      },
      format: 'esm', // Explicitly set the format to ESM which supports top-level await
      legalComments: 'none',
      minifyIdentifiers: false,
      minifySyntax: true,
      minifyWhitespace: true,
      treeShaking: true
    },
    optimizeDeps: {
      // Exclude setup-netlify.js from optimization to prevent it from being bundled
      exclude: ['setup-netlify.js', 'colors', 'colors/safe.js']
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
