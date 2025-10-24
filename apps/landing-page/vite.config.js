import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
// https://vitejs.dev/config/
export default defineConfig(function (_a) {
    var mode = _a.mode;
    // Cargar variables de entorno desde el .env de la raíz
    var env = loadEnv(mode, process.cwd() + "/../..", "");
    return {
        plugins: [react()],
        base: "/",
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
                    },
                },
            },
        },
        server: {
            port: parseInt(env.LANDING_PORT || env.PORT || "3000"),
            host: env.LANDING_HOST || "127.0.0.1",
            open: env.NODE_ENV !== "production",
            proxy: {
                "/api": {
                    target: "".concat(env.API_PROTOCOL || "http", "://").concat(env.API_HOST || "127.0.0.1", ":").concat(env.API_PORT || "3004"),
                    changeOrigin: true,
                    secure: false,
                    configure: function (proxy, _options) {
                        proxy.on("error", function (err, _req, _res) {
                            console.log("🚨 Landing Page Proxy Error:", err);
                        });
                        proxy.on("proxyReq", function (_proxyReq, req, _res) {
                            console.log("🔗 Landing Page Proxy Request:", req.method, req.url);
                        });
                    },
                },
            },
        },
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
                "@components": path.resolve(__dirname, "./src/components"),
            },
        },
        optimizeDeps: {
            include: [
                "react",
                "react-dom",
                "react-router-dom",
                "@headlessui/react",
                "@heroicons/react",
            ],
        },
    };
});
