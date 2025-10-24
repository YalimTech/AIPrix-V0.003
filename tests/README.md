# Tests de Producción - PrixAgent SaaS

Este directorio contiene tests para verificar que las optimizaciones de producción funcionan correctamente usando la URL de producción: `https://agent.prixcenter.com`

## 🚀 Tests Disponibles

### 1. Test Rápido (`quick-test.js`)

Test básico para verificar funcionalidad esencial:

- Health check de la API
- Login con credenciales de prueba
- Acceso al dashboard
- Configuración CORS

```bash
npm run test:quick
# o
node quick-test.js
```

### 2. Test de API (`api-production.test.js`)

Test completo de la API backend:

- Health endpoints
- Login endpoint
- Headers CORS
- Tiempos de respuesta
- Requests concurrentes

```bash
npm run test:api
# o
node api-production.test.js
```

### 3. Test de Dashboard (`client-dashboard.test.js`)

Test del cliente dashboard:

- Acceso al dashboard
- Assets estáticos
- Integración con API
- Flujo de login completo
- Métricas de rendimiento

```bash
npm run test:dashboard
# o
node client-dashboard.test.js
```

### 4. Test Completo (`run-all-tests.js`)

Ejecuta todos los tests y genera un reporte completo:

- Diagnóstico de producción
- Optimización de configuración
- Tests de API
- Tests de Dashboard
- Reporte final

```bash
npm test
# o
node run-all-tests.js
```

## 📊 Scripts de Diagnóstico y Optimización

### Diagnóstico de Producción

```bash
npm run diagnostic
# o
node ../scripts/diagnostic-production.js
```

### Optimización de Producción

```bash
npm run optimize
# o
node ../scripts/optimize-production.js
```

## 🔧 Configuración

Los tests están configurados para usar la URL de producción:

- **Base URL**: `https://agent.prixcenter.com`
- **API Endpoint**: `https://agent.prixcenter.com/api/v1`
- **Dashboard**: `https://agent.prixcenter.com/dashboard`

### Credenciales de Prueba

- **Email**: `test@prixagent.com`
- **Password**: `TestPassword123!`

## 📋 Interpretación de Resultados

### Estados de Test

- ✅ **Success**: Test pasó correctamente
- ⚠️ **Warning**: Test pasó pero con advertencias
- ❌ **Error**: Test falló

### Métricas de Rendimiento

- **Optimal**: < 3 segundos
- **Acceptable**: < 5 segundos
- **Slow**: > 5 segundos

### Tasa de Éxito

- **Excelente**: ≥ 90%
- **Buena**: ≥ 80%
- **Necesita Mejoras**: < 80%

## 🚨 Solución de Problemas

### Error de Timeout

```bash
# Verificar conectividad
curl -f https://agent.prixcenter.com/health

# Verificar DNS
nslookup agent.prixcenter.com
```

### Error de CORS

```bash
# Verificar headers CORS
curl -H "Origin: https://agent.prixcenter.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://agent.prixcenter.com/api/v1/health
```

### Error de Login

```bash
# Verificar endpoint de login
curl -X POST https://agent.prixcenter.com/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@prixagent.com","password":"TestPassword123!"}'
```

## 📈 Monitoreo Continuo

### Ejecutar Tests Automáticamente

```bash
# Cada 5 minutos
*/5 * * * * cd /path/to/tests && npm run test:quick

# Cada hora
0 * * * * cd /path/to/tests && npm test
```

### Alertas por Email

Los tests pueden ser integrados con sistemas de monitoreo para enviar alertas cuando fallen.

## 🔍 Debugging

### Logs Detallados

Los tests incluyen logging detallado para facilitar el debugging:

- Tiempos de respuesta
- Códigos de estado HTTP
- Headers de respuesta
- Errores específicos

### Variables de Entorno

```bash
# Para debugging local
export DEBUG=true
export VERBOSE=true
```

## 📝 Reportes

Los tests generan reportes en formato JSON que incluyen:

- Timestamp de ejecución
- Resultados de cada test
- Métricas de rendimiento
- Resumen de éxito/fallo
- Duración total

### Ubicación de Reportes

- **Test Completo**: `test-results.json`
- **Logs**: Consola con colores
- **Métricas**: Incluidas en reportes JSON

## 🛠️ Desarrollo

### Agregar Nuevos Tests

1. Crear archivo de test en este directorio
2. Agregar script en `package.json`
3. Incluir en `run-all-tests.js`
4. Documentar en este README

### Estructura de Test

```javascript
async function testFunction() {
  log("\n🧪 Test Description...", "cyan");

  try {
    // Test logic
    log(`✅ Test passed`, "green");
    return { status: "success", data: result };
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, "red");
    return { status: "error", error: error.message };
  }
}
```

## 📞 Soporte

Si los tests fallan consistentemente:

1. Verificar conectividad de red
2. Revisar logs de la aplicación
3. Ejecutar diagnóstico completo
4. Contactar al equipo de desarrollo

Los tests están diseñados para ser robustos y proporcionar información útil para la resolución de problemas en producción.
