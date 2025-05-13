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
      browserTarget: 'esnext'
    },
    esbuild: {
      // Set target to esnext which fully supports top-level await
      target: 'esnext',
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
