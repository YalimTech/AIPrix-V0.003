# 👨‍💻 **GUÍA COMPLETA PARA DESARROLLADORES - PRIXAGENT**

## 📋 **ÍNDICE**

1. [Introducción](#introducción)
2. [Configuración del Entorno](#configuración-del-entorno)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Desarrollo Local](#desarrollo-local)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Mejores Prácticas](#mejores-prácticas)
9. [Troubleshooting](#troubleshooting)
10. [Contribución](#contribución)

---

## 🎯 **INTRODUCCIÓN**

Esta guía está diseñada para desarrolladores que trabajen con PrixAgent. Proporciona toda la información necesaria para configurar, desarrollar, testear y desplegar el sistema.

### **Tecnologías Principales**

- **Backend:** NestJS + TypeScript + Prisma
- **Frontend:** React + TypeScript + Vite
- **Base de Datos:** PostgreSQL
- **Cache:** Redis (opcional)
- **Integraciones:** ElevenLabs, GoHighLevel, Twilio, PayPal
- **Deployment:** Docker + Docker Compose

### **Requisitos del Sistema**

- Node.js 18+
- PostgreSQL 13+
- Redis 6+ (opcional)
- Docker & Docker Compose
- Git

---

## ⚙️ **CONFIGURACIÓN DEL ENTORNO**

### **1. Clonar el Repositorio**

```bash
git clone https://github.com/prixagent/prixagent.git
cd prixagent
```

### **2. Instalar Dependencias**

```bash
# Instalar dependencias raíz
npm install

# Instalar dependencias de cada aplicación
cd apps/api && npm install
cd ../admin-dashboard && npm install
cd ../agency-dashboard && npm install
cd ../client-dashboard1 && npm install
cd ../landing-page && npm install
```

### **3. Configurar Variables de Entorno**

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar variables de entorno
nano .env
```

### **4. Configurar Base de Datos**

```bash
# Iniciar PostgreSQL (Docker)
docker-compose up -d db

# Ejecutar migraciones
cd apps/api
npx prisma migrate deploy

# Generar cliente Prisma
npx prisma generate

# (Opcional) Seed de datos de prueba
npm run db:seed
```

### **5. Configurar Redis (Opcional)**

```bash
# Iniciar Redis
docker-compose up -d redis

# Verificar conexión
redis-cli ping
```

---

## 🏗️ **ARQUITECTURA DEL SISTEMA**

### **Diagrama de Arquitectura**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (NestJS)      │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   Cache         │              │
         │              │   (Redis)       │              │
         │              └─────────────────┘              │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Integrations  │    │   External      │    │   Monitoring    │
│   (APIs)        │◄──►│   Services      │◄──►│   (Prometheus)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Módulos Principales**

#### **Backend (NestJS)**

```typescript
src/
├── auth/                 // Autenticación y autorización
├── users/                // Gestión de usuarios
├── accounts/             // Multi-account management
├── agents/               // Agentes de IA
├── calls/                // Gestión de llamadas
├── contacts/             // Gestión de contactos
├── integrations/         // Integraciones externas
│   ├── elevenlabs/      // ElevenLabs API
│   ├── ghl/             // GoHighLevel API
│   ├── twilio/          // Twilio API
│   └── paypal/          // PayPal API
├── notifications/        // Sistema de notificaciones
├── webhooks/            // Sistema de webhooks
├── health/              // Health checks
├── monitoring/          // Métricas y monitoreo
├── security/            // Seguridad avanzada
└── performance/         // Optimización de performance
```

#### **Frontend (React)**

```typescript
apps/
├── admin-dashboard/      // Dashboard administrativo
├── agency-dashboard/     // Dashboard de agencias
├── client-dashboard1/     // Dashboard de clientes
└── landing-page/         // Página de aterrizaje
```

---

## 📁 **ESTRUCTURA DEL PROYECTO**

### **Estructura Completa**

```
prixagent/
├── apps/                          // Aplicaciones
│   ├── api/                       // Backend API
│   │   ├── src/
│   │   │   ├── auth/             // Autenticación
│   │   │   ├── users/            // Usuarios
│   │   │   ├── agents/           // Agentes
│   │   │   ├── calls/            // Llamadas
│   │   │   ├── contacts/         // Contactos
│   │   │   ├── integrations/     // Integraciones
│   │   │   ├── notifications/    // Notificaciones
│   │   │   ├── webhooks/         // Webhooks
│   │   │   ├── health/           // Health checks
│   │   │   ├── monitoring/       // Monitoreo
│   │   │   ├── security/         // Seguridad
│   │   │   ├── performance/      // Performance
│   │   │   ├── prisma/           // Base de datos
│   │   │   └── main.ts           // Punto de entrada
│   │   ├── prisma/
│   │   │   ├── schema.prisma     // Esquema de BD
│   │   │   ├── migrations/       // Migraciones
│   │   │   └── seed.ts           // Datos de prueba
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── admin-dashboard/           // Dashboard admin
│   ├── agency-dashboard/          // Dashboard agencia
│   ├── client-dashboard1/          // Dashboard cliente
│   └── landing-page/              // Landing page
├── docs/                          // Documentación
├── scripts/                       // Scripts de utilidad
├── tests/                         // Tests
├── monitoring/                    // Configuración monitoreo
├── nginx/                         // Configuración Nginx
├── docker-compose.yml             // Docker Compose
├── Dockerfile                     // Docker principal
├── package.json                   // Dependencias raíz
└── README.md                      // Documentación principal
```

### **Archivos de Configuración Importantes**

```bash
# Configuración principal
.env                          # Variables de entorno
docker-compose.yml            # Docker Compose
docker-compose.production.yml # Producción

# Configuración de desarrollo
apps/api/package.json         # Dependencias API
apps/api/tsconfig.json        # TypeScript API
apps/api/jest.config.js       # Testing API

# Configuración de frontend
apps/admin-dashboard/package.json    # Dependencias admin
apps/agency-dashboard/package.json   # Dependencias agency
apps/client-dashboard1/package.json   # Dependencias client
```

---

## 🚀 **DESARROLLO LOCAL**

### **1. Iniciar Servicios de Desarrollo**

```bash
# Iniciar base de datos y Redis
docker-compose up -d db redis

# Iniciar API en modo desarrollo
cd apps/api
npm run start:dev

# En otra terminal, iniciar frontend
cd apps/admin-dashboard
npm run dev
```

### **2. URLs de Desarrollo**

```
API: http://localhost:3000
Admin Dashboard: http://localhost:3001
Agency Dashboard: http://localhost:3002
Client Dashboard: http://localhost:3003
Landing Page: http://localhost:3004
```

### **3. Hot Reload**

- **Backend:** Automático con `npm run start:dev`
- **Frontend:** Automático con Vite
- **Base de Datos:** Reiniciar con `docker-compose restart db`

### **4. Debugging**

#### **Backend (VS Code)**

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/api/src/main.ts",
      "env": {
        "NODE_ENV": "development"
      },
      "runtimeArgs": ["-r", "ts-node/register"]
    }
  ]
}
```

#### **Frontend (Browser DevTools)**

- Abrir DevTools (F12)
- Configurar breakpoints en el código
- Usar React DevTools extension

### **5. Logs y Monitoreo**

```bash
# Ver logs de la API
cd apps/api
npm run start:dev

# Ver logs de Docker
docker-compose logs -f

# Ver logs específicos
docker-compose logs -f api
docker-compose logs -f db
```

---

## 🧪 **TESTING**

### **1. Configuración de Testing**

```bash
# Instalar dependencias de testing
npm install --save-dev jest @nestjs/testing supertest

# Configurar Jest
# apps/api/jest.config.js ya está configurado
```

### **2. Tipos de Tests**

#### **Unit Tests**

```bash
# Ejecutar unit tests
cd apps/api
npm run test:unit

# Con coverage
npm run test:coverage:unit
```

#### **Integration Tests**

```bash
# Ejecutar integration tests
cd apps/api
npm run test:integration

# Con coverage
npm run test:coverage:integration
```

#### **E2E Tests**

```bash
# Ejecutar E2E tests
cd apps/api
npm run test:e2e
```

#### **Performance Tests**

```bash
# Ejecutar performance tests
npm run test:performance
```

### **3. Ejemplo de Test**

```typescript
// apps/api/src/agents/agents.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { AgentsService } from "./agents.service";
import { PrismaService } from "../prisma/prisma.service";

describe("AgentsService", () => {
  let service: AgentsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentsService,
        {
          provide: PrismaService,
          useValue: {
            agent: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AgentsService>(AgentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create an agent", async () => {
      const createAgentDto = {
        name: "Test Agent",
        description: "Test Description",
        voiceId: "voice_123",
        modelId: "model_456",
        accountId: "account_789",
      };

      const expectedAgent = {
        id: "agent_123",
        ...createAgentDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.agent, "create").mockResolvedValue(expectedAgent);

      const result = await service.create(createAgentDto);
      expect(result).toEqual(expectedAgent);
      expect(prisma.agent.create).toHaveBeenCalledWith({
        data: createAgentDto,
      });
    });
  });
});
```

### **4. Testing de Integraciones**

```typescript
// apps/api/src/integrations/elevenlabs/elevenlabs.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { ElevenLabsService } from "./elevenlabs.service";
import { HttpService } from "@nestjs/axios";
import { of } from "rxjs";

describe("ElevenLabsService", () => {
  let service: ElevenLabsService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElevenLabsService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ElevenLabsService>(ElevenLabsService);
    httpService = module.get<HttpService>(HttpService);
  });

  it("should synthesize audio", async () => {
    const mockResponse = {
      data: Buffer.from("audio_data"),
      headers: { "content-type": "audio/mpeg" },
    };

    jest.spyOn(httpService, "post").mockReturnValue(of(mockResponse));

    const result = await service.synthesizeAudio({
      text: "Hello world",
      voiceId: "voice_123",
    });

    expect(result).toBeDefined();
    expect(httpService.post).toHaveBeenCalledWith(
      expect.stringContaining("/text-to-speech"),
      expect.objectContaining({
        text: "Hello world",
        voice_settings: expect.any(Object),
      }),
      expect.any(Object),
    );
  });
});
```

---

## 🚀 **DEPLOYMENT**

### **1. Preparación para Producción**

```bash
# Construir aplicación
cd apps/api
npm run build

# Construir frontend
cd ../admin-dashboard
npm run build
```

### **2. Docker Deployment**

```bash
# Construir imágenes
docker-compose -f docker-compose.production.yml build

# Desplegar
docker-compose -f docker-compose.production.yml up -d

# Verificar estado
docker-compose -f docker-compose.production.yml ps
```

### **3. Variables de Entorno de Producción**

```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:secret@db:5432/prixagent_prod
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=super_secret_encryption_key
REDIS_URL=redis://redis:6379
```

### **4. SSL/HTTPS**

```bash
# Generar certificados SSL
certbot certonly --webroot -w /var/www/html -d yourdomain.com

# Configurar Nginx
cp nginx/nginx.production.conf /etc/nginx/sites-available/prixagent
ln -s /etc/nginx/sites-available/prixagent /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### **5. Monitoreo de Producción**

```bash
# Iniciar monitoreo
docker-compose -f docker-compose.production.yml up -d prometheus grafana loki

# Acceder a dashboards
# Grafana: https://yourdomain.com/grafana
# Prometheus: https://yourdomain.com/prometheus
```

---

## 📋 **MEJORES PRÁCTICAS**

### **1. Código y Arquitectura**

#### **TypeScript**

```typescript
// ✅ Bueno: Tipos explícitos
interface CreateAgentDto {
  name: string;
  description: string;
  voiceId: string;
  modelId: string;
  accountId: string;
}

// ❌ Malo: Any types
function createAgent(data: any) {
  // ...
}
```

#### **Error Handling**

```typescript
// ✅ Bueno: Manejo estructurado de errores
try {
  const agent = await this.agentsService.create(createAgentDto);
  return {
    success: true,
    data: agent,
    message: "Agent created successfully",
  };
} catch (error) {
  this.logger.error("Failed to create agent:", error);
  throw new BadRequestException("Failed to create agent");
}

// ❌ Malo: Errores no manejados
const agent = await this.agentsService.create(createAgentDto);
return agent;
```

#### **Logging**

```typescript
// ✅ Bueno: Logging estructurado
this.logger.log("Agent created", {
  agentId: agent.id,
  userId: user.id,
  timestamp: new Date().toISOString(),
});

// ❌ Malo: Logging básico
console.log("Agent created");
```

### **2. Seguridad**

#### **Validación de Input**

```typescript
// ✅ Bueno: Validación con class-validator
import { IsString, IsNotEmpty, IsUUID } from "class-validator";

export class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  accountId: string;
}
```

#### **Autenticación**

```typescript
// ✅ Bueno: Guards y decoradores
@Controller("agents")
@UseGuards(JwtAuthGuard)
export class AgentsController {
  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() createAgentDto: CreateAgentDto) {
    // ...
  }
}
```

### **3. Performance**

#### **Caching**

```typescript
// ✅ Bueno: Cache inteligente
@Injectable()
export class AgentsService {
  async findOne(id: string): Promise<Agent> {
    const cacheKey = `agent:${id}`;
    let agent = await this.cacheService.get<Agent>(cacheKey);

    if (!agent) {
      agent = await this.prisma.agent.findUnique({ where: { id } });
      await this.cacheService.set(cacheKey, agent, 3600); // 1 hora
    }

    return agent;
  }
}
```

#### **Paginación**

```typescript
// ✅ Bueno: Paginación eficiente
async findAll(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [agents, total] = await Promise.all([
    this.prisma.agent.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    this.prisma.agent.count()
  ]);

  return {
    data: agents,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}
```

### **4. Testing**

#### **Test Coverage**

```bash
# Mantener coverage > 80%
npm run test:coverage

# Verificar coverage mínimo
npm run test:coverage:check
```

#### **Mocking**

```typescript
// ✅ Bueno: Mocks específicos
jest.mock("../integrations/elevenlabs/elevenlabs.service", () => ({
  ElevenLabsService: jest.fn().mockImplementation(() => ({
    synthesizeAudio: jest.fn().mockResolvedValue(Buffer.from("audio_data")),
  })),
}));
```

---

## 🔧 **TROUBLESHOOTING**

### **Problemas Comunes**

#### **1. Error de Conexión a Base de Datos**

```bash
# Verificar estado de PostgreSQL
docker-compose ps db

# Ver logs de la base de datos
docker-compose logs db

# Reiniciar base de datos
docker-compose restart db

# Verificar conexión
docker-compose exec db psql -U postgres -d prixagent
```

#### **2. Error de TypeScript**

```bash
# Limpiar cache de TypeScript
rm -rf apps/api/dist
rm -rf apps/api/node_modules/.cache

# Reinstalar dependencias
cd apps/api
rm -rf node_modules
npm install

# Verificar tipos
npm run type-check
```

#### **3. Error de Prisma**

```bash
# Regenerar cliente Prisma
cd apps/api
npx prisma generate

# Resetear base de datos
npx prisma migrate reset

# Aplicar migraciones
npx prisma migrate deploy
```

#### **4. Error de Docker**

```bash
# Limpiar contenedores
docker-compose down
docker system prune -a

# Reconstruir imágenes
docker-compose build --no-cache

# Verificar configuración
docker-compose config
```

### **Logs Útiles**

```bash
# Logs de la aplicación
docker-compose logs -f api

# Logs de la base de datos
docker-compose logs -f db

# Logs de Redis
docker-compose logs -f redis

# Logs de todos los servicios
docker-compose logs -f
```

### **Debugging Avanzado**

```bash
# Entrar al contenedor
docker-compose exec api sh

# Verificar variables de entorno
docker-compose exec api env

# Verificar conectividad
docker-compose exec api ping db
docker-compose exec api ping redis
```

---

## 🤝 **CONTRIBUCIÓN**

### **1. Flujo de Contribución**

```bash
# Fork del repositorio
git fork https://github.com/prixagent/prixagent

# Clonar tu fork
git clone https://github.com/tu-usuario/prixagent.git

# Crear rama para feature
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y commits
git add .
git commit -m "feat: agregar nueva funcionalidad"

# Push a tu fork
git push origin feature/nueva-funcionalidad

# Crear Pull Request
```

### **2. Estándares de Código**

```bash
# Linting
npm run lint

# Formateo
npm run format

# Type checking
npm run type-check

# Testing
npm run test
```

### **3. Commit Messages**

```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formato de código
refactor: refactorización
test: tests
chore: tareas de mantenimiento
```

### **4. Pull Request Template**

```markdown
## Descripción

Breve descripción de los cambios

## Tipo de Cambio

- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## Testing

- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Tests E2E
- [ ] Testing manual

## Checklist

- [ ] Código sigue los estándares
- [ ] Tests pasan
- [ ] Documentación actualizada
- [ ] No hay breaking changes
```

---

## 📞 **SOPORTE Y RECURSOS**

### **Documentación Adicional**

- [API Documentation](./API_DOCUMENTATION.md)
- [Integrations Guide](./INTEGRATIONS_GUIDE.md)
- [Architecture Guide](./ARCHITECTURE_GUIDE.md)
- [Security Guide](./SECURITY_GUIDE.md)

### **Comunidad**

- **Discord:** [Servidor de Desarrolladores](https://discord.gg/prixagent)
- **GitHub:** [Issues y Discussions](https://github.com/prixagent/prixagent)
- **Email:** dev@prixagent.com

### **Herramientas Útiles**

- **Postman Collection:** [Importar colección](./postman/PrixAgent-API.postman_collection.json)
- **Insomnia Collection:** [Importar colección](./insomnia/PrixAgent-API.json)
- **VS Code Extensions:** [Lista recomendada](./vscode-extensions.md)

---

**Última actualización:** 10 de Enero, 2025  
**Versión:** v1.0.0  
**Mantenido por:** Equipo de Desarrollo PrixAgent
