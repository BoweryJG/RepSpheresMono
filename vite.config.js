import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

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
    plugins: [react()],
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
      '__IS_NETLIFY__': isNetlify
    }
  };
});
