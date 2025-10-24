import { test, expect } from '@playwright/test';

test.describe('Export/Import Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/');
    
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          user: {
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
            tenantId: 'tenant-1',
          },
        }),
      });
    });

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.goto('/contacts');
  });

  test('should export contacts to CSV', async ({ page }) => {
    // Mock contacts data
    await page.route('**/api/contacts', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'contact-1',
            name: 'John Doe',
            lastName: 'Smith',
            phone: '+1234567890',
            email: 'john@example.com',
            company: 'Test Company',
            status: 'active',
            source: 'import',
            createdAt: '2023-01-01T00:00:00Z',
          },
        ]),
      });
    });

    await page.reload();
    
    // Mock export endpoint
    await page.route('**/api/export-import/contacts/export?format=csv', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/csv',
        body: 'ID,Nombre,Apellido,Teléfono,Email,Empresa,Estado,Fuente,Fecha de Creación\ncontact-1,John,Doe,+1234567890,john@example.com,Test Company,active,import,2023-01-01T00:00:00Z',
        headers: {
          'Content-Disposition': 'attachment; filename="contactos_2023-01-01.csv"',
        },
      });
    });

    // Click export button
    await page.click('button:has-text("Exportar")');
    await page.click('text=CSV');

    // Should trigger download
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Descargar")');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('contactos_');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should export contacts to Excel', async ({ page }) => {
    // Mock export endpoint for Excel
    await page.route('**/api/export-import/contacts/export?format=xlsx', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: Buffer.from('mock-excel-content'),
        headers: {
          'Content-Disposition': 'attachment; filename="contactos_2023-01-01.xlsx"',
        },
      });
    });

    await page.click('button:has-text("Exportar")');
    await page.click('text=Excel');

    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Descargar")');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('.xlsx');
  });

  test('should import contacts from CSV', async ({ page }) => {
    // Mock import endpoint
    await page.route('**/api/export-import/contacts/import', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Importación completada: 5 exitosos, 0 errores',
          result: {
            success: 5,
            errors: 0,
            total: 5,
            errorsList: [],
          },
        }),
      });
    });

    // Click import button
    await page.click('button:has-text("Importar")');
    
    // Should open import modal
    await expect(page.locator('[data-testid="import-modal"]')).toBeVisible();
    
    // Create a test CSV file
    const csvContent = 'nombre,teléfono,email\nJohn Doe,+1234567890,john@example.com\nJane Smith,+0987654321,jane@example.com';
    const csvFile = new File([csvContent], 'test-contacts.csv', { type: 'text/csv' });
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-contacts.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });
    
    // Submit import
    await page.click('button:has-text("Importar Archivo")');

    // Should show success message
    await expect(page.locator('text=Importación completada: 5 exitosos, 0 errores')).toBeVisible();
  });

  test('should handle import errors', async ({ page }) => {
    // Mock import endpoint with errors
    await page.route('**/api/export-import/contacts/import', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Importación completada: 2 exitosos, 1 errores',
          result: {
            success: 2,
            errors: 1,
            total: 3,
            errorsList: [
              {
                row: 2,
                error: 'Nombre y teléfono son requeridos',
                data: { nombre: '', teléfono: '', email: 'invalid@email' },
              },
            ],
          },
        }),
      });
    });

    await page.click('button:has-text("Importar")');
    
    // Create CSV with invalid data
    const csvContent = 'nombre,teléfono,email\nJohn Doe,+1234567890,john@example.com\n,+0987654321,invalid@email\nJane Smith,+1111111111,jane@example.com';
    const csvFile = new File([csvContent], 'test-contacts.csv', { type: 'text/csv' });
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-contacts.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });
    
    await page.click('button:has-text("Importar Archivo")');

    // Should show error details
    await expect(page.locator('text=Importación completada: 2 exitosos, 1 errores')).toBeVisible();
    await expect(page.locator('text=Nombre y teléfono son requeridos')).toBeVisible();
  });

  test('should export calls data', async ({ page }) => {
    await page.goto('/calls');
    
    // Mock calls export endpoint
    await page.route('**/api/export-import/calls/export?format=csv', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/csv',
        body: 'ID,Número de Teléfono,Estado,Duración,Éxito,Fecha de Creación\ncall-1,+1234567890,completed,120,true,2023-01-01T00:00:00Z',
        headers: {
          'Content-Disposition': 'attachment; filename="llamadas_2023-01-01.csv"',
        },
      });
    });

    await page.click('button:has-text("Exportar")');
    await page.click('text=CSV');

    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Descargar")');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('llamadas_');
  });

  test('should export campaigns data', async ({ page }) => {
    await page.goto('/campaigns');
    
    // Mock campaigns export endpoint
    await page.route('**/api/export-import/campaigns/export?format=csv', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/csv',
        body: 'ID,Nombre,Estado,Tipo,Fecha de Creación\ncampaign-1,Test Campaign,active,outbound,2023-01-01T00:00:00Z',
        headers: {
          'Content-Disposition': 'attachment; filename="campañas_2023-01-01.csv"',
        },
      });
    });

    await page.click('button:has-text("Exportar")');
    await page.click('text=CSV');

    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Descargar")');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('campañas_');
  });

  test('should create and restore backup', async ({ page }) => {
    // Mock backup creation
    await page.route('**/api/export-import/backup/create', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tenant: { id: 'tenant-1', name: 'Test Tenant' },
          exportDate: '2023-01-01T00:00:00Z',
          version: '1.0',
        }),
        headers: {
          'Content-Disposition': 'attachment; filename="backup_tenant-1_2023-01-01.json"',
        },
      });
    });

    // Mock backup restoration
    await page.route('**/api/export-import/backup/restore', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Backup restaurado exitosamente',
          result: {
            success: 1,
            errors: 0,
            total: 1,
            errorsList: [],
          },
        }),
      });
    });

    // Test backup creation
    await page.click('button:has-text("Crear Backup")');
    
    const downloadPromise = page.waitForEvent('download');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('backup_');

    // Test backup restoration
    await page.click('button:has-text("Restaurar Backup")');
    
    const backupContent = JSON.stringify({
      tenant: { id: 'tenant-1', name: 'Test Tenant' },
      exportDate: '2023-01-01T00:00:00Z',
      version: '1.0',
    });
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(backupContent),
    });
    
    await page.click('button:has-text("Restaurar")');
    
    await expect(page.locator('text=Backup restaurado exitosamente')).toBeVisible();
  });
});
