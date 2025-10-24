import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// import { OpenAIService } from '../integrations/openai/openai.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateKnowledgeDto, KnowledgeType } from './dto/create-knowledge.dto';
import {
  KnowledgeDto,
  KnowledgeSearchDto,
  KnowledgeSearchResultDto,
  KnowledgeStatsDto,
} from './dto/knowledge.dto';
import { UpdateKnowledgeDto } from './dto/update-knowledge.dto';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    private readonly prisma: PrismaService,
    // private readonly openaiService: OpenAIService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    createKnowledgeDto: CreateKnowledgeDto,
    accountId: string,
  ): Promise<KnowledgeDto> {
    try {
      // Generar embedding para el contenido
      const embedding = await this.generateEmbedding(
        createKnowledgeDto.content,
      );

      const knowledge = await this.prisma.knowledgeBase.create({
        data: {
          name: createKnowledgeDto.title || 'Sin título',
          title: createKnowledgeDto.title,
          description: null,
          content: createKnowledgeDto.content,
          type: createKnowledgeDto.type,
          category: createKnowledgeDto.category,
          tags: createKnowledgeDto.tags || [],
          accountId,
          embedding: JSON.stringify(embedding), // Almacenar como JSON string temporalmente
        },
      });

      this.logger.log(
        `Documento de conocimiento creado: ${knowledge.id} - ${knowledge.title}`,
      );
      this.eventEmitter.emit('knowledge.created', {
        knowledgeId: knowledge.id,
        accountId,
      });

      return this.mapToDto(knowledge);
    } catch (error) {
      this.logger.error('Error creando documento de conocimiento:', error);
      throw new BadRequestException('Error creando documento de conocimiento');
    }
  }

  async findAll(
    accountId: string,
    page: number = 1,
    limit: number = 10,
    type?: KnowledgeType,
    category?: string,
    tags?: string[],
  ): Promise<{ knowledge: KnowledgeDto[]; total: number }> {
    const skip = (page - 1) * limit;

    const where: any = { accountId };

    if (type) where.type = type;
    if (category) where.category = category;
    if (tags && tags.length > 0) where.tags = { hasSome: tags };

    const [knowledge, total] = await Promise.all([
      this.prisma.knowledgeBase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.knowledgeBase.count({ where }),
    ]);

    return {
      knowledge: knowledge.map((k) => this.mapToDto(k)),
      total,
    };
  }

  async findOne(id: string, accountId: string): Promise<KnowledgeDto> {
    const knowledge = await this.prisma.knowledgeBase.findFirst({
      where: { id, accountId },
    });

    if (!knowledge) {
      throw new NotFoundException('Documento de conocimiento no encontrado');
    }

    return this.mapToDto(knowledge);
  }

  async update(
    id: string,
    updateKnowledgeDto: UpdateKnowledgeDto,
    accountId: string,
  ): Promise<KnowledgeDto> {
    const existingKnowledge = await this.findOne(id, accountId);

    // Si se actualiza el contenido, regenerar embedding
    let embedding = existingKnowledge.embedding;
    if (
      updateKnowledgeDto.content &&
      updateKnowledgeDto.content !== existingKnowledge.content
    ) {
      embedding = await this.generateEmbedding(updateKnowledgeDto.content);
    }

    const knowledge = await this.prisma.knowledgeBase.update({
      where: { id },
      data: {
        ...updateKnowledgeDto,
        embedding: embedding ? JSON.stringify(embedding) : undefined,
      },
    });

    this.logger.log(
      `Documento de conocimiento actualizado: ${knowledge.id} - ${knowledge.title}`,
    );
    this.eventEmitter.emit('knowledge.updated', {
      knowledgeId: knowledge.id,
      accountId,
    });

    return this.mapToDto(knowledge);
  }

  async remove(id: string, accountId: string): Promise<void> {
    await this.findOne(id, accountId);

    await this.prisma.knowledgeBase.delete({
      where: { id },
    });

    this.logger.log(`Documento de conocimiento eliminado: ${id}`);
    this.eventEmitter.emit('knowledge.deleted', { knowledgeId: id, accountId });
  }

  async search(
    searchDto: KnowledgeSearchDto,
    accountId: string,
  ): Promise<KnowledgeSearchResultDto[]> {
    try {
      // Generar embedding para la consulta
      const queryEmbedding = await this.generateEmbedding(searchDto.query);

      // Obtener todos los documentos del account (en producción usar pgvector)
      const allKnowledge = await this.prisma.knowledgeBase.findMany({
        where: {
          accountId,
          ...(searchDto.type && { type: searchDto.type }),
          ...(searchDto.category && { category: searchDto.category }),
          ...(searchDto.tags &&
            searchDto.tags.length > 0 && { tags: { hasSome: searchDto.tags } }),
        },
      });

      // Calcular similitud (en producción usar pgvector)
      const results = allKnowledge
        .map((knowledge) => {
          const embedding = knowledge.embedding
            ? JSON.parse(knowledge.embedding as string)
            : null;
          if (!embedding) return null;

          const similarity = this.calculateCosineSimilarity(
            queryEmbedding,
            embedding,
          );
          const relevanceScore = this.calculateRelevanceScore(
            searchDto.query,
            knowledge,
            similarity,
          );

          return {
            knowledge: this.mapToDto(knowledge),
            similarity,
            relevanceScore,
          };
        })
        .filter(
          (result) =>
            result && result.similarity >= (searchDto.threshold || 0.7),
        )
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, searchDto.limit || 5);

      this.logger.log(
        `Búsqueda realizada: ${results.length} resultados para "${searchDto.query}"`,
      );
      this.eventEmitter.emit('knowledge.searched', {
        query: searchDto.query,
        accountId,
        resultCount: results.length,
      });

      return results;
    } catch (error) {
      this.logger.error('Error en búsqueda de conocimiento:', error);
      throw new BadRequestException('Error en búsqueda de conocimiento');
    }
  }

  async getStats(accountId: string): Promise<KnowledgeStatsDto> {
    const [totalDocuments, documentsByType, documentsByCategory, allKnowledge] =
      await Promise.all([
        this.prisma.knowledgeBase.count({ where: { accountId } }),
        this.prisma.knowledgeBase.groupBy({
          by: ['type'],
          where: { accountId },
          _count: { type: true },
        }),
        this.prisma.knowledgeBase.groupBy({
          by: ['category'],
          where: { accountId },
          _count: { category: true },
        }),
        this.prisma.knowledgeBase.findMany({
          where: { accountId },
          select: { tags: true, content: true, updatedAt: true },
        }),
      ]);

    const allTags = new Set();
    allKnowledge.forEach((k) => k.tags.forEach((tag) => allTags.add(tag)));

    const averageContentLength =
      allKnowledge.length > 0
        ? allKnowledge.reduce((sum, k) => sum + k.content.length, 0) /
          allKnowledge.length
        : 0;

    const lastUpdated =
      allKnowledge.length > 0
        ? new Date(Math.max(...allKnowledge.map((k) => k.updatedAt.getTime())))
        : new Date();

    return {
      totalDocuments,
      documentsByType: documentsByType.reduce(
        (acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        },
        {} as Record<string, number>,
      ),
      documentsByCategory: documentsByCategory.reduce(
        (acc, item) => {
          acc[item.category || 'Sin categoría'] = item._count.category;
          return acc;
        },
        {} as Record<string, number>,
      ),
      totalTags: allTags.size,
      averageContentLength: Math.round(averageContentLength),
      lastUpdated,
    };
  }

  async generateContext(
    query: string,
    accountId: string,
    limit: number = 3,
  ): Promise<string> {
    try {
      const searchResults = await this.search(
        { query, limit, threshold: 0.6 },
        accountId,
      );

      if (searchResults.length === 0) {
        return '';
      }

      const context = searchResults
        .map(
          (result) =>
            `**${result.knowledge.title}** (${result.knowledge.type}):\n${result.knowledge.content}`,
        )
        .join('\n\n');

      this.logger.log(
        `Contexto generado para consulta: ${query} (${searchResults.length} documentos)`,
      );
      return context;
    } catch (error) {
      this.logger.error('Error generando contexto:', error);
      return '';
    }
  }

  private async generateEmbedding(_text: string): Promise<number[]> {
    try {
      // return await this.openaiService.generateEmbedding(text);
      // Simulación temporal hasta implementar OpenAI
      return new Array(1536).fill(0).map(() => Math.random());
    } catch (error) {
      this.logger.error('Error generando embedding:', error);
      throw new BadRequestException('Error generando embedding');
    }
  }

  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (normA * normB);
  }

  private calculateRelevanceScore(
    query: string,
    knowledge: any,
    similarity: number,
  ): number {
    const queryLower = query.toLowerCase();
    const titleLower = knowledge.title.toLowerCase();
    const contentLower = knowledge.content.toLowerCase();

    let score = similarity;

    // Bonus por coincidencia en título
    if (titleLower.includes(queryLower)) {
      score += 0.2;
    }

    // Bonus por coincidencia en contenido
    const contentMatches = (
      contentLower.match(new RegExp(queryLower, 'g')) || []
    ).length;
    score += Math.min(contentMatches * 0.1, 0.3);

    // Bonus por tipo de documento
    const typeBonus = {
      faq: 0.3,
      script: 0.2,
      policy: 0.1,
      document: 0.05,
    };
    score += typeBonus[knowledge.type] || 0;

    return Math.min(score, 1);
  }

  private mapToDto(knowledge: any): KnowledgeDto {
    return {
      id: knowledge.id,
      accountId: knowledge.accountId,
      title: knowledge.title,
      content: knowledge.content,
      type: knowledge.type,
      category: knowledge.category,
      tags: knowledge.tags,
      embedding: knowledge.embedding
        ? JSON.parse(knowledge.embedding)
        : undefined,
      metadata: knowledge.metadata,
      source: knowledge.source,
      language: knowledge.language,
      createdAt: knowledge.createdAt,
      updatedAt: knowledge.updatedAt,
    };
  }
}
