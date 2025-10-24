import { expect, test } from "@playwright/test";

test.describe("Agents Management", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication and navigate to agents page
    await page.goto("/");

    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "mock-token",
          user: {
            id: "user-1",
            email: "test@example.com",
            name: "Test User",
            tenantId: "tenant-1",
          },
        }),
      });
    });

    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    await page.goto("/agents");
  });

  test("should display agents list", async ({ page }) => {
    // This test is for a different page, we can adapt it later if needed.
    // For now, the main goal is testing the creation flow.
    await page.goto("/saved-agents");
    await expect(page.locator("h1")).toContainText("Saved Agents");
    await expect(
      page.locator('button:has-text("Create New Agent")'),
    ).toBeVisible();
  });

  test("should navigate to creation page and create a new agent with detailed configuration", async ({
    page,
  }) => {
    // Navigate to the agent creation page
    await page.goto("/outbound-agent");

    // Wait for the voices to load.
    await page.waitForSelector("div.w-16.h-16.rounded-full");

    const agentName = `E2E Agent Calendario ${Date.now()}`;

    // 1. Set Language
    await page.selectOption("select", "Spanish");

    // 2. Fill the main fields
    await page.fill('input[placeholder="Agent Name"]', agentName);
    await page.fill(
      'input[placeholder="Opening Message"]',
      "Hola, soy tu asistente virtual.",
    );
    await page.fill(
      'textarea[placeholder*="Instruct the AI"]',
      "Saluda y deseale lo mejor en la vida y un excelente resto de la semana. Y agenda en el calendario para que coordinen una reunion virtual. Recuerda qeu debes agendario en el calendario de gohighlevel.",
    );

    // 3. Adjust sliders
    // AI Creativity
    await page.locator('input[type="range"]').nth(0).fill("0");
    // Initial Message Delay
    await page.locator('input[type="range"]').nth(2).fill("0");

    // Note: VM Detection, Interrupt Sensitivity, and Response Speed are already set to the desired defaults (On, High, Sensitive).

    // 4. Select a voice (we'll click the 8th voice, "Chris", as in the screenshot)
    await page.locator("div.w-16.h-16.rounded-full").nth(7).click();

    // 5. Click the save button
    await page.click('button:has-text("Save Agent")');

    // 6. Assert navigation to the saved agents page
    await page.waitForURL("**/saved-agents");
    await expect(page).toHaveURL(/.*saved-agents/);

    // 7. Assert that a success notification is visible
    await expect(page.locator("text=Agente Creado")).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.locator("text=El agente se ha creado exitosamente"),
    ).toBeVisible();

    // 8. Assert that the new agent is in the list
    await expect(page.locator(`text=${agentName}`)).toBeVisible();
  });

  test("should edit existing agent", async ({ page }) => {
    // Mock agents data
    await page.route("**/api/agents", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "agent-1",
            name: "Existing Agent",
            description: "Existing description",
            status: "active",
            type: "conversational",
            llmProvider: "openai",
            llmModel: "gpt-3.5-turbo",
            voiceName: "Test Voice",
          },
        ]),
      });
    });

    await page.reload();

    // Click edit button
    await page.click('[data-testid="edit-agent-1"]');

    // Update agent name
    await page.fill('input[name="name"]', "Updated Agent Name");
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(
      page.locator("text=Agente actualizado exitosamente"),
    ).toBeVisible();
  });

  test("should delete agent", async ({ page }) => {
    // Mock agents data
    await page.route("**/api/agents", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "agent-1",
            name: "Agent to Delete",
            status: "active",
            type: "conversational",
          },
        ]),
      });
    });

    await page.reload();

    // Click delete button
    await page.click('[data-testid="delete-agent-1"]');

    // Confirm deletion
    await page.click('button:has-text("Confirmar")');

    // Should show success message
    await expect(
      page.locator("text=Agente eliminado exitosamente"),
    ).toBeVisible();
  });

  test("should test agent configuration", async ({ page }) => {
    // Mock agents data
    await page.route("**/api/agents", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "agent-1",
            name: "Test Agent",
            status: "active",
            type: "conversational",
          },
        ]),
      });
    });

    await page.reload();

    // Click test button
    await page.click('[data-testid="test-agent-1"]');

    // Should open test modal
    await expect(
      page.locator('[data-testid="agent-test-modal"]'),
    ).toBeVisible();
    await expect(page.locator('textarea[name="testMessage"]')).toBeVisible();

    // Send test message
    await page.fill(
      'textarea[name="testMessage"]',
      "Hello, this is a test message",
    );
    await page.click('button:has-text("Enviar")');

    // Should show response
    await expect(page.locator('[data-testid="agent-response"]')).toBeVisible();
  });

  test("should filter agents by status", async ({ page }) => {
    // Mock agents data
    await page.route("**/api/agents", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "agent-1",
            name: "Active Agent",
            status: "active",
            type: "conversational",
          },
          {
            id: "agent-2",
            name: "Inactive Agent",
            status: "inactive",
            type: "conversational",
          },
        ]),
      });
    });

    await page.reload();

    // Filter by active status
    await page.selectOption('[data-testid="status-filter"]', "active");

    // Should only show active agents
    await expect(page.locator("text=Active Agent")).toBeVisible();
    await expect(page.locator("text=Inactive Agent")).not.toBeVisible();
  });

  test("should search agents by name", async ({ page }) => {
    // Mock agents data
    await page.route("**/api/agents", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "agent-1",
            name: "Customer Service Agent",
            status: "active",
            type: "conversational",
          },
          {
            id: "agent-2",
            name: "Sales Agent",
            status: "active",
            type: "conversational",
          },
        ]),
      });
    });

    await page.reload();

    // Search for "Customer"
    await page.fill('[data-testid="search-input"]', "Customer");

    // Should only show matching agents
    await expect(page.locator("text=Customer Service Agent")).toBeVisible();
    await expect(page.locator("text=Sales Agent")).not.toBeVisible();
  });
});
