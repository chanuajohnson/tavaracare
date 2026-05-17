
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// @ts-ignore - plain JS plugin
import seoPrerender from "./prerender/vite-plugin-seo-prerender.mjs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isLovablePreview = process.env.VITE_ENV === 'development' || 
                          process.env.VITE_ENV === 'lovable' ||
                          mode === 'development';
  
  const isProductionBuild = mode === 'production';
  
  const envPrefix = 'VITE_';
  
  console.log('[Vite Config] Environment detection:', {
    mode,
    VITE_ENV: process.env.VITE_ENV,
    isLovablePreview,
    isProductionBuild,
    NODE_ENV: process.env.NODE_ENV
  });
  
  return {
    base: "/",
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      isProductionBuild && seoPrerender(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      }
    },
    define: {
      __APP_ENV__: JSON.stringify(process.env.VITE_ENV || mode),
      __IS_PREVIEW__: isLovablePreview,
      __IS_PRODUCTION__: isProductionBuild,
    },
    envPrefix: envPrefix,
    envDir: process.cwd(),
  }
});
