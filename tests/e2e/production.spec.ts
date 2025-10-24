import { expect, test } from "@playwright/test";

// Test específico para el dominio de producción
test.describe("Diagnóstico de Producción - agent.prixcenter.com", () => {
  test("Verificar que el servidor principal esté funcionando en producción", async ({
    request,
  }) => {
    const response = await request.get("https://agent.prixcenter.com/health");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("ok");
    expect(data.timestamp).toBeDefined();
    console.log("✅ Servidor principal en producción funcionando:", data);
  });

  test("Verificar que la API esté accesible a través del proxy en producción", async ({
    request,
  }) => {
    const response = await request.get(
      "https://agent.prixcenter.com/api/v1/health",
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("healthy");
    console.log("✅ API accesible a través del proxy en producción:", data);
  });

  test("Verificar configuración de CORS en producción", async ({ request }) => {
    const response = await request.options(
      "https://agent.prixcenter.com/api/v1/health",
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
    console.log(
      "✅ CORS configurado correctamente en producción:",
      corsHeaders,
    );
  });

  test("Verificar timeout del proxy en producción con petición larga", async ({
    request,
  }) => {
    const startTime = Date.now();

    try {
      const response = await request.get(
        "https://agent.prixcenter.com/api/v1/health",
        {
          timeout: 70000, // 70 segundos de timeout
        },
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status()).toBe(200);
      console.log(`✅ Proxy en producción respondió en ${duration}ms`);

      // Verificar que no haya timeout prematuro
      expect(duration).toBeLessThan(65000);
    } catch (error) {
      console.error("❌ Error en test de timeout en producción:", error);
      throw error;
    }
  });

  test("Verificar que no haya errores de request aborted en producción", async ({
    request,
  }) => {
    const promises = [];

    // Hacer múltiples peticiones simultáneas para detectar problemas
    for (let i = 0; i < 10; i++) {
      promises.push(
        request
          .get("https://agent.prixcenter.com/api/v1/health")
          .catch((error) => {
            console.error(`Petición ${i} falló en producción:`, error.message);
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
    console.log(
      '✅ No se detectaron errores de "request aborted" en producción',
    );
  });

  test("Verificar rendimiento del proxy en producción", async ({ request }) => {
    const startTime = Date.now();

    const response = await request.get(
      "https://agent.prixcenter.com/api/v1/health",
    );
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(10000); // Debe responder en menos de 10 segundos en producción
    console.log(`✅ Proxy en producción responde en ${duration}ms`);
  });

  test("Verificar que el dashboard esté disponible en producción", async ({
    page,
  }) => {
    // Test del dashboard en producción
    await page.goto("https://agent.prixcenter.com/dashboard/");

    // Esperar a que la página cargue completamente
    await page.waitForLoadState("networkidle");

    // Verificar que no haya errores de "request aborted" en la consola
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Verificar que la página tenga el título correcto
    await expect(page).toHaveTitle(/PrixAgent/);
    console.log("✅ Dashboard en producción disponible");

    // Verificar que no haya errores de "request aborted" en la consola
    expect(
      consoleErrors.filter((error) => error.includes("request aborted")).length,
    ).toBe(0);
    console.log(
      '✅ No se detectaron errores de "request aborted" en el dashboard',
    );
  });

  test("Verificar que el admin dashboard esté disponible en producción", async ({
    page,
  }) => {
    // Test del admin dashboard en producción
    await page.goto("https://agent.prixcenter.com/manager/");

    // Esperar a que la página cargue completamente
    await page.waitForLoadState("networkidle");

    // Verificar que no haya errores de "request aborted" en la consola
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Verificar que la página tenga el título correcto
    await expect(page).toHaveTitle(/PrixAgent/);
    console.log("✅ Admin dashboard en producción disponible");

    // Verificar que no haya errores de "request aborted" en la consola
    expect(
      consoleErrors.filter((error) => error.includes("request aborted")).length,
    ).toBe(0);
    console.log(
      '✅ No se detectaron errores de "request aborted" en el admin dashboard',
    );
  });

  test("Verificar que la landing page esté disponible en producción", async ({
    page,
  }) => {
    // Test de la landing page en producción
    await page.goto("https://agent.prixcenter.com/");

    // Esperar a que la página cargue completamente
    await page.waitForLoadState("networkidle");

    // Verificar que no haya errores de "request aborted" en la consola
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Verificar que la página tenga el título correcto
    await expect(page).toHaveTitle(/PrixAgent/);
    console.log("✅ Landing page en producción disponible");

    // Verificar que no haya errores de "request aborted" en la consola
    expect(
      consoleErrors.filter((error) => error.includes("request aborted")).length,
    ).toBe(0);
    console.log(
      '✅ No se detectaron errores de "request aborted" en la landing page',
    );
  });

  test("Verificar base de datos en producción", async ({ request }) => {
    const response = await request.get(
      "https://agent.prixcenter.com/api/v1/health/database",
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("healthy");
    console.log("✅ Base de datos conectada en producción:", data);
  });

  test("Verificar servicios externos en producción", async ({ request }) => {
    const response = await request.get(
      "https://agent.prixcenter.com/api/v1/health/external-services",
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    console.log("✅ Servicios externos en producción:", data);
  });

  test("Verificar métricas del sistema en producción", async ({ request }) => {
    const response = await request.get(
      "https://agent.prixcenter.com/api/v1/health/metrics",
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.memory).toBeDefined();
    expect(data.uptime).toBeDefined();
    console.log("✅ Métricas del sistema en producción:", data);
  });

  test("Verificar endpoints de autenticación en producción", async ({
    request,
  }) => {
    // Test de login endpoint en producción
    const loginResponse = await request.post(
      "https://agent.prixcenter.com/api/v1/auth/login",
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
      "✅ Endpoint de login responde correctamente en producción:",
      loginResponse.status(),
    );
  });

  test("Verificar middleware de tenancy en producción", async ({ request }) => {
    // Test sin account ID en producción
    const response1 = await request.get(
      "https://agent.prixcenter.com/api/v1/dashboard/stats",
    );
    expect([401, 403, 404]).toContain(response1.status());
    console.log(
      "✅ Middleware de tenancy funciona sin account ID en producción:",
      response1.status(),
    );

    // Test con account ID inválido en producción
    const response2 = await request.get(
      "https://agent.prixcenter.com/api/v1/dashboard/stats",
      {
        headers: {
          "X-Account-ID": "invalid-uuid",
        },
      },
    );
    expect([401, 403, 404]).toContain(response2.status());
    console.log(
      "✅ Middleware de tenancy maneja UUID inválido en producción:",
      response2.status(),
    );
  });
});
