// Script para probar la sincronización desde el frontend
import { apiClient } from '../lib/api';

export async function testSyncFromFrontend() {
  console.log('🧪 Probando sincronización desde el frontend...\n');

  try {
    // 1. Verificar que el usuario esté autenticado
    const token = localStorage.getItem('auth_token');
    const accountId = localStorage.getItem('accountId');

    if (!token || !accountId) {
      console.log('❌ Usuario no autenticado');
      return;
    }

    console.log(`✅ Usuario autenticado: ${accountId}`);

    // 2. Configurar headers de autenticación
    apiClient.setAuthToken(token);
    apiClient.setAccountId(accountId);

    // 3. Probar endpoint de diagnósticos primero
    console.log('\n🔍 Probando endpoint de diagnósticos...');
    try {
      const diagnostics = await apiClient.get('/agents/diagnostics');
      console.log('✅ Diagnósticos obtenidos:', diagnostics);
    } catch (error) {
      console.log('❌ Error en diagnósticos:', error);
    }

    // 4. Probar endpoint de sincronización
    console.log('\n🔄 Probando endpoint de sincronización...');
    try {
      const syncResult = await apiClient.post('/agents/sync-elevenlabs');
      console.log('✅ Sincronización exitosa:', syncResult);
    } catch (error) {
      console.log('❌ Error en sincronización:', error);
    }

    // 5. Verificar agentes después de la sincronización
    console.log('\n📋 Verificando agentes después de sincronización...');
    try {
      const agents = await apiClient.get('/agents');
      console.log(`✅ Agentes obtenidos: ${agents.length}`);
      agents.forEach((agent, index) => {
        console.log(`   ${index + 1}. ${agent.name}`);
        console.log(`      - ID Local: ${agent.id}`);
        console.log(`      - ElevenLabs ID: ${agent.elevenLabsAgentId || 'No sincronizado'}`);
      });
    } catch (error) {
      console.log('❌ Error obteniendo agentes:', error);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Función para ejecutar desde la consola del navegador
window.testSyncFromFrontend = testSyncFromFrontend;
