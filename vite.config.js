import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

function copyPublicSubdirPlugin() {
  return {
    name: 'copy-public-subdir',
    closeBundle() {
      try {
        const srcDir = path.resolve(process.cwd(), 'public');
        const destDir = path.resolve(process.cwd(), 'dist', 'public');
        if (fs.existsSync(srcDir)) {
          fs.cpSync(srcDir, destDir, { recursive: true, force: true });
        }
      } catch (e) {}
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [copyPublicSubdirPlugin()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  server: {
    port: 3000,
    open: true
  }
});
