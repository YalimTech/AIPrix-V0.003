import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    // Check for validation messages
    await expect(page.locator('text=Email es requerido')).toBeVisible();
    await expect(page.locator('text=Contraseña es requerida')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.locator('text=Credenciales inválidas')).toBeVisible();
  });

  test('should redirect to dashboard on successful login', async ({ page }) => {
    // Mock successful login response
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

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle forgot password flow', async ({ page }) => {
    await page.click('text=¿Olvidaste tu contraseña?');
    
    // Should show forgot password form
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('text=Enviar enlace de recuperación')).toBeVisible();
  });

  test('should handle registration flow', async ({ page }) => {
    await page.click('text=Crear cuenta');
    
    // Should show registration form
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });
});
