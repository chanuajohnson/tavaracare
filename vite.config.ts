
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Enhanced environment detection for both preview and production
  const isLovablePreview = process.env.VITE_ENV === 'development' || 
                          process.env.VITE_ENV === 'lovable' ||
                          mode === 'development';
  
  // For production builds, we should ALWAYS use absolute paths to prevent asset 404s
  const isProductionBuild = mode === 'production';
  
  // Determine environment for variable loading
  const envPrefix = 'VITE_';
  
  console.log('[Vite Config] Environment detection:', {
    mode,
    VITE_ENV: process.env.VITE_ENV,
    isLovablePreview,
    isProductionBuild,
    NODE_ENV: process.env.NODE_ENV
  });
  
  return {
    // CRITICAL FIX: Always use absolute paths for both preview AND production
    // This prevents assets from being requested from nested routes like /dashboard/assets/
    base: "/",
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
      // Ensure proper asset handling for SPA with absolute paths
      rollupOptions: {
        output: {
          // Ensure consistent file names for proper caching and loading
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      }
    },
    define: {
      // Make environment variables available to client code
      __APP_ENV__: JSON.stringify(process.env.VITE_ENV || mode),
      __IS_PREVIEW__: isLovablePreview,
      __IS_PRODUCTION__: isProductionBuild,
    },
    // Enhanced environment variable handling
    envPrefix: envPrefix,
    // Make Vite load the correct .env file based on mode
    envDir: process.cwd(),
  }
});
