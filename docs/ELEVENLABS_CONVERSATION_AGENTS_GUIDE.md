# Guía de Agentes de Conversación de ElevenLabs

## 📋 **Resumen**

Los **agentes de conversación de ElevenLabs** son el componente más crítico de PrixAgent. Permiten realizar llamadas telefónicas automáticas con conversaciones naturales que suenan como humanos reales.

## 🎯 **Características Principales**

### ✅ **Funcionalidades Implementadas**

1. **Agentes de Conversación Nativos**
   - Creación de agentes directamente en ElevenLabs
   - Configuración de voces personalizadas
   - Gestión de conversaciones en tiempo real

2. **Integración con Twilio**
   - Conexión directa entre llamadas de Twilio y agentes de ElevenLabs
   - Manejo automático de transcripciones
   - Grabación y análisis de conversaciones

3. **Configuraciones Optimizadas**
   - Voces optimizadas para llamadas telefónicas
   - Parámetros de calidad ajustados para conversaciones naturales
   - Soporte multilingüe

## 🔧 **Configuración de Agentes**

### **Crear un Agente de ElevenLabs**

```typescript
// Endpoint: POST /agents/:id/create-elevenlabs-agent
{
  "voiceId": "alloy", // ID de la voz en ElevenLabs
  "language": "es", // Idioma de la conversación
  "conversationConfig": {
    "maxDuration": 300, // Duración máxima en segundos
    "endCallPhrases": ["gracias", "hasta luego", "adiós"],
    "interruptionThreshold": 0.5 // Umbral de interrupción
  }
}
```

### **Configuraciones de Voz Optimizadas**

```typescript
voiceSettings: {
  stability: 0.8,        // Máxima estabilidad para llamadas telefónicas
  similarityBoost: 0.85, // Máxima similitud para mantener características
  style: 0.5,           // Más expresivo para conversaciones naturales
  useSpeakerBoost: true // Mejorar claridad en llamadas telefónicas
}
```

## 🚀 **Flujo de Conversación**

### **1. Inicio de Llamada**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│ Cliente recibe  │───▶│ Twilio conecta   │───▶│ Verificar agente    │
│ llamada         │    │ con webhook      │    │ en base de datos    │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────────┐
                                               │ ¿Tiene              │
                                               │ elevenLabsAgentId?  │
                                               └─────────────────────┘
                                                         │
                                    ┌────────────────────┼────────────────────┐
                                    │                    │                    │
                                    ▼                    ▼                    ▼
                          ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
                          │ Iniciar         │  │ Usar fallback   │  │ Agente maneja   │
                          │ conversación    │  │ con             │  │ conversación    │
                          │ con ElevenLabs  │  │ generateSpeech  │  │ automáticamente │
                          └─────────────────┘  └─────────────────┘  └─────────────────┘
                                    │                    │                    │
                                    ▼                    ▼                    ▼
                          ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
                          │ Conversación    │  │ Generar         │  │ Transcripción   │
                          │ fluida y        │  │ respuesta con   │  │ y análisis      │
                          │ natural         │  │ IA + TTS        │  │ automático      │
                          └─────────────────┘  └─────────────────┘  └─────────────────┘
```

### **2. Procesamiento en Tiempo Real**
- **Transcripción automática** del cliente
- **Generación de respuesta** con IA
- **Síntesis de voz** con ElevenLabs
- **Reproducción** en la llamada

## 📊 **Monitoreo y Analytics**

### **Métricas Disponibles**
- Total de conversaciones
- Conversaciones activas
- Duración promedio
- Tasa de éxito
- Minutos totales
- Costo por conversación

### **Endpoints de Monitoreo**
```bash
# Obtener analíticas
GET /integrations/elevenlabs/analytics?agentId=xxx

# Conversaciones recientes
GET /integrations/elevenlabs/conversations/recent

# Estado del agente
GET /agents/:id/elevenlabs-status
```

## 🔐 **Configuración de Seguridad**

### **Variables de Entorno Requeridas**
```bash
ELEVENLABS_API_KEY=tu_api_key_aqui
APP_URL=https://tu-dominio.com
```

### **Webhooks Configurados**
- `/webhooks/elevenlabs` - Eventos de conversación
- `/webhooks/twilio/voice` - Eventos de llamada
- `/webhooks/twilio/recording` - Grabaciones

## 🛠️ **Troubleshooting**

### **Problemas Comunes**

1. **Agente no responde**
   - Verificar `elevenLabsAgentId` en la base de datos
   - Comprobar estado del agente en ElevenLabs
   - Revisar logs de webhooks

2. **Calidad de audio baja**
   - Ajustar `voiceSettings` para mayor estabilidad
   - Verificar formato de audio (`mp3_44100_128`)
   - Comprobar conexión de red

3. **Latencia alta**
   - Usar `optimizeStreamingLatency: 2`
   - Verificar ubicación del servidor
   - Optimizar configuración de Twilio

### **Logs Importantes**
```bash
# Inicio de conversación
"Conversación iniciada: {callId}"

# Error en agente
"Error procesando respuesta de agente: {error}"

# Sincronización exitosa
"Agente sincronizado: ElevenLabs ID {id} -> Database ID {id}"
```

## 📈 **Mejores Prácticas**

### **Para Conversaciones Naturales**
1. **Usar voces apropiadas** para el contexto
2. **Configurar frases de finalización** naturales
3. **Ajustar umbral de interrupción** según el tipo de cliente
4. **Monitorear métricas** de calidad regularmente

### **Para Optimización de Costos**
1. **Configurar duración máxima** de conversaciones
2. **Usar detección de máquinas** de Twilio
3. **Implementar límites** de uso por cuenta
4. **Monitorear costos** en tiempo real

## 🔄 **Actualizaciones Futuras**

### **Próximas Funcionalidades**
- [ ] Soporte para múltiples idiomas simultáneos
- [ ] Integración con CRM automática
- [ ] Análisis de sentimientos en tiempo real
- [ ] Personalización de voces por cliente
- [ ] Dashboard de métricas avanzadas

---

**Nota**: Esta implementación utiliza la API oficial de ElevenLabs 2025 y sigue las mejores prácticas de la documentación oficial.
