import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import tailwindcss from "tailwindcss";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: true,
      followSymlinks: false,
    },
    allowedHosts: ["freewave-energy-cmvgn.ondigitalocean.app", "freewavecrm.com"],
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: ["freewave-energy-cmvgn.ondigitalocean.app", "freewavecrm.com"],
  },
  plugins: [react(), tsconfigPaths()], 
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    include: ["axios", "react-icons"],
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
