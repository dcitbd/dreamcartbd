import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: process.cwd(),
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      input: resolve(process.cwd(), 'index.html')
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
