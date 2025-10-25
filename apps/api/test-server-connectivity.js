/**
 * Test de conectividad del servidor
 * Verifica que el servidor esté corriendo y respondiendo
 */

const axios = require('axios');

async function testServerConnectivity() {
  console.log('🧪 Test de Conectividad del Servidor');
  console.log('='.repeat(50));

  const baseURL = 'http://localhost:3004/api/v1';
  const endpoints = [
    { name: 'Health Check', url: '/health', method: 'GET' },
    { name: 'Dashboard Info', url: '/dashboard/user-info', method: 'GET' },
    { name: 'Phone Numbers', url: '/dashboard/phone-numbers', method: 'GET' },
    { name: 'Agents', url: '/agents', method: 'GET' },
    { name: 'Phone Assignment', url: '/phone-assignment/inbound-agents', method: 'GET' }
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Probando: ${endpoint.name} (${endpoint.method} ${endpoint.url})`);
      
      const response = await axios({
        method: endpoint.method,
        url: `${baseURL}${endpoint.url}`,
        timeout: 5000,
        headers: {
          'Authorization': 'Bearer test-token',
          'X-Account-ID': 'cmgwz0eou0000tivkwzxldm7t'
        }
      });

      results.push({
        name: endpoint.name,
        status: 'SUCCESS',
        statusCode: response.status,
        responseTime: response.headers['x-response-time'] || 'N/A'
      });

      console.log(`✅ ${endpoint.name} - Status: ${response.status}`);
      
    } catch (error) {
      const status = error.response?.status || 'CONNECTION_ERROR';
      const message = error.message || 'Unknown error';
      
      results.push({
        name: endpoint.name,
        status: 'FAILED',
        statusCode: status,
        error: message
      });

      console.log(`❌ ${endpoint.name} - Error: ${message}`);
    }
  }

  // Test de webhooks
  console.log('\n🔍 Probando Webhooks...');
  
  try {
    const webhookData = {
      CallSid: 'CA' + Math.random().toString(36).substr(2, 32),
      CallStatus: 'in-progress',
      From: '+1987654321',
      To: '+12315183302',
      Direction: 'inbound'
    };

    const webhookResponse = await axios.post(`${baseURL}/webhooks/voice`, webhookData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000
    });

    results.push({
      name: 'Twilio Webhook',
      status: 'SUCCESS',
      statusCode: webhookResponse.status
    });

    console.log(`✅ Twilio Webhook - Status: ${webhookResponse.status}`);
    
  } catch (error) {
    results.push({
      name: 'Twilio Webhook',
      status: 'FAILED',
      statusCode: error.response?.status || 'CONNECTION_ERROR',
      error: error.message
    });

    console.log(`❌ Twilio Webhook - Error: ${error.message}`);
  }

  // Resumen
  console.log('\n📊 RESUMEN DE CONECTIVIDAD');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.status === 'SUCCESS').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  
  console.log(`✅ Exitosos: ${successful}`);
  console.log(`❌ Fallidos: ${failed}`);
  
  if (failed > 0) {
    console.log('\n❌ ENDPOINTS FALLIDOS:');
    results.filter(r => r.status === 'FAILED').forEach(result => {
      console.log(`   - ${result.name}: ${result.error}`);
    });
  }

  if (successful === results.length) {
    console.log('\n🎉 ¡SERVIDOR FUNCIONANDO PERFECTAMENTE!');
    console.log('✅ Todos los endpoints están respondiendo correctamente');
    console.log('✅ Los webhooks están funcionando');
    console.log('✅ La implementación está lista para usar');
  } else if (successful > 0) {
    console.log('\n⚠️ SERVIDOR PARCIALMENTE FUNCIONAL');
    console.log('✅ Algunos endpoints funcionan correctamente');
    console.log('❌ Algunos endpoints necesitan revisión');
  } else {
    console.log('\n❌ SERVIDOR NO FUNCIONA');
    console.log('❌ Ningún endpoint está respondiendo');
    console.log('❌ Verificar que el servidor esté corriendo');
  }

  return results;
}

// Ejecutar test
testServerConnectivity().catch(console.error);
