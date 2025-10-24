import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PreviewSpeechDto {
  @ApiProperty({
    description: 'The ID of the voice to use for the preview.',
    example: '2EiwWnXFnvU5JabPnv8n',
  })
  @IsString()
  @IsNotEmpty()
  voiceId: string;

  @ApiProperty({
    description:
      'The text to generate a preview for. Should be in the target language.',
    example: 'Hola, esta es una prueba de mi voz.',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    description:
      'Optional model to use. Defaults to a multilingual model if available.',
    example: 'eleven_multilingual_v2',
    required: false,
  })
  @IsString()
  @IsOptional()
  modelId?: string;
}
