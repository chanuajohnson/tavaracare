
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Detect Lovable preview environment properly
  const isLovablePreview = process.env.VITE_ENV === 'development' || 
                          process.env.VITE_ENV === 'lovable' ||
                          mode === 'development';
  
  // Determine environment for variable loading
  const envPrefix = 'VITE_';
  
  console.log('[Vite Config] Environment detection:', {
    mode,
    VITE_ENV: process.env.VITE_ENV,
    isLovablePreview,
    NODE_ENV: process.env.NODE_ENV
  });
  
  return {
    // Use absolute paths for Lovable preview to fix asset loading
    // Use relative paths for production builds
    base: isLovablePreview ? "/" : "./",
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
      // Ensure proper asset handling for SPA
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
    },
    // Enhanced environment variable handling
    envPrefix: envPrefix,
    // Make Vite load the correct .env file based on mode
    envDir: process.cwd(),
  }
});
