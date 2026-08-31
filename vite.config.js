import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // গিটহাব পেজ ও কাস্টম ডোমেইনে রিলেটিভ পাথের জন্য
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    open: true,
    cors: true
  }
});
