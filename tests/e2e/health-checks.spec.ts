import { test, expect } from '@playwright/test';

test.describe('Health Checks', () => {
  test('should return basic health status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      status: 'ok',
      service: 'prixagent-api',
      version: '1.0.0',
      uptime: expect.any(Number),
    });
    expect(data.timestamp).toBeDefined();
  });

  test('should return detailed health status', async ({ request }) => {
    const response = await request.get('/api/health/detailed');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      status: expect.stringMatching(/^(healthy|unhealthy|degraded)$/),
      timestamp: expect.any(String),
      uptime: expect.any(Number),
      version: '1.0.0',
      environment: expect.any(String),
      checks: {
        database: expect.objectContaining({
          status: expect.stringMatching(/^(healthy|unhealthy|degraded)$/),
          lastChecked: expect.any(String),
        }),
        externalServices: expect.objectContaining({
          status: expect.stringMatching(/^(healthy|unhealthy|degraded)$/),
          lastChecked: expect.any(String),
        }),
        memory: expect.objectContaining({
          status: expect.stringMatching(/^(healthy|unhealthy|degraded)$/),
          lastChecked: expect.any(String),
        }),
        disk: expect.objectContaining({
          status: expect.stringMatching(/^(healthy|unhealthy|degraded)$/),
          lastChecked: expect.any(String),
        }),
      },
      metrics: {
        memory: expect.objectContaining({
          used: expect.any(Number),
          total: expect.any(Number),
          percentage: expect.any(Number),
          free: expect.any(Number),
        }),
        disk: expect.objectContaining({
          used: expect.any(Number),
          total: expect.any(Number),
          percentage: expect.any(Number),
          free: expect.any(Number),
        }),
        connections: expect.objectContaining({
          active: expect.any(Number),
          total: expect.any(Number),
          websocket: expect.any(Number),
        }),
      },
    });
  });

  test('should return database health status', async ({ request }) => {
    const response = await request.get('/api/health/database');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      status: expect.stringMatching(/^(healthy|unhealthy|degraded)$/),
      lastChecked: expect.any(String),
    });
    
    if (data.status === 'healthy') {
      expect(data.responseTime).toBeDefined();
      expect(data.details).toBeDefined();
    } else {
      expect(data.error).toBeDefined();
    }
  });

  test('should return external services health status', async ({ request }) => {
    const response = await request.get('/api/health/external-services');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      status: expect.stringMatching(/^(healthy|unhealthy|degraded)$/),
      lastChecked: expect.any(String),
      details: {
        services: expect.objectContaining({
          openai: expect.any(Boolean),
          gemini: expect.any(Boolean),
          twilio: expect.any(Boolean),
          elevenlabs: expect.any(Boolean),
          deepgram: expect.any(Boolean),
        }),
        healthyCount: expect.any(Number),
        totalCount: expect.any(Number),
      },
    });
  });

  test('should return system metrics', async ({ request }) => {
    const response = await request.get('/api/health/metrics');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      memory: expect.objectContaining({
        used: expect.any(Number),
        total: expect.any(Number),
        percentage: expect.any(Number),
        free: expect.any(Number),
      }),
      disk: expect.objectContaining({
        used: expect.any(Number),
        total: expect.any(Number),
        percentage: expect.any(Number),
        free: expect.any(Number),
      }),
      connections: expect.objectContaining({
        active: expect.any(Number),
        total: expect.any(Number),
        websocket: expect.any(Number),
      }),
    });
  });

  test('should return readiness status', async ({ request }) => {
    const response = await request.get('/api/health/readiness');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      status: expect.stringMatching(/^(ready|not ready)$/),
      timestamp: expect.any(String),
      checks: expect.arrayContaining([
        expect.objectContaining({
          status: expect.stringMatching(/^(healthy|unhealthy|degraded)$/),
          lastChecked: expect.any(String),
        }),
      ]),
    });
  });

  test('should return liveness status', async ({ request }) => {
    const response = await request.get('/api/health/liveness');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      status: 'alive',
      timestamp: expect.any(String),
      uptime: expect.any(Number),
      memory: expect.objectContaining({
        used: expect.any(Number),
        total: expect.any(Number),
        percentage: expect.any(Number),
        free: expect.any(Number),
      }),
    });
  });

  test('should handle health check errors gracefully', async ({ request }) => {
    // Test with invalid endpoint
    const response = await request.get('/api/health/invalid');
    expect(response.status()).toBe(404);
  });

  test('should return consistent health data structure', async ({ request }) => {
    const [basic, detailed, database, external, metrics, readiness, liveness] = await Promise.all([
      request.get('/api/health'),
      request.get('/api/health/detailed'),
      request.get('/api/health/database'),
      request.get('/api/health/external-services'),
      request.get('/api/health/metrics'),
      request.get('/api/health/readiness'),
      request.get('/api/health/liveness'),
    ]);

    // All should return 200
    expect(basic.status()).toBe(200);
    expect(detailed.status()).toBe(200);
    expect(database.status()).toBe(200);
    expect(external.status()).toBe(200);
    expect(metrics.status()).toBe(200);
    expect(readiness.status()).toBe(200);
    expect(liveness.status()).toBe(200);

    // All should have timestamps
    const basicData = await basic.json();
    const detailedData = await detailed.json();
    const databaseData = await database.json();
    const externalData = await external.json();
    const metricsData = await metrics.json();
    const readinessData = await readiness.json();
    const livenessData = await liveness.json();

    expect(basicData.timestamp).toBeDefined();
    expect(detailedData.timestamp).toBeDefined();
    expect(databaseData.lastChecked).toBeDefined();
    expect(externalData.lastChecked).toBeDefined();
    expect(readinessData.timestamp).toBeDefined();
    expect(livenessData.timestamp).toBeDefined();
  });
});
