import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative assets work on GitHub Pages without path breaking
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['/src/utils/format.js', '/src/api/client.js']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
