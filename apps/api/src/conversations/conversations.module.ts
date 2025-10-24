import { Module } from '@nestjs/common';
import { ElevenLabsModule } from '../integrations/elevenlabs/elevenlabs.module';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';

@Module({
  imports: [ElevenLabsModule],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
