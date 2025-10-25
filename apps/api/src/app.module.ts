import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { AccountsModule } from './accounts/accounts.module';
import { AdminModule } from './admin/admin.module';
import { AgentsModule } from './agents/agents.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AudioProcessingModule } from './audio/audio-processing.module';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { CallsModule } from './calls/calls.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import configuration from './config/configuration';
import { ContactsModule } from './contacts/contacts.module';
import { ConversationModule } from './conversation/conversation.module';
import { ConversationsModule } from './conversations/conversations.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ExportImportModule } from './export-import/export-import.module';
import { FoldersModule } from './folders/folders.module';
import { HealthModule } from './health/health.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { TwilioMarketplaceModule } from './integrations/twilio/twilio-marketplace.module';
import { ExternalWebhookService } from './services/external-webhook.service';
import { ExternalWebhookController } from './controllers/external-webhook.controller';
import { PhoneAssignmentService } from './services/phone-assignment.service';
import { PhoneAssignmentController } from './controllers/phone-assignment.controller';
import { TwilioInboundService } from './services/twilio-inbound.service';
import { TwilioInboundController, TwilioWebhookController } from './controllers/twilio-inbound.controller';
import { KnowledgeModule } from './knowledge/knowledge.module';
// import { LLMModule } from './llm/llm.module';
import { LoggingModule } from './logging/logging.module';
import { ProxyFixMiddleware } from './middleware/proxy-fix.middleware';
import { RawBodyErrorMiddleware } from './middleware/raw-body-error.middleware';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { TimeoutMiddleware } from './middleware/timeout.middleware';
import { PhoneNumbersModule } from './phone-numbers/phone-numbers.module';
import { PrismaModule } from './prisma/prisma.module';
// import { RAGModule } from './rag/rag.module';
import { ErrorHandlerInterceptor } from './interceptors/error-handler.interceptor';
import { SimpleHealthController } from './simple-health.controller';
import { AccountMiddleware } from './tenancy/account.middleware';
import { TenancyModule } from './tenancy/tenancy.module';
import { UsersModule } from './users/users.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { WebSocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      ignoreEnvFile: false,
      envFilePath: '../../.env',
      cache: true,
      expandVariables: true,
      validate: AppModule.validateEnvironmentVariables,
    }),
    EventEmitterModule.forRoot({
      // Configuración optimizada para 2025
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 segundos
        limit: 100, // 100 requests por minuto
        // Configuraciones adicionales para 2025
        skipIf: (context) => {
          // Saltar throttling para health checks
          return context.switchToHttp().getRequest().url === '/health';
        },
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    IntegrationsModule,
    TwilioMarketplaceModule,
    AccountsModule,
    AgentsModule,
    FoldersModule,
    // LLMModule,
    TenancyModule,
    WebhooksModule,
    AudioProcessingModule,
    CampaignsModule,
    ContactsModule,
    CallsModule,
    KnowledgeModule,
    DashboardModule,
    PhoneNumbersModule,
    WebSocketModule,
    ExportImportModule,
    HealthModule,
    LoggingModule,
    ConversationModule,
    ConversationsModule,
    // RAGModule,
    AdminModule,
    BillingModule,
  ],
  controllers: [AppController, SimpleHealthController, ExternalWebhookController, PhoneAssignmentController, TwilioInboundController, TwilioWebhookController],
  providers: [AppService, ErrorHandlerInterceptor, ExternalWebhookService, PhoneAssignmentService, TwilioInboundService],
})
export class AppModule implements NestModule {
  /**
   * Validates required environment variables
   * @param config - Configuration object
   * @returns Validated configuration
   */
  private static validateEnvironmentVariables(config: any) {
    if (process.env.NODE_ENV === 'production') {
      const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
      const missingVars = requiredVars.filter(
        (varName) => !process.env[varName],
      );

      if (missingVars.length > 0) {
        console.warn(
          `Missing required environment variables: ${missingVars.join(', ')}`,
        );
      }
    }
    return config;
  }

  configure(consumer: MiddlewareConsumer) {
    // Aplicar middleware de proxy fix primero
    consumer.apply(ProxyFixMiddleware).forRoutes('*');

    // BodyParsingMiddleware disabled to prevent proxy conflicts
    // consumer.apply(BodyParsingMiddleware).forRoutes('*');

    // Aplicar middleware de manejo de errores de raw-body
    consumer.apply(RawBodyErrorMiddleware).forRoutes('*');

    // Aplicar middleware de logging y timeout a todas las rutas excepto debug
    consumer.apply(RequestLoggerMiddleware, TimeoutMiddleware).exclude('auth/debug/(.*)').forRoutes('*');

    // Aplicar middleware de tenancy a todas las rutas excepto auth, health y webhooks
    consumer
      .apply(AccountMiddleware)
      .exclude(
        'auth/(.*)',
        'health',
        'accounts',
        'accounts/(.*)',
        'webhooks/(.*)',
        'dashboard/audio',
        'dashboard/audio/(.*)',
        'sub-clients',
        'sub-clients/(.*)',
      )
      .forRoutes('*');
  }
}
