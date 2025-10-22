import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 1. PDF.js separate (lazy load - only in carta porte)
          if (id.includes('pdfjs-dist')) {
            return 'pdfjs';
          }
          
          // 2. React + Router together (critical - load first)
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') ||
              id.includes('react-router')) {
            return 'react-core';
          }
          
          // 3. All other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          
          // App code stays in main bundle
        },
      },
    },
  },
}));
