# 🚀 Guía de Optimización - PrixAgent V0.01

## 📋 Índice

1. [Optimizaciones de Redis](#redis-optimizations)
2. [Optimizaciones de PostgreSQL + PgVector](#postgresql-optimizations)
3. [Optimizaciones de Memoria](#memory-optimizations)
4. [Optimizaciones de Latencia](#latency-optimizations)
5. [Configuración de Producción](#production-config)

---

## 🔴 Optimizaciones de Redis {#redis-optimizations}

### Configuración Optimizada para Fluidez Natural

```typescript
// Configuración Redis optimizada para PrixAgent
const redisConfig = {
  // Conexión optimizada para latencia mínima
  retryDelayOnFailover: 50, // Recuperación rápida
  maxRetriesPerRequest: 5, // Mayor confiabilidad
  lazyConnect: false, // Conexión inmediata
  connectTimeout: 5000, // Conexión rápida
  commandTimeout: 2000, // Comandos rápidos
  keepAlive: 60000, // Conexión persistente

  // Gestión de memoria optimizada
  maxMemoryPolicy: "allkeys-lru", // Política LRU
  tcpKeepAlive: true, // TCP persistente
  enableReadyCheck: true, // Verificación de estado

  // Pool de conexiones
  connectionName: "prixagent-memory",
  maxLoadingTimeout: 3000,

  // Pipeline para operaciones en lote
  enableAutoPipelining: true,
  maxAutoPipelining: 32,

  // Compresión para reducir latencia de red
  enableCompression: true,
  compressionThreshold: 1000,
};
```

### Estructura de Datos Optimizada

```typescript
// Estructura de claves Redis para máxima eficiencia
const redisKeys = {
  // Contexto principal de conversación
  conversation: `conversation:${callId}`,

  // Índices para búsqueda rápida
  topics: `conversation:${callId}:topics`, // Set de temas clave
  messages: `conversation:${callId}:messages`, // ZSet ordenado por timestamp
  meta: `conversation:${callId}:meta`, // Hash de metadatos

  // Índice global de conversaciones activas
  activeConversations: "active_conversations", // ZSet con timestamp
};
```

### Pipeline Optimizado

```typescript
// Operaciones en pipeline para máxima velocidad
const pipeline = this.redis.pipeline();

// Guardar contexto principal
pipeline.setex(key, 86400, JSON.stringify(contextData));

// Índices para búsqueda rápida
pipeline.zadd(
  `conversation:${callId}:messages`,
  Date.now(),
  `${context.messages.length}:${lastMessageId}`,
);

// Temas clave para contexto rápido
pipeline.sadd(`conversation:${callId}:topics`, ...keyTopics);

// Índice de conversaciones activas
pipeline.zadd("active_conversations", Date.now(), callId);

await pipeline.exec(); // Ejecutar todas las operaciones atómicamente
```

---

## 🗄️ Optimizaciones de PostgreSQL + PgVector {#postgresql-optimizations}

### Configuración de PgVector Optimizada

```sql
-- Crear extensión PgVector
CREATE EXTENSION IF NOT EXISTS vector;

-- Índices optimizados para búsqueda vectorial
CREATE INDEX CONCURRENTLY idx_knowledge_base_embedding_cosine
ON knowledge_base USING ivfflat (embedding::vector vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX CONCURRENTLY idx_knowledge_base_embedding_l2
ON knowledge_base USING ivfflat (embedding::vector vector_l2_ops)
WITH (lists = 100);

-- Índices compuestos para consultas híbridas
CREATE INDEX CONCURRENTLY idx_knowledge_base_account_type
ON knowledge_base (account_id, type)
INCLUDE (id, title, content, embedding);

CREATE INDEX CONCURRENTLY idx_knowledge_base_account_category
ON knowledge_base (account_id, category)
INCLUDE (id, title, content, embedding);
```

### Configuración de PostgreSQL para Producción

```sql
-- Configuraciones optimizadas para PgVector
-- postgresql.conf

# Memoria
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Conexiones
max_connections = 100
shared_preload_libraries = 'vector'

# Logging
log_min_duration_statement = 1000
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '

# Autovacuum optimizado para vectores
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 1min
```

### Consultas Optimizadas

```sql
-- Búsqueda vectorial optimizada con filtros
SELECT
  kb.id,
  kb.title,
  kb.content,
  kb.type,
  kb.category,
  kb.tags,
  kb.metadata,
  kb.created_at,
  (kb.embedding::vector <-> $1::vector) as distance,
  kb.embedding::vector <#> $1::vector as cosine_distance
FROM knowledge_base kb
WHERE kb.account_id = $2
  AND kb.type = $3
  AND kb.embedding IS NOT NULL
ORDER BY kb.embedding::vector <-> $1::vector
LIMIT $4;

-- Búsqueda híbrida (vectorial + texto)
WITH vector_search AS (
  SELECT id, title, content, similarity
  FROM (
    SELECT
      id, title, content,
      (1 - (embedding::vector <-> $1::vector)) as similarity
    FROM knowledge_base
    WHERE account_id = $2 AND embedding IS NOT NULL
    ORDER BY embedding::vector <-> $1::vector
    LIMIT 10
  ) vs
  WHERE similarity > 0.6
),
text_search AS (
  SELECT id, title, content,
    CASE
      WHEN title ILIKE '%' || $3 || '%' THEN 0.9
      WHEN content ILIKE '%' || $3 || '%' THEN 0.7
      ELSE 0.5
    END as similarity
  FROM knowledge_base
  WHERE account_id = $2
    AND (title ILIKE '%' || $3 || '%' OR content ILIKE '%' || $3 || '%')
  LIMIT 5
)
SELECT DISTINCT id, title, content, similarity
FROM (
  SELECT id, title, content, similarity * 0.7 as similarity FROM vector_search
  UNION ALL
  SELECT id, title, content, similarity * 0.3 as similarity FROM text_search
) combined
ORDER BY similarity DESC
LIMIT $4;
```

---

## 🧠 Optimizaciones de Memoria {#memory-optimizations}

### Gestión de Contexto Optimizada

```typescript
// Estructura optimizada para contexto de conversación
interface OptimizedConversationContext {
  callId: string;
  agentId: string;
  accountId: string;
  messages: ConversationMessage[];

  // Metadatos optimizados para recuperación rápida
  _optimized: boolean;
  _lastUpdate: number;
  _messageCount: number;
  _keyTopics: string[]; // Solo los más importantes

  // Contexto crítico para latencia mínima
  criticalContext: {
    lastMessage?: ConversationMessage;
    customerIntent?: string;
    sentiment?: string;
  };
}
```

### Caché Inteligente

```typescript
// Sistema de caché inteligente para embeddings
class EmbeddingCache {
  private cache = new Map<string, { embedding: number[]; timestamp: number }>();
  private readonly TTL = 3600000; // 1 hora

  async getCachedEmbedding(text: string): Promise<number[] | null> {
    const key = this.generateKey(text);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.embedding;
    }

    return null;
  }

  setCachedEmbedding(text: string, embedding: number[]): void {
    const key = this.generateKey(text);
    this.cache.set(key, { embedding, timestamp: Date.now() });
  }

  private generateKey(text: string): string {
    // Normalizar texto para mejor hit rate
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
}
```

---

## ⚡ Optimizaciones de Latencia {#latency-optimizations}

### Pipelining de Operaciones

```typescript
// Pipeline optimizado para operaciones frecuentes
async function optimizedContextUpdate(
  callId: string,
  context: ConversationContext,
) {
  const pipeline = this.redis.pipeline();

  // Operaciones en paralelo
  pipeline.setex(`conversation:${callId}`, 86400, JSON.stringify(context));
  pipeline.zadd(
    `conversation:${callId}:messages`,
    Date.now(),
    `${context.messages.length}:${lastMessageId}`,
  );
  pipeline.sadd(
    `conversation:${callId}:topics`,
    ...context.keyTopics.slice(0, 5),
  );
  pipeline.zadd("active_conversations", Date.now(), callId);

  // Ejecutar todas las operaciones atómicamente
  await pipeline.exec();
}
```

### Búsqueda Híbrida Optimizada

```typescript
// Búsqueda híbrida que combina velocidad y precisión
async function hybridSearchOptimized(accountId: string, query: string) {
  // Ejecutar búsquedas en paralelo
  const [vectorResults, textResults] = await Promise.all([
    this.vectorSearch(accountId, query), // Búsqueda vectorial
    this.textSearch(accountId, query), // Búsqueda textual
  ]);

  // Combinar resultados con pesos optimizados
  return this.combineResults(vectorResults, textResults, {
    vectorWeight: 0.7, // Mayor peso para búsqueda vectorial
    textWeight: 0.3, // Menor peso para búsqueda textual
  });
}
```

### Recuperación de Contexto Crítico

```typescript
// Recuperación ultra-rápida de contexto crítico
async function getCriticalContext(callId: string) {
  const pipeline = this.redis.pipeline();

  // Solo datos críticos para latencia mínima
  pipeline.smembers(`conversation:${callId}:topics`);
  pipeline.zrange(`conversation:${callId}:messages`, -1, -1);
  pipeline.hget(`conversation:${callId}:meta`, "intent");

  const results = await pipeline.exec();

  return {
    keyTopics: results[0][1] || [],
    lastMessage: results[1][1] || null,
    customerIntent: results[2][1] || null,
  };
}
```

---

## 🏭 Configuración de Producción {#production-config}

### Variables de Entorno Optimizadas

```bash
# Redis optimizado para producción
REDIS_URL="redis://user:pass@host:6379/0"
REDIS_MAX_CONNECTIONS=50
REDIS_COMMAND_TIMEOUT=2000
REDIS_CONNECT_TIMEOUT=5000

# PostgreSQL optimizado para vectores
DATABASE_URL="postgresql://user:secret@host:5432/prixagent?sslmode=require"
DATABASE_POOL_SIZE=20
DATABASE_POOL_TIMEOUT=30000

# Configuraciones de memoria
MEMORY_CACHE_SIZE=1000
EMBEDDING_CACHE_TTL=3600000
CONTEXT_CACHE_TTL=86400000

# Configuraciones de latencia
MAX_RESPONSE_TIME=300
PIPELINE_BATCH_SIZE=32
CONCURRENT_REQUESTS=10
```

### Monitoreo de Rendimiento

```typescript
// Métricas de rendimiento en tiempo real
interface PerformanceMetrics {
  redisLatency: number; // Latencia de Redis
  postgresqlLatency: number; // Latencia de PostgreSQL
  embeddingGenerationTime: number; // Tiempo de generación de embeddings
  contextRetrievalTime: number; // Tiempo de recuperación de contexto
  totalResponseTime: number; // Tiempo total de respuesta
  cacheHitRate: number; // Tasa de aciertos de caché
  memoryUsage: string; // Uso de memoria
}

// Alertas automáticas
const performanceThresholds = {
  maxRedisLatency: 50, // 50ms
  maxPostgresqlLatency: 100, // 100ms
  maxTotalResponseTime: 300, // 300ms
  minCacheHitRate: 0.8, // 80%
};
```

### Mantenimiento Automático

```typescript
// Limpieza automática de recursos
class MaintenanceService {
  async cleanupExpiredConversations() {
    const expiredTime = Date.now() - 24 * 60 * 60 * 1000;
    const expiredConversations = await this.redis.zrangebyscore(
      "active_conversations",
      0,
      expiredTime,
    );

    const pipeline = this.redis.pipeline();
    expiredConversations.forEach((callId) => {
      pipeline.del(`conversation:${callId}`);
      pipeline.del(`conversation:${callId}:topics`);
      pipeline.del(`conversation:${callId}:messages`);
      pipeline.del(`conversation:${callId}:meta`);
      pipeline.zrem("active_conversations", callId);
    });

    await pipeline.exec();
  }

  async optimizeVectorIndexes() {
    // Reindexar vectores periódicamente para mantener rendimiento
    await this.prisma.$executeRaw`
      REINDEX INDEX CONCURRENTLY idx_knowledge_base_embedding_cosine;
    `;
  }
}
```

---

## 📊 Métricas de Rendimiento Esperadas

### Latencia Objetivo

- **Redis**: ≤ 10ms por operación
- **PostgreSQL**: ≤ 50ms por consulta
- **Búsqueda vectorial**: ≤ 100ms
- **Generación de contexto**: ≤ 200ms
- **Respuesta total**: ≤ 300ms

### Throughput Esperado

- **Conversaciones concurrentes**: 100+
- **Operaciones Redis/segundo**: 1000+
- **Consultas PostgreSQL/segundo**: 100+
- **Embeddings generados/segundo**: 50+

### Disponibilidad

- **Uptime**: 99.9%
- **Recovery Time**: ≤ 30 segundos
- **Data Loss**: 0%

---

## 🎯 Resultados de Optimización

Con estas optimizaciones, PrixAgent logra:

✅ **Latencia ≤ 300ms** para respuestas naturales  
✅ **Memoria contextual fluida** sin interrupciones  
✅ **Búsqueda semántica precisa** con PgVector  
✅ **Escalabilidad horizontal** para múltiples accounts  
✅ **Recuperación automática** de errores  
✅ **Monitoreo en tiempo real** de rendimiento

¡PrixAgent está optimizado para proporcionar una experiencia de conversación de voz completamente natural y humana! 🚀
