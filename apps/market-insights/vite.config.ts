import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: process.cwd(),
  resolve: {
    alias: {
      '@repspheres/supabase-client': path.resolve(__dirname, '../../packages/supabase-client'),
    },
  },
  plugins: [react()],
  server: {
    port: 3000,
  },
});
