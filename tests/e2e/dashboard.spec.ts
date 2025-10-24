import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/');
    
    // Mock successful login
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

    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display dashboard overview', async ({ page }) => {
    // Check for main dashboard elements
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('[data-testid="stats-cards"]')).toBeVisible();
    await expect(page.locator('[data-testid="recent-calls"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-campaigns"]')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Agentes')).toBeVisible();
    await expect(page.locator('text=Campañas')).toBeVisible();
    await expect(page.locator('text=Contactos')).toBeVisible();
    await expect(page.locator('text=Llamadas')).toBeVisible();
  });

  test('should navigate to agents page', async ({ page }) => {
    await page.click('text=Agentes');
    await expect(page).toHaveURL('/agents');
    await expect(page.locator('h1')).toContainText('Agentes');
  });

  test('should navigate to campaigns page', async ({ page }) => {
    await page.click('text=Campañas');
    await expect(page).toHaveURL('/campaigns');
    await expect(page.locator('h1')).toContainText('Campañas');
  });

  test('should navigate to contacts page', async ({ page }) => {
    await page.click('text=Contactos');
    await expect(page).toHaveURL('/contacts');
    await expect(page.locator('h1')).toContainText('Contactos');
  });

  test('should navigate to calls page', async ({ page }) => {
    await page.click('text=Llamadas');
    await expect(page).toHaveURL('/calls');
    await expect(page.locator('h1')).toContainText('Llamadas');
  });

  test('should display user menu and logout', async ({ page }) => {
    await page.click('[data-testid="user-menu"]');
    await expect(page.locator('text=Cerrar Sesión')).toBeVisible();
    
    await page.click('text=Cerrar Sesión');
    await expect(page).toHaveURL('/');
  });

  test('should display real-time stats', async ({ page }) => {
    // Mock WebSocket connection
    await page.evaluate(() => {
      window.mockWebSocket = {
        emit: () => {},
        on: () => {},
        connected: true,
      };
    });

    // Check for stats cards
    await expect(page.locator('[data-testid="total-calls"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-agents"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-contacts"]')).toBeVisible();
  });
});
