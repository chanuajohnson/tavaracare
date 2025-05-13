import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Determine if we're in a preview environment by checking environment variables
  const isPreview = process.env.PREVIEW === 'true';
  
  // Determine environment for variable loading
  const envPrefix = 'VITE_';
  
  return {
    // Use empty base for custom domain and preview environments
    base: "",  
    server: {
      host: "::",
      port: 8080,
      // Add allowedHosts configuration to fix the blocked request error
      allowedHosts: [
        '6d6595e0-04bb-4870-8c48-286aef5b647f.lovableproject.com',
        // Keep existing hosts if any
        'localhost',
        '127.0.0.1'
      ]
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Ensure React is properly resolved
        "react": path.resolve(__dirname, "./node_modules/react"),
        "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      },
    },
    build: {
      outDir: "dist", // Output to 'dist' directory
      sourcemap: mode === 'development', // Enable sourcemaps in development
      chunkSizeWarningLimit: 1600, // Increase chunk size warning limit for larger components
      commonjsOptions: {
        // Handle non-ESM modules more carefully
        transformMixedEsModules: true,
        include: [/node_modules/, /cdn\.gpteng\.co/],
      },
      rollupOptions: {
        output: {
          // Enhanced chunk management to ensure correct loading order
          manualChunks: (id) => {
            // React and React DOM must be in the first chunk to initialize before other dependencies
            if (id.includes('node_modules/react') || 
                id.includes('node_modules/react-dom') || 
                id.includes('node_modules/scheduler')) {
              return 'react-core';
            }
            
            // Put Lucide React in a separate chunk that loads after React
            if (id.includes('node_modules/lucide-react')) {
              return 'lucide';
            }

            // Put Framer Motion in a separate chunk that loads after React
            if (id.includes('node_modules/framer-motion')) {
              return 'framer-motion';
            }
            
            // Dashboard specific chunks
            if (id.includes('/pages/dashboards/FamilyDashboard')) {
              return 'family-dashboard';
            }
            if (id.includes('/pages/dashboards/ProfessionalDashboard')) {
              return 'professional-dashboard';
            }
            if (id.includes('/pages/dashboards/CommunityDashboard')) {
              return 'community-dashboard';
            }
            
            // Other vendor chunks
            if (id.includes('node_modules')) {
              if (id.includes('framer-motion')) {
                return 'vendor-animations';
              }
              return 'vendor'; // Other node_modules
            }
            
            // UI components chunk
            if (id.includes('/components/ui/')) {
              return 'ui-components';
            }
            
            // Default chunk handling by Vite
            return undefined;
          },
          // Configure entry points to ensure React loads first
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: (chunkInfo) => {
            // Ensure react-core chunk has the highest priority (loads first)
            if (chunkInfo.name === 'react-core') {
              return 'assets/react-core-[hash].js';
            }
            // Ensure lucide chunk loads after react-core
            if (chunkInfo.name === 'lucide') {
              return 'assets/lucide-[hash].js';
            }
            // Ensure framer-motion chunk loads after react-core
            if (chunkInfo.name === 'framer-motion') {
              return 'assets/framer-motion-[hash].js';
            }
            return 'assets/[name]-[hash].js';
          }
        }
      }
    },
    define: {
      // Make environment variables available to client code
      __APP_ENV__: JSON.stringify(process.env.VITE_ENV || mode),
      __IS_PREVIEW__: isPreview,
      'import.meta.env': JSON.stringify(process.env),
      'process.env': JSON.stringify(process.env),
    },
    // Enhanced environment variable handling
    envPrefix: envPrefix,
    // Make Vite load the correct .env file based on mode
    envDir: process.cwd(),
    optimizeDeps: {
      // Ensure React is pre-bundled and available
      include: [
        'react', 
        'react-dom', 
        'react-router-dom', 
        'framer-motion', 
        'lucide-react'
      ],
      esbuildOptions: {
        // Increase build memory limit to handle large components
        treeShaking: true,
      }
    }
  }
});
