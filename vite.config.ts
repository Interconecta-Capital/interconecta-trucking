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
          // PDF.js separado
          if (id.includes('pdfjs-dist')) {
            return 'pdfjs';
          }
          // React core separado
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // React Router separado
          if (id.includes('react-router')) {
            return 'router';
          }
          // Supabase separado (lazy load)
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          // Radix UI (lazy load)
          if (id.includes('@radix-ui')) {
            return 'radix';
          }
          // Chart libraries (lazy load)
          if (id.includes('recharts') || id.includes('d3')) {
            return 'charts';
          }
          // Resto de node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
}));
