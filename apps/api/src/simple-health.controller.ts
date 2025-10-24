import { Controller, Get } from '@nestjs/common';

@Controller()
export class SimpleHealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'prixagent-api',
      version: '1.0.0',
    };
  }
}
