# IMPORTANTE: Configuración de ElevenLabs y Arquitectura del Proyecto

## Arquitectura del Proyecto: .env Único

### 📁 UN SOLO .env EN TODO EL PROYECTO

- **SOLO existe UN archivo `.env` en TODO el proyecto**
- **Ubicación**: Raíz del proyecto (`/Prix V0.01/.env`)
- **Base de datos**: PostgreSQL configurada en el `.env` de la raíz
- **NO puede haber otros `.env` en ninguna otra parte del repositorio**

### ⚠️ Reglas Estrictas:

1. ❌ **NO crear** archivos `.env` en subdirectorios (`apps/api/.env`, `apps/client-dashboard/.env`, etc.)
2. ❌ **NO permitir** múltiples archivos `.env` en el proyecto
3. ✅ **SIEMPRE usar** el `.env` de la raíz para toda la configuración
4. ✅ **TODAS las aplicaciones** (API, Client Dashboard, Admin Dashboard, Landing Page) usan el mismo `.env`

### 🗂️ Estructura Correcta:

```
Prix V0.01/
├── .env                    ← ✅ ÚNICO archivo de configuración
├── .env.example           ← ✅ Plantilla para Git
├── apps/
│   ├── api/              ← ❌ SIN .env propio (lee del raíz)
│   ├── client-dashboard/ ← ❌ SIN .env propio (lee del raíz)
│   ├── admin-dashboard/  ← ❌ SIN .env propio (lee del raíz)
│   └── landing-page/     ← ❌ SIN .env propio (lee del raíz)
```

## API Keys de ElevenLabs

### ⚠️ NUNCA en el .env

- Las API keys de ElevenLabs **NO se almacenan** en el archivo `.env`
- **NO existe** la variable `ELEVENLABS_API_KEY` en el `.env`
- El código **NO debe buscar** la API key en variables de entorno

### ✅ Siempre en la Base de Datos

- Cada cliente tiene su propia API key de ElevenLabs
- Las API keys se almacenan en la base de datos en la tabla: `account_eleven_labs_config`
- Cada cliente debe configurar su propia API key desde el dashboard

## Arquitectura

### Tabla: AccountElevenLabsConfig

```prisma
model AccountElevenLabsConfig {
  id        String   @id @default(cuid())
  accountId String   @unique
  apiKey    String
  status    String   @default("active")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Campos

- `id`: Identificador único del registro
- `accountId`: ID de la cuenta (unique)
- `apiKey`: API key de ElevenLabs del cliente
- `status`: Estado de la configuración (active/inactive)
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

## Código

### Servicio: ElevenLabsService

```typescript
// ✅ CORRECTO: Obtener API key de la base de datos
const config = await this.prisma.accountElevenLabsConfig.findUnique({
  where: { accountId },
});

// ❌ INCORRECTO: Buscar en variables de entorno
const apiKey = this.configService.get("ELEVENLABS_API_KEY");
```

### Health Check

```typescript
// Verificar que hay al menos una cuenta con API key configurada
const configs = await this.prisma.accountElevenLabsConfig.findMany({
  where: { apiKey: { not: null } },
  take: 1,
});
```

## Razón del Diseño

### Modelo de Negocio

1. **Cada cliente paga su propio consumo de ElevenLabs**
   - El cliente debe tener su propia API key
   - El cliente controla su propio gasto
   - El cliente puede ver su consumo real

2. **El desarrollador NO paga por el consumo de los clientes**
   - No hay API key del desarrollador
   - No hay API key compartida
   - Cada cliente es responsable de su propio consumo

3. **Control de gastos**
   - Cada cliente puede configurar límites
   - Cada cliente puede ver su historial de uso
   - Cada cliente puede recargar su saldo

### Seguridad

1. **Aislamiento de datos**
   - Cada cliente solo puede acceder a su propia API key
   - No hay riesgo de que un cliente acceda a la API key de otro

2. **Auditoría**
   - Se puede rastrear qué cliente usó qué API key
   - Se puede ver el historial de uso por cliente

## Flujo de Configuración

1. **Cliente se registra** → Se crea una cuenta
2. **Cliente configura ElevenLabs** → Ingresa su API key
3. **Sistema valida la API key** → Verifica que sea válida
4. **Cliente puede usar el servicio** → Puede crear agentes, hacer llamadas, etc.

## Notas Importantes

### Sobre el .env

- ✅ **SOLO existe UN archivo `.env`** en TODO el proyecto
- ✅ **Ubicación**: Raíz del proyecto (`/Prix V0.01/.env`)
- ✅ **Base de datos PostgreSQL**: Configurada en el `.env` de la raíz
- ❌ **NUNCA crear** archivos `.env` en subdirectorios
- ❌ **NUNCA permitir** múltiples archivos `.env` en el proyecto

### Sobre ElevenLabs

- ❌ **NUNCA** agregar `ELEVENLABS_API_KEY` al `.env`
- ❌ **NUNCA** usar una API key compartida
- ❌ **NUNCA** hardcodear API keys en el código
- ✅ **SIEMPRE** obtener la API key de la base de datos por `accountId`
- ✅ **SIEMPRE** validar que la API key pertenezca al cliente correcto
- ✅ **SIEMPRE** verificar permisos antes de usar la API key

### Configuración de Aplicaciones

- ✅ **API Backend**: Lee el `.env` de la raíz
- ✅ **Client Dashboard**: Lee el `.env` de la raíz
- ✅ **Admin Dashboard**: Lee el `.env` de la raíz
- ✅ **Landing Page**: Lee el `.env` de la raíz
- ✅ **Todas las aplicaciones** usan el mismo `.env` de la raíz

## Troubleshooting

### Error: "No se encontró configuración de ElevenLabs"

- **Causa**: El cliente no ha configurado su API key
- **Solución**: El cliente debe ir a Settings → Integrations → ElevenLabs y configurar su API key

### Error: "API key inválida"

- **Causa**: La API key configurada no es válida
- **Solución**: El cliente debe verificar su API key en ElevenLabs y actualizarla

### Error: "No hay cuentas con API key configurada"

- **Causa**: Ningún cliente ha configurado su API key
- **Solución**: Al menos un cliente debe configurar su API key para que el sistema funcione
