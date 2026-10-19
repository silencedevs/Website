import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  base: './',
  publicDir: false,
  build: {
    outDir: '.build/hero-client',
    emptyOutDir: true,
    assetsDir: '',
    cssCodeSplit: true,
    rollupOptions: {
      input: 'src/styles/hero.css',
      output: { entryFileNames: 'hero.js', chunkFileNames: '[name]-[hash].js', assetFileNames: '[name].[ext]' },
    },
  },
});
