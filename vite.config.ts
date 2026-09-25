import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' so the built bundle also opens from file:// on an air-gapped machine
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { outDir: 'dist', sourcemap: false },
});
