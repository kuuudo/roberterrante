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
    },
    // Use this for GitHub Pages
    base: '/roberterrante/',
});