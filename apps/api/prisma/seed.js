'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const client_1 = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL no encontrada en el archivo .env');
  console.error('Archivo .env buscado en:', envPath);
  process.exit(1);
}
console.log('✅ Variables de entorno cargadas correctamente');
console.log('📁 Archivo .env:', envPath);
const prisma = new client_1.PrismaClient();
async function main() {
  console.log('🌱 Iniciando seeds de datos...');
  const account = await prisma.account.upsert({
    where: { email: 'demo@prixagent.com' },
    update: {},
    create: {
      name: 'PrixAgent Demo',
      slug: 'prixagent-demo',
      email: 'demo@prixagent.com',
      status: 'active',
    },
  });
  console.log('✅ Account creado:', account.name);
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@prixagent.com')
    .trim()
    .toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'default123';
  const adminName = process.env.ADMIN_NAME || 'Yalim Admin';
  const adminRole = process.env.ADMIN_ROLE || 'superadmin';
  const [adminFirstName, ...adminLastNameParts] = adminName.split(' ');
  const adminLastName = adminLastNameParts.join(' ') || 'Admin';
  const adminHashedPassword = await bcrypt.hash(adminPassword, 10);
  const adminUser = await prisma.user.upsert({
    where: {
      accountId_email: {
        accountId: account.id,
        email: adminEmail,
      },
    },
    update: {
      passwordHash: adminHashedPassword,
      firstName: adminFirstName,
      lastName: adminLastName,
      role: adminRole,
    },
    create: {
      accountId: account.id,
      email: adminEmail,
      passwordHash: adminHashedPassword,
      firstName: adminFirstName,
      lastName: adminLastName,
      role: adminRole,
      status: 'active',
    },
  });
  console.log(
    '✅ Usuario Super Administrador creado/actualizado:',
    adminUser.email,
  );
  const userPassword = await bcrypt.hash('demo123', 10);
  const testUser = await prisma.user.upsert({
    where: {
      accountId_email: {
        accountId: account.id,
        email: 'demo@example.com',
      },
    },
    update: {
      passwordHash: userPassword,
      firstName: 'Yalim',
      lastName: 'User',
    },
    create: {
      accountId: account.id,
      email: 'demo@example.com',
      passwordHash: userPassword,
      firstName: 'Yalim',
      lastName: 'User',
      role: 'user',
      status: 'active',
    },
  });
  console.log('✅ Usuario de prueba creado:', testUser.email);
  const agent = await prisma.agent.create({
    data: {
      accountId: account.id,
      name: 'Agente de Ventas',
      description: 'Agente especializado en ventas telefónicas',
      type: 'outbound',
      status: 'active',
      llmProvider: 'openai',
      llmModel: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
      voiceName: 'EXAVITQu4vr4xnSDxMaL', // Voz de ejemplo - debe ser reemplazada por el usuario
      language: 'es',
    },
  });
  console.log('✅ Agente creado:', agent.name);
  const phoneNumber = await prisma.phoneNumber.upsert({
    where: {
      number: '+1234567890',
    },
    update: {},
    create: {
      accountId: account.id,
      number: '+1234567890',
      country: 'US',
      type: 'local',
      provider: 'twilio',
      status: 'active',
      description: 'Número principal de demo',
    },
  });
  console.log('✅ Número de teléfono creado:', phoneNumber.number);
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        accountId: account.id,
        name: 'Juan',
        lastName: 'Pérez',
        phone: '+1234567891',
        email: 'juan@example.com',
        company: 'Empresa Demo',
        status: 'active',
        source: 'manual',
      },
    }),
    prisma.contact.create({
      data: {
        accountId: account.id,
        name: 'María',
        lastName: 'González',
        phone: '+1234567892',
        email: 'maria@example.com',
        company: 'Empresa Demo 2',
        status: 'active',
        source: 'manual',
      },
    }),
  ]);
  console.log('✅ Contactos creados:', contacts.length);
  const twilioConfig = await prisma.accountTwilioConfig.upsert({
    where: { accountId: account.id },
    update: {},
    create: {
      accountId: account.id,
      accountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      authToken: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      webhookUrl: 'https://your-domain.com/webhooks/twilio',
      status: 'trial',
    },
  });
  console.log('✅ Configuración de Twilio creada:', twilioConfig.accountSid);
  const ghlConfig = await prisma.accountGhlConfig.upsert({
    where: { accountId: account.id },
    update: {},
    create: {
      accountId: account.id,
      apiKey: 'your-ghl-api-key-here',
      locationId: 'your-location-id-here',
      baseUrl: 'https://rest.gohighlevel.com/v1',
      status: 'active',
    },
  });
  console.log('✅ Configuración de GoHighLevel creada:', ghlConfig.id);
  console.log('🎉 Seeds completados exitosamente!');
}
main()
  .catch((e) => {
    console.error('❌ Error en seeds:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
//# sourceMappingURL=seed.js.map
