# 🎯 Configuración de Dashboards - PrixAgent V0.01

## 📋 Resumen de Puertos

| Dashboard           | Puerto | URL de Desarrollo      | URL de Producción                      |
| ------------------- | ------ | ---------------------- | -------------------------------------- |
| 🏠 Landing Page     | 3000   | http://localhost:3000/ | https://agent.prixcenter.com/          |
| 📱 Client Dashboard | 3001   | http://localhost:3001/ | https://agent.prixcenter.com/dashboard |
| 👨‍💼 Admin Dashboard  | 3002   | http://localhost:3002/ | https://agent.prixcenter.com/manager   |
| 🏢 Agency Dashboard | 3003   | http://localhost:3003/ | https://agent.prixcenter.com/agency    |
| 📡 API Backend      | 3004   | http://localhost:3004/ | https://agent.prixcenter.com/api/v1    |

## 🚀 Comandos de Desarrollo

### Iniciar Todos los Dashboards

```bash
npm run dev
```

### Iniciar Dashboards Individuales

```bash
# Landing Page (puerto 3000)
npm run dev:landing-only

# Client Dashboard (puerto 3001)
npm run dev:client-only

# Admin Dashboard (puerto 3002)
npm run dev:manager-only

# Agency Dashboard (puerto 3003)
npm run dev:agency

# API Backend (puerto 3004)
npm run dev:api-only
```

## 🏗️ Comandos de Build

### Build de Todos los Dashboards

```bash
npm run build
```

### Build Individual

```bash
npm run build:landing    # Landing Page
npm run build:client     # Client Dashboard
npm run build:manager    # Admin Dashboard
npm run build:agency     # Agency Dashboard
npm run build:api        # API Backend
```

## 🔧 Configuración de Archivos

### Variables de Entorno (env.example)

```env
PORT=3000                    # Landing Page
CLIENT_PORT=3001            # Client Dashboard (Seguro)
ADMIN_PORT=3002             # Admin Dashboard (Seguro)
AGENCY_PORT=3003            # Agency Dashboard (Seguro)
API_PORT=3004               # API Backend
```

### Configuraciones de Vite

- `apps/landing-page/vite.config.ts` - Puerto 3000
- `apps/client-dashboard/vite.config.ts` - Puerto 3001
- `apps/admin-dashboard/vite.config.ts` - Puerto 3002
- `apps/admin-dashboard/vite.agency.config.ts` - Puerto 3003

### Server.js

- Configurado para servir todos los dashboards desde el puerto 3000
- Proxy para API backend en puerto 3004
- Rutas configuradas para cada dashboard

## 🧪 Verificación

Para verificar que la configuración es correcta:

```bash
node scripts/test-dashboards.js
```

## 📁 Estructura de Archivos

```
apps/
├── landing-page/          # Puerto 3000
│   ├── vite.config.ts
│   └── package.json
├── client-dashboard/      # Puerto 3001
│   ├── vite.config.ts
│   └── package.json
├── admin-dashboard/       # Puerto 3002
│   ├── vite.config.ts
│   ├── vite.agency.config.ts  # Puerto 3003
│   └── package.json
└── api/                   # Puerto 3004
    └── package.json
```

## 🔄 Flujo de Desarrollo

1. **Desarrollo Individual**: Usar comandos `dev:*-only` para trabajar en un dashboard específico
2. **Desarrollo Completo**: Usar `npm run dev` para iniciar todos los servicios
3. **Testing**: Usar `node scripts/test-dashboards.js` para verificar configuración
4. **Build**: Usar `npm run build` antes de deployar a producción

## ⚠️ Notas Importantes

- El **Agency Dashboard** usa la misma aplicación que el Admin Dashboard pero con configuración diferente
- Todos los dashboards apuntan al API Backend en puerto 3004
- El servidor principal (server.js) corre en puerto 3000 y sirve todos los dashboards
- En producción, todos los dashboards se sirven desde el mismo dominio con rutas diferentes

## 🐛 Solución de Problemas

### Puerto en Uso

Si un puerto está en uso, verificar:

```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

### Verificar Configuración

```bash
node scripts/test-dashboards.js
```

### Limpiar Cache

```bash
npm run clean
npm install
```
