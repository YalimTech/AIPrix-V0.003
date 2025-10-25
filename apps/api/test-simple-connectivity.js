/**
 * Test simple de conectividad
 */

const http = require('http');

function testPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      console.log(`✅ Puerto ${port} - Status: ${res.statusCode}`);
      resolve({ port, status: 'SUCCESS', statusCode: res.statusCode });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Puerto ${port} - Error: ${err.message}`);
      resolve({ port, status: 'FAILED', error: err.message });
    });
    
    req.setTimeout(3000, () => {
      console.log(`❌ Puerto ${port} - Timeout`);
      resolve({ port, status: 'TIMEOUT', error: 'Connection timeout' });
    });
  });
}

async function testAllPorts() {
  console.log('🧪 Test de Conectividad Simple');
  console.log('='.repeat(40));
  
  const ports = [3000, 3001, 3002, 3003, 3004, 3005];
  const results = [];
  
  for (const port of ports) {
    const result = await testPort(port);
    results.push(result);
  }
  
  console.log('\n📊 RESUMEN:');
  const successful = results.filter(r => r.status === 'SUCCESS');
  const failed = results.filter(r => r.status === 'FAILED');
  
  console.log(`✅ Puertos activos: ${successful.length}`);
  console.log(`❌ Puertos inactivos: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\n🎉 SERVIDORES ENCONTRADOS:');
    successful.forEach(result => {
      console.log(`   - Puerto ${result.port}: Status ${result.statusCode}`);
    });
  }
  
  return results;
}

testAllPorts().catch(console.error);
