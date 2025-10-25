/**
 * Test real para verificar llamadas inbound con credenciales de la base de datos
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRealInboundSetup() {
  console.log('🧪 Test real de configuración de llamadas inbound...\n');

  try {
    // 1. Verificar credenciales de Twilio en la base de datos
    console.log('1️⃣ Verificando credenciales de Twilio...');
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

    // 2. Verificar credenciales de ElevenLabs
    console.log('\n2️⃣ Verificando credenciales de ElevenLabs...');
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

    // 3. Verificar agentes inbound con números asignados
    console.log('\n3️⃣ Verificando agentes inbound con números asignados...');
    const inboundAgents = await prisma.agent.findMany({
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

    if (inboundAgents.length === 0) {
      console.log('❌ No hay agentes inbound con números asignados y elevenLabsAgentId');
      console.log('\n💡 Para configurar un agente inbound:');
      console.log('   1. Crea un agente de tipo "inbound"');
      console.log('   2. Asigna un número de teléfono usando /phone-assignment/assign');
      console.log('   3. Configura elevenLabsAgentId en el agente');
      return;
    }

    console.log(`✅ Encontrados ${inboundAgents.length} agentes inbound configurados:`);
    inboundAgents.forEach((agent, index) => {
      console.log(`   ${index + 1}. ${agent.name} | Tel: ${agent.phoneNumber} | ElevenLabs: ${agent.elevenLabsAgentId?.substring(0, 10)}...`);
    });

    // 4. Verificar números de teléfono disponibles
    console.log('\n4️⃣ Verificando números de teléfono disponibles...');
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

    if (phoneNumbers.length === 0) {
      console.log('❌ No hay números de teléfono activos en la base de datos');
      return;
    }

    console.log(`✅ Encontrados ${phoneNumbers.length} números de teléfono activos:`);
    phoneNumbers.forEach((phone, index) => {
      console.log(`   ${index + 1}. ${phone.number} | País: ${phone.country} | Account: ${phone.accountId}`);
    });

    // 5. Verificar llamadas recientes
    console.log('\n5️⃣ Verificando llamadas recientes...');
    const recentCalls = await prisma.call.findMany({
      where: {
        direction: 'inbound',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
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
      console.log('ℹ️  No hay llamadas inbound en las últimas 24 horas');
    } else {
      console.log(`✅ Encontradas ${recentCalls.length} llamadas inbound recientes:`);
      recentCalls.forEach((call, index) => {
        console.log(`   ${index + 1}. ${call.phoneNumber} → ${call.agent?.name} | Status: ${call.status} | ${call.createdAt.toISOString()}`);
      });
    }

    // 6. Resumen de configuración
    console.log('\n📋 Resumen de configuración:');
    console.log('='.repeat(50));
    console.log(`✅ Configuraciones de Twilio: ${twilioConfigs.length}`);
    console.log(`✅ Configuraciones de ElevenLabs: ${elevenLabsConfigs.length}`);
    console.log(`✅ Agentes inbound configurados: ${inboundAgents.length}`);
    console.log(`✅ Números de teléfono activos: ${phoneNumbers.length}`);
    console.log(`✅ Llamadas inbound recientes: ${recentCalls.length}`);

    // 7. Instrucciones para testing
    console.log('\n🧪 Para probar llamadas inbound:');
    console.log('1. Asegúrate de que el servidor esté corriendo: npm run start:dev');
    console.log('2. Configura el webhook de Twilio en tu cuenta de Twilio:');
    console.log(`   URL: ${process.env.API_BASE_URL || 'https://api.prixcenter.com'}/webhooks/voice`);
    console.log('3. Llama a uno de los números asignados:');
    inboundAgents.forEach(agent => {
      console.log(`   - ${agent.phoneNumber} (${agent.name})`);
    });
    console.log('4. Verifica los logs del servidor para ver el procesamiento');
    console.log('5. Revisa la base de datos para ver el registro de la llamada');

    console.log('\n🎉 ¡Configuración verificada exitosamente!');

  } catch (error) {
    console.error('❌ Error verificando configuración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar test
testRealInboundSetup().catch(console.error);
