import { test as base, expect, type Page } from '@playwright/test';

/**
 * Helpers customizados para testes de UI do PrintAI ERP
 */

export class LandingPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async scrollToFooter() {
    await this.page.locator('footer').scrollIntoViewIfNeeded();
  }

  async openMobileMenu() {
    const mobileMenuButton = this.page.locator('button[aria-label="Abrir menu"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
    }
  }

  async closeMobileMenu() {
    const closeButton = this.page.locator('svg[class*="lucide-x"]').first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }

  // Getters para elementos comuns
  get logo() {
    return this.page.locator('img[alt="Logo"]');
  }

  get navLinks() {
    return this.page.locator('nav a');
  }

  get heroTitle() {
    return this.page.getByText(/Impressões que/);
  }

  get categoriesSection() {
    return this.page.getByText('Categorias de Sucesso');
  }

  get ctaSection() {
    return this.page.getByText('Pronto para imprimir sua ideia?');
  }
}

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByPlaceholder('nome@suagrafica.com.br').fill(email);
    await this.page.getByPlaceholder('••••••••').fill(password);
    await this.page.getByRole('button', { name: /Entrar/ }).click();
  }

  get emailInput() {
    return this.page.getByPlaceholder('nome@suagrafica.com.br');
  }

  get passwordInput() {
    return this.page.getByPlaceholder('••••••••');
  }

  get submitButton() {
    return this.page.getByRole('button', { name: /Entrar/ });
  }

  get errorMessage() {
    return this.page.locator('text=incorretos, text=erro').first();
  }
}

// Fixtures customizadas
export const test = base.extend<{
  landingPage: LandingPage;
  loginPage: LoginPage;
}>({
  landingPage: async ({ page }, use) => {
    const landingPage = new LandingPage(page);
    await landingPage.goto();
    await use(landingPage);
  },
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },
});

export { expect };
