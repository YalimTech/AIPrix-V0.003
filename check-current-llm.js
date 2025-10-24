import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCurrentLLM() {
  try {
    console.log('🧪 Verificando qué LLM están usando nuestros agentes...');
    
    // 1. Obtener configuración de ElevenLabs
    const config = await prisma.accountElevenLabsConfig.findFirst({
      include: {
        account: true
      }
    });
    
    if (!config || !config.apiKey) {
      console.log('❌ No se encontró API Key de ElevenLabs');
      return;
    }
    
    console.log(`✅ API Key encontrada para: ${config.account.email}`);
    
    // 2. Obtener agentes existentes
    console.log('\n2️⃣ Obteniendo agentes existentes...');
    
    const agentsResponse = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
      headers: {
        'xi-api-key': config.apiKey,
      },
    });
    
    if (!agentsResponse.ok) {
      console.log('❌ Error al obtener agentes');
      return;
    }
    
    const agents = await agentsResponse.json();
    console.log(`✅ Se encontraron ${agents.agents?.length || 0} agentes existentes`);
    
    if (agents.agents && agents.agents.length > 0) {
      console.log('\n3️⃣ Analizando LLM de cada agente:');
      
      for (let i = 0; i < Math.min(5, agents.agents.length); i++) {
        const agent = agents.agents[i];
        console.log(`\n   Agente ${i + 1}: ${agent.name}`);
        console.log(`   - Agent ID: ${agent.agent_id}`);
        
        // Obtener detalles del agente
        const agentDetailsResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agent.agent_id}`, {
          headers: {
            'xi-api-key': config.apiKey,
          },
        });
        
        if (agentDetailsResponse.ok) {
          const agentDetails = await agentDetailsResponse.json();
          const llm = agentDetails.conversation_config?.agent?.prompt?.llm;
          const temperature = agentDetails.conversation_config?.agent?.prompt?.temperature;
          const maxTokens = agentDetails.conversation_config?.agent?.prompt?.max_tokens;
          const reasoningEffort = agentDetails.conversation_config?.agent?.prompt?.reasoning_effort;
          const thinkingBudget = agentDetails.conversation_config?.agent?.prompt?.thinking_budget;
          
          console.log(`   - LLM: ${llm || 'No especificado'}`);
          console.log(`   - Temperature: ${temperature}`);
          console.log(`   - Max Tokens: ${maxTokens}`);
          console.log(`   - Reasoning Effort: ${reasoningEffort}`);
          console.log(`   - Thinking Budget: ${thinkingBudget}`);
          
          // Verificar si tiene herramientas
          const tools = agentDetails.conversation_config?.agent?.prompt?.tools;
          const builtInTools = agentDetails.conversation_config?.agent?.prompt?.built_in_tools;
          console.log(`   - Tools: ${tools?.length || 0} herramientas personalizadas`);
          console.log(`   - Built-in Tools: ${Object.keys(builtInTools || {}).length} herramientas integradas`);
          
          // Mostrar herramientas integradas activas
          if (builtInTools) {
            const activeTools = Object.entries(builtInTools).filter(([key, value]) => value !== null);
            if (activeTools.length > 0) {
              console.log(`   - Herramientas activas: ${activeTools.map(([key]) => key).join(', ')}`);
            }
          }
        } else {
          console.log(`   ❌ Error al obtener detalles del agente`);
        }
      }
      
      // 4. Mostrar resumen de LLMs utilizados
      console.log('\n4️⃣ Resumen de LLMs utilizados:');
      const llmCounts = {};
      
      for (const agent of agents.agents) {
        const agentDetailsResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agent.agent_id}`, {
          headers: {
            'xi-api-key': config.apiKey,
          },
        });
        
        if (agentDetailsResponse.ok) {
          const agentDetails = await agentDetailsResponse.json();
          const llm = agentDetails.conversation_config?.agent?.prompt?.llm || 'No especificado';
          llmCounts[llm] = (llmCounts[llm] || 0) + 1;
        }
      }
      
      for (const [llm, count] of Object.entries(llmCounts)) {
        console.log(`   - ${llm}: ${count} agentes`);
      }
      
      // 5. Verificar qué LLMs están disponibles
      console.log('\n5️⃣ LLMs disponibles en ElevenLabs:');
      console.log('   - gemini-2.0-flash: Modelo rápido de Google');
      console.log('   - gpt-4o-mini: Modelo eficiente de OpenAI');
      console.log('   - gpt-4o: Modelo avanzado de OpenAI');
      console.log('   - claude-3-5-sonnet: Modelo de Anthropic');
      console.log('   - claude-3-5-haiku: Modelo rápido de Anthropic');
      
      // 6. Recomendaciones
      console.log('\n6️⃣ Recomendaciones:');
      console.log('   - Para agentes en español: gemini-2.0-flash (actual)');
      console.log('   - Para máxima calidad: gpt-4o');
      console.log('   - Para velocidad: gpt-4o-mini');
      console.log('   - Para análisis complejo: claude-3-5-sonnet');
      
    } else {
      console.log('❌ No se encontraron agentes');
    }
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentLLM();
