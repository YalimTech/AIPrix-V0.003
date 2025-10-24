import { expect, test } from "@playwright/test";

// Test de diagnóstico end-to-end para identificar problemas
test.describe("Diagnóstico de Problemas E2E", () => {
  test("Verificar que el servidor principal esté funcionando", async ({
    request,
  }) => {
    const response = await request.get("http://localhost:3000/health");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("ok");
    expect(data.timestamp).toBeDefined();
    console.log("✅ Servidor principal funcionando:", data);
  });

  test("Verificar que la API esté accesible a través del proxy", async ({
    request,
  }) => {
    const response = await request.get("http://localhost:3000/api/v1/health");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("healthy");
    console.log("✅ API accesible a través del proxy:", data);
  });

  test("Verificar conexión directa a la API", async ({ request }) => {
    const response = await request.get("http://localhost:3004/api/v1/health");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("healthy");
    console.log("✅ API directa funcionando:", data);
  });

  test("Verificar configuración de CORS", async ({ request }) => {
    const response = await request.options(
      "http://localhost:3000/api/v1/health",
      {
        headers: {
          Origin: "https://agent.prixcenter.com",
          "Access-Control-Request-Method": "GET",
          "Access-Control-Request-Headers": "Content-Type, Authorization",
        },
      },
    );

    expect(response.status()).toBe(200);

    const corsHeaders = response.headers();
    expect(corsHeaders["access-control-allow-origin"]).toContain(
      "agent.prixcenter.com",
    );
    console.log("✅ CORS configurado correctamente:", corsHeaders);
  });

  test("Verificar timeout del proxy con petición larga", async ({
    request,
  }) => {
    const startTime = Date.now();

    try {
      const response = await request.get(
        "http://localhost:3000/api/v1/health",
        {
          timeout: 70000, // 70 segundos de timeout
        },
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status()).toBe(200);
      console.log(`✅ Proxy respondió en ${duration}ms`);

      // Verificar que no haya timeout prematuro
      expect(duration).toBeLessThan(65000);
    } catch (error) {
      console.error("❌ Error en test de timeout:", error);
      throw error;
    }
  });

  test("Verificar endpoints de autenticación", async ({ request }) => {
    // Test de login endpoint
    const loginResponse = await request.post(
      "http://localhost:3000/api/v1/auth/login",
      {
        data: {
          email: "test@example.com",
          password: "testpassword",
        },
      },
    );

    // Debería devolver 401 (no autorizado) o 400 (bad request), no timeout
    expect([400, 401, 404]).toContain(loginResponse.status());
    console.log(
      "✅ Endpoint de login responde correctamente:",
      loginResponse.status(),
    );
  });

  test("Verificar middleware de tenancy", async ({ request }) => {
    // Test sin account ID
    const response1 = await request.get(
      "http://localhost:3000/api/v1/dashboard/stats",
    );
    expect([401, 403, 404]).toContain(response1.status());
    console.log(
      "✅ Middleware de tenancy funciona sin account ID:",
      response1.status(),
    );

    // Test con account ID inválido
    const response2 = await request.get(
      "http://localhost:3000/api/v1/dashboard/stats",
      {
        headers: {
          "X-Account-ID": "invalid-uuid",
        },
      },
    );
    expect([401, 403, 404]).toContain(response2.status());
    console.log(
      "✅ Middleware de tenancy maneja UUID inválido:",
      response2.status(),
    );
  });

  test("Verificar base de datos", async ({ request }) => {
    const response = await request.get(
      "http://localhost:3000/api/v1/health/database",
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("healthy");
    console.log("✅ Base de datos conectada:", data);
  });

  test("Verificar servicios externos", async ({ request }) => {
    const response = await request.get(
      "http://localhost:3000/api/v1/health/external-services",
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    console.log("✅ Servicios externos:", data);
  });

  test("Verificar métricas del sistema", async ({ request }) => {
    const response = await request.get(
      "http://localhost:3000/api/v1/health/metrics",
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.memory).toBeDefined();
    expect(data.uptime).toBeDefined();
    console.log("✅ Métricas del sistema:", data);
  });

  test("Verificar que no haya errores de request aborted", async ({
    request,
  }) => {
    const promises = [];

    // Hacer múltiples peticiones simultáneas para detectar problemas
    for (let i = 0; i < 10; i++) {
      promises.push(
        request.get("http://localhost:3000/api/v1/health").catch((error) => {
          console.error(`Petición ${i} falló:`, error.message);
          return { error: error.message };
        }),
      );
    }

    const results = await Promise.all(promises);

    // Verificar que no haya errores de "request aborted"
    const errors = results.filter(
      (result) => result.error && result.error.includes("request aborted"),
    );

    expect(errors.length).toBe(0);
    console.log('✅ No se detectaron errores de "request aborted"');
  });

  test("Verificar rendimiento del proxy", async ({ request }) => {
    const startTime = Date.now();

    const response = await request.get("http://localhost:3000/api/v1/health");
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(5000); // Debe responder en menos de 5 segundos
    console.log(`✅ Proxy responde en ${duration}ms`);
  });

  test("Verificar que las aplicaciones frontend estén disponibles", async ({
    page,
  }) => {
    // Test del dashboard
    await page.goto("http://localhost:3000/dashboard");
    await expect(page).toHaveTitle(/PrixAgent/);
    console.log("✅ Dashboard frontend disponible");

    // Test del admin dashboard
    await page.goto("http://localhost:3000/manager");
    await expect(page).toHaveTitle(/PrixAgent/);
    console.log("✅ Admin dashboard frontend disponible");

    // Test de la landing page
    await page.goto("http://localhost:3000/");
    await expect(page).toHaveTitle(/PrixAgent/);
    console.log("✅ Landing page frontend disponible");
  });
});
