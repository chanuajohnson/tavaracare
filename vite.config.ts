
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // When using a custom domain like tavara.care, you should use an empty base
  base: "",  // Empty base for custom domain
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
  },
  define: {
    // Make environment variables available to client code
    __APP_ENV__: JSON.stringify(process.env.VITE_ENV || mode),
  }
}));
