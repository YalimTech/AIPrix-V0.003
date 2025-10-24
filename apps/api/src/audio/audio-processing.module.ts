import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ElevenLabsModule } from '../integrations/elevenlabs/elevenlabs.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AudioProcessingService } from './audio-processing.service';

@Module({
  imports: [
    ElevenLabsModule,
    KnowledgeModule,
    PrismaModule,
    EventEmitterModule,
  ],
  providers: [AudioProcessingService],
  exports: [AudioProcessingService],
})
export class AudioProcessingModule {}
