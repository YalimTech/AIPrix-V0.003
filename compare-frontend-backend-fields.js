// Campos que envía el frontend según los logs
const frontendFields = [
  'name',
  'description', 
  'type',
  'voiceName',
  'language',
  'preMadePrompt',
  'maxTokens',
  'temperature',
  'status',
  'doubleCall',
  'vmDetection',
  'interruptSensitivity',
  'responseSpeed',
  'initialMessageDelay',
  'webhookUrl',
  'callTransferType',
  'callTransferPhoneNumber',
  'callTransferKeywords',
  'callTransferBusinessHours',
  'calendarBookingEnabled',
  'calendarBookingProvider',
  'calendarBookingId',
  'calendarBookingTimezone'
];

// Campos que acepta el DTO según el código
const dtoFields = [
  'name',
  'description',
  'type',
  'status',
  'language',
  'llmProvider',
  'llmModel',
  'fallbackProvider',
  'maxTokens',
  'voiceName',
  'initialMessageDelay',
  'preMadePrompt',
  'systemPrompt',
  'elevenLabsAgentId',
  'vmDetection',
  'doubleCall',
  'webhookConfig',
  'temperature',
  'calendarBookingEnabled',
  'calendarBookingProvider',
  'calendarBookingId',
  'calendarBookingTimezone',
  'interruptSensitivity',
  'responseSpeed',
  'webhookUrl',
  'callTransferType',
  'callTransferPhoneNumber',
  'callTransferKeywords',
  'callTransferBusinessHours'
];

console.log('🔍 Comparando campos del frontend vs DTO:\n');

// Campos que envía el frontend pero NO están en el DTO
const frontendOnlyFields = frontendFields.filter(field => !dtoFields.includes(field));
console.log('❌ Campos que envía el frontend pero NO están en el DTO:');
frontendOnlyFields.forEach(field => console.log(`   - ${field}`));

// Campos que están en el DTO pero NO envía el frontend
const dtoOnlyFields = dtoFields.filter(field => !frontendFields.includes(field));
console.log('\n⚠️ Campos que están en el DTO pero NO envía el frontend:');
dtoOnlyFields.forEach(field => console.log(`   - ${field}`));

// Campos comunes
const commonFields = frontendFields.filter(field => dtoFields.includes(field));
console.log('\n✅ Campos comunes (frontend y DTO):');
commonFields.forEach(field => console.log(`   - ${field}`));

console.log(`\n📊 Resumen:`);
console.log(`   - Total campos frontend: ${frontendFields.length}`);
console.log(`   - Total campos DTO: ${dtoFields.length}`);
console.log(`   - Campos comunes: ${commonFields.length}`);
console.log(`   - Campos solo frontend: ${frontendOnlyFields.length}`);
console.log(`   - Campos solo DTO: ${dtoOnlyFields.length}`);

if (frontendOnlyFields.length > 0) {
  console.log('\n🚨 PROBLEMA ENCONTRADO:');
  console.log('El frontend está enviando campos que no están permitidos en el DTO.');
  console.log('Esto causa el error 400 debido a forbidNonWhitelisted: true');
  console.log('\n💡 SOLUCIÓN:');
  console.log('1. Agregar los campos faltantes al DTO, o');
  console.log('2. Remover los campos del frontend, o');
  console.log('3. Hacer los campos opcionales en el DTO');
}
