/**
 * Script para verificar que la configuración de llamadas inbound esté correcta
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de llamadas inbound con ElevenLabs...\n');

// 1. Verificar que los archivos necesarios existan
const requiredFiles = [
  'src/webhooks/webhooks.service.ts',
  'src/integrations/twilio/twilio-webhooks.controller.ts',
  'src/integrations/elevenlabs/elevenlabs-webhook.controller.ts',
  'src/services/phone-assignment.service.ts',
  'src/controllers/phone-assignment.controller.ts'
];

console.log('1️⃣ Verificando archivos necesarios...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NO ENCONTRADO`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Faltan archivos necesarios para las llamadas inbound');
  process.exit(1);
}

// 2. Verificar configuración del webhook de Twilio
console.log('\n2️⃣ Verificando configuración del webhook de Twilio...');
const twilioWebhookPath = path.join(__dirname, 'src/integrations/twilio/twilio-webhooks.controller.ts');
const twilioWebhookContent = fs.readFileSync(twilioWebhookPath, 'utf8');

if (twilioWebhookContent.includes('WebhooksService')) {
  console.log('✅ Webhook de Twilio conectado con WebhooksService');
} else {
  console.log('❌ Webhook de Twilio NO conectado con WebhooksService');
}

if (twilioWebhookContent.includes('processTwilioVoiceWebhook')) {
  console.log('✅ Webhook de Twilio procesa llamadas de voz');
} else {
  console.log('❌ Webhook de Twilio NO procesa llamadas de voz');
}

// 3. Verificar configuración del webhook de ElevenLabs
console.log('\n3️⃣ Verificando configuración del webhook de ElevenLabs...');
const elevenLabsWebhookPath = path.join(__dirname, 'src/integrations/elevenlabs/elevenlabs-webhook.controller.ts');
const elevenLabsWebhookContent = fs.readFileSync(elevenLabsWebhookPath, 'utf8');

if (elevenLabsWebhookContent.includes('conversation-initiation')) {
  console.log('✅ Webhook de ElevenLabs maneja iniciación de conversación');
} else {
  console.log('❌ Webhook de ElevenLabs NO maneja iniciación de conversación');
}

// 4. Verificar servicio de asignación de números
console.log('\n4️⃣ Verificando servicio de asignación de números...');
const phoneAssignmentPath = path.join(__dirname, 'src/services/phone-assignment.service.ts');
const phoneAssignmentContent = fs.readFileSync(phoneAssignmentPath, 'utf8');

if (phoneAssignmentContent.includes('assignPhoneToAgent')) {
  console.log('✅ Servicio de asignación implementado');
} else {
  console.log('❌ Servicio de asignación NO implementado');
}

if (phoneAssignmentContent.includes('type: \'inbound\'')) {
  console.log('✅ Solo agentes inbound pueden tener números asignados');
} else {
  console.log('❌ NO se restringe a agentes inbound');
}

// 5. Verificar flujo de llamadas inbound
console.log('\n5️⃣ Verificando flujo de llamadas inbound...');
const webhooksServicePath = path.join(__dirname, 'src/webhooks/webhooks.service.ts');
const webhooksServiceContent = fs.readFileSync(webhooksServicePath, 'utf8');

if (webhooksServiceContent.includes('phoneNumber: toNumber')) {
  console.log('✅ Busca agente por número de teléfono');
} else {
  console.log('❌ NO busca agente por número de teléfono');
}

if (webhooksServiceContent.includes('elevenLabsAgentId')) {
  console.log('✅ Verifica elevenLabsAgentId del agente');
} else {
  console.log('❌ NO verifica elevenLabsAgentId del agente');
}

if (webhooksServiceContent.includes('generateElevenLabsInboundTwiML')) {
  console.log('✅ Genera TwiML para ElevenLabs');
} else {
  console.log('❌ NO genera TwiML para ElevenLabs');
}

// 6. Verificar configuración de TwiML
console.log('\n6️⃣ Verificando configuración de TwiML...');
if (webhooksServiceContent.includes('conversation-initiation')) {
  console.log('✅ TwiML redirige a webhook de ElevenLabs');
} else {
  console.log('❌ TwiML NO redirige a webhook de ElevenLabs');
}

if (webhooksServiceContent.includes('caller_id') && webhooksServiceContent.includes('agent_id')) {
  console.log('✅ TwiML incluye parámetros requeridos por ElevenLabs');
} else {
  console.log('❌ TwiML NO incluye parámetros requeridos por ElevenLabs');
}

// 7. Resumen
console.log('\n📋 Resumen de configuración:');
console.log('='.repeat(50));

const checks = [
  { name: 'Archivos necesarios', status: allFilesExist },
  { name: 'Webhook Twilio conectado', status: twilioWebhookContent.includes('WebhooksService') },
  { name: 'Webhook ElevenLabs configurado', status: elevenLabsWebhookContent.includes('conversation-initiation') },
  { name: 'Asignación de números', status: phoneAssignmentContent.includes('assignPhoneToAgent') },
  { name: 'Flujo inbound', status: webhooksServiceContent.includes('phoneNumber: toNumber') },
  { name: 'TwiML ElevenLabs', status: webhooksServiceContent.includes('generateElevenLabsInboundTwiML') }
];

let passedChecks = 0;
checks.forEach(check => {
  const status = check.status ? '✅' : '❌';
  console.log(`${status} ${check.name}`);
  if (check.status) passedChecks++;
});

console.log('\n' + '='.repeat(50));
console.log(`📊 Resultado: ${passedChecks}/${checks.length} verificaciones pasaron`);

if (passedChecks === checks.length) {
  console.log('\n🎉 ¡Configuración de llamadas inbound COMPLETA!');
  console.log('\n📝 Próximos pasos:');
  console.log('1. Asegúrate de que el servidor esté corriendo');
  console.log('2. Configura las credenciales de Twilio en la base de datos');
  console.log('3. Asigna un número de teléfono a un agente inbound');
  console.log('4. Verifica que el agente tenga elevenLabsAgentId configurado');
  console.log('5. Haz una llamada de prueba al número asignado');
} else {
  console.log('\n⚠️  Configuración INCOMPLETA - Revisa los elementos marcados con ❌');
}

console.log('\n🔗 URLs importantes:');
console.log('- Webhook de Twilio: POST /webhooks/voice');
console.log('- Webhook de ElevenLabs: POST /webhooks/elevenlabs/conversation-initiation');
console.log('- Asignar número: POST /phone-assignment/assign');
console.log('- Obtener agentes: GET /phone-assignment/inbound-agents');
