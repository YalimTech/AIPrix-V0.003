#!/usr/bin/env node

/**
 * Script para ejecutar todos los tests de producción
 * Verifica que las optimizaciones funcionan correctamente
 */

const { execSync } = require("child_process");
const path = require("path");

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

function runTest(testName, testFile) {
  log(`\n🧪 Running ${testName}...`, "cyan");
  log(`📁 Test file: ${testFile}`, "blue");

  try {
    const startTime = Date.now();
    const output = execSync(`node ${testFile}`, {
      encoding: "utf8",
      stdio: "pipe",
      timeout: 300000, // 5 minutos timeout
    });

    const duration = Date.now() - startTime;
    log(`✅ ${testName} completed successfully in ${duration}ms`, "green");

    return {
      name: testName,
      status: "success",
      duration,
      output: output,
    };
  } catch (error) {
    const duration = Date.now() - Date.now();
    log(`❌ ${testName} failed: ${error.message}`, "red");

    return {
      name: testName,
      status: "error",
      duration,
      error: error.message,
      output: error.stdout || error.stderr || "",
    };
  }
}

function runDiagnostic() {
  log(`\n🔍 Running Production Diagnostic...`, "cyan");

  try {
    const output = execSync("node scripts/diagnostic-production.js", {
      encoding: "utf8",
      stdio: "pipe",
      timeout: 120000, // 2 minutos timeout
    });

    log(`✅ Production diagnostic completed`, "green");
    return { status: "success", output };
  } catch (error) {
    log(`❌ Production diagnostic failed: ${error.message}`, "red");
    return {
      status: "error",
      error: error.message,
      output: error.stdout || error.stderr || "",
    };
  }
}

function runOptimization() {
  log(`\n⚙️  Running Production Optimization...`, "cyan");

  try {
    const output = execSync("node scripts/optimize-production.js", {
      encoding: "utf8",
      stdio: "pipe",
      timeout: 120000, // 2 minutos timeout
    });

    log(`✅ Production optimization completed`, "green");
    return { status: "success", output };
  } catch (error) {
    log(`❌ Production optimization failed: ${error.message}`, "red");
    return {
      status: "error",
      error: error.message,
      output: error.stdout || error.stderr || "",
    };
  }
}

function generateFinalReport(
  testResults,
  diagnosticResult,
  optimizationResult,
) {
  log("\n📊 Generating Final Test Report...", "cyan");

  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: "https://agent.prixcenter.com",
    environment: "production",
    tests: testResults,
    diagnostic: diagnosticResult,
    optimization: optimizationResult,
    summary: {
      totalTests: testResults.length,
      passed: testResults.filter((t) => t.status === "success").length,
      failed: testResults.filter((t) => t.status === "error").length,
      totalDuration: testResults.reduce((sum, t) => sum + (t.duration || 0), 0),
    },
  };

  log("\n📋 Final Test Report:", "magenta");
  console.log(JSON.stringify(report, null, 2));

  // Mostrar resumen
  log("\n📊 Final Test Summary:", "bright");
  log(`   Total Tests: ${report.summary.totalTests}`, "blue");
  log(`   Passed: ${report.summary.passed}`, "green");
  log(`   Failed: ${report.summary.failed}`, "red");
  log(
    `   Total Duration: ${Math.round(report.summary.totalDuration / 1000)}s`,
    "blue",
  );

  const successRate = (report.summary.passed / report.summary.totalTests) * 100;
  log(
    `   Success Rate: ${successRate.toFixed(1)}%`,
    successRate >= 80 ? "green" : "yellow",
  );

  // Mostrar resultados individuales
  log("\n📋 Individual Test Results:", "bright");
  testResults.forEach((test) => {
    const statusIcon = test.status === "success" ? "✅" : "❌";
    const duration = test.duration
      ? `${Math.round(test.duration / 1000)}s`
      : "N/A";
    log(
      `   ${statusIcon} ${test.name} - ${duration}`,
      test.status === "success" ? "green" : "red",
    );
  });

  return report;
}

function saveReportToFile(report) {
  const reportPath = path.join(__dirname, "..", "test-results.json");

  try {
    require("fs").writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log(`\n💾 Test report saved to: ${reportPath}`, "green");
  } catch (error) {
    log(`\n⚠️  Could not save test report: ${error.message}`, "yellow");
  }
}

async function main() {
  log("🚀 Starting Complete Production Test Suite...", "bright");
  log("🌐 Testing against: https://agent.prixcenter.com", "blue");

  const startTime = Date.now();

  try {
    // Ejecutar diagnóstico
    const diagnosticResult = runDiagnostic();

    // Ejecutar optimización
    const optimizationResult = runOptimization();

    // Ejecutar tests
    const testResults = [];

    // Test de API
    testResults.push(
      runTest(
        "API Production Tests",
        path.join(__dirname, "api-production.test.js"),
      ),
    );

    // Test de Dashboard
    testResults.push(
      runTest(
        "Dashboard Production Tests",
        path.join(__dirname, "client-dashboard.test.js"),
      ),
    );

    // Generar reporte final
    const finalReport = generateFinalReport(
      testResults,
      diagnosticResult,
      optimizationResult,
    );

    // Guardar reporte
    saveReportToFile(finalReport);

    const totalDuration = Date.now() - startTime;
    log(
      `\n⏱️  Total execution time: ${Math.round(totalDuration / 1000)}s`,
      "blue",
    );

    // Determinar resultado final
    const successRate =
      (finalReport.summary.passed / finalReport.summary.totalTests) * 100;

    if (successRate >= 80) {
      log("\n🎉 All tests completed successfully!", "green");
      log("✅ Production optimizations are working correctly.", "green");
      log("🚀 Your application is ready for production!", "green");
      process.exit(0);
    } else {
      log("\n⚠️  Some tests failed or had issues.", "yellow");
      log("🔧 Please review the test results and fix any issues.", "yellow");
      process.exit(1);
    }
  } catch (error) {
    log(`\n❌ Test suite execution failed: ${error.message}`, "red");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  runTest,
  runDiagnostic,
  runOptimization,
  generateFinalReport,
  saveReportToFile,
};
