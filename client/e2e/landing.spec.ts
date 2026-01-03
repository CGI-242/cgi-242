/**
 * E2E tests for Landing page
 */

import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the landing page', async ({ page }) => {
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have login link', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /connexion|login/i });
    await expect(loginLink).toBeVisible();
  });

  test('should have register link', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /inscription|register|créer/i });
    await expect(registerLink).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.getByRole('link', { name: /connexion|login/i }).click();
    await expect(page).toHaveURL(/.*login/);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: /inscription|register|créer/i }).click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
  });
});
