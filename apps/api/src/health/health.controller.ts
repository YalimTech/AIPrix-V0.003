import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  async getHealth() {
    return this.healthService.getBasicHealth();
  }

  @Get('detailed')
  @Public()
  async getDetailedHealth() {
    return this.healthService.getDetailedHealth();
  }

  @Get('database')
  @Public()
  async getDatabaseHealth() {
    return this.healthService.getDatabaseHealth();
  }

  @Get('external-services')
  @Public()
  async getExternalServicesHealth() {
    return this.healthService.getExternalServicesHealth();
  }

  @Get('metrics')
  @Public()
  async getMetrics() {
    return this.healthService.getSystemMetrics();
  }

  @Get('readiness')
  @Public()
  async getReadiness() {
    return this.healthService.getReadiness();
  }

  @Get('liveness')
  @Public()
  async getLiveness() {
    return this.healthService.getLiveness();
  }
}
