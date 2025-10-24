import { Module } from '@nestjs/common';
import { ElevenLabsModule } from './elevenlabs/elevenlabs.module';
import { GHLModule } from './ghl/ghl.module';
import { TwilioModule } from './twilio/twilio.module';

@Module({
  imports: [TwilioModule, ElevenLabsModule, GHLModule],
  exports: [TwilioModule, ElevenLabsModule, GHLModule],
})
export class IntegrationsModule {}
