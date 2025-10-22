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
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    minify: 'esbuild',
    reportCompressedSize: false, // Faster builds
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        compact: true,
        manualChunks: (id) => {
          // Librerías pesadas en chunks separados
          if (id.includes('pdfjs-dist')) {
            return 'pdfjs';
          }
          if (id.includes('@fullcalendar')) {
            return 'calendar';
          }
          if (id.includes('recharts')) {
            return 'charts';
          }
          if (id.includes('mapbox-gl')) {
            return 'maps';
          }
          if (id.includes('tesseract.js')) {
            return 'ocr';
          }
          if (id.includes('xlsx')) {
            return 'xlsx';
          }
          if (id.includes('jspdf')) {
            return 'pdf-gen';
          }
          
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'react-core';
            }
            // React Router
            if (id.includes('react-router')) {
              return 'react-router';
            }
            // UI Components
            if (id.includes('@radix-ui')) {
              return 'ui-radix';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // Forms
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'forms';
            }
            // Utilities
            if (id.includes('date-fns') || id.includes('moment') || id.includes('axios')) {
              return 'utils';
            }
            // Query
            if (id.includes('@tanstack/react-query')) {
              return 'query';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            // Resto de vendor
            return 'vendor';
          }
        },
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'js/[name].[hash].js',
        entryFileNames: 'js/[name].[hash].js',
      },
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
}));
