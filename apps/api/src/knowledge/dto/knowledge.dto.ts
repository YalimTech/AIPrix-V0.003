import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { KnowledgeType } from './create-knowledge.dto';

export class KnowledgeDto {
  id: string;
  accountId: string;
  title: string;
  content: string;
  type: KnowledgeType;
  category?: string;
  tags: string[];
  embedding?: number[];
  metadata?: Record<string, any>;
  source?: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export class KnowledgeSearchDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsEnum(KnowledgeType)
  type?: KnowledgeType;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  limit?: number = 5;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  threshold?: number = 0.7;
}

export class KnowledgeSearchResultDto {
  knowledge: KnowledgeDto;
  similarity: number;
  relevanceScore: number;
}

export class KnowledgeStatsDto {
  totalDocuments: number;
  documentsByType: Record<string, number>;
  documentsByCategory: Record<string, number>;
  totalTags: number;
  averageContentLength: number;
  lastUpdated: Date;
}
