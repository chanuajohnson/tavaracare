
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
      outDir: "dist", // Output to 'dist' directory
      sourcemap: mode === 'development', // Enable sourcemaps in development
      chunkSizeWarningLimit: 1600, // Increase chunk size warning limit for larger components
      rollupOptions: {
        output: {
          // Use a function-based manualChunks configuration for more flexibility
          manualChunks: (id) => {
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
            
            // Vendor chunks
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
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
          }
        }
      }
    },
    define: {
      // Make environment variables available to client code
      __APP_ENV__: JSON.stringify(process.env.VITE_ENV || mode),
      __IS_PREVIEW__: isPreview,
    },
    // Enhanced environment variable handling
    envPrefix: envPrefix,
    // Make Vite load the correct .env file based on mode
    envDir: process.cwd(),
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
      esbuildOptions: {
        // Increase build memory limit to handle large components
        treeShaking: true,
      }
    }
  }
});
