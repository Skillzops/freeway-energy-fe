import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import tailwindcss from "tailwindcss";
import tsconfigPaths from "vite-tsconfig-paths";
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    historyApiFallback: true, // Helps with SPA routing
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
  plugins: [react(), tsconfigPaths()],
  base: "/", // Ensure the base is correctly set
  build: {
    outDir: "dist", // Ensure Vite builds into 'dist'
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    include: ["@axios", "@react-icons"],
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
