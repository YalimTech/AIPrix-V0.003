import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GHLService } from './ghl.service';
import { GHLController } from './ghl.controller';

@Module({
  imports: [ConfigModule],
  providers: [GHLService],
  controllers: [GHLController],
  exports: [GHLService],
})
export class GHLModule {}
