import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno desde el .env de la raíz
  const env = loadEnv(mode, process.cwd() + "/../..", "");

  return {
  plugins: [react()] as any,
  base: "/manager",
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      env.NODE_ENV || "development",
    ),
    // Hacer las variables disponibles en el cliente
    "process.env.REACT_APP_API_URL": JSON.stringify(
      env.REACT_APP_API_URL || env.API_URL || "https://agent.prixcenter.com/api/v1",
    ),
    "process.env.REACT_APP_API_PROTOCOL": JSON.stringify(
      env.REACT_APP_API_PROTOCOL || env.API_PROTOCOL || "https",
    ),
    "process.env.REACT_APP_API_HOST": JSON.stringify(
      env.REACT_APP_API_HOST || env.API_HOST || "agent.prixcenter.com",
    ),
    "process.env.REACT_APP_API_PORT": JSON.stringify(
      env.REACT_APP_API_PORT || env.API_PORT || "3004",
    ),
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["@headlessui/react", "@heroicons/react"],
          charts: ["chart.js", "react-chartjs-2"],
          forms: ["react-hook-form", "@hookform/resolvers"],
          validation: ["zod"],
          state: ["zustand", "@tanstack/react-query"],
        },
      },
    },
  },
  server: {
    port: parseInt(env.ADMIN_PORT || "3002"),
    host: env.ADMIN_HOST || "127.0.0.1",
    open: env.NODE_ENV !== "production",
    proxy: {
      "/api": {
        target: `${env.API_PROTOCOL || "http"}://${env.API_HOST || "127.0.0.1"}:${env.API_PORT || "3004"}`,
        changeOrigin: true,
        secure: false,
        timeout: 30000, // 30 segundos de timeout estándar
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("🚨 Admin Dashboard Proxy Error:", err);
          });
          proxy.on("proxyReq", (_proxyReq, req, _res) => {
            console.log(
              "🔗 Admin Dashboard Proxy Request:",
              req.method,
              req.url,
            );
          });
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@lib": path.resolve(__dirname, "./src/lib"),
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@headlessui/react",
      "@heroicons/react",
      "chart.js",
      "react-chartjs-2",
      "react-hook-form",
      "@hookform/resolvers",
      "zod",
      "zustand",
      "@tanstack/react-query",
    ],
  },
};
});
