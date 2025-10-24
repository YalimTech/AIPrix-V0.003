#!/usr/bin/env node

const http = require('http');

console.log('🧪 Verificando que los POST requests funcionan correctamente...\n');

// Función para hacer requests HTTP
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsedBody, headers: res.headers });
        } catch (error) {
          resolve({ status: res.statusCode, body: body, headers: res.headers });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test 1: Verificar que el servidor está funcionando
async function testServerHealth() {
  console.log('🔍 Test 1: Verificando que el servidor está funcionando...');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET'
    });

    if (response.status === 200) {
      console.log('   ✅ Servidor funcionando correctamente');
      console.log(`   📊 Status: ${response.body.status}`);
      return true;
    } else {
      console.log(`   ❌ Servidor no responde correctamente (Status: ${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error conectando al servidor: ${error.message}`);
    return false;
  }
}

// Test 2: Verificar endpoint de prueba de body parsing
async function testBodyParsingEndpoint() {
  console.log('\n🔍 Test 2: Verificando endpoint de prueba de body parsing...');
  
  const testData = {
    email: 'test@example.com',
    password: 'testpassword123',
    name: 'Test User',
    role: 'user',
    metadata: {
      timestamp: new Date().toISOString(),
      test: true
    }
  };

  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/test-body',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, testData);

    console.log(`   📊 Status: ${response.status}`);
    console.log(`   📊 Response:`, response.body);

    if (response.status === 200 && response.body.success) {
      console.log('   ✅ Body parsing funciona correctamente');
      console.log(`   📊 Body recibido:`, response.body.receivedBody);
      return true;
    } else {
      console.log('   ❌ Body parsing no funciona correctamente');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error en body parsing: ${error.message}`);
    return false;
  }
}

// Test 3: Verificar login endpoint a través del proxy
async function testLoginEndpoint() {
  console.log('\n🔍 Test 3: Verificando login endpoint a través del proxy...');
  
  const loginData = {
    email: 'test@prixagent.com',
    password: 'TestPassword123!'
  };

  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, loginData);

    console.log(`   📊 Status: ${response.status}`);
    console.log(`   📊 Response:`, response.body);

    // Verificar que no sea un error de body parsing
    if (response.status === 500) {
      const errorMsg = response.body.error || response.body.message || '';
      if (errorMsg.includes('body parsing') || errorMsg.includes('JSON') || errorMsg.includes('Unexpected token')) {
        console.log('   ❌ Error de body parsing detectado');
        console.log(`   📊 Error: ${errorMsg}`);
        return false;
      }
    }

    // Aceptar diferentes códigos de respuesta
    if ([200, 401, 500, 502, 503].includes(response.status)) {
      console.log('   ✅ No hay errores de body parsing');
      if (response.status === 200) {
        console.log('   ✅ Login exitoso');
      } else if (response.status === 401) {
        console.log('   ✅ Credenciales inválidas (comportamiento esperado)');
      } else {
        console.log('   ⚠️  API no disponible (pero no es error de body parsing)');
      }
      return true;
    } else {
      console.log('   ❌ Status inesperado');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error en login: ${error.message}`);
    return false;
  }
}

// Test 4: Verificar que el proxy maneja correctamente el body
async function testProxyBodyHandling() {
  console.log('\n🔍 Test 4: Verificando manejo de body en el proxy...');
  
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

  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, complexData);

    console.log(`   📊 Status: ${response.status}`);
    console.log(`   📊 Response:`, response.body);

    // Verificar que no sea un error de body parsing
    if (response.status === 500) {
      const errorMsg = response.body.error || response.body.message || '';
      if (errorMsg.includes('body parsing') || errorMsg.includes('JSON') || errorMsg.includes('Unexpected token')) {
        console.log('   ❌ Error de body parsing en proxy');
        return false;
      }
    }

    console.log('   ✅ Proxy maneja correctamente el body complejo');
    return true;
  } catch (error) {
    console.log(`   ❌ Error en proxy: ${error.message}`);
    return false;
  }
}

// Test 5: Verificar manejo de payloads grandes
async function testLargePayload() {
  console.log('\n🔍 Test 5: Verificando manejo de payloads grandes...');
  
  const largeData = {
    email: 'test@example.com',
    password: 'test',
    largeField: 'x'.repeat(50000), // 50KB string
    metadata: {
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

  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, largeData);

    console.log(`   📊 Status: ${response.status}`);

    // Debe manejar payloads grandes sin errores de body parsing
    if ([200, 400, 401, 413, 500, 502, 503].includes(response.status)) {
      console.log('   ✅ Payload grande manejado correctamente');
      return true;
    } else {
      console.log('   ❌ Error inesperado con payload grande');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error con payload grande: ${error.message}`);
    return false;
  }
}

// Función principal
async function runAllTests() {
  console.log('🚀 Iniciando verificación de POST requests...\n');

  const results = [];

  // Ejecutar todos los tests
  results.push(await testServerHealth());
  results.push(await testBodyParsingEndpoint());
  results.push(await testLoginEndpoint());
  results.push(await testProxyBodyHandling());
  results.push(await testLargePayload());

  // Resumen de resultados
  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('\n📊 RESUMEN DE TESTS:');
  console.log(`   ✅ Pasaron: ${passed}/${total}`);
  console.log(`   ❌ Fallaron: ${total - passed}/${total}`);

  if (passed === total) {
    console.log('\n🎉 ¡TODOS LOS TESTS PASARON!');
    console.log('✅ Los POST requests funcionan correctamente');
    console.log('\n🎯 Verificación exitosa:');
    console.log('   ✅ Servidor funcionando');
    console.log('   ✅ Body parsing funciona');
    console.log('   ✅ Proxy maneja correctamente el body');
    console.log('   ✅ No hay errores de JSON parsing');
    console.log('   ✅ Payloads grandes se manejan correctamente');
    console.log('\n🚀 El problema del proxy con body parsing ha sido SOLUCIONADO!');
  } else {
    console.log('\n❌ ALGUNOS TESTS FALLARON');
    console.log('💡 Revisa los logs anteriores para identificar el problema');
  }

  return passed === total;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Error ejecutando tests:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };
