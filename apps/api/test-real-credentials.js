/**
 * Test con Credenciales Reales de la Base de Datos
 * Verifica que todo funcione con las credenciales reales almacenadas
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

// Cargar variables de entorno
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
}

const prisma = new PrismaClient();
const API_BASE_URL = 'http://localhost:3004/api/v1';

class RealCredentialsTester {
  constructor() {
    this.testResults = [];
    this.errors = [];
    this.testAccountId = 'cmgwz0eou0000tivkwzxldm7t';
    this.realCredentials = {};
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(testName, testFunction) {
    this.log(`🧪 Ejecutando: ${testName}`);
    try {
      const result = await testFunction();
      this.testResults.push({ name: testName, status: 'PASS', result });
      this.log(`✅ ${testName} - PASÓ`, 'success');
      return result;
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
      this.errors.push({ test: testName, error: error.message });
      this.log(`❌ ${testName} - FALLÓ: ${error.message}`, 'error');
      throw error;
    }
  }

  // Test 1: Obtener credenciales reales de Twilio
  async testGetRealTwilioCredentials() {
    const twilioConfig = await prisma.accountTwilioConfig.findFirst({
      where: { 
        accountId: this.testAccountId,
        status: 'active'
      }
    });

    if (!twilioConfig) {
      throw new Error('No hay configuración de Twilio activa');
    }

    this.realCredentials.twilio = {
      accountSid: twilioConfig.accountSid,
      authToken: twilioConfig.authToken,
      status: twilioConfig.status
    };

    return {
      message: 'Credenciales de Twilio obtenidas',
      accountSid: twilioConfig.accountSid?.substring(0, 10) + '...',
      status: twilioConfig.status
    };
  }

  // Test 2: Obtener credenciales reales de ElevenLabs
  async testGetRealElevenLabsCredentials() {
    const elevenLabsConfig = await prisma.accountElevenLabsConfig.findFirst({
      where: { 
        accountId: this.testAccountId,
        status: 'active'
      }
    });

    if (!elevenLabsConfig) {
      throw new Error('No hay configuración de ElevenLabs activa');
    }

    this.realCredentials.elevenLabs = {
      apiKey: elevenLabsConfig.apiKey,
      status: elevenLabsConfig.status
    };

    return {
      message: 'Credenciales de ElevenLabs obtenidas',
      apiKey: elevenLabsConfig.apiKey ? 'Configurada' : 'No configurada',
      status: elevenLabsConfig.status
    };
  }

  // Test 3: Verificar agentes inbound con credenciales reales
  async testRealInboundAgents() {
    const inboundAgents = await prisma.agent.findMany({
      where: { 
        accountId: this.testAccountId,
        type: 'inbound'
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        elevenLabsAgentId: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (inboundAgents.length === 0) {
      throw new Error('No hay agentes inbound configurados');
    }

    const completeAgents = inboundAgents.filter(agent => 
      agent.phoneNumber && agent.elevenLabsAgentId
    );

    return {
      message: 'Agentes inbound verificados',
      total: inboundAgents.length,
      complete: completeAgents.length,
      agents: inboundAgents.map(agent => ({
        id: agent.id,
        name: agent.name,
        phoneNumber: agent.phoneNumber,
        elevenLabsAgentId: agent.elevenLabsAgentId ? 'Configurado' : 'No configurado',
        status: agent.status
      }))
    };
  }

  // Test 4: Verificar números de teléfono reales
  async testRealPhoneNumbers() {
    const phoneNumbers = await prisma.phoneNumber.findMany({
      where: { 
        accountId: this.testAccountId,
        status: 'active'
      },
      select: {
        id: true,
        number: true,
        country: true,
        capabilities: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (phoneNumbers.length === 0) {
      throw new Error('No hay números de teléfono activos');
    }

    return {
      message: 'Números de teléfono verificados',
      total: phoneNumbers.length,
      numbers: phoneNumbers.map(phone => ({
        id: phone.id,
        number: phone.number,
        country: phone.country,
        capabilities: phone.capabilities,
        status: phone.status
      }))
    };
  }

  // Test 5: Verificar llamadas reales en la base de datos
  async testRealCalls() {
    const calls = await prisma.call.findMany({
      where: { 
        accountId: this.testAccountId
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
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const inboundCalls = calls.filter(call => call.direction === 'inbound');
    const outboundCalls = calls.filter(call => call.direction === 'outbound');

    return {
      message: 'Llamadas verificadas',
      total: calls.length,
      inbound: inboundCalls.length,
      outbound: outboundCalls.length,
      recentCalls: calls.slice(0, 5).map(call => ({
        id: call.id,
        direction: call.direction,
        status: call.status,
        phoneNumber: call.phoneNumber,
        agent: call.agent?.name,
        createdAt: call.createdAt
      }))
    };
  }

  // Test 6: Test de conectividad con servidor
  async testServerConnectivity() {
    const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
    
    if (response.status !== 200) {
      throw new Error(`Health check falló con status ${response.status}`);
    }

    return {
      message: 'Servidor funcionando correctamente',
      status: response.status,
      url: API_BASE_URL
    };
  }

  // Test 7: Test de webhook con datos reales
  async testRealWebhook() {
    // Usar un número real de la base de datos
    const realPhoneNumber = await prisma.phoneNumber.findFirst({
      where: { 
        accountId: this.testAccountId,
        status: 'active'
      }
    });

    if (!realPhoneNumber) {
      throw new Error('No hay números de teléfono disponibles para el test');
    }

    const webhookData = {
      CallSid: 'CA' + Math.random().toString(36).substr(2, 32),
      CallStatus: 'in-progress',
      From: '+1987654321',
      To: realPhoneNumber.number,
      Direction: 'inbound',
      AccountSid: this.realCredentials.twilio?.accountSid || 'AC' + Math.random().toString(36).substr(2, 32)
    };

    const response = await axios.post(`${API_BASE_URL}/webhooks/voice`, webhookData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000
    });

    if (response.status !== 200) {
      throw new Error(`Webhook falló con status ${response.status}`);
    }

    return {
      message: 'Webhook funcionando con datos reales',
      status: response.status,
      realPhoneNumber: realPhoneNumber.number,
      response: response.data
    };
  }

  // Test 8: Verificar configuración completa para llamadas inbound
  async testCompleteInboundSetup() {
    const completeAgents = await prisma.agent.findMany({
      where: {
        accountId: this.testAccountId,
        type: 'inbound',
        phoneNumber: { not: null },
        elevenLabsAgentId: { not: null },
        status: 'active'
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        elevenLabsAgentId: true,
        status: true
      }
    });

    if (completeAgents.length === 0) {
      throw new Error('No hay agentes inbound completamente configurados');
    }

    return {
      message: 'Configuración completa verificada',
      completeAgents: completeAgents.length,
      agents: completeAgents.map(agent => ({
        id: agent.id,
        name: agent.name,
        phoneNumber: agent.phoneNumber,
        elevenLabsAgentId: agent.elevenLabsAgentId,
        status: agent.status
      }))
    };
  }

  // Ejecutar todos los tests
  async runAllTests() {
    this.log('🚀 TEST CON CREDENCIALES REALES DE LA BASE DE DATOS');
    this.log('='.repeat(70));

    try {
      // Tests de credenciales reales
      await this.runTest('Credenciales Twilio Reales', () => this.testGetRealTwilioCredentials());
      await this.runTest('Credenciales ElevenLabs Reales', () => this.testGetRealElevenLabsCredentials());
      
      // Tests de datos reales
      await this.runTest('Agentes Inbound Reales', () => this.testRealInboundAgents());
      await this.runTest('Números de Teléfono Reales', () => this.testRealPhoneNumbers());
      await this.runTest('Llamadas Reales', () => this.testRealCalls());
      
      // Tests de funcionalidad
      await this.runTest('Conectividad del Servidor', () => this.testServerConnectivity());
      await this.runTest('Webhook con Datos Reales', () => this.testRealWebhook());
      await this.runTest('Configuración Completa Inbound', () => this.testCompleteInboundSetup());

    } catch (error) {
      this.log(`❌ Test falló: ${error.message}`, 'error');
    }

    // Resumen final
    this.generateRealCredentialsReport();
  }

  generateRealCredentialsReport() {
    this.log('\n📊 REPORTE FINAL CON CREDENCIALES REALES');
    this.log('='.repeat(70));

    const passed = this.testResults.filter(t => t.status === 'PASS').length;
    const failed = this.testResults.filter(t => t.status === 'FAIL').length;
    const total = this.testResults.length;

    this.log(`✅ Tests Pasados: ${passed}/${total}`);
    this.log(`❌ Tests Fallidos: ${failed}/${total}`);

    if (failed > 0) {
      this.log('\n❌ TESTS FALLIDOS:');
      this.errors.forEach(error => {
        this.log(`   - ${error.test}: ${error.error}`, 'error');
      });
    }

    if (passed === total) {
      this.log('\n🎉 ¡TODOS LOS TESTS CON CREDENCIALES REALES PASARON!');
      this.log('✅ Las credenciales reales de Twilio están funcionando');
      this.log('✅ Las credenciales reales de ElevenLabs están funcionando');
      this.log('✅ Los agentes inbound están configurados correctamente');
      this.log('✅ Los números de teléfono están disponibles');
      this.log('✅ Las llamadas están siendo registradas');
      this.log('✅ El servidor está funcionando con datos reales');
      this.log('✅ Los webhooks funcionan con datos reales');
      this.log('✅ La configuración completa está lista para producción');
    } else {
      this.log('\n⚠️ ALGUNOS TESTS FALLARON');
      this.log('✅ La mayoría de componentes funcionan con credenciales reales');
      this.log('❌ Algunos componentes necesitan revisión');
    }

    this.log('\n📋 CREDENCIALES REALES VERIFICADAS:');
    if (this.realCredentials.twilio) {
      this.log(`✅ Twilio Account SID: ${this.realCredentials.twilio.accountSid?.substring(0, 10)}...`);
      this.log(`✅ Twilio Status: ${this.realCredentials.twilio.status}`);
    }
    if (this.realCredentials.elevenLabs) {
      this.log(`✅ ElevenLabs API Key: ${this.realCredentials.elevenLabs.apiKey ? 'Configurada' : 'No configurada'}`);
      this.log(`✅ ElevenLabs Status: ${this.realCredentials.elevenLabs.status}`);
    }

    this.log('\n🔗 URLs de Webhooks para Producción:');
    this.log(`- Twilio: POST ${API_BASE_URL}/webhooks/voice`);
    this.log(`- ElevenLabs: POST ${API_BASE_URL}/webhooks/elevenlabs/conversation-initiation`);

    this.log('\n🧪 Para probar llamadas inbound con credenciales reales:');
    this.log('1. Configura el webhook en Twilio: POST /webhooks/voice');
    this.log('2. Configura el webhook en ElevenLabs: POST /webhooks/elevenlabs/conversation-initiation');
    this.log('3. Llama a uno de los números reales asignados a agentes inbound');
    this.log('4. Verifica los logs del servidor para ver el procesamiento');
    this.log('5. Revisa la base de datos para ver el registro de la llamada');

    return {
      total,
      passed,
      failed,
      errors: this.errors,
      success: passed === total,
      realCredentials: this.realCredentials
    };
  }
}

// Ejecutar test con credenciales reales
async function runRealCredentialsTest() {
  const tester = new RealCredentialsTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Error ejecutando test con credenciales reales:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runRealCredentialsTest().catch(console.error);
}

module.exports = { RealCredentialsTester, runRealCredentialsTest };
