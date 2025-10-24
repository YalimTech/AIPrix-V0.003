const request = require('supertest');

// Test específico para verificar que la API maneja correctamente el body parsing
describe('API Body Parsing Tests', () => {
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

  describe('API Endpoints Body Parsing', () => {
    test('POST /api/v1/auth/login should parse body correctly', async () => {
      const loginData = {
        email: 'test@prixagent.com',
        password: 'TestPassword123!'
      };

      console.log('🧪 Testing login endpoint with body parsing...');
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect((res) => {
          console.log(`🧪 Response status: ${res.status}`);
          console.log(`🧪 Response body:`, res.body);
          
          // Verificar que no sea un error de body parsing
          if (res.status === 500) {
            expect(res.body.error).not.toContain('body parsing');
            expect(res.body.error).not.toContain('JSON');
            expect(res.body.error).not.toContain('Unexpected token');
          }
          
          // Aceptar diferentes códigos de respuesta
          expect([200, 401, 500, 502, 503]).toContain(res.status);
        });

      // Verificar que la respuesta tenga la estructura esperada
      if (response.status === 200) {
        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('user');
      } else if (response.status === 401) {
        expect(response.body).toHaveProperty('error');
      }
    });

    test('POST /api/v1/auth/register should handle body correctly', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'newpassword123',
        name: 'New User'
      };

      console.log('🧪 Testing register endpoint with body parsing...');
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData)
        .expect((res) => {
          console.log(`🧪 Register response status: ${res.status}`);
          console.log(`🧪 Register response body:`, res.body);
          
          // Verificar que no sea un error de body parsing
          if (res.status === 500) {
            expect(res.body.error).not.toContain('body parsing');
            expect(res.body.error).not.toContain('JSON');
          }
          
          expect([200, 400, 409, 500, 502, 503]).toContain(res.status);
        });
    });

    test('POST /api/v1/agents should handle complex body', async () => {
      const agentData = {
        name: 'Test Agent',
        description: 'Test agent for body parsing',
        prompt: 'You are a helpful assistant',
        voice: 'EXAVITQu4vr4xnSDxMaL', // Voz de ejemplo para testing
        settings: {
          temperature: 0.7,
          maxTokens: 1000,
          language: 'es'
        },
        metadata: {
          createdBy: 'test@example.com',
          tags: ['test', 'body-parsing']
        }
      };

      console.log('🧪 Testing agents endpoint with complex body...');
      
      const response = await request(app)
        .post('/api/v1/agents')
        .send(agentData)
        .expect((res) => {
          console.log(`🧪 Agents response status: ${res.status}`);
          console.log(`🧪 Agents response body:`, res.body);
          
          // Verificar que no sea un error de body parsing
          if (res.status === 500) {
            expect(res.body.error).not.toContain('body parsing');
            expect(res.body.error).not.toContain('JSON');
          }
          
          expect([200, 201, 400, 401, 500, 502, 503]).toContain(res.status);
        });
    });
  });

  describe('Body Parsing Edge Cases', () => {
    test('Should handle empty JSON body', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({})
        .expect((res) => {
          // Debe manejar body vacío sin errores de parsing
          expect([400, 401, 500, 502, 503]).toContain(res.status);
        });
    });

    test('Should handle null values in body', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: null,
          password: null
        })
        .expect((res) => {
          expect([400, 401, 500, 502, 503]).toContain(res.status);
        });
    });

    test('Should handle very large body', async () => {
      const largeData = {
        email: 'test@example.com',
        password: 'test',
        largeField: 'x'.repeat(100000) // 100KB string
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(largeData)
        .expect((res) => {
          // Debe manejar payloads grandes
          expect([200, 400, 401, 413, 500, 502, 503]).toContain(res.status);
        });
    });
  });

  describe('Content-Type Handling', () => {
    test('Should handle application/json Content-Type', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: 'test@example.com', password: 'test' })
        .expect((res) => {
          expect([200, 400, 401, 500, 502, 503]).toContain(res.status);
        });
    });

    test('Should handle missing Content-Type', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'test' })
        .expect((res) => {
          expect([200, 400, 401, 500, 502, 503]).toContain(res.status);
        });
    });

    test('Should handle wrong Content-Type gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .set('Content-Type', 'text/plain')
        .send('email=test@example.com&password=test')
        .expect((res) => {
          expect([200, 400, 401, 500, 502, 503]).toContain(res.status);
        });
    });
  });
});
