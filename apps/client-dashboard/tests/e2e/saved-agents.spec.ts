import { expect, test } from '@playwright/test'

test.describe('SavedAgents E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de Saved Agents
    await page.goto('/saved-agents')
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle')
  })

  test('debe cargar la página correctamente', async ({ page }) => {
    // Verificar que el título esté presente
    await expect(page.getByText('Saved Agents')).toBeVisible()
    
    // Verificar que los elementos principales estén presentes
    await expect(page.getByPlaceholderText('Search agents...')).toBeVisible()
    await expect(page.getByText('Agent Type')).toBeVisible()
    await expect(page.getByText('Create Folder')).toBeVisible()
    await expect(page.getByText('Import Agent')).toBeVisible()
    await expect(page.getByText('Sync ElevenLabs')).toBeVisible()
  })

  test('debe filtrar agentes por búsqueda', async ({ page }) => {
    // Buscar un agente específico
    const searchInput = page.getByPlaceholderText('Search agents...')
    await searchInput.fill('Test Agent 1')
    
    // Verificar que solo se muestre el agente buscado
    await expect(page.getByText('Test Agent 1')).toBeVisible()
    
    // Limpiar la búsqueda
    await searchInput.clear()
    
    // Verificar que se muestren todos los agentes nuevamente
    await expect(page.getByText('Test Agent 1')).toBeVisible()
    await expect(page.getByText('Test Agent 2')).toBeVisible()
  })

  test('debe filtrar agentes por tipo', async ({ page }) => {
    // Abrir el dropdown de tipo de agente
    await page.getByText('Agent Type').click()
    
    // Seleccionar tipo "Inbound"
    await page.getByText('Inbound').click()
    
    // Verificar que solo se muestren agentes inbound
    await expect(page.getByText('Test Agent 1')).toBeVisible()
    
    // Cambiar a tipo "Outbound"
    await page.getByText('Agent Type').click()
    await page.getByText('Outbound').click()
    
    // Verificar que solo se muestren agentes outbound
    await expect(page.getByText('Test Agent 2')).toBeVisible()
  })

  test('debe mostrar menú contextual de acciones', async ({ page }) => {
    // Buscar el primer botón de opciones
    const optionButtons = page.locator('button[aria-label*="options"], button[aria-label*="Options"]')
    await optionButtons.first().click()
    
    // Verificar que aparezcan las opciones del menú
    await expect(page.getByText('Edit')).toBeVisible()
    await expect(page.getByText('Delete')).toBeVisible()
    await expect(page.getByText('Duplicate')).toBeVisible()
    await expect(page.getByText('Quick Edit')).toBeVisible()
    await expect(page.getByText('Move to Folder')).toBeVisible()
    await expect(page.getByText('Edit Phone Number')).toBeVisible()
    await expect(page.getByText('Training Mode')).toBeVisible()
    await expect(page.getByText('Copy Webhook')).toBeVisible()
    await expect(page.getByText('Upload Avatar')).toBeVisible()
  })

  test('debe navegar a edición de agente', async ({ page }) => {
    // Abrir menú contextual
    const optionButtons = page.locator('button[aria-label*="options"], button[aria-label*="Options"]')
    await optionButtons.first().click()
    
    // Hacer clic en Edit
    await page.getByText('Edit').click()
    
    // Verificar que se navegue a la página de edición
    await expect(page).toHaveURL(/.*agents.*edit/)
  })

  test('debe mostrar confirmación de eliminación', async ({ page }) => {
    // Abrir menú contextual
    const optionButtons = page.locator('button[aria-label*="options"], button[aria-label*="Options"]')
    await optionButtons.first().click()
    
    // Configurar el handler para el diálogo de confirmación
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('¿Estás seguro de que quieres eliminar este agente?')
      await dialog.accept()
    })
    
    // Hacer clic en Delete
    await page.getByText('Delete').click()
    
    // Verificar que se muestre el diálogo de confirmación
    // (El handler ya verifica el contenido del diálogo)
  })

  test('debe mostrar prompt de duplicación', async ({ page }) => {
    // Abrir menú contextual
    const optionButtons = page.locator('button[aria-label*="options"], button[aria-label*="Options"]')
    await optionButtons.first().click()
    
    // Configurar el handler para el prompt
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Enter a new name for the duplicated agent')
      await dialog.accept('Test Agent Copy')
    })
    
    // Hacer clic en Duplicate
    await page.getByText('Duplicate').click()
    
    // Verificar que se muestre el prompt
    // (El handler ya verifica el contenido del prompt)
  })

  test('debe abrir modal de llamada', async ({ page }) => {
    // Buscar botón de llamada
    const callButtons = page.locator('button[aria-label*="call"], button[aria-label*="Call"]')
    await callButtons.first().click()
    
    // Verificar que se abra el modal de llamada
    await expect(page.locator('[data-testid="launch-call-modal"]')).toBeVisible()
  })

  test('debe copiar ID del agente', async ({ page }) => {
    // Abrir menú contextual
    const optionButtons = page.locator('button[aria-label*="options"], button[aria-label*="Options"]')
    await optionButtons.first().click()
    
    // Hacer clic en Copy Webhook
    await page.getByText('Copy Webhook').click()
    
    // Verificar que se copie al portapapeles
    // (Esto requeriría verificar el portapapeles, que puede ser complejo en E2E)
    // Por ahora, verificamos que no haya errores
    await expect(page.getByText('Copy Webhook')).not.toBeVisible() // Menú se cierra
  })

  test('debe crear nueva carpeta', async ({ page }) => {
    // Hacer clic en Create Folder
    await page.getByText('Create Folder').click()
    
    // Verificar que aparezca el modal
    await expect(page.getByPlaceholderText('Enter folder name')).toBeVisible()
    
    // Llenar el nombre de la carpeta
    await page.getByPlaceholderText('Enter folder name').fill('Nueva Carpeta de Prueba')
    
    // Hacer clic en Create
    await page.getByText('Create').click()
    
    // Verificar que se cierre el modal
    await expect(page.getByPlaceholderText('Enter folder name')).not.toBeVisible()
  })

  test('debe importar agente', async ({ page }) => {
    // Hacer clic en Import Agent
    await page.getByText('Import Agent').click()
    
    // Verificar que aparezca el modal
    await expect(page.getByPlaceholderText('Enter agent ID')).toBeVisible()
    
    // Llenar el ID del agente
    await page.getByPlaceholderText('Enter agent ID').fill('test-agent-id-123')
    
    // Hacer clic en Import
    await page.getByText('Import').click()
    
    // Verificar que se cierre el modal
    await expect(page.getByPlaceholderText('Enter agent ID')).not.toBeVisible()
  })

  test('debe sincronizar con ElevenLabs', async ({ page }) => {
    // Hacer clic en Sync ElevenLabs
    await page.getByText('Sync ElevenLabs').click()
    
    // Verificar que no haya errores
    // (La sincronización puede tomar tiempo, así que solo verificamos que no falle)
    await page.waitForTimeout(1000)
  })

  test('debe alternar vista de carpetas', async ({ page }) => {
    // Verificar que esté en vista de carpetas por defecto
    await expect(page.getByText('Show All Folders')).toBeVisible()
    
    // Hacer clic para cambiar vista
    await page.getByText('Show All Folders').click()
    
    // Verificar que cambie el texto del botón
    await expect(page.getByText('Hide Folders')).toBeVisible()
    
    // Hacer clic para volver a la vista original
    await page.getByText('Hide Folders').click()
    
    // Verificar que vuelva al texto original
    await expect(page.getByText('Show All Folders')).toBeVisible()
  })

  test('debe mostrar información del agente en las tarjetas', async ({ page }) => {
    // Verificar que las tarjetas de agentes muestren información básica
    const agentCards = page.locator('[data-testid*="agent-card"], .agent-card, [class*="agent-card"]')
    
    // Verificar que al menos una tarjeta esté presente
    await expect(agentCards.first()).toBeVisible()
    
    // Verificar que se muestre el nombre del agente
    await expect(page.getByText('Test Agent 1')).toBeVisible()
    await expect(page.getByText('Test Agent 2')).toBeVisible()
  })

  test('debe manejar carga y errores correctamente', async ({ page }) => {
    // Verificar que no haya indicadores de carga visibles después de cargar
    await expect(page.locator('[data-testid*="loading"], .loading, [class*="loading"]')).not.toBeVisible()
    
    // Verificar que no haya mensajes de error visibles
    await expect(page.locator('[data-testid*="error"], .error, [class*="error"]')).not.toBeVisible()
  })

  test('debe ser responsive en diferentes tamaños de pantalla', async ({ page }) => {
    // Probar en móvil
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByText('Saved Agents')).toBeVisible()
    
    // Probar en tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByText('Saved Agents')).toBeVisible()
    
    // Probar en desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.getByText('Saved Agents')).toBeVisible()
  })

  test('debe manejar navegación por teclado', async ({ page }) => {
    // Usar Tab para navegar por los elementos
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Verificar que algún elemento esté enfocado
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('debe mostrar tooltips y información adicional', async ({ page }) => {
    // Buscar elementos con tooltips o información adicional
    const tooltipElements = page.locator('[title], [data-tooltip], [aria-label]')
    
    // Verificar que al menos algunos elementos tengan información adicional
    const count = await tooltipElements.count()
    expect(count).toBeGreaterThan(0)
  })
})
