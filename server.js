import { spawn } from "child_process";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_PORT = process.env.API_PORT || 3004;
const APP_URL =
  process.env.APP_URL ||
  `http://${process.env.API_HOST || "localhost"}:${PORT}`;

// Variable para almacenar el proceso de la API (solo en producción)
let apiProcess = null;

// Función para verificar si la API está corriendo (solo en producción)
async function isApiRunning() {
  try {
    const apiTarget = `http://127.0.0.1:${API_PORT}`;
    const response = await fetch(`${apiTarget}/api/v1/health`, {
      timeout: 10000, // 10 segundos para health check
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Start API automatically in production
async function startApi() {
  console.log("Starting API service...");

  const isRunning = await isApiRunning();
  if (isRunning) {
    console.log(`API is already running on port ${API_PORT}`);
    return;
  }

  console.log(`Starting API on port ${API_PORT}...`);

  // Cambiar al directorio de la API
  const apiDir = path.join(__dirname, "apps", "api");

  // Verificar si dist/main.js existe
  const mainFile = path.join(apiDir, "dist", "main.js");

  if (!fs.existsSync(mainFile)) {
    console.log("🔨 Building API before starting...");
    const buildProcess = spawn("npm", ["run", "build"], {
      cwd: apiDir,
      stdio: "pipe",
      shell: true,
    });

    buildProcess.stdout.on("data", (data) => {
      console.log(`[API Build] ${data}`);
    });

    buildProcess.stderr.on("data", (data) => {
      console.error(`[API Build Error] ${data}`);
    });

    await new Promise((resolve, reject) => {
      buildProcess.on("close", (code) => {
        if (code === 0) {
          console.log("✅ API build completed successfully");
          resolve();
        } else {
          console.error(`❌ API build failed with code ${code}`);
          reject(new Error(`API build failed with code ${code}`));
        }
      });
    });
  }

  // Iniciar la API
  console.log(`🔍 Starting API process in directory: ${apiDir}`);
  console.log(`🔍 API command: node dist/main.js`);
  console.log(`🔍 API environment: PORT=${API_PORT}`);
  
  apiProcess = spawn("node", ["dist/main.js"], {
    cwd: apiDir,
    stdio: "pipe",
    env: { ...process.env, PORT: API_PORT },
  });

  apiProcess.stdout.on("data", (data) => {
    console.log(`[API] ${data}`);
  });

  apiProcess.stderr.on("data", (data) => {
    console.error(`[API Error] ${data}`);
  });

  apiProcess.on("error", (error) => {
    console.error(`❌ API Process Error:`, error);
  });

  apiProcess.on("close", (code) => {
    console.log(`🔍 API process exited with code ${code}`);
  });

  apiProcess.on("close", (code) => {
    console.log(`API process exited with code ${code}`);
    apiProcess = null;
  });

  // Esperar a que la API esté lista
  console.log("⏳ Waiting for API to be ready...");
  let attempts = 0;
  const maxAttempts = 30;

  while (attempts < maxAttempts) {
    if (await isApiRunning()) {
      console.log(`✅ API is ready on port ${API_PORT}`);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    attempts++;
  }

  console.error("❌ API failed to start within 30 seconds");
}

// Middleware para parsear JSON - Configuración correcta para proxy
app.use(express.json({ 
  limit: '50mb',
  type: 'application/json'
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb'
}));

// Rutas específicas del client-dashboard que pueden ser accedidas directamente
// IMPORTANTE: Estas rutas deben ir ANTES de la configuración de archivos estáticos
app.get("/buy-number", (req, res) => {
  console.log("🎯 RUTA ESPECÍFICA CAPTURADA: /buy-number");
  console.log(
    "📁 Sirviendo archivo:",
    path.join(__dirname, "apps/client-dashboard/dist/index.html"),
  );
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/purchased-numbers", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/agents", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/campaigns", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/contacts", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/call-logs", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/reports", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/analytics", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/settings", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/billing", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/integrations", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

// Rutas adicionales para páginas SPA que estaban causando errores 404
app.get("/inbound-agent", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/outbound-agent", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/saved-agents", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/error-logs", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/ai-prompt-generator", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/voice-agent", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/users", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/cards", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/calls", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

// Rutas adicionales que faltaban
app.get("/sub-clients", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

// Middleware para manejar rutas con y sin barra final (evitar redirecciones)
app.use((req, res, next) => {
  // Si la ruta termina con barra, servir directamente
  if (req.path.endsWith("/")) {
    return next();
  }

  // Si es una ruta de dashboard o manager sin barra, servir el index.html
  if (req.path === "/dashboard" || req.path === "/manager") {
    const appPath =
      req.path === "/dashboard" ? "client-dashboard" : "admin-dashboard";
    const indexPath = path.join(__dirname, `apps/${appPath}/dist/index.html`);
    return res.sendFile(indexPath);
  }

  next();
});

// Servir archivos estáticos de las aplicaciones construidas
app.use(
  "/manager",
  express.static(path.join(__dirname, "apps/admin-dashboard/dist")),
);
app.use(
  "/dashboard",
  express.static(path.join(__dirname, "apps/client-dashboard/dist")),
);
// Servir archivos estáticos de la carpeta public
app.use("/", express.static(path.join(__dirname, "public")));

// Servir archivos estáticos de la landing page
app.use("/", express.static(path.join(__dirname, "apps/landing-page/dist")));

// Rutas específicas para assets de cada aplicación
app.use(
  "/assets",
  express.static(path.join(__dirname, "apps/client-dashboard/dist/assets")),
);
app.use(
  "/manager/assets",
  express.static(path.join(__dirname, "apps/admin-dashboard/dist/assets")),
);

// Proxy para la API con configuración optimizada

// Configuración robusta para producción y desarrollo
let API_HOST;

// Configuración robusta para Docker y desarrollo
console.log("🔍 DEBUG - Variables de entorno:");
console.log("  - NODE_ENV:", process.env.NODE_ENV);
console.log("  - API_HOST:", process.env.API_HOST);
console.log("  - API_PORT:", process.env.API_PORT);
console.log("  - HOSTNAME:", process.env.HOSTNAME);

if (process.env.NODE_ENV === "production") {
  // En producción (Docker), usar 127.0.0.1 para comunicación interna
  // ya que tanto el servidor como la API están en el mismo contenedor
  API_HOST = "127.0.0.1";
  console.log(
    "🔧 USANDO 127.0.0.1 en producción (Docker) para comunicación interna",
  );
} else if (process.env.API_HOST) {
  // Si está definido en .env, usarlo
  API_HOST = process.env.API_HOST;
  console.log("🔧 Usando API_HOST del .env:", API_HOST);
} else {
  // En desarrollo, usar 127.0.0.1
  API_HOST = "127.0.0.1";
  console.log("🔧 Usando 127.0.0.1 para desarrollo");
}

// Asegurar que siempre usemos HTTP para comunicación interna
const API_PROTOCOL = "http";
const API_TARGET = `${API_PROTOCOL}://${API_HOST}:${API_PORT}`;

console.log(`🔗 API Proxy Target: ${API_TARGET}`);
console.log(`🔗 Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`🔗 API Host: ${API_HOST}`);
console.log(`🔗 API Port: ${API_PORT}`);
console.log(`🔗 API Protocol: ${API_PROTOCOL}`);

// Circuit breaker para el proxy
let circuitBreakerState = {
  failures: 0,
  lastFailureTime: 0,
  state: "CLOSED", // CLOSED, OPEN, HALF_OPEN
};

const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT = 30000; // 30 segundos

// Función para verificar el estado del circuit breaker
const isCircuitOpen = () => {
  const now = Date.now();
  if (circuitBreakerState.state === "OPEN") {
    if (now - circuitBreakerState.lastFailureTime > CIRCUIT_BREAKER_TIMEOUT) {
      circuitBreakerState.state = "HALF_OPEN";
      return false;
    }
    return true;
  }
  return false;
};

// Función para registrar fallos
const recordFailure = () => {
  circuitBreakerState.failures++;
  circuitBreakerState.lastFailureTime = Date.now();
  console.warn(
    `🔴 Circuit breaker failure #${circuitBreakerState.failures}/${CIRCUIT_BREAKER_THRESHOLD}`,
  );

  if (circuitBreakerState.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitBreakerState.state = "OPEN";
    console.warn("🚨 Circuit breaker OPEN - API service unavailable");
    console.warn(
      `🔴 State: ${circuitBreakerState.state}, Failures: ${circuitBreakerState.failures}`,
    );
  }
};

// Función para registrar éxito
const recordSuccess = () => {
  if (circuitBreakerState.failures > 0) {
    console.log(
      `✅ Circuit breaker success - resetting failures (was ${circuitBreakerState.failures})`,
    );
  }
  circuitBreakerState.failures = 0;
  circuitBreakerState.state = "CLOSED";
};

// API Proxy Configuration
const proxyConfig = {
  target: API_TARGET,
  changeOrigin: true,
  secure: false,
  logLevel: "error",
  timeout: 30000,
  proxyTimeout: 30000,
  ws: false,
  xfwd: true,
  pathRewrite: (path, req) => {
    if (path.startsWith("/api/v1")) {
      return path;
    }
    if (path.startsWith("/api")) {
      return path.replace("/api", "/api/v1");
    }
    return path;
  },
  followRedirects: true,
  preserveHeaderKeyCase: true,
  autoRewrite: false,
  protocolRewrite: false,
  agent: false,
  headers: {
    Connection: "keep-alive",
    "Keep-Alive": "timeout=15, max=50",
    "X-Forwarded-For": "127.0.0.1",
    "X-Forwarded-Proto": API_PROTOCOL,
  },
  retry: {
    retries: 1,
    retryDelay: 1000, // 1 segundo de delay
    retryCondition: (err, req, res) => {
      // Solo reintentar para errores de conexión específicos
      return err.code === "ECONNRESET" && !err.message?.includes("aborted");
    },
  },
  // Manejo mejorado de errores con circuit breaker
  onError: (err, req, res) => {
    // Verificar circuit breaker
    if (isCircuitOpen()) {
      if (!res.headersSent) {
        res.status(503).json({
          error: "Service Unavailable",
          message: "API service temporarily unavailable (circuit breaker open)",
          timestamp: new Date().toISOString(),
        });
      }
      return;
    }

    // Manejar requests abortados de manera más inteligente
    if (err.code === "ECONNRESET" || err.message?.includes("aborted")) {
      console.log(`🔗 Request aborted by client: ${req.method} ${req.url}`);
      
      // Si el cliente canceló la request, no enviar respuesta
      if (req.destroyed || res.destroyed) {
        return;
      }
      
      // Para requests de login, intentar una respuesta más útil
      if (req.url.includes("/auth/login") && !res.headersSent) {
        try {
          res.status(408).json({
            error: "Request Timeout",
            message: "La solicitud de login fue cancelada",
            timestamp: new Date().toISOString(),
          });
        } catch (responseError) {
          // Si no se puede enviar respuesta, solo loggear
          console.log(`🔗 No se pudo enviar respuesta para ${req.method} ${req.url}`);
        }
      }
      return;
    }

    // Solo registrar como fallo si no es un request abortado
    if (err.code !== "ECONNRESET" && !err.message?.includes("aborted")) {
      recordFailure();
    }

    console.error(
      `🚨 Development API Proxy Error for ${req.method} ${req.url}:`,
      {
        error: err.message,
        code: err.code,
        target: API_TARGET,
        timestamp: new Date().toISOString(),
      },
    );

    if (!res.headersSent) {
      res.status(502).json({
        error: "Bad Gateway",
        message: "API service temporarily unavailable",
        target: API_TARGET,
        timestamp: new Date().toISOString(),
      });
    }
  },
  // Configuración simplificada de timeout para requests
  onProxyReq: (proxyReq, req, res) => {
    // Configurar timeout específico para health checks
    if (req.url.includes("/health")) {
      proxyReq.setTimeout(5000); // 5 segundos para health checks
    } else {
      // Timeout del proxy debe ser mayor que el del frontend
      proxyReq.setTimeout(45000); // 45 segundos para todos los requests
    }
    
    // Manejar el body para requests POST/PUT/PATCH
    if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  // Manejo de respuestas del proxy
  onProxyRes: (proxyRes, req, res) => {
    // Registrar éxito en circuit breaker
    recordSuccess();

    // Agregar headers de respuesta
    res.setHeader("X-Proxy-Target", API_TARGET);
    res.setHeader("X-Proxy-Timestamp", new Date().toISOString());

    // Configuración específica para login
    if (req.url.includes("/auth/login")) {
      res.setHeader("X-Login-Response", "true");
      console.log(`✅ Login response procesada: ${req.url}`);
    }
  },
};

// Middleware específico para health checks con cache
let healthCheckCache = {
  lastCheck: 0,
  result: null,
  ttl: 5000, // 5 segundos de cache
};

app.use("/api/health", (req, res, next) => {
  const now = Date.now();

  // Si tenemos un resultado en cache y no ha expirado, usarlo
  if (
    healthCheckCache.result &&
    now - healthCheckCache.lastCheck < healthCheckCache.ttl
  ) {
    return res.json(healthCheckCache.result);
  }

  // Si el circuit breaker está abierto, devolver error inmediatamente
  if (isCircuitOpen()) {
    const errorResponse = {
      status: "error",
      timestamp: new Date().toISOString(),
      service: "prixagent-api",
      error: "Circuit breaker open",
      cached: false,
    };
    healthCheckCache.result = errorResponse;
    healthCheckCache.lastCheck = now;
    return res.status(503).json(errorResponse);
  }

  next();
});



// API proxy middleware - handles all /api routes

app.use("/api", createProxyMiddleware(proxyConfig));

// Rutas para las aplicaciones SPA
app.get("/manager/*", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/admin-dashboard/dist/index.html"));
});

app.get("/dashboard/*", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

// Ruta raíz - Landing Page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/landing-page/dist/index.html"));
});

// Health check endpoint
app.get("/health", (req, res) => {
  const healthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    circuitBreaker: {
      state: circuitBreakerState.state,
      failures: circuitBreakerState.failures,
      lastFailureTime: circuitBreakerState.lastFailureTime,
      threshold: CIRCUIT_BREAKER_THRESHOLD,
      timeout: CIRCUIT_BREAKER_TIMEOUT,
    },
  };

  // Actualizar cache
  healthCheckCache.result = healthResponse;
  healthCheckCache.lastCheck = Date.now();

  res.json(healthResponse);
});


// Endpoint de diagnóstico del circuit breaker
app.get("/debug/circuit-breaker", (req, res) => {
  res.json({
    circuitBreaker: circuitBreakerState,
    config: {
      threshold: CIRCUIT_BREAKER_THRESHOLD,
      timeout: CIRCUIT_BREAKER_TIMEOUT,
    },
    healthCache: {
      lastCheck: healthCheckCache.lastCheck,
      hasResult: !!healthCheckCache.result,
      ttl: healthCheckCache.ttl,
    },
    timestamp: new Date().toISOString(),
  });
});

// Manejo de rutas SPA - servir index.html para rutas del frontend
app.get("/dashboard/*", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/client-dashboard/dist/index.html"));
});

app.get("/manager/*", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/admin-dashboard/dist/index.html"));
});

app.get("/agency/*", (req, res) => {
  res.sendFile(path.join(__dirname, "apps/admin-dashboard/dist/index.html"));
});

// Manejo de errores 404 para rutas no encontradas
app.use("*", (req, res) => {
  console.log("❌ RUTA NO ENCONTRADA:", req.originalUrl);
  console.log("🔍 Método:", req.method);
  console.log("🔍 Path:", req.path);
  res.status(404).json({
    error: "Not Found",
    message: "The requested resource was not found",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
});

// Detectar entorno y configurar API
const isProduction = process.env.NODE_ENV === 'production';

// Función para inicializar el servidor
async function startServer() {
  console.log('🔧 Starting server with automatic API initialization...');
  
  // Iniciar servidor
  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 App URL: ${APP_URL}`);
    console.log(`📱 Landing Page: ${APP_URL}`);
    console.log(`👤 Client Dashboard: ${APP_URL}/dashboard`);
    console.log(`⚙️  Admin Dashboard: ${APP_URL}/manager`);
    console.log(`🏢 Agency Dashboard: ${APP_URL}/agency`);
    console.log(`🔗 API: ${APP_URL}/api`);
    console.log(`❤️  Health Check: ${APP_URL}/health`);
    console.log(`🔧 Environment: ${isProduction ? 'Production' : 'Development'}`);
    
    // Iniciar API automáticamente en producción
    if (isProduction) {
      console.log('🚀 Starting API automatically in production...');
      try {
        await startApi();
      } catch (error) {
        console.error('❌ Failed to start API:', error);
      }
    }
  });
}

// Iniciar el servidor
startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

// Manejo graceful de cierre
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  if (apiProcess) {
    console.log("🛑 Stopping API process...");
    apiProcess.kill('SIGTERM');
  }
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  if (apiProcess) {
    console.log("🛑 Stopping API process...");
    apiProcess.kill('SIGINT');
  }
  process.exit(0);
});
