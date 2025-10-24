import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { AppModule } from './app.module';
import { productionConfig } from './config/production.config';
import { RawBodyExceptionFilter } from './filters/raw-body-exception.filter';
import { ErrorHandlerInterceptor } from './interceptors/error-handler.interceptor';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Configure body parsing for JSON and URL-encoded requests
  app.use(express.json({ 
    limit: '50mb',
    type: 'application/json'
  }));
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '50mb',
    type: 'application/x-www-form-urlencoded'
  }));

  // Handle critical connection errors
  app.use((req, res, next) => {
    req.on('error', (error) => {
      // Handle only critical connection errors
      if (
        (error as any).code === 'ECONNRESET' ||
        (error as any).code === 'EPIPE' ||
        (error as any).code === 'ECONNREFUSED'
      ) {
        logger.debug(
          `Connection error for ${req.method} ${req.url}: ${error.message}`,
        );
        return;
      }
    });
    next();
  });

  // Configurar pipes de validación globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // Rechazar propiedades no permitidas
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // Convertir tipos automáticamente
      },
    }),
  );

  // Configurar interceptores globales
  const timeoutInterceptor = app.get(TimeoutInterceptor);
  const errorHandlerInterceptor = app.get(ErrorHandlerInterceptor);

  app.useGlobalInterceptors(timeoutInterceptor, errorHandlerInterceptor);

  // Configurar filtro de excepciones global para manejar raw-body
  app.useGlobalFilters(new RawBodyExceptionFilter());

  // Configurar prefijo global para API
  app.setGlobalPrefix('api/v1', {
    exclude: ['ready'], // Solo excluir ready del prefijo, health debe estar en /api/v1/health
  });

  // Habilitar CORS con configuración optimizada para producción
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // En producción, usar CORS_ORIGIN si está definido, sino usar configuración optimizada
    const corsOrigin = process.env.CORS_ORIGIN;
    if (corsOrigin) {
      app.enableCors({
        origin: corsOrigin.split(',').map((origin) => origin.trim()),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'Accept',
          'X-Account-ID',
          'X-Tenant-ID',
          'X-Forwarded-For',
          'X-Forwarded-Proto',
          'X-Real-IP',
        ],
        optionsSuccessStatus: 200,
        preflightContinue: false,
        maxAge: 86400,
      });
    } else {
      app.enableCors(productionConfig.cors);
    }
  } else {
    // En desarrollo, usar configuración más restrictiva
    app.enableCors({
      origin: (origin, callback) => {
        const appUrl =
          configService.get('APP_URL') ||
          `http://${process.env.API_HOST || 'localhost'}:${process.env.PORT || '3000'}`;
        const apiHost = process.env.API_HOST || 'localhost';
        const apiProtocol = process.env.API_PROTOCOL || 'http';

        const allowedOrigins = [
          appUrl,
          appUrl.replace('http://', 'https://'),
          appUrl.replace('https://', 'http://'),
          // URLs de producción
          'https://agent.prixcenter.com',
          'https://www.agent.prixcenter.com',
          // URLs dinámicas para desarrollo
          `${apiProtocol}://${apiHost}:${process.env.PORT || '3000'}`,
          `${apiProtocol}://${apiHost}:${process.env.CLIENT_PORT || '3001'}`,
          `${apiProtocol}://${apiHost}:${process.env.ADMIN_PORT || '3002'}`,
          `${apiProtocol}://${apiHost}:${process.env.AGENCY_PORT || '3003'}`,
          `${apiProtocol}://${apiHost}:${process.env.API_PORT || '3004'}`,
          // URLs específicas para 127.0.0.1 (localhost alternativo)
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
          'http://127.0.0.1:3002',
          'http://127.0.0.1:3003',
          'http://127.0.0.1:3004',
        ];

        // Permitir requests sin origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        } else {
          // console.warn(`CORS blocked origin: ${origin}`);
          return callback(new Error('Not allowed by CORS'), false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'X-Account-ID',
        'X-Tenant-ID',
        'X-Forwarded-For',
        'X-Forwarded-Proto',
        'X-Real-IP',
      ],
      optionsSuccessStatus: 200,
      preflightContinue: false,
      maxAge: 86400,
    });
  }

  const port =
    configService.get('API_PORT') || configService.get('port') || 3004;
  // Escuchar en todas las interfaces para evitar problemas de conectividad
  const host = '0.0.0.0';
  await app.listen(port, host);

  const appUrl = configService.get('APP_URL') || `http://${host}:${port}`;
  logger.log(`🚀 PrixAgent SaaS API ejecutándose en ${host}:${port}`);
  logger.log(`🌐 App URL: ${appUrl}`);
  logger.log(`📊 Health check: ${appUrl}/api/v1`);
  logger.log(`🌍 Entorno: ${configService.get('NODE_ENV') || 'development'}`);
  logger.log(`🔗 API Base URL: ${appUrl}/api/v1`);
  logger.log(`📚 Swagger Docs: ${appUrl}/api/v1/docs`);
}
bootstrap();
