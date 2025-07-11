// vite.config.js
import { defineConfig } from "file:///home/francis/a4t-project-frontend/node_modules/.pnpm/vite@5.4.19_@types+node@24.0.4/node_modules/vite/dist/node/index.js";
import react from "file:///home/francis/a4t-project-frontend/node_modules/.pnpm/@vitejs+plugin-react-swc@3.10.2_vite@5.4.19_@types+node@24.0.4_/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { resolve } from "path";
import tailwindcss from "file:///home/francis/a4t-project-frontend/node_modules/.pnpm/tailwindcss@3.4.17_ts-node@10.9.2_@swc+core@1.12.6_@types+node@24.0.4_typescript@5.8.3_/node_modules/tailwindcss/lib/index.js";
import tsconfigPaths from "file:///home/francis/a4t-project-frontend/node_modules/.pnpm/vite-tsconfig-paths@5.1.4_typescript@5.8.3_vite@5.4.19_@types+node@24.0.4_/node_modules/vite-tsconfig-paths/dist/index.js";
var __vite_injected_original_dirname = "/home/francis/a4t-project-frontend";
var vite_config_default = defineConfig({
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"]
        }
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: true,
      followSymlinks: false
    },
    allowedHosts: ["a4nt-grvnz.ondigitalocean.app", "a4nt-epaoy.ondigitalocean.app", "www.a4tpowercrm.com.ng"]
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: ["a4nt-grvnz.ondigitalocean.app", "a4nt-epaoy.ondigitalocean.app", "www.a4tpowercrm.com.ng"]
  },
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src")
    }
  },
  optimizeDeps: {
    include: ["@axios", "@react-icons"]
  },
  css: {
    postcss: {
      plugins: [tailwindcss()]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9mcmFuY2lzL2E0dC1wcm9qZWN0LWZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9mcmFuY2lzL2E0dC1wcm9qZWN0LWZyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2ZyYW5jaXMvYTR0LXByb2plY3QtZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gXCJ0YWlsd2luZGNzc1wiO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSBcInZpdGUtdHNjb25maWctcGF0aHNcIjtcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBidWlsZDoge1xuICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgIHZlbmRvcjogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIl0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiMC4wLjAuMFwiLFxuICAgIHBvcnQ6IDUxNzMsXG4gICAgd2F0Y2g6IHtcbiAgICAgIHVzZVBvbGxpbmc6IHRydWUsXG4gICAgICBmb2xsb3dTeW1saW5rczogZmFsc2UsXG4gICAgfSxcbiAgICBhbGxvd2VkSG9zdHM6IFtcImE0bnQtZ3J2bnoub25kaWdpdGFsb2NlYW4uYXBwXCIsIFwiYTRudC1lcGFveS5vbmRpZ2l0YWxvY2Vhbi5hcHBcIiwgXCJ3d3cuYTR0cG93ZXJjcm0uY29tLm5nXCJdLCBcbiAgfSxcbiAgcHJldmlldzoge1xuICAgIGhvc3Q6IFwiMC4wLjAuMFwiLFxuICAgIHBvcnQ6IDUxNzMsXG4gICAgYWxsb3dlZEhvc3RzOiBbXCJhNG50LWdydm56Lm9uZGlnaXRhbG9jZWFuLmFwcFwiLCBcImE0bnQtZXBhb3kub25kaWdpdGFsb2NlYW4uYXBwXCIsIFwid3d3LmE0dHBvd2VyY3JtLmNvbS5uZ1wiXSxcbiAgfSxcbiAgcGx1Z2luczogW3JlYWN0KCksIHRzY29uZmlnUGF0aHMoKV0sIFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogW1wiQGF4aW9zXCIsIFwiQHJlYWN0LWljb25zXCJdLFxuICB9LFxuICBjc3M6IHtcbiAgICBwb3N0Y3NzOiB7XG4gICAgICBwbHVnaW5zOiBbdGFpbHdpbmRjc3MoKV0sXG4gICAgfSxcbiAgfSxcbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1IsU0FBUyxvQkFBb0I7QUFDclQsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUN4QixPQUFPLGlCQUFpQjtBQUN4QixPQUFPLG1CQUFtQjtBQUoxQixJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixPQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUEsSUFDWCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsVUFDWixRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsUUFDL0I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFlBQVk7QUFBQSxNQUNaLGdCQUFnQjtBQUFBLElBQ2xCO0FBQUEsSUFDQSxjQUFjLENBQUMsaUNBQWlDLGlDQUFpQyx3QkFBd0I7QUFBQSxFQUMzRztBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sY0FBYyxDQUFDLGlDQUFpQyxpQ0FBaUMsd0JBQXdCO0FBQUEsRUFDM0c7QUFBQSxFQUNBLFNBQVMsQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDO0FBQUEsRUFDbEMsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxJQUMvQjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxVQUFVLGNBQWM7QUFBQSxFQUNwQztBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0gsU0FBUztBQUFBLE1BQ1AsU0FBUyxDQUFDLFlBQVksQ0FBQztBQUFBLElBQ3pCO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
