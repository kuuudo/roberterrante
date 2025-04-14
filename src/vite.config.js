// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 3000,
    },
    resolve: {
        alias: {
            '@dimforge/rapier3d-compat': '@dimforge/rapier3d-compat/rapier',
        },
    },
    build: {
        target: 'esnext',
        commonjsOptions: {
            transformMixedEsModules: true,
        },
        outDir: 'dist',
        sourcemap: true,
        // This ensures assets are referenced correctly
        assetsDir: 'assets',
        rollupOptions: {
            output: {
                // This helps with path resolution
                assetFileNames: 'assets/[name]-[hash][extname]',
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
            }
        }
    },
    // Use this for GitHub Pages
    base: './',  // Change from '/roberterrante/' to './'
});
