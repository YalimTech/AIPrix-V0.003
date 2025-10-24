const request = require('supertest');
const express = require('express');

// Test para verificar que el body parsing funciona correctamente
describe('Proxy Body Parsing Tests', () => {
  let app;
  let server;

  beforeAll(async () => {
    // Importar la aplicación principal
    const { default: serverApp } = await import('../server.js');
    app = serverApp;
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('Body Parsing Tests', () => {
    test('POST /test-body should parse JSON body correctly', async () => {
      const testData = {
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User',
        role: 'user'
      };

      const response = await request(app)
        .post('/test-body')
        .send(testData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.receivedBody).toEqual(testData);
      expect(response.body.bodyType).toBe('object');
      expect(response.body.message).toBe('Body parsing test successful');
    });

    test('POST /test-body should handle empty body', async () => {
      const response = await request(app)
        .post('/test-body')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.receivedBody).toEqual({});
      expect(response.body.bodyType).toBe('object');
    });

    test('POST /test-body should handle complex nested objects', async () => {
      const complexData = {
        user: {
          id: 123,
          profile: {
            name: 'John Doe',
            settings: {
              theme: 'dark',
              notifications: true
            }
          }
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      const response = await request(app)
        .post('/test-body')
        .send(complexData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.receivedBody).toEqual(complexData);
      expect(response.body.bodyType).toBe('object');
    });
  });

  describe('API Proxy Tests', () => {
    test('POST /api/v1/auth/login should handle body correctly', async () => {
      const loginData = {
        email: 'test@prixagent.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect((res) => {
          // Puede ser 200 (éxito) o 401 (credenciales inválidas) o 500 (error de API)
          // Lo importante es que no sea un error de body parsing
          expect([200, 401, 500]).toContain(res.status);
        });

      // Verificar que la respuesta no sea un error de body parsing
      if (response.status === 500) {
        expect(response.body.error).not.toContain('body parsing');
        expect(response.body.error).not.toContain('JSON');
      }
    });

    test('POST /api/v1/auth/login should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"email": "test@example.com", "password": "test"') // JSON malformado
        .expect((res) => {
          // Debe manejar el error de JSON malformado
          expect([400, 500]).toContain(res.status);
        });
    });

    test('POST /api/v1/auth/login should handle large payloads', async () => {
      const largeData = {
        email: 'test@example.com',
        password: 'testpassword',
        metadata: {
          largeString: 'x'.repeat(10000), // 10KB string
          array: Array(1000).fill('test'),
          nested: {
            level1: {
              level2: {
                level3: {
                  data: 'deep nested data'
                }
              }
            }
          }
        }
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(largeData)
        .expect((res) => {
          // Debe manejar payloads grandes sin errores de body parsing
          expect([200, 401, 500]).toContain(res.status);
        });
    });
  });

  describe('Health Check Tests', () => {
    test('GET /health should return correct status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.environment).toBeDefined();
      expect(response.body.circuitBreaker).toBeDefined();
    });

    test('GET /api/health should work through proxy', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect((res) => {
          // Puede ser 200 (API funcionando) o 503 (API no disponible)
          expect([200, 503]).toContain(res.status);
        });
    });
  });

  describe('Error Handling Tests', () => {
    test('Should handle requests without Content-Type header', async () => {
      const response = await request(app)
        .post('/test-body')
        .send('plain text')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('Should handle requests with wrong Content-Type', async () => {
      const response = await request(app)
        .post('/test-body')
        .set('Content-Type', 'text/plain')
        .send('plain text')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
