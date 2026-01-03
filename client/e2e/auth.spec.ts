/**
 * E2E tests for Authentication flows
 */

import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /connexion|login/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe|password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /connexion|login|se connecter/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: /connexion|login|se connecter/i }).click();

    // Should show validation messages
    await expect(page.getByText(/email.*requis|required/i)).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/mot de passe|password/i).fill('password123');
    await page.getByRole('button', { name: /connexion|login|se connecter/i }).click();

    await expect(page.getByText(/email.*valide|invalid.*email/i)).toBeVisible();
  });

  test('should have forgot password link', async ({ page }) => {
    const forgotLink = page.getByRole('link', { name: /oublié|forgot/i });
    await expect(forgotLink).toBeVisible();
  });

  test('should have register link', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /inscription|créer|register/i });
    await expect(registerLink).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: /inscription|créer|register/i }).click();
    await expect(page).toHaveURL(/.*register/);
  });
});

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display register form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /inscription|register|créer/i })).toBeVisible();
    await expect(page.getByLabel(/nom|name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe|password/i).first()).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: /inscription|register|créer/i }).click();

    // Should show validation messages
    await expect(page.locator('.text-red-500, .error, [class*="error"]').first()).toBeVisible();
  });

  test('should validate password strength', async ({ page }) => {
    await page.getByLabel(/nom|name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/mot de passe|password/i).first().fill('weak');

    await page.getByRole('button', { name: /inscription|register|créer/i }).click();

    // Should show password strength error
    await expect(page.getByText(/caractères|characters|fort|strong/i)).toBeVisible();
  });

  test('should have login link', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /connexion|login|déjà/i });
    await expect(loginLink).toBeVisible();
  });
});

test.describe('Forgot Password Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password');
  });

  test('should display forgot password form', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /envoyer|réinitialiser|reset|send/i })).toBeVisible();
  });

  test('should have back to login link', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /retour|back|connexion|login/i });
    await expect(backLink).toBeVisible();
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Should be redirected to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should redirect to login when accessing chat', async ({ page }) => {
    await page.goto('/chat');

    // Should be redirected to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should redirect to login when accessing organization settings', async ({ page }) => {
    await page.goto('/organization/settings');

    // Should be redirected to login
    await expect(page).toHaveURL(/.*login/);
  });
});
