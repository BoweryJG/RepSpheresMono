import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        // Add any necessary aliases here
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      'process.env': JSON.stringify({
        ...env,
        NODE_ENV: mode
      }),
      // Fix for the colors package
      'window.process': JSON.stringify({
        env: { NODE_ENV: mode }
      })
    },
    // Exclude server-side utilities from client build
    ssr: {
      // Don't bundle server-side code in the client build
      noExternal: (id) => !id.startsWith('src/server/')
    },
    optimizeDeps: {
      // Force Vite to include these dependencies in the optimized deps
      include: ['react', 'react-dom', 'react-router-dom'],
      // Exclude problematic packages from optimization
      exclude: ['@colors/colors']
    },
    server: {
      port: 3000,
      open: true,
      cors: true,
      // Handle SPA fallback
      historyApiFallback: {
        index: '/index.html'
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            mui: ['@mui/material', '@mui/icons-material']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    esbuild: {
      // Configure esbuild options
      // jsxInject removed to prevent duplicate React imports
    }
  };
});
