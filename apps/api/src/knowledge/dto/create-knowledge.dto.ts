import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
} from 'class-validator';

export enum KnowledgeType {
  DOCUMENT = 'document',
  FAQ = 'faq',
  SCRIPT = 'script',
  POLICY = 'policy',
  PROCEDURE = 'procedure',
  PRODUCT_INFO = 'product_info',
  COMPANY_INFO = 'company_info',
}

export class CreateKnowledgeDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsEnum(KnowledgeType)
  type: KnowledgeType;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] = [];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  source?: string; // URL, archivo, etc.

  @IsOptional()
  @IsString()
  language?: string = 'es';
}
