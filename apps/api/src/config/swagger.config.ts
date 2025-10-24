import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app: any) => {
  const config = new DocumentBuilder()
    .setTitle('PrixAgent SaaS API')
    .setDescription(
      `
      API para el SaaS de Agentes de IA Conversacional Telefónico.
      
      ## Características:
      - 🤖 Agentes de IA con voz natural
      - 📞 Automatización de llamadas telefónicas
      - 🏢 Multi-tenancy (múltiples clientes)
      - 🔐 Autenticación JWT + GHL OAuth
      - 📊 Gestión de campañas y contactos
      - 🔗 Integraciones (Twilio, OpenAI, Gemini, ElevenLabs)
      - 📈 Analytics y reportes
    `,
    )
    .setVersion('1.0.0')
    .setContact(
      'PrixAgent Team',
      'https://agent.prixcenter.com',
      'support@prixcenter.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('https://agent.prixcenter.com', 'Producción')
    .addServer(
      `${process.env.API_PROTOCOL || 'http'}://${process.env.API_HOST || 'localhost'}:${process.env.PORT || '3000'}`,
      'Desarrollo',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Token JWT para autenticación',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Autenticación y autorización')
    .addTag('Tenancy', 'Gestión de accounts (clientes)')
    .addTag('Agents', 'Gestión de agentes de IA')
    .addTag('Campaigns', 'Gestión de campañas')
    .addTag('Contacts', 'Gestión de contactos')
    .addTag('Calls', 'Registro de llamadas')
    .addTag('Integrations', 'Integraciones externas')
    .addTag('Billing', 'Facturación y suscripciones')
    .addTag('Webhooks', 'Webhooks y notificaciones')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
    customSiteTitle: 'PrixAgent SaaS API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #2563eb; }
    `,
  });

  return document;
};
