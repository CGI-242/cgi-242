/**
 * E2E tests for Fiscal Simulators
 */

import { test, expect } from '@playwright/test';

test.describe('Simulateur IRPP', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulateur/irpp');
  });

  test('should display IRPP calculator', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /irpp|impôt.*revenu/i })).toBeVisible();
  });

  test('should have salary input', async ({ page }) => {
    const salaryInput = page.getByLabel(/salaire|revenu/i);
    await expect(salaryInput).toBeVisible();
  });

  test('should have family situation selector', async ({ page }) => {
    // Look for select or radio buttons for situation
    const situationSelector = page.locator('select, [role="radiogroup"]').first();
    await expect(situationSelector).toBeVisible();
  });

  test('should calculate IRPP when form is filled', async ({ page }) => {
    // Fill salary
    await page.getByLabel(/salaire|revenu/i).fill('500000');

    // Look for calculate button or auto-calculation
    const calculateBtn = page.getByRole('button', { name: /calculer|calculate/i });
    if (await calculateBtn.isVisible()) {
      await calculateBtn.click();
    }

    // Should show results
    await expect(page.getByText(/irpp|impôt/i)).toBeVisible();
  });

  test('should show CNSS deduction', async ({ page }) => {
    await page.getByLabel(/salaire|revenu/i).fill('1000000');

    // Should show CNSS
    await expect(page.getByText(/cnss/i)).toBeVisible();
  });

  test('should update when salary changes', async ({ page }) => {
    const salaryInput = page.getByLabel(/salaire|revenu/i);

    await salaryInput.fill('500000');
    await page.waitForTimeout(500);

    await salaryInput.fill('1000000');
    await page.waitForTimeout(500);

    // Results should be visible
    await expect(page.locator('[class*="result"], [class*="montant"], .text-green-500, .font-bold').first()).toBeVisible();
  });
});

test.describe('Simulateur ITS', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulateur/its');
  });

  test('should display ITS 2026 calculator', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /its|impôt.*traitement/i })).toBeVisible();
  });

  test('should have salary input', async ({ page }) => {
    const salaryInput = page.getByLabel(/salaire|revenu/i);
    await expect(salaryInput).toBeVisible();
  });

  test('should have charge de famille option', async ({ page }) => {
    // ITS 2026 has exception for family charges
    await expect(page.getByText(/charge.*famille|exception/i)).toBeVisible();
  });

  test('should calculate ITS', async ({ page }) => {
    await page.getByLabel(/salaire|revenu/i).fill('500000');

    // Should show ITS results
    await expect(page.getByText(/its/i)).toBeVisible();
  });

  test('should show comparison with IRPP', async ({ page }) => {
    await page.getByLabel(/salaire|revenu/i).fill('1000000');

    // Should show comparison
    await expect(page.getByText(/comparaison|économie|difference/i)).toBeVisible();
  });
});

test.describe('Simulateur IS', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulateur/is');
  });

  test('should display IS calculator', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /is|impôt.*société/i })).toBeVisible();
  });

  test('should have products input', async ({ page }) => {
    await expect(page.getByLabel(/produits.*exploitation|chiffre.*affaires/i)).toBeVisible();
  });

  test('should have benefice input', async ({ page }) => {
    await expect(page.getByLabel(/bénéfice|résultat/i)).toBeVisible();
  });

  test('should calculate IS', async ({ page }) => {
    await page.getByLabel(/produits.*exploitation|chiffre.*affaires/i).fill('100000000');
    await page.getByLabel(/bénéfice|résultat/i).fill('20000000');

    // Should show IS results
    await expect(page.getByText(/is|25%|minimum/i)).toBeVisible();
  });

  test('should show acomptes', async ({ page }) => {
    await page.getByLabel(/produits.*exploitation|chiffre.*affaires/i).fill('100000000');
    await page.getByLabel(/bénéfice|résultat/i).fill('20000000');

    // Should show quarterly payments
    await expect(page.getByText(/acompte|trimestre|mars|juin/i)).toBeVisible();
  });
});

test.describe('Simulateur Navigation', () => {
  test('should navigate between calculators', async ({ page }) => {
    await page.goto('/simulateur');

    // Should show calculator options
    await expect(page.getByText(/irpp/i)).toBeVisible();
    await expect(page.getByText(/its/i)).toBeVisible();
    await expect(page.getByText(/is/i)).toBeVisible();
  });

  test('should access IRPP from main simulateur page', async ({ page }) => {
    await page.goto('/simulateur');

    await page.getByRole('link', { name: /irpp/i }).click();
    await expect(page).toHaveURL(/.*simulateur.*irpp/);
  });

  test('should access ITS from main simulateur page', async ({ page }) => {
    await page.goto('/simulateur');

    await page.getByRole('link', { name: /its/i }).click();
    await expect(page).toHaveURL(/.*simulateur.*its/);
  });
});
