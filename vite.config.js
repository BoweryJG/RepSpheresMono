import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/brave-search': {
        target: 'https://api.search.brave.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/brave-search/, '/res/v1/web/search')
      }
    },
  },
  build: {
    outDir: 'build',
    minify: 'terser',
    sourcemap: true
  }
});
