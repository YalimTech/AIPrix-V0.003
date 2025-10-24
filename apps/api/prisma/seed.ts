import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde el archivo .env de la raíz del proyecto
// IMPORTANTE: Esto debe hacerse ANTES de crear el PrismaClient
// El archivo .env está en la raíz del proyecto (3 niveles arriba desde prisma/)
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

// Verificar que DATABASE_URL esté cargada
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL no encontrada en el archivo .env');
  console.error('Archivo .env buscado en:', envPath);
  process.exit(1);
}

console.log('✅ Variables de entorno cargadas correctamente');
console.log('📁 Archivo .env:', envPath);

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeds de datos...');

  // Crear account principal
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

  // Crear usuario administrador del .env
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

  // Crear usuario de prueba
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

  // Crear agente de ejemplo
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

  // Crear número de teléfono de ejemplo
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

  // Crear algunos contactos de ejemplo
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

  // Crear configuración de Twilio con credenciales de prueba
  const twilioConfig = await prisma.accountTwilioConfig.upsert({
    where: { accountId: account.id },
    update: {},
    create: {
      accountId: account.id,
      accountSid: 'ACdemo-twilio-account-sid', // Account SID de prueba de Twilio
      authToken: 'demo-twilio-token', // Auth Token de prueba de Twilio
      webhookUrl: 'https://your-domain.com/webhooks/twilio',
      status: 'trial', // Marcar como cuenta de prueba
    },
  });

  console.log('✅ Configuración de Twilio creada:', twilioConfig.accountSid);

  // Crear configuración de GoHighLevel con credenciales de prueba
  const ghlConfig = await prisma.accountGhlConfig.upsert({
    where: { accountId: account.id },
    update: {},
    create: {
      accountId: account.id,
      apiKey: 'demo-ghl-api-key', // API Key de GoHighLevel
      locationId: 'your-location-id-here', // Location ID de GoHighLevel
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
