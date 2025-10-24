#!/usr/bin/env node

/**
 * Tests de producción para verificar que las optimizaciones funcionan
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

async function testHealthEndpoints() {
  log("\n🏥 Testing Health Endpoints...", "cyan");

  const baseUrl = "https://agent.prixcenter.com";
  const healthUrls = [
    `${baseUrl}/health`,
    `${baseUrl}/api/v1/health`,
    `${baseUrl}/api/v1`,
  ];

  const results = [];

  for (const url of healthUrls) {
    try {
      log(`📡 Testing ${url}...`, "blue");
      const startTime = Date.now();

      const response = await makeRequest(url, {
        method: "GET",
        timeout: 10000, // 10 segundos timeout
        headers: {
          "User-Agent": "PrixAgent-Production-Test/1.0",
        },
      });

      const responseTime = Date.now() - startTime;

      if (response.statusCode === 200) {
        log(
          `✅ ${url} - Status: ${response.statusCode} - Time: ${responseTime}ms`,
          "green",
        );
        results.push({
          url,
          status: "success",
          responseTime,
          statusCode: response.statusCode,
        });
      } else {
        log(
          `⚠️  ${url} - Status: ${response.statusCode} - Time: ${responseTime}ms`,
          "yellow",
        );
        results.push({
          url,
          status: "warning",
          responseTime,
          statusCode: response.statusCode,
        });
      }
    } catch (error) {
      log(`❌ ${url} - Error: ${error.message}`, "red");
      results.push({ url, status: "error", error: error.message });
    }
  }

  return results;
}

async function testLoginEndpoint() {
  log("\n🔐 Testing Login Endpoint...", "cyan");

  const baseUrl = "https://agent.prixcenter.com";
  const loginUrl = `${baseUrl}/api/v1/auth/login`;

  const testCredentials = {
    email: "test@prixagent.com",
    password: "TestPassword123!",
  };

  try {
    log(`📡 Testing login at ${loginUrl}...`, "blue");
    const startTime = Date.now();

    const response = await makeRequest(loginUrl, {
      method: "POST",
      timeout: 30000, // 30 segundos timeout (optimizado)
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "PrixAgent-Production-Test/1.0",
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
          return {
            status: "success",
            responseTime,
            token: data.access_token,
            user: data.user,
          };
        } else {
          log(`⚠️  Login response missing token or user data`, "yellow");
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
      log(`   Response: ${response.data}`, "red");
      return {
        status: "error",
        responseTime,
        statusCode: response.statusCode,
        data: response.data,
      };
    }
  } catch (error) {
    log(`❌ Login request failed: ${error.message}`, "red");
    return { status: "error", error: error.message };
  }
}

async function testCORSHeaders() {
  log("\n🌐 Testing CORS Headers...", "cyan");

  const baseUrl = "https://agent.prixcenter.com";
  const testUrl = `${baseUrl}/api/v1/health`;

  try {
    log(`📡 Testing CORS at ${testUrl}...`, "blue");

    const response = await makeRequest(testUrl, {
      method: "OPTIONS",
      timeout: 10000,
      headers: {
        Origin: "https://agent.prixcenter.com",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type,Authorization",
        "User-Agent": "PrixAgent-Production-Test/1.0",
      },
    });

    const corsHeaders = {
      "Access-Control-Allow-Origin":
        response.headers["access-control-allow-origin"],
      "Access-Control-Allow-Methods":
        response.headers["access-control-allow-methods"],
      "Access-Control-Allow-Headers":
        response.headers["access-control-allow-headers"],
      "Access-Control-Allow-Credentials":
        response.headers["access-control-allow-credentials"],
    };

    log(`📋 CORS Headers:`, "blue");
    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (value) {
        log(`   ${key}: ${value}`, "green");
      } else {
        log(`   ${key}: Not set`, "yellow");
      }
    });

    const hasRequiredHeaders =
      corsHeaders["Access-Control-Allow-Origin"] &&
      corsHeaders["Access-Control-Allow-Methods"] &&
      corsHeaders["Access-Control-Allow-Headers"];

    if (hasRequiredHeaders) {
      log(`✅ CORS configuration looks good`, "green");
      return { status: "success", headers: corsHeaders };
    } else {
      log(`⚠️  CORS configuration may be incomplete`, "yellow");
      return { status: "warning", headers: corsHeaders };
    }
  } catch (error) {
    log(`❌ CORS test failed: ${error.message}`, "red");
    return { status: "error", error: error.message };
  }
}

async function testResponseTimes() {
  log("\n⏱️  Testing Response Times...", "cyan");

  const baseUrl = "https://agent.prixcenter.com";
  const endpoints = [
    { name: "Health Check", url: `${baseUrl}/health` },
    { name: "API Health", url: `${baseUrl}/api/v1/health` },
    { name: "API Root", url: `${baseUrl}/api/v1` },
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      log(`📡 Testing ${endpoint.name}...`, "blue");
      const startTime = Date.now();

      const response = await makeRequest(endpoint.url, {
        method: "GET",
        timeout: 10000,
        headers: {
          "User-Agent": "PrixAgent-Production-Test/1.0",
        },
      });

      const responseTime = Date.now() - startTime;

      // Verificar que los tiempos de respuesta estén dentro de los límites optimizados
      const isOptimal = responseTime < 5000; // Menos de 5 segundos
      const isAcceptable = responseTime < 10000; // Menos de 10 segundos

      if (isOptimal) {
        log(`✅ ${endpoint.name} - ${responseTime}ms (Optimal)`, "green");
      } else if (isAcceptable) {
        log(`⚠️  ${endpoint.name} - ${responseTime}ms (Acceptable)`, "yellow");
      } else {
        log(`❌ ${endpoint.name} - ${responseTime}ms (Too slow)`, "red");
      }

      results.push({
        name: endpoint.name,
        url: endpoint.url,
        responseTime,
        status: isOptimal ? "optimal" : isAcceptable ? "acceptable" : "slow",
        statusCode: response.statusCode,
      });
    } catch (error) {
      log(`❌ ${endpoint.name} - Error: ${error.message}`, "red");
      results.push({
        name: endpoint.name,
        url: endpoint.url,
        status: "error",
        error: error.message,
      });
    }
  }

  return results;
}

async function testConcurrentRequests() {
  log("\n🔄 Testing Concurrent Requests...", "cyan");

  const baseUrl = "https://agent.prixcenter.com";
  const testUrl = `${baseUrl}/api/v1/health`;
  const concurrentCount = 5;

  log(
    `📡 Making ${concurrentCount} concurrent requests to ${testUrl}...`,
    "blue",
  );

  const promises = Array.from({ length: concurrentCount }, (_, index) => {
    return makeRequest(testUrl, {
      method: "GET",
      timeout: 10000,
      headers: {
        "User-Agent": `PrixAgent-Production-Test/1.0-${index}`,
      },
    })
      .then((response) => ({
        index,
        statusCode: response.statusCode,
        responseTime: response.responseTime,
        success: response.statusCode === 200,
      }))
      .catch((error) => ({
        index,
        error: error.message,
        success: false,
      }));
  });

  try {
    const results = await Promise.all(promises);
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    log(`📊 Concurrent Test Results:`, "blue");
    log(
      `   Successful: ${successful}/${concurrentCount}`,
      successful === concurrentCount ? "green" : "yellow",
    );
    log(
      `   Failed: ${failed}/${concurrentCount}`,
      failed === 0 ? "green" : "red",
    );

    if (successful > 0) {
      const avgResponseTime =
        results
          .filter((r) => r.success && r.responseTime)
          .reduce((sum, r) => sum + r.responseTime, 0) / successful;
      log(`   Average Response Time: ${Math.round(avgResponseTime)}ms`, "blue");
    }

    return {
      total: concurrentCount,
      successful,
      failed,
      results,
    };
  } catch (error) {
    log(`❌ Concurrent test failed: ${error.message}`, "red");
    return {
      total: concurrentCount,
      successful: 0,
      failed: concurrentCount,
      error: error.message,
    };
  }
}

async function generateTestReport(testResults) {
  log("\n📊 Generating Test Report...", "cyan");

  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: "https://agent.prixcenter.com",
    tests: {
      health: testResults.health,
      login: testResults.login,
      cors: testResults.cors,
      responseTimes: testResults.responseTimes,
      concurrent: testResults.concurrent,
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
    if (Array.isArray(result)) {
      result.forEach((item) => {
        report.summary.totalTests++;
        if (item.status === "success") report.summary.passed++;
        else if (item.status === "error") report.summary.failed++;
        else if (item.status === "warning") report.summary.warnings++;
      });
    } else if (result && typeof result === "object") {
      report.summary.totalTests++;
      if (result.status === "success") report.summary.passed++;
      else if (result.status === "error") report.summary.failed++;
      else if (result.status === "warning") report.summary.warnings++;
    }
  });

  log("\n📋 Test Report:", "magenta");
  console.log(JSON.stringify(report, null, 2));

  // Mostrar resumen
  log("\n📊 Test Summary:", "bright");
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
    "🚀 Starting Production Tests for https://agent.prixcenter.com...",
    "bright",
  );

  try {
    const testResults = {};

    // Ejecutar todos los tests
    testResults.health = await testHealthEndpoints();
    testResults.login = await testLoginEndpoint();
    testResults.cors = await testCORSHeaders();
    testResults.responseTimes = await testResponseTimes();
    testResults.concurrent = await testConcurrentRequests();

    // Generar reporte
    const report = await generateTestReport(testResults);

    // Determinar si los tests pasaron
    const successRate =
      (report.summary.passed / report.summary.totalTests) * 100;

    if (successRate >= 80) {
      log("\n✅ Production tests completed successfully!", "green");
      log("🎉 The optimizations are working correctly.", "green");
    } else {
      log("\n⚠️  Production tests completed with issues.", "yellow");
      log("🔧 Some optimizations may need adjustment.", "yellow");
    }

    return report;
  } catch (error) {
    log(`\n❌ Test execution failed: ${error.message}`, "red");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  testHealthEndpoints,
  testLoginEndpoint,
  testCORSHeaders,
  testResponseTimes,
  testConcurrentRequests,
  generateTestReport,
};
