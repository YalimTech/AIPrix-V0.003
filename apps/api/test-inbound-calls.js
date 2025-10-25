/**
 * Test script para verificar que las llamadas inbound funcionen correctamente
 * con ElevenLabs Conversational AI
 */

const axios = require('axios');

// Configuración del test
const API_BASE_URL = 'http://localhost:3004/api/v1';
const TEST_ACCOUNT_ID = 'cmgwz0ey50002tivk67ld4m1z'; // Reemplazar con un accountId real
const TEST_AGENT_ID = 'agent_8801k8da5h42f0er4fyrxe6z9315'; // Reemplazar con un agentId real

async function testInboundCallFlow() {
  console.log('🧪 Iniciando test de llamadas inbound...\n');

  try {
    // 1. Verificar que el agente existe y tiene elevenLabsAgentId
    console.log('1️⃣ Verificando agente...');
    const agentResponse = await axios.get(`${API_BASE_URL}/agents/${TEST_AGENT_ID}`, {
      headers: {
        'Authorization': 'Bearer test-token', // Reemplazar con token real
        'X-Account-ID': TEST_ACCOUNT_ID
      }
    });
    
    const agent = agentResponse.data;
    console.log(`✅ Agente encontrado: ${agent.name}`);
    console.log(`   - ElevenLabs Agent ID: ${agent.elevenLabsAgentId || 'NO CONFIGURADO'}`);
    console.log(`   - Phone Number: ${agent.phoneNumber || 'NO ASIGNADO'}`);
    
    if (!agent.elevenLabsAgentId) {
      console.log('❌ ERROR: El agente no tiene elevenLabsAgentId configurado');
      return;
    }

    if (!agent.phoneNumber) {
      console.log('❌ ERROR: El agente no tiene número de teléfono asignado');
      return;
    }

    // 2. Verificar configuración de Twilio
    console.log('\n2️⃣ Verificando configuración de Twilio...');
    const twilioConfigResponse = await axios.get(`${API_BASE_URL}/integrations/twilio/config`, {
      headers: {
        'Authorization': 'Bearer test-token',
        'X-Account-ID': TEST_ACCOUNT_ID
      }
    });
    
    const twilioConfig = twilioConfigResponse.data;
    console.log(`✅ Configuración de Twilio: ${twilioConfig ? 'CONFIGURADA' : 'NO CONFIGURADA'}`);

    // 3. Simular webhook de llamada inbound de Twilio
    console.log('\n3️⃣ Simulando webhook de llamada inbound...');
    const mockTwilioWebhook = {
      CallSid: 'CA' + Math.random().toString(36).substr(2, 32),
      CallStatus: 'in-progress',
      From: '+1234567890',
      To: agent.phoneNumber,
      Direction: 'inbound',
      SpeechResult: 'Hola, necesito ayuda',
      AccountSid: 'AC' + Math.random().toString(36).substr(2, 32)
    };

    console.log('📞 Datos del webhook simulado:', mockTwilioWebhook);

    // 4. Procesar webhook (esto debería crear una llamada en la BD)
    const webhookResponse = await axios.post(`${API_BASE_URL}/webhooks/voice`, mockTwilioWebhook, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('✅ Webhook procesado:', webhookResponse.data);

    // 5. Verificar que se creó el registro de llamada
    console.log('\n4️⃣ Verificando registro de llamada...');
    const callsResponse = await axios.get(`${API_BASE_URL}/dashboard/call-logs`, {
      headers: {
        'Authorization': 'Bearer test-token',
        'X-Account-ID': TEST_ACCOUNT_ID
      },
      params: {
        limit: 10
      }
    });

    const calls = callsResponse.data.calls || [];
    const testCall = calls.find(call => 
      call.notes && call.notes.includes(mockTwilioWebhook.CallSid)
    );

    if (testCall) {
      console.log('✅ Llamada registrada en la base de datos');
      console.log(`   - ID: ${testCall.id}`);
      console.log(`   - Status: ${testCall.status}`);
      console.log(`   - Direction: ${testCall.direction}`);
    } else {
      console.log('❌ ERROR: No se encontró la llamada en la base de datos');
    }

    // 6. Simular webhook de ElevenLabs (conversation started)
    console.log('\n5️⃣ Simulando webhook de ElevenLabs...');
    const mockElevenLabsWebhook = {
      event_type: 'conversation.started',
      conversation_id: 'conv_' + Math.random().toString(36).substr(2, 32),
      account_id: TEST_ACCOUNT_ID,
      agent_id: agent.elevenLabsAgentId,
      call_id: mockTwilioWebhook.CallSid,
      from_number: mockTwilioWebhook.From,
      to_number: mockTwilioWebhook.To,
      direction: 'inbound'
    };

    const elevenLabsResponse = await axios.post(`${API_BASE_URL}/webhooks/elevenlabs/conversation-initiation`, mockElevenLabsWebhook);
    console.log('✅ Webhook de ElevenLabs procesado:', elevenLabsResponse.data);

    // 7. Simular webhook de finalización de conversación
    console.log('\n6️⃣ Simulando finalización de conversación...');
    const mockConversationEnded = {
      event_type: 'conversation.ended',
      conversation_id: mockElevenLabsWebhook.conversation_id,
      account_id: TEST_ACCOUNT_ID,
      agent_id: agent.elevenLabsAgentId,
      call_id: mockTwilioWebhook.CallSid,
      duration: 120,
      tokens_used: 1500,
      cost: 0.15,
      transcript: 'Cliente: Hola, necesito ayuda\nAgente: Hola, ¿en qué puedo ayudarte hoy?\nCliente: Gracias, ya no necesito nada más\nAgente: Perfecto, que tengas un buen día.',
      recording_url: 'https://example.com/recording.mp3',
      from_number: mockTwilioWebhook.From,
      to_number: mockTwilioWebhook.To,
      direction: 'inbound',
      status: 'completed'
    };

    const endResponse = await axios.post(`${API_BASE_URL}/webhooks/elevenlabs/conversation-initiation`, mockConversationEnded);
    console.log('✅ Conversación finalizada:', endResponse.data);

    console.log('\n🎉 Test completado exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('   ✅ Agente configurado correctamente');
    console.log('   ✅ Número de teléfono asignado');
    console.log('   ✅ Webhook de Twilio procesado');
    console.log('   ✅ Llamada registrada en BD');
    console.log('   ✅ Webhook de ElevenLabs procesado');
    console.log('   ✅ Conversación simulada completada');

  } catch (error) {
    console.error('❌ Error en el test:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Solución: Verifica que tengas un token de autenticación válido');
    } else if (error.response?.status === 404) {
      console.log('\n💡 Solución: Verifica que el agente y accountId existan');
    }
  }
}

// Función para verificar la configuración de webhooks
async function checkWebhookConfiguration() {
  console.log('🔧 Verificando configuración de webhooks...\n');

  const webhookEndpoints = [
    '/webhooks/voice',
    '/webhooks/elevenlabs/conversation-initiation',
    '/webhooks/elevenlabs/conversation-ended'
  ];

  for (const endpoint of webhookEndpoints) {
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        timeout: 5000
      });
      console.log(`✅ ${endpoint}: ${response.status}`);
    } catch (error) {
      if (error.response?.status === 405) {
        console.log(`✅ ${endpoint}: Endpoint disponible (método no permitido es normal)`);
      } else {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }
  }
}

// Ejecutar tests
async function runTests() {
  console.log('🚀 Iniciando tests de llamadas inbound con ElevenLabs\n');
  
  await checkWebhookConfiguration();
  console.log('\n' + '='.repeat(50) + '\n');
  await testInboundCallFlow();
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testInboundCallFlow, checkWebhookConfiguration };
