import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    // Cargar variables de entorno desde el .env de la raíz
    const env = loadEnv(mode, process.cwd() + "/../..", "");
    return {
        plugins: [react()],
        define: {
            // Hacer las variables VITE_* disponibles en el cliente
            // En producción, usar valores hardcodeados si no están en el entorno
            "import.meta.env.VITE_APP_URL": JSON.stringify(env.VITE_APP_URL || "https://agent.prixcenter.com"),
            "import.meta.env.VITE_API_PROTOCOL": JSON.stringify(env.VITE_API_PROTOCOL || "https"),
            "import.meta.env.VITE_API_HOST": JSON.stringify(env.VITE_API_HOST || "agent.prixcenter.com"),
            "import.meta.env.VITE_API_PORT": JSON.stringify(env.VITE_API_PORT || "3004"),
        },
        base: "/dashboard",
        server: {
            host: process.env.CLIENT_HOST || "127.0.0.1",
            port: parseInt(process.env.CLIENT_PORT || "3001"),
            open: process.env.NODE_ENV !== "production",
            watch: {
                ignored: [
                    "**/AppData/**",
                    "**/node_modules/**",
                    "**/.git/**",
                    "**/dist/**",
                    "**/*.tmp",
                    "**/*.log",
                    "**/*.cache",
                ],
            },
            // Proxy only for development
            proxy: {
                "/api": {
                    target: "http://localhost:3004",
                    changeOrigin: true,
                    secure: false,
                    timeout: 30000, // 30 segundos de timeout estándar
                    configure: (proxy, _options) => {
                        proxy.on("error", (err, _req, _res) => {
                            console.log("🚨 Client Dashboard Proxy Error:", err);
                        });
                        proxy.on("proxyReq", (_proxyReq, req, _res) => {
                            console.log("🔗 Client Dashboard Proxy Request:", req.method, req.url);
                        });
                    },
                },
            },
        },
        build: {
            outDir: "dist",
            sourcemap: true,
            chunkSizeWarningLimit: 1000,
            rollupOptions: {
                external: [],
                output: {
                    manualChunks: {
                        vendor: ["react", "react-dom"],
                        router: ["react-router-dom", "set-cookie-parser"],
                        ui: ["@heroicons/react"],
                        charts: ["chart.js"],
                        state: ["zustand", "@tanstack/react-query"],
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
                "set-cookie-parser",
                "@heroicons/react",
                "chart.js",
                "zustand",
                "@tanstack/react-query",
            ],
        },
    };
});
