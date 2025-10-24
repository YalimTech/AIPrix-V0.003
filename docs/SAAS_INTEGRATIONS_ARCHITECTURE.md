# Arquitectura de Integraciones SaaS - PrixAgent

## Resumen de la Arquitectura

PrixAgent es una plataforma SaaS multi-tenant donde cada cliente puede configurar sus propias credenciales para Twilio y GoHighLevel, mientras que ElevenLabs usa una API key global del desarrollador.

## Configuración de Integraciones

### 1. ElevenLabs (Global - Desarrollador)
- **Ubicación**: Archivo `.env` en la raíz del proyecto
- **Propósito**: API key global del desarrollador para todos los clientes
- **Variable**: `ELEVENLABS_API_KEY=tu_api_key_aqui`
- **Verificación**: Se verifica una sola vez al inicializar el servicio

```env
# .env (Global)
ELEVENLABS_API_KEY=tu_api_key_del_desarrollador
```

### 2. Twilio (Por Cliente)
- **Ubicación**: Base de datos - tabla `AccountTwilioConfig`
- **Propósito**: Cada cliente configura sus propias credenciales de Twilio
- **Campos**: `accountSid`, `authToken`, `webhookUrl`
- **Verificación**: Se verifica por cada cliente al hacer llamadas

```typescript
// Estructura en base de datos
{
  accountId: "cliente_123",
  accountSid: "ACxxxxx",
  authToken: "xxxxx",
  webhookUrl: "https://tu-dominio.com/webhooks/twilio"
}
```

### 3. GoHighLevel (Por Cliente)
- **Ubicación**: Base de datos - tabla `AccountGhlConfig`
- **Propósito**: Cada cliente configura sus propias credenciales de GHL
- **Campos**: `apiKey`, `locationId`, `baseUrl`
- **Verificación**: Se verifica por cada cliente al sincronizar datos

```typescript
// Estructura en base de datos
{
  accountId: "cliente_123",
  apiKey: "ghl_api_key_del_cliente",
  locationId: "location_123",
  baseUrl: "https://rest.gohighlevel.com/v1"
}
```

## Flujo de Verificación de Estado

### Endpoint: `/api/v1/dashboard/integrations/status`

```typescript
{
  "status": {
    "twilio": false,        // ❌ Cliente no ha configurado sus credenciales
    "elevenLabs": false,    // ❌ Desarrollador no ha configurado API key global
    "goHighLevel": false    // ❌ Cliente no ha configurado sus credenciales
  },
  "lastChecked": "2025-10-09T16:49:38.611Z"
}
```

### Lógica de Verificación

1. **ElevenLabs**: 
   - Verifica si la API key global está configurada en `.env`
   - Hace una llamada de prueba a la API de ElevenLabs
   - Resultado: `true` si la API key funciona, `false` si no

2. **Twilio**:
   - Busca la configuración del cliente en `AccountTwilioConfig`
   - Intenta hacer una llamada de prueba con las credenciales del cliente
   - Resultado: `true` si las credenciales del cliente funcionan, `false` si no

3. **GoHighLevel**:
   - Busca la configuración del cliente en `AccountGhlConfig`
   - Intenta hacer una llamada de prueba con las credenciales del cliente
   - Resultado: `true` si las credenciales del cliente funcionan, `false` si no

## Configuración para Desarrolladores

### Para configurar ElevenLabs (Global):
1. Obtener API key de ElevenLabs
2. Agregar al archivo `.env`:
   ```
   ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxx
   ```
3. Reiniciar el servidor

### Para que los clientes configuren Twilio:
1. El cliente ingresa a su dashboard
2. Va a la sección de configuraciones/integraciones
3. Ingresa sus credenciales de Twilio:
   - Account SID
   - Auth Token
   - Webhook URL
4. El sistema guarda en `AccountTwilioConfig`

### Para que los clientes configuren GoHighLevel:
1. El cliente ingresa a su dashboard
2. Va a la sección de configuraciones/integraciones
3. Ingresa sus credenciales de GHL:
   - API Key
   - Location ID (opcional)
4. El sistema guarda en `AccountGhlConfig`

## Estado Actual del Sistema

- ✅ **Backend**: Verificación correcta implementada
- ✅ **Frontend**: Mock correcto para modo offline
- ✅ **Base de datos**: Estructura correcta para credenciales por cliente
- ❌ **ElevenLabs**: API key del desarrollador no configurada en `.env`
- ❌ **Twilio**: Clientes no han configurado sus credenciales
- ❌ **GoHighLevel**: Clientes no han configurado sus credenciales

## Próximos Pasos

1. **Configurar ElevenLabs**: Agregar API key del desarrollador al `.env`
2. **Implementar UI**: Crear formularios para que clientes configuren Twilio y GHL
3. **Testing**: Probar con credenciales reales de cada servicio
4. **Documentación**: Crear guías de configuración para clientes

