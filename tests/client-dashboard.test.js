#!/usr/bin/env node

/**
 * Tests del Cliente Dashboard para verificar optimizaciones
 * Usa la URL de producción: https://agent.prixcenter.com
 */

const https = require("https");
const http = require("http");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const request = protocol.request(url, options, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          data: data,
          responseTime: Date.now() - startTime,
        });
      });
    });

    const startTime = Date.now();

    request.on("error", (error) => {
      reject(error);
    });

    request.setTimeout(options.timeout || 30000, () => {
      request.destroy();
      reject(new Error("Request timeout"));
    });

    if (options.body) {
      request.write(JSON.stringify(options.body));
    }

    request.end();
  });
}

async function testDashboardAccess() {
  log("\n📱 Testing Dashboard Access...", "cyan");

  const baseUrl = "https://agent.prixcenter.com";
  const dashboardUrl = `${baseUrl}/dashboard`;

  try {
    log(`📡 Testing dashboard at ${dashboardUrl}...`, "blue");
    const startTime = Date.now();

    const response = await makeRequest(dashboardUrl, {
      method: "GET",
      timeout: 30000, // 30 segundos timeout (optimizado)
      headers: {
        "User-Agent": "PrixAgent-Production-Test/1.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const responseTime = Date.now() - startTime;

    if (response.statusCode === 200) {
      log(
        `✅ Dashboard accessible - Status: ${response.statusCode} - Time: ${responseTime}ms`,
        "green",
      );

      // Verificar que es una página HTML válida
      if (
        response.data.includes("<html") &&
        response.data.includes("</html>")
      ) {
        log(`✅ Valid HTML page received`, "green");

        // Verificar que contiene elementos del dashboard
        const hasReactRoot =
          response.data.includes('id="root"') ||
          response.data.includes('id="app"');
        const hasAssets =
          response.data.includes("/assets/") ||
          response.data.includes("static/");

        if (hasReactRoot) {
          log(`✅ React application detected`, "green");
        } else {
          log(`⚠️  React application not detected`, "yellow");
        }

        if (hasAssets) {
          log(`✅ Static assets referenced`, "green");
        } else {
          log(`⚠️  Static assets not found`, "yellow");
        }

        return {
          status: "success",
          responseTime,
          hasReactRoot,
          hasAssets,
          htmlLength: response.data.length,
        };
      } else {
        log(`⚠️  Response is not valid HTML`, "yellow");
        return {
          status: "warning",
          responseTime,
          data: response.data.substring(0, 200),
        };
      }
    } else {
      log(
        `❌ Dashboard not accessible - Status: ${response.statusCode} - Time: ${responseTime}ms`,
        "red",
      );
      return { status: "error", responseTime, statusCode: response.statusCode };
    }
  } catch (error) {
    log(`❌ Dashboard test failed: ${error.message}`, "red");
    return { status: "error", error: error.message };
  }
}

async function testStaticAssets() {
  log("\n📦 Testing Static Assets...", "cyan");

  const baseUrl = "https://agent.prixcenter.com";

  // Primero obtener la página del dashboard para extraer las referencias a assets
  try {
    const dashboardResponse = await makeRequest(`${baseUrl}/dashboard`, {
      method: "GET",
      timeout: 10000,
      headers: {
        "User-Agent": "PrixAgent-Production-Test/1.0",
      },
    });

    if (dashboardResponse.statusCode !== 200) {
      log(`❌ Cannot access dashboard to test assets`, "red");
      return { status: "error", error: "Dashboard not accessible" };
    }

    // Extraer referencias a assets del HTML
    const assetMatches =
      dashboardResponse.data.match(/\/assets\/[^"'\s]+/g) || [];
    const cssMatches = dashboardResponse.data.match(/\.css/g) || [];
    const jsMatches = dashboardResponse.data.match(/\.js/g) || [];

    log(
      `📋 Found ${assetMatches.length} asset references, ${cssMatches.length} CSS files, ${jsMatches.length} JS files`,
      "blue",
    );

    const assetTests = [];
    let successfulAssets = 0;

    // Probar algunos assets principales
    const testAssets = [
      "/assets/index.css",
      "/assets/index.js",
      "/assets/app.css",
      "/assets/app.js",
    ];

    for (const asset of testAssets) {
      try {
        log(`📡 Testing asset ${asset}...`, "blue");
        const startTime = Date.now();

        const response = await makeRequest(`${baseUrl}${asset}`, {
          method: "GET",
          timeout: 10000,
          headers: {
            "User-Agent": "PrixAgent-Production-Test/1.0",
          },
        });

        const responseTime = Date.now() - startTime;

        if (response.statusCode === 200) {
          log(
            `✅ ${asset} - Status: ${response.statusCode} - Time: ${responseTime}ms - Size: ${response.data.length} bytes`,
            "green",
          );
          successfulAssets++;
          assetTests.push({
            asset,
            status: "success",
            responseTime,
            size: response.data.length,
          });
        } else {
          log(
            `⚠️  ${asset} - Status: ${response.statusCode} - Time: ${responseTime}ms`,
            "yellow",
          );
          assetTests.push({
            asset,
            status: "warning",
            responseTime,
            statusCode: response.statusCode,
          });
        }
      } catch (error) {
        log(`❌ ${asset} - Error: ${error.message}`, "red");
        assetTests.push({ asset, status: "error", error: error.message });
      }
    }

    const successRate = (successfulAssets / testAssets.length) * 100;
    log(
      `📊 Asset Test Results: ${successfulAssets}/${testAssets.length} (${successRate.toFixed(1)}%)`,
      successRate >= 50 ? "green" : "yellow",
    );

    return {
      status: successRate >= 50 ? "success" : "warning",
      totalAssets: testAssets.length,
      successfulAssets,
      successRate,
      tests: assetTests,
    };
  } catch (error) {
    log(`❌ Static assets test failed: ${error.message}`, "red");
    return { status: "error", error: error.message };
  }
}

async function testAPIIntegration() {
  log("\n🔗 Testing API Integration...", "cyan");

  const baseUrl = "https://agent.prixcenter.com";
  const apiUrl = `${baseUrl}/api/v1`;

  // Probar endpoints que el dashboard necesita
  const endpoints = [
    { name: "Health Check", path: "/health" },
    { name: "Auth Profile", path: "/auth/profile" },
    { name: "Dashboard Stats", path: "/dashboard/stats" },
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      log(`📡 Testing ${endpoint.name}...`, "blue");
      const startTime = Date.now();

      const response = await makeRequest(`${apiUrl}${endpoint.path}`, {
        method: "GET",
        timeout: 30000, // 30 segundos timeout (optimizado)
        headers: {
          "User-Agent": "PrixAgent-Production-Test/1.0",
          Accept: "application/json",
        },
      });

      const responseTime = Date.now() - startTime;

      if (response.statusCode === 200) {
        log(
          `✅ ${endpoint.name} - Status: ${response.statusCode} - Time: ${responseTime}ms`,
          "green",
        );
        results.push({
          name: endpoint.name,
          path: endpoint.path,
          status: "success",
          responseTime,
          statusCode: response.statusCode,
        });
      } else if (response.statusCode === 401) {
        log(
          `⚠️  ${endpoint.name} - Status: ${response.statusCode} (Unauthorized - expected for protected endpoints)`,
          "yellow",
        );
        results.push({
          name: endpoint.name,
          path: endpoint.path,
          status: "expected_auth_required",
          responseTime,
          statusCode: response.statusCode,
        });
      } else {
        log(
          `❌ ${endpoint.name} - Status: ${response.statusCode} - Time: ${responseTime}ms`,
          "red",
        );
        results.push({
          name: endpoint.name,
          path: endpoint.path,
          status: "error",
          responseTime,
          statusCode: response.statusCode,
        });
      }
    } catch (error) {
      log(`❌ ${endpoint.name} - Error: ${error.message}`, "red");
      results.push({
        name: endpoint.name,
        path: endpoint.path,
        status: "error",
        error: error.message,
      });
    }
  }

  const successful = results.filter((r) => r.status === "success").length;
  const authRequired = results.filter(
    (r) => r.status === "expected_auth_required",
  ).length;
  const failed = results.filter((r) => r.status === "error").length;

  log(`📊 API Integration Results:`, "blue");
  log(`   Successful: ${successful}`, "green");
  log(`   Auth Required (Expected): ${authRequired}`, "yellow");
  log(`   Failed: ${failed}`, failed === 0 ? "green" : "red");

  return {
    status: failed === 0 ? "success" : "warning",
    total: results.length,
    successful,
    authRequired,
    failed,
    results,
  };
}

async function testLoginFlow() {
  log("\n🔐 Testing Login Flow...", "cyan");

  const baseUrl = "https://agent.prixcenter.com";
  const loginUrl = `${baseUrl}/api/v1/auth/login`;

  const testCredentials = {
    email: "test@prixagent.com",
    password: "TestPassword123!",
  };

  try {
    log(`📡 Testing login flow...`, "blue");
    const startTime = Date.now();

    const response = await makeRequest(loginUrl, {
      method: "POST",
      timeout: 30000, // 30 segundos timeout (optimizado)
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "PrixAgent-Production-Test/1.0",
        Accept: "application/json",
      },
      body: testCredentials,
    });

    const responseTime = Date.now() - startTime;

    if (response.statusCode === 200) {
      log(
        `✅ Login successful - Status: ${response.statusCode} - Time: ${responseTime}ms`,
        "green",
      );

      try {
        const data = JSON.parse(response.data);

        if (data.access_token && data.user) {
          log(
            `✅ Token received: ${data.access_token.substring(0, 20)}...`,
            "green",
          );
          log(`✅ User: ${data.user.email} (${data.user.role})`, "green");
          log(`✅ Account: ${data.user.account.name}`, "green");

          // Verificar que el token se puede usar para hacer requests autenticados
          return await testAuthenticatedRequests(
            baseUrl,
            data.access_token,
            data.user.account.id,
          );
        } else {
          log(`⚠️  Login response missing required data`, "yellow");
          return { status: "warning", responseTime, data: response.data };
        }
      } catch (parseError) {
        log(
          `⚠️  Could not parse login response: ${parseError.message}`,
          "yellow",
        );
        return { status: "warning", responseTime, data: response.data };
      }
    } else {
      log(
        `❌ Login failed - Status: ${response.statusCode} - Time: ${responseTime}ms`,
        "red",
      );
      return { status: "error", responseTime, statusCode: response.statusCode };
    }
  } catch (error) {
    log(`❌ Login flow test failed: ${error.message}`, "red");
    return { status: "error", error: error.message };
  }
}

async function testAuthenticatedRequests(baseUrl, token, accountId) {
  log("\n🔒 Testing Authenticated Requests...", "cyan");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "X-Account-ID": accountId,
    "User-Agent": "PrixAgent-Production-Test/1.0",
    Accept: "application/json",
  };

  const endpoints = [
    { name: "User Profile", path: "/api/v1/auth/profile" },
    { name: "Dashboard Stats", path: "/api/v1/dashboard/stats" },
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      log(`📡 Testing ${endpoint.name}...`, "blue");
      const startTime = Date.now();

      const response = await makeRequest(`${baseUrl}${endpoint.path}`, {
        method: "GET",
        timeout: 30000,
        headers: authHeaders,
      });

      const responseTime = Date.now() - startTime;

      if (response.statusCode === 200) {
        log(
          `✅ ${endpoint.name} - Status: ${response.statusCode} - Time: ${responseTime}ms`,
          "green",
        );
        results.push({
          name: endpoint.name,
          status: "success",
          responseTime,
          statusCode: response.statusCode,
        });
      } else {
        log(
          `❌ ${endpoint.name} - Status: ${response.statusCode} - Time: ${responseTime}ms`,
          "red",
        );
        results.push({
          name: endpoint.name,
          status: "error",
          responseTime,
          statusCode: response.statusCode,
        });
      }
    } catch (error) {
      log(`❌ ${endpoint.name} - Error: ${error.message}`, "red");
      results.push({
        name: endpoint.name,
        status: "error",
        error: error.message,
      });
    }
  }

  const successful = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status === "error").length;

  log(
    `📊 Authenticated Requests Results: ${successful}/${results.length} successful`,
    failed === 0 ? "green" : "yellow",
  );

  return {
    status: failed === 0 ? "success" : "warning",
    total: results.length,
    successful,
    failed,
    results,
  };
}

async function testPerformanceMetrics() {
  log("\n⚡ Testing Performance Metrics...", "cyan");

  const baseUrl = "https://agent.prixcenter.com";
  const testUrl = `${baseUrl}/dashboard`;

  const iterations = 3;
  const responseTimes = [];

  for (let i = 0; i < iterations; i++) {
    try {
      log(`📡 Performance test ${i + 1}/${iterations}...`, "blue");
      const startTime = Date.now();

      const response = await makeRequest(testUrl, {
        method: "GET",
        timeout: 30000,
        headers: {
          "User-Agent": "PrixAgent-Production-Test/1.0",
        },
      });

      const responseTime = Date.now() - startTime;
      responseTimes.push(responseTime);

      log(
        `   Response time: ${responseTime}ms`,
        responseTime < 5000 ? "green" : "yellow",
      );
    } catch (error) {
      log(`   Error: ${error.message}`, "red");
    }
  }

  if (responseTimes.length > 0) {
    const avgResponseTime =
      responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);

    log(`📊 Performance Metrics:`, "blue");
    log(
      `   Average: ${Math.round(avgResponseTime)}ms`,
      avgResponseTime < 5000 ? "green" : "yellow",
    );
    log(`   Min: ${minResponseTime}ms`, "green");
    log(
      `   Max: ${maxResponseTime}ms`,
      maxResponseTime < 10000 ? "green" : "yellow",
    );

    const isOptimal = avgResponseTime < 3000;
    const isAcceptable = avgResponseTime < 5000;

    return {
      status: isOptimal ? "optimal" : isAcceptable ? "acceptable" : "slow",
      average: avgResponseTime,
      min: minResponseTime,
      max: maxResponseTime,
      iterations: responseTimes.length,
    };
  } else {
    return { status: "error", error: "No successful requests" };
  }
}

async function generateDashboardTestReport(testResults) {
  log("\n📊 Generating Dashboard Test Report...", "cyan");

  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: "https://agent.prixcenter.com",
    tests: {
      dashboardAccess: testResults.dashboardAccess,
      staticAssets: testResults.staticAssets,
      apiIntegration: testResults.apiIntegration,
      loginFlow: testResults.loginFlow,
      performance: testResults.performance,
    },
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
    },
  };

  // Calcular resumen
  Object.values(testResults).forEach((result) => {
    if (result && typeof result === "object") {
      report.summary.totalTests++;
      if (result.status === "success" || result.status === "optimal")
        report.summary.passed++;
      else if (result.status === "error") report.summary.failed++;
      else if (result.status === "warning" || result.status === "acceptable")
        report.summary.warnings++;
    }
  });

  log("\n📋 Dashboard Test Report:", "magenta");
  console.log(JSON.stringify(report, null, 2));

  // Mostrar resumen
  log("\n📊 Dashboard Test Summary:", "bright");
  log(`   Total Tests: ${report.summary.totalTests}`, "blue");
  log(`   Passed: ${report.summary.passed}`, "green");
  log(`   Warnings: ${report.summary.warnings}`, "yellow");
  log(`   Failed: ${report.summary.failed}`, "red");

  const successRate = (report.summary.passed / report.summary.totalTests) * 100;
  log(
    `   Success Rate: ${successRate.toFixed(1)}%`,
    successRate >= 80 ? "green" : "yellow",
  );

  return report;
}

async function main() {
  log(
    "🚀 Starting Dashboard Tests for https://agent.prixcenter.com...",
    "bright",
  );

  try {
    const testResults = {};

    // Ejecutar todos los tests
    testResults.dashboardAccess = await testDashboardAccess();
    testResults.staticAssets = await testStaticAssets();
    testResults.apiIntegration = await testAPIIntegration();
    testResults.loginFlow = await testLoginFlow();
    testResults.performance = await testPerformanceMetrics();

    // Generar reporte
    const report = await generateDashboardTestReport(testResults);

    // Determinar si los tests pasaron
    const successRate =
      (report.summary.passed / report.summary.totalTests) * 100;

    if (successRate >= 80) {
      log("\n✅ Dashboard tests completed successfully!", "green");
      log("🎉 The dashboard optimizations are working correctly.", "green");
    } else {
      log("\n⚠️  Dashboard tests completed with issues.", "yellow");
      log("🔧 Some dashboard optimizations may need adjustment.", "yellow");
    }

    return report;
  } catch (error) {
    log(`\n❌ Dashboard test execution failed: ${error.message}`, "red");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  testDashboardAccess,
  testStaticAssets,
  testAPIIntegration,
  testLoginFlow,
  testAuthenticatedRequests,
  testPerformanceMetrics,
  generateDashboardTestReport,
};
