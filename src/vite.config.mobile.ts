// vite.config.mobile.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        mobile: 'mobile.ts'
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
});
