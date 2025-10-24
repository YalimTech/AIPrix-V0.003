#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Iniciando tests de body parsing...\n');

// Función para ejecutar tests
function runTests() {
  return new Promise((resolve, reject) => {
    const testFiles = [
      'tests/proxy-body-parsing.test.js',
      'tests/api-body-parsing.test.js'
    ];

    console.log('📋 Archivos de test a ejecutar:');
    testFiles.forEach(file => console.log(`  - ${file}`));
    console.log('');

    // Ejecutar tests con Jest
    const jestProcess = spawn('npx', ['jest', ...testFiles, '--verbose', '--no-cache'], {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    });

    jestProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Todos los tests pasaron exitosamente!');
        resolve();
      } else {
        console.log(`\n❌ Tests fallaron con código: ${code}`);
        reject(new Error(`Tests failed with code ${code}`));
      }
    });

    jestProcess.on('error', (error) => {
      console.error('❌ Error ejecutando tests:', error);
      reject(error);
    });
  });
}

// Función para verificar que el servidor esté funcionando
async function checkServerHealth() {
  try {
    const response = await fetch('http://localhost:3000/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Servidor está funcionando correctamente');
      console.log(`   Status: ${data.status}`);
      console.log(`   Environment: ${data.environment}`);
      return true;
    } else {
      console.log('❌ Servidor no está respondiendo correctamente');
      return false;
    }
  } catch (error) {
    console.log('❌ No se pudo conectar al servidor:', error.message);
    console.log('💡 Asegúrate de que el servidor esté ejecutándose en el puerto 3000');
    return false;
  }
}

// Función para test manual del endpoint de prueba
async function testBodyParsingEndpoint() {
  try {
    console.log('🧪 Probando endpoint /test-body...');
    
    const testData = {
      email: 'test@example.com',
      password: 'testpassword123',
      message: 'Body parsing test'
    };

    const response = await fetch('http://localhost:3000/test-body', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Endpoint /test-body funciona correctamente');
      console.log(`   Success: ${data.success}`);
      console.log(`   Body Type: ${data.bodyType}`);
      console.log(`   Received Body:`, data.receivedBody);
      return true;
    } else {
      console.log('❌ Endpoint /test-body falló:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Error probando endpoint /test-body:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando verificación de body parsing...\n');

  // Verificar que el servidor esté funcionando
  console.log('1️⃣ Verificando servidor...');
  const serverOk = await checkServerHealth();
  if (!serverOk) {
    console.log('❌ El servidor no está funcionando. Por favor inicia el servidor primero.');
    process.exit(1);
  }

  // Probar endpoint de prueba
  console.log('\n2️⃣ Probando endpoint de body parsing...');
  const endpointOk = await testBodyParsingEndpoint();
  if (!endpointOk) {
    console.log('❌ El endpoint de prueba no funciona. Revisa la configuración.');
    process.exit(1);
  }

  // Ejecutar tests automatizados
  console.log('\n3️⃣ Ejecutando tests automatizados...');
  try {
    await runTests();
    console.log('\n🎉 ¡Todos los tests de body parsing pasaron exitosamente!');
    console.log('\n📊 Resumen:');
    console.log('   ✅ Servidor funcionando');
    console.log('   ✅ Endpoint de prueba funcionando');
    console.log('   ✅ Tests automatizados pasando');
    console.log('\n🎯 El problema del proxy con body parsing ha sido solucionado!');
  } catch (error) {
    console.log('\n❌ Algunos tests fallaron:');
    console.log('   Error:', error.message);
    console.log('\n💡 Revisa los logs anteriores para más detalles.');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error en la ejecución:', error);
    process.exit(1);
  });
}

module.exports = { main, checkServerHealth, testBodyParsingEndpoint, runTests };
