import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    
    // PWA Plugin para Service Worker
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Interconecta Trucking',
        short_name: 'Interconecta',
        description: 'Plataforma de gestión de transporte y cartas porte',
        theme_color: '#1A69FA',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutos
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/maps\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-maps-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 días
              },
            },
          },
        ],
      },
    }),
    
    // Brotli compression
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
    }),
    
    // Gzip compression (fallback)
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false,
    }),
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
    include: ['react', 'react-dom', 'react-router-dom', 'mapbox-gl'],
    exclude: ['pdfjs-dist', 'tesseract.js', '@fullcalendar/core'],
  },
}));
