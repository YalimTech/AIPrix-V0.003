const axios = require('axios');

// Script para probar webhooks externos
async function testExternalWebhook() {
  const baseUrl = process.env.API_URL || 'http://localhost:3004';
  const testWebhookUrl = 'https://webhook.site/unique-id'; // Reemplaza con tu webhook de prueba
  
  console.log('🧪 Probando funcionalidad de webhooks externos...\n');

  try {
    // 1. Probar webhook URL
    console.log('1️⃣ Probando webhook URL...');
    const testResponse = await axios.post(`${baseUrl}/api/v1/external-webhooks/test`, {
      webhookUrl: testWebhookUrl
    });
    
    console.log('✅ Test webhook:', testResponse.data);
    
    // 2. Simular configuración de webhook para un agente
    console.log('\n2️⃣ Configurando webhook para agente...');
    const agentId = 'test-agent-id'; // Reemplaza con un ID real
    const configureResponse = await axios.put(`${baseUrl}/api/v1/external-webhooks/agent/${agentId}`, {
      webhookUrl: testWebhookUrl
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN', // Reemplaza con token real
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Webhook configurado:', configureResponse.data);
    
    // 3. Verificar configuración
    console.log('\n3️⃣ Verificando configuración...');
    const configResponse = await axios.get(`${baseUrl}/api/v1/external-webhooks/agent/${agentId}`, {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN'
      }
    });
    
    console.log('✅ Configuración actual:', configResponse.data);
    
    console.log('\n🎉 Prueba completada exitosamente!');
    console.log('\n📋 Para probar con una llamada real:');
    console.log('1. Configura un webhook real (ej: webhook.site)');
    console.log('2. Realiza una llamada inbound al agente');
    console.log('3. Verifica que el webhook reciba los datos');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testExternalWebhook();
}

module.exports = { testExternalWebhook };
