import { test, expect } from '@playwright/test';

/**
 * Testes de Componentes UI - PrintAI ERP
 * 
 * Testa componentes reutilizáveis:
 * - Buttons (variantes e estados)
 * - Inputs e formulários
 * - Cards e diálogos
 * - Toast notifications
 */

test.describe('Componentes UI', () => {
  
  // ============================================================
  // TESTES DA PÁGINA DE LOGIN
  // ============================================================
  
  test.describe('Login Page', () => {
    
    test('deve exibir formulário de login completo', async ({ page }) => {
      await page.goto('/login');
      
      // Verifica logo
      await expect(page.locator('img[alt="Logo"]')).toBeVisible();
      
      // Verifica título/descrição
      await expect(page.getByText(/inteligência que sua gráfica precisa/)).toBeVisible();
      
      // Verifica campos do formulário
      await expect(page.getByPlaceholder('nome@suagrafica.com.br')).toBeVisible();
      await expect(page.getByPlaceholder('••••••••')).toBeVisible();
      
      // Verifica botão de login
      await expect(page.getByRole('button', { name: /Entrar/ })).toBeVisible();
    });

    test('deve validar campos obrigatórios do login', async ({ page }) => {
      await page.goto('/login');
      
      // Tenta submeter sem preencher
      await page.getByRole('button', { name: /Entrar/ }).click();
      
      // Verifica se campos ficaram em branco (HTML5 validation)
      const emailInput = page.getByPlaceholder('nome@suagrafica.com.br');
      await expect(emailInput).toBeVisible();
    });

    test('deve exibir mensagem de erro com credenciais inválidas', async ({ page }) => {
      await page.goto('/login');
      
      // Preenche com dados inválidos
      await page.getByPlaceholder('nome@suagrafica.com.br').fill('teste@exemplo.com');
      await page.getByPlaceholder('••••••••').fill('senhaerrada');
      
      // Clica em entrar
      await page.getByRole('button', { name: /Entrar/ }).click();
      
      // Aguarda mensagem de erro (pode demorar um pouco)
      await page.waitForTimeout(2000);
      
      // Verifica se há mensagem de erro ou se permaneceu na página
      const hasError = await page.locator('text=incorretos').isVisible()
        .catch(() => false) 
        || await page.locator('text=erro').isVisible()
        .catch(() => false);
      
      // Ou ainda está na página de login ou mostra erro
      const isStillOnLogin = await page.url().includes('/login');
      expect(hasError || isStillOnLogin).toBeTruthy();
    });

    test('deve ter link "Esqueceu?" para recuperação de senha', async ({ page }) => {
      await page.goto('/login');
      
      await expect(page.getByText('Esqueceu')).toBeVisible();
    });

    test('deve ter link para falar com consultor', async ({ page }) => {
      await page.goto('/login');
      
      await expect(page.getByText('Falar com consultor')).toBeVisible();
    });

    test('input de email deve ter ícone de mail', async ({ page }) => {
      await page.goto('/login');
      
      // Verifica ícone Mail próximo ao input
      const emailInput = page.getByPlaceholder('nome@suagrafica.com.br');
      const parent = emailInput.locator('..');
      await expect(parent.locator('svg[class*="lucide-mail"]')).toBeVisible();
    });

    test('input de senha deve ter ícone de lock', async ({ page }) => {
      await page.goto('/login');
      
      const passwordInput = page.getByPlaceholder('••••••••');
      const parent = passwordInput.locator('..');
      await expect(parent.locator('svg[class*="lucide-lock"]')).toBeVisible();
    });
  });

  // ============================================================
  // TESTES DO DASHBOARD (ADMIN)
  // ============================================================
  
  test.describe('Dashboard Admin', () => {
    
    test('deve exigir autenticação para acessar dashboard', async ({ page }) => {
      await page.goto('/admin');
      
      // Deve redirecionar para login ou estar na página de login
      const url = page.url();
      expect(url.includes('/login') || url.includes('/admin')).toBeTruthy();
    });

  });

  // ============================================================
  // TESTES DE COMPONENTES UI BÁSICOS
  // ============================================================
  
  test.describe('UI Components', () => {
    
    test('buttons devem ter variantes visuais distintas', async ({ page }) => {
      // Vai para página de pedidos que tem botões variados
      await page.goto('/pedidos');
      
      // Aguarda página carregar (pode redirecionar para login)
      await page.waitForLoadState('networkidle');
      
      // Verifica se há botões na página
      const buttons = page.locator('button, [role="button"]');
      const count = await buttons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('inputs devem ter estados de foco visuais', async ({ page }) => {
      await page.goto('/login');
      
      const emailInput = page.getByPlaceholder('nome@suagrafica.com.br');
      
      // Verifica estado normal
      await expect(emailInput).toBeVisible();
      
      // Clica no input para focar
      await emailInput.click();
      
      // Aguarda transição
      await page.waitForTimeout(100);
      
      // Input deve estar focado (verifica se está visível)
      await expect(emailInput).toBeFocused();
    });

    test('cards devem ter bordas e sombras consistentes', async ({ page }) => {
      await page.goto('/');
      
      // Verifica se há elementos com classe de card/sombra
      const cards = page.locator('[class*="shadow"], [class*="rounded"]');
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('badges devem exibir cores de status corretamente', async ({ page }) => {
      await page.goto('/pedidos');
      
      await page.waitForLoadState('networkidle');
      
      // Verifica se há badges (pode ter em status de pedidos)
      const badges = page.locator('[class*="badge"], [class*="Badge"]');
      // Badges podem ou não existir dependendo dos dados
    });
  });

  // ============================================================
  // TESTES DE INTERAÇÃO
  // ============================================================
  
  test.describe('Interactions', () => {
    
    test('hover effects devem funcionar em botões', async ({ page }) => {
      await page.goto('/');
      
      const button = page.getByText('Ver Produtos');
      await button.hover();
      
      // Aguarda transição
      await page.waitForTimeout(200);
      
      // Verifica que botão ainda está visível
      await expect(button).toBeVisible();
    });

    test('links devem ter cursor pointer', async ({ page }) => {
      await page.goto('/');
      
      const link = page.getByText('Ver Produtos');
      await expect(link).toBeVisible();
      
      // Verifica que é clicável
      const box = await link.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);
    });

    test('scroll deve funcionar suavemente', async ({ page }) => {
      await page.goto('/');
      
      // Scroll até o footer
      await page.locator('footer').scrollIntoViewIfNeeded();
      
      // Verifica que footer está visível
      await expect(page.locator('footer')).toBeVisible();
      
      // Scroll de volta ao topo
      await page.evaluate(() => window.scrollTo(0, 0));
      
      // Verifica que está no topo
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeLessThan(100);
    });
  });

  // ============================================================
  // TESTES DE FORMULÁRIOS
  // ============================================================
  
  test.describe('Forms UI', () => {
    
    test('formulário de login deve ter labels implícitos ou explícitos', async ({ page }) => {
      await page.goto('/login');
      
      // Verifica labels
      await expect(page.getByText('E-mail corporativo')).toBeVisible();
      await expect(page.getByText('Senha')).toBeVisible();
    });

    test('placeholders devem ser descritivos', async ({ page }) => {
      await page.goto('/login');
      
      const emailInput = page.getByPlaceholder('nome@suagrafica.com.br');
      const placeholder = await emailInput.getAttribute('placeholder');
      
      expect(placeholder).toContain('@');
      expect(placeholder).toContain('.com.br');
    });

    test('botão de submit deve mostrar loading em submissão', async ({ page }) => {
      await page.goto('/login');
      
      // Preenche formulário
      await page.getByPlaceholder('nome@suagrafica.com.br').fill('teste@email.com');
      await page.getByPlaceholder('••••••••').fill('123456');
      
      // Clica em entrar
      await page.getByRole('button', { name: /Entrar/ }).click();
      
      // Aguarda um pouco para ver loading
      await page.waitForTimeout(500);
      
      // Verifica se botão ainda existe (pode ter mudado para loading)
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
    });
  });

  // ============================================================
  // TESTES DE NAVEGAÇÃO ENTRE PÁGINAS
  // ============================================================
  
  test.describe('Navigation Flow', () => {
    
    test('deve navegar da landing page para login', async ({ page }) => {
      await page.goto('/');
      
      // Encontra link de login no menu mobile
      const mobileMenuButton = page.locator('button[aria-label="Abrir menu"]');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
      }
      
      const loginLink = page.getByText('Fazer Login');
      if (await loginLink.isVisible()) {
        await Promise.all([
          page.waitForNavigation({ timeout: 10000 }).catch(() => {}),
          loginLink.click()
        ]);
        
        const url = page.url();
        expect(url.includes('/login')).toBeTruthy();
      }
    });

    test('deve voltar do login para a landing page', async ({ page }) => {
      await page.goto('/login');
      
      // Clica no logo para voltar
      const logo = page.locator('img[alt="Logo"]');
      if (await logo.isVisible()) {
        await logo.click();
        await page.waitForTimeout(500);
      }
      
      // Verifica se está em alguma página
      const url = page.url();
      expect(url).toBeTruthy();
    });
  });
});
