# Estrategia de Optimización de Base de Datos - SaaS Agente IA

## 🎯 Análisis de la Situación Actual

### Problema Identificado

- **Prisma Studio** es excelente para datos transaccionales pero **NO optimizado** para pgvector
- **pgvector** requiere consultas SQL directas para búsquedas de similitud
- **Latencia crítica** (< 500ms) para conversaciones telefónicas
- **RAG** necesita búsquedas vectoriales ultra-rápidas

## 🏗️ Arquitectura Híbrida Optimizada

### 1. **Prisma ORM** - Datos Transaccionales

```typescript
// Para operaciones CRUD estándar
- Gestión de usuarios y accounts
- Configuración de agentes
- Logs de llamadas
- Facturación y pagos
- Configuraciones de integración
```

### 2. **node-postgres (pg)** - Datos Vectoriales

```typescript
// Para búsquedas RAG optimizadas
- Búsquedas de similitud vectorial
- Consultas de embeddings
- Operaciones de pgvector nativas
```

## 🔧 Implementación Técnica

### Configuración Híbrida en NestJS

```typescript
// database.module.ts
@Module({
  imports: [
    // Prisma para datos transaccionales
    PrismaModule,

    // pg para consultas vectoriales
    PgModule,
  ],
  providers: [
    // Servicios híbridos
    HybridDatabaseService,
    RAGService,
    TransactionalService,
  ],
})
export class DatabaseModule {}
```

### Servicios Especializados

```typescript
// transactional.service.ts - Prisma
@Injectable()
export class TransactionalService {
  constructor(private prisma: PrismaService) {}

  // Operaciones CRUD estándar
  async createAgent(data: CreateAgentDto) {
    return this.prisma.agent.create({ data });
  }

  async getCallLogs(filters: CallLogFilters) {
    return this.prisma.callLog.findMany({
      where: filters,
      include: { agent: true, contact: true },
    });
  }
}

// rag.service.ts - pg directo
@Injectable()
export class RAGService {
  constructor(private pg: PgService) {}

  // Búsquedas vectoriales optimizadas
  async searchSimilarDocuments(
    query: string,
    accountId: string,
    limit: number = 5,
  ) {
    const query_embedding = await this.generateEmbedding(query);

    const result = await this.pg.query(
      `
      SELECT 
        id,
        content,
        metadata,
        1 - (embedding <=> $1) as similarity
      FROM knowledge_base 
      WHERE account_id = $2
      ORDER BY embedding <=> $1
      LIMIT $3
    `,
      [query_embedding, accountId, limit],
    );

    return result.rows;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Usar OpenAI API para generar embeddings
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  }
}
```

## 📊 Estructura de Base de Datos Optimizada

### Tablas Transaccionales (Prisma)

```sql
-- Gestión estándar con Prisma
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    -- ... otros campos
);

CREATE TABLE call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL,
    -- ... otros campos
);
```

### Tablas Vectoriales (pg directo)

```sql
-- RAG con pgvector
CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding VECTOR(1536), -- OpenAI embedding dimension
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice HNSW para búsquedas ultra-rápidas
CREATE INDEX ON knowledge_base
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

## 🚀 Optimizaciones de Rendimiento

### 1. **Índices Vectoriales**

```sql
-- HNSW para búsquedas de similitud
CREATE INDEX knowledge_base_embedding_idx
ON knowledge_base
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Índice compuesto para filtros
CREATE INDEX knowledge_base_account_embedding_idx
ON knowledge_base (account_id, embedding);
```

### 2. **Configuración de PostgreSQL**

```sql
-- Optimizaciones para pgvector
SET shared_preload_libraries = 'vector';
SET max_connections = 200;
SET shared_buffers = '256MB';
SET effective_cache_size = '1GB';
SET work_mem = '4MB';
SET maintenance_work_mem = '64MB';
```

### 3. **Pool de Conexiones**

```typescript
// pg.service.ts
@Injectable()
export class PgService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20, // Máximo de conexiones
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async query(text: string, params?: any[]) {
    const client = await this.pool.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  }
}
```

## 🔍 Flujo de Búsqueda RAG Optimizado

### 1. **Proceso de Búsqueda**

```typescript
// orchestrator.service.ts
@Injectable()
export class OrchestratorService {
  constructor(
    private ragService: RAGService,
    private transactionalService: TransactionalService,
  ) {}

  async processCall(audio: string, accountId: string) {
    // 1. Transcribir audio (ASR)
    const transcript = await this.transcribeAudio(audio);

    // 2. Búsqueda RAG ultra-rápida (< 100ms)
    const relevantDocs = await this.ragService.searchSimilarDocuments(
      transcript,
      accountId,
      3,
    );

    // 3. Generar respuesta con LLM
    const response = await this.generateResponse(transcript, relevantDocs);

    // 4. Guardar en logs (Prisma)
    await this.transactionalService.createCallLog({
      transcript,
      response,
      accountId,
    });

    return response;
  }
}
```

### 2. **Caché de Embeddings**

```typescript
// embedding-cache.service.ts
@Injectable()
export class EmbeddingCacheService {
  private cache = new Map<string, number[]>();

  async getEmbedding(text: string): Promise<number[]> {
    const hash = this.hashText(text);

    if (this.cache.has(hash)) {
      return this.cache.get(hash)!;
    }

    const embedding = await this.generateEmbedding(text);
    this.cache.set(hash, embedding);

    return embedding;
  }

  private hashText(text: string): string {
    return crypto.createHash("sha256").update(text).digest("hex");
  }
}
```

## 📈 Monitoreo y Métricas

### 1. **Métricas de Rendimiento**

```typescript
// performance.service.ts
@Injectable()
export class PerformanceService {
  async getRAGMetrics(accountId: string) {
    return {
      averageSearchTime: await this.getAverageSearchTime(accountId),
      cacheHitRate: await this.getCacheHitRate(accountId),
      embeddingGenerationTime: await this.getEmbeddingTime(accountId),
      totalSearches: await this.getTotalSearches(accountId),
    };
  }

  async getDatabaseMetrics() {
    return {
      prismaConnections: await this.getPrismaConnections(),
      pgConnections: await this.getPgConnections(),
      queryPerformance: await this.getQueryPerformance(),
    };
  }
}
```

### 2. **Alertas de Latencia**

```typescript
// latency-monitor.service.ts
@Injectable()
export class LatencyMonitorService {
  @Cron("*/30 * * * * *") // Cada 30 segundos
  async checkLatency() {
    const metrics = await this.performanceService.getRAGMetrics();

    if (metrics.averageSearchTime > 200) {
      // > 200ms
      await this.alertService.sendAlert({
        type: "HIGH_LATENCY",
        message: `RAG search latency: ${metrics.averageSearchTime}ms`,
        severity: "WARNING",
      });
    }
  }
}
```

## 🛠️ Herramientas de Desarrollo

### 1. **Prisma Studio** - Datos Transaccionales

```bash
# Para gestión visual de datos estándar
npx prisma studio
```

- ✅ Gestión de usuarios y accounts
- ✅ Configuración de agentes
- ✅ Logs de llamadas
- ✅ Facturación
- ❌ No optimizado para vectores

### 2. **pgAdmin** - Consultas Vectoriales

```bash
# Para consultas SQL directas y debugging
# Acceso web a pgAdmin
```

- ✅ Consultas vectoriales
- ✅ Análisis de rendimiento
- ✅ Debugging de índices
- ✅ Monitoreo de consultas

### 3. **Herramientas de Embeddings**

```python
# embedding-generator.py
import openai
import psycopg2
from sentence_transformers import SentenceTransformer

class EmbeddingGenerator:
    def __init__(self):
        self.openai_client = openai.OpenAI()
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def generate_embeddings(self, documents):
        # Generar embeddings en lote
        embeddings = self.model.encode(documents)
        return embeddings

    def store_embeddings(self, account_id, documents, embeddings):
        # Insertar en pgvector
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        for doc, embedding in zip(documents, embeddings):
            cur.execute("""
                INSERT INTO knowledge_base (account_id, content, embedding)
                VALUES (%s, %s, %s)
            """, (account_id, doc, embedding.tolist()))

        conn.commit()
        conn.close()
```

## 🎯 Resumen de Optimización

### ✅ **Lo Ideal para tu SaaS**

1. **Prisma ORM** - Datos transaccionales
   - Gestión de usuarios, agentes, llamadas
   - Operaciones CRUD estándar
   - TypeScript tipado

2. **node-postgres (pg)** - Datos vectoriales
   - Búsquedas RAG ultra-rápidas
   - Consultas de similitud optimizadas
   - Latencia < 100ms

3. **Índices HNSW** - Búsquedas vectoriales
   - Configuración optimizada
   - Búsquedas casi instantáneas
   - Escalabilidad

4. **Caché de Embeddings** - Rendimiento
   - Reutilización de embeddings
   - Reducción de costos API
   - Latencia mejorada

### 🚀 **Beneficios de esta Arquitectura**

- **Latencia ultra-baja** (< 500ms total)
- **Escalabilidad** horizontal
- **Costo optimizado** (caché de embeddings)
- **Mantenibilidad** (separación de responsabilidades)
- **Monitoreo** completo
- **Desarrollo eficiente** (herramientas adecuadas)

### 📊 **Métricas Objetivo**

- **Búsqueda RAG**: < 100ms
- **Generación de respuesta**: < 300ms
- **TTS**: < 100ms
- **Total**: < 500ms

Esta arquitectura híbrida es **óptima** para tu SaaS de Agente de IA Conversacional Telefónico, combinando lo mejor de ambas tecnologías para lograr la máxima eficiencia y rendimiento.
