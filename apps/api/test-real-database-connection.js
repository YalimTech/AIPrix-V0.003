/**
 * Test real con conexión a la base de datos usando .env de la raíz
 */

const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

// Cargar variables de entorno desde .env de la raíz del proyecto
const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
  
  console.log('✅ Variables de entorno cargadas desde .env');
} else {
  console.log('❌ Archivo .env no encontrado en la raíz del proyecto');
  process.exit(1);
}

const prisma = new PrismaClient();

async function testRealDatabaseConnection() {
  console.log('🧪 Test real de conexión a base de datos...\n');

  try {
    // Test 1: Verificar conexión a la base de datos
    console.log('1️⃣ Verificando conexión a la base de datos...');
    const accounts = await prisma.account.findMany({ take: 1 });
    console.log(`✅ Conexión exitosa - Encontradas ${accounts.length} cuentas`);

    // Test 2: Verificar credenciales de Twilio en la base de datos
    console.log('\n2️⃣ Verificando credenciales de Twilio...');
    const twilioConfigs = await prisma.accountTwilioConfig.findMany({
      take: 3,
      select: {
        accountId: true,
        accountSid: true,
        status: true,
        createdAt: true
      }
    });

    if (twilioConfigs.length === 0) {
      console.log('❌ No hay configuraciones de Twilio en la base de datos');
      return;
    }

    console.log(`✅ Encontradas ${twilioConfigs.length} configuraciones de Twilio:`);
    twilioConfigs.forEach((config, index) => {
      console.log(`   ${index + 1}. Account: ${config.accountId} | Status: ${config.status} | SID: ${config.accountSid?.substring(0, 10)}...`);
    });

    // Test 3: Verificar credenciales de ElevenLabs
    console.log('\n3️⃣ Verificando credenciales de ElevenLabs...');
    const elevenLabsConfigs = await prisma.accountElevenLabsConfig.findMany({
      take: 3,
      select: {
        accountId: true,
        apiKey: true,
        status: true,
        createdAt: true
      }
    });

    if (elevenLabsConfigs.length === 0) {
      console.log('❌ No hay configuraciones de ElevenLabs en la base de datos');
      return;
    }

    console.log(`✅ Encontradas ${elevenLabsConfigs.length} configuraciones de ElevenLabs:`);
    elevenLabsConfigs.forEach((config, index) => {
      console.log(`   ${index + 1}. Account: ${config.accountId} | Status: ${config.status} | API Key: ${config.apiKey ? 'Configurada' : 'No configurada'}`);
    });

    // Test 4: Verificar agentes inbound
    console.log('\n4️⃣ Verificando agentes inbound...');
    const inboundAgents = await prisma.agent.findMany({
      where: {
        type: 'inbound'
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        elevenLabsAgentId: true,
        accountId: true,
        status: true
      },
      take: 5
    });

    console.log(`✅ Encontrados ${inboundAgents.length} agentes inbound:`);
    inboundAgents.forEach((agent, index) => {
      console.log(`   ${index + 1}. ${agent.name} | Tel: ${agent.phoneNumber || 'NO ASIGNADO'} | ElevenLabs: ${agent.elevenLabsAgentId ? 'Configurado' : 'NO CONFIGURADO'}`);
    });

    // Test 5: Verificar números de teléfono
    console.log('\n5️⃣ Verificando números de teléfono...');
    const phoneNumbers = await prisma.phoneNumber.findMany({
      where: {
        status: 'active'
      },
      select: {
        id: true,
        number: true,
        country: true,
        status: true,
        accountId: true
      },
      take: 5
    });

    console.log(`✅ Encontrados ${phoneNumbers.length} números de teléfono activos:`);
    phoneNumbers.forEach((phone, index) => {
      console.log(`   ${index + 1}. ${phone.number} | País: ${phone.country} | Account: ${phone.accountId}`);
    });

    // Test 6: Verificar llamadas recientes
    console.log('\n6️⃣ Verificando llamadas recientes...');
    const recentCalls = await prisma.call.findMany({
      where: {
        direction: 'inbound',
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
        }
      },
      select: {
        id: true,
        direction: true,
        status: true,
        phoneNumber: true,
        createdAt: true,
        agent: {
          select: {
            name: true,
            phoneNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    if (recentCalls.length === 0) {
      console.log('ℹ️  No hay llamadas inbound en los últimos 7 días');
    } else {
      console.log(`✅ Encontradas ${recentCalls.length} llamadas inbound recientes:`);
      recentCalls.forEach((call, index) => {
        console.log(`   ${index + 1}. ${call.phoneNumber} → ${call.agent?.name} | Status: ${call.status} | ${call.createdAt.toISOString()}`);
      });
    }

    // Test 7: Verificar configuración completa para llamadas inbound
    console.log('\n7️⃣ Verificando configuración completa...');
    const completeAgents = await prisma.agent.findMany({
      where: {
        type: 'inbound',
        phoneNumber: { not: null },
        elevenLabsAgentId: { not: null }
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        elevenLabsAgentId: true,
        accountId: true,
        status: true
      }
    });

    if (completeAgents.length === 0) {
      console.log('❌ No hay agentes inbound completamente configurados');
      console.log('\n💡 Para configurar un agente inbound:');
      console.log('   1. Crea un agente de tipo "inbound"');
      console.log('   2. Asigna un número de teléfono usando /phone-assignment/assign');
      console.log('   3. Configura elevenLabsAgentId en el agente');
    } else {
      console.log(`✅ Encontrados ${completeAgents.length} agentes inbound completamente configurados:`);
      completeAgents.forEach((agent, index) => {
        console.log(`   ${index + 1}. ${agent.name} | Tel: ${agent.phoneNumber} | ElevenLabs: ${agent.elevenLabsAgentId?.substring(0, 10)}...`);
      });
    }

    // Resumen final
    console.log('\n📋 RESUMEN DE CONFIGURACIÓN:');
    console.log('='.repeat(50));
    console.log(`✅ Configuraciones de Twilio: ${twilioConfigs.length}`);
    console.log(`✅ Configuraciones de ElevenLabs: ${elevenLabsConfigs.length}`);
    console.log(`✅ Agentes inbound: ${inboundAgents.length}`);
    console.log(`✅ Números de teléfono activos: ${phoneNumbers.length}`);
    console.log(`✅ Agentes completamente configurados: ${completeAgents.length}`);
    console.log(`✅ Llamadas inbound recientes: ${recentCalls.length}`);

    if (completeAgents.length > 0) {
      console.log('\n🎉 ¡CONFIGURACIÓN COMPLETA PARA LLAMADAS INBOUND!');
      console.log('\n🧪 Para probar llamadas inbound:');
      console.log('1. Asegúrate de que el servidor esté corriendo: npm run start:dev');
      console.log('2. Configura el webhook de Twilio en tu cuenta de Twilio:');
      console.log(`   URL: ${process.env.API_BASE_URL || 'https://api.prixcenter.com'}/webhooks/voice`);
      console.log('3. Llama a uno de los números asignados:');
      completeAgents.forEach(agent => {
        console.log(`   - ${agent.phoneNumber} (${agent.name})`);
      });
      console.log('4. Verifica los logs del servidor para ver el procesamiento');
      console.log('5. Revisa la base de datos para ver el registro de la llamada');
    } else {
      console.log('\n⚠️  CONFIGURACIÓN INCOMPLETA');
      console.log('❌ Necesitas configurar al menos un agente inbound completo');
    }

  } catch (error) {
    console.error('❌ Error en el test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar test
testRealDatabaseConnection().catch(console.error);
