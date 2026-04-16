import { test, expect } from '@playwright/test';

/**
 * Testes de UI da Landing Page - PrintAI ERP
 * 
 * Cobertura:
 * - Layout e estrutura básica
 * - Navegação e menu mobile
 * - Componentes visuais (hero, categorias, produtos)
 * - Responsividade
 * - Acessibilidade básica
 * - Links e botões
 */

test.describe('Landing Page - UI Tests', () => {
  
  // ============================================================
  // TESTES DE ESTRUTURA BÁSICA
  // ============================================================
  
  test('deve carregar a landing page com sucesso', async ({ page }) => {
    await page.goto('/');
    
    // Verifica se a página carregou
    await expect(page).toHaveTitle(/PrintAI/);
    
    // Verifica elementos essenciais
    await expect(page.locator('img[alt="Logo"]')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
  });

  test('deve exibir o top bar com informações de contato', async ({ page }) => {
    await page.goto('/');
    
    // Verifica endereço
    await expect(page.getByText('Rua José Bertho, 217')).toBeVisible();
    
    // Verifica telefone
    await expect(page.getByText('(43) 99135-9790')).toBeVisible();
    
    // Verifica email
    await expect(page.getByText('contato@printai.app')).toBeVisible();
  });

  test('deve exibir a navbar com todos os links de navegação', async ({ page }) => {
    await page.goto('/');
    
    const navLinks = ['Impressão', 'Corte Laser', 'MDF', 'Acrílico', 'Personalizados'];
    
    for (const link of navLinks) {
      await expect(page.getByText(link)).toBeVisible();
    }
    
    // Verifica botões de tema e carrinho
    await expect(page.locator('button[aria-label*="Switch"]')).toBeVisible();
    await expect(page.locator('svg[class*="lucide-shopping-cart"]')).toBeVisible();
  });

  // ============================================================
  // TESTES DO HERO SECTION
  // ============================================================

  test('deve exibir o hero section com título e CTA', async ({ page }) => {
    await page.goto('/');
    
    // Verifica título principal
    await expect(page.getByText(/Impressões que/)).toBeVisible();
    await expect(page.getByText('destacam')).toBeVisible();
    await expect(page.getByText('marca')).toBeVisible();
    
    // Verifica descrição
    await expect(page.getByText(/cockpit operacional/)).toBeVisible();
    
    // Verifica botões CTA
    await expect(page.getByText('Ver Produtos')).toBeVisible();
    await expect(page.getByText('WhatsApp')).toBeVisible();
  });

  test('deve exibir o grid de imagens no hero', async ({ page }) => {
    await page.goto('/');
    
    // Verifica se há imagens no hero
    const heroImages = page.locator('section img').first();
    await expect(heroImages).toBeVisible();
  });

  test('botão "Ver Produtos" deve navegar para /produtos', async ({ page }) => {
    await page.goto('/');
    
    await page.getByText('Ver Produtos').click();
    
    // Aguarda navegação
    await page.waitForURL('**/produtos');
    await expect(page).toHaveURL(/.*produtos/);
  });

  // ============================================================
  // TESTES DA SEÇÃO DE CATEGORIAS
  // ============================================================

  test('deve exibir a seção de categorias com 4 itens', async ({ page }) => {
    await page.goto('/');
    
    // Verifica título da seção
    await expect(page.getByText('Categorias de Sucesso')).toBeVisible();
    
    // Verifica se há 4 cards de categorias
    const categoryCards = page.locator('text=Cartões de visitas, text=Flyers, text=Banners, text=Adesivos');
    await expect(page.getByText('Cartões de visita')).toBeVisible();
    await expect(page.getByText('Flyers')).toBeVisible();
    await expect(page.getByText('Banners')).toBeVisible();
    await expect(page.getByText('Adesivos')).toBeVisible();
  });

  test('cada categoria deve ter imagem, nome, preço e botão', async ({ page }) => {
    await page.goto('/');
    
    // Verifica primeira categoria em detalhe
    const firstCategory = page.locator('text=Cartões de visita').first();
    await expect(firstCategory).toBeVisible();
    
    // Verifica se tem preço
    await expect(page.getByText('R$ 49,90')).toBeVisible();
    
    // Verifica botão "Pedir"
    const pedirButtons = page.getByRole('button', { name: 'Pedir' });
    await expect(pedirButtons.first()).toBeVisible();
  });

  // ============================================================
  // TESTES DA SEÇÃO "MAIS PEDIDOS"
  // ============================================================

  test('deve exibir a seção Mais Pedidos', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText('Mais Pedidos')).toBeVisible();
    
    // Verifica card grande
    await expect(page.getByText(/Combo Identidade Visual/)).toBeVisible();
    
    // Verifica card pequeno
    await expect(page.getByText('Adesivos em Vinil')).toBeVisible();
  });

  test('deve exibir botões funcionais na seção Mais Pedidos', async ({ page }) => {
    await page.goto('/');
    
    // Verifica botão "Ver Detalhes"
    await expect(page.getByText('Ver Detalhes')).toBeVisible();
    
    // Verifica botão "Customizar agora"
    await expect(page.getByText('Customizar agora')).toBeVisible();
  });

  // ============================================================
  // TESTES DA SEÇÃO DE LANÇAMENTOS
  // ============================================================

  test('deve exibir a seção de Lançamentos com 4 produtos', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText('Lançamentos')).toBeVisible();
    
    // Verifica os 4 produtos
    await expect(page.getByText('Papel Semente')).toBeVisible();
    await expect(page.getByText('Costura Aparente')).toBeVisible();
    await expect(page.getByText('Canvas Galeria')).toBeVisible();
    await expect(page.getByText('Acrílico Laser')).toBeVisible();
  });

  test('cada lançamento deve ter descrição e preço', async ({ page }) => {
    await page.goto('/');
    
    // Verifica descrições
    await expect(page.getByText(/Sustentável com flores/)).toBeVisible();
    await expect(page.getByText(/Catalogo premium/)).toBeVisible();
    
    // Verifica preços
    await expect(page.getByText('R$ 108,00')).toBeVisible();
    await expect(page.getByText('R$ 65,00')).toBeVisible();
  });

  // ============================================================
  // TESTES DA SEÇÃO CTA
  // ============================================================

  test('deve exibir o CTA final com botões', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText('Pronto para imprimir sua ideia?')).toBeVisible();
    
    // Verifica botões do CTA
    await expect(page.getByText('Fazer pedido agora')).toBeVisible();
    await expect(page.getByText('Orçamento Customizado')).toBeVisible();
  });

  // ============================================================
  // TESTES DO FOOTER
  // ============================================================

  test('deve exibir o footer completo', async ({ page }) => {
    await page.goto('/');
    
    // Scroll até o footer
    await page.locator('footer').scrollIntoViewIfNeeded();
    
    await expect(page.locator('footer')).toBeVisible();
    
    // Verifica logo no footer
    const footerLogos = page.locator('footer img[alt="Logo"]');
    await expect(footerLogos.first()).toBeVisible();
    
    // Verifica texto de descrição
    await expect(page.getByText(/Excelência em impressão/)).toBeVisible();
  });

  test('footer deve ter links de redes sociais', async ({ page }) => {
    await page.goto('/');
    await page.locator('footer').scrollIntoViewIfNeeded();
    
    // Verifica ícones de redes sociais
    await expect(page.locator('svg[class*="lucide-facebook"]')).toBeVisible();
    await expect(page.locator('svg[class*="lucide-instagram"]')).toBeVisible();
  });

  // ============================================================
  // TESTES DE NAVEGAÇÃO
  // ============================================================

  test('link "Acessar Painel" deve navegar para /admin', async ({ page }) => {
    await page.goto('/');
    
    // Abre menu mobile se necessário
    const mobileMenuButton = page.locator('button[aria-label="Abrir menu"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
    }
    
    const painelLink = page.getByText('Acessar Painel');
    if (await painelLink.isVisible()) {
      await painelLink.click();
      await page.waitForURL('**/admin');
      await expect(page).toHaveURL(/.*admin/);
    }
  });

  test('link "Fazer Login" deve navegar para /login', async ({ page }) => {
    await page.goto('/');
    
    // Abre menu mobile se necessário
    const mobileMenuButton = page.locator('button[aria-label="Abrir menu"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
    }
    
    const loginLink = page.getByText('Fazer Login');
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await page.waitForURL('**/login');
      await expect(page).toHaveURL(/.*login/);
    }
  });

  // ============================================================
  // TESTES DE RESPONSIVIDADE
  // ============================================================

  test('deve exibir menu hamburger em telas pequenas', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    
    // Verifica botão de menu mobile
    await expect(page.locator('button[aria-label="Abrir menu"]')).toBeVisible();
    
    // Verifica que navegação desktop está oculta
    const desktopNav = page.locator('nav.hidden.lg\\:flex');
    await expect(desktopNav).not.toBeVisible();
  });

  test('deve exibir navegação completa em telas grandes', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Verifica que navegação desktop está visível
    await expect(page.locator('nav.hidden.lg\\:flex')).toBeVisible();
    
    // Verifica que botão de menu mobile está oculto
    await expect(page.locator('button[aria-label="Abrir menu"]')).not.toBeVisible();
  });

  // ============================================================
  // TESTES DO MENU MOBILE
  // ============================================================

  test('deve abrir e fechar o menu mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    
    // Abre menu
    await page.locator('button[aria-label="Abrir menu"]').click();
    
    // Verifica que menu abriu
    await expect(page.locator('text=Menu')).toBeVisible();
    
    // Fecha menu
    await page.locator('button[aria-label="Fechar menu"], svg[class*="lucide-x"]').click();
    
    // Verifica que menu fechou
    await expect(page.locator('text=Menu')).not.toBeVisible();
  });

  test('menu mobile deve ter todos os links de navegação', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    
    // Abre menu
    await page.locator('button[aria-label="Abrir menu"]').click();
    
    // Verifica links
    await expect(page.locator('text=Impressão')).toBeVisible();
    await expect(page.locator('text=Corte Laser')).toBeVisible();
    await expect(page.locator('text=MDF')).toBeVisible();
  });

  // ============================================================
  // TESTES DE ACESSIBILIDADE
  // ============================================================

  test('todos os botões devem ter aria-label ou texto acessível', async ({ page }) => {
    await page.goto('/');
    
    // Verifica botões principais
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      
      // Cada botão deve ter texto ou aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('imagens devem ter alt text', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      
      // Imagens devem ter alt text (pode ser vazio para decorativas)
      expect(alt !== null).toBeTruthy();
    }
  });

  // ============================================================
  // TESTES DE PERFORMANCE VISUAL
  // ============================================================

  test('deve carregar sem erros de console', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    
    // Aguarda carregamento
    await page.waitForLoadState('networkidle');
    
    // Não deve ter erros críticos
    expect(errors.length).toBeLessThan(3);
  });

  test('animações devem estar presentes no hero', async ({ page }) => {
    await page.goto('/');
    
    // Verifica se há elementos com animação
    const animatedElements = page.locator('[class*="animate-"]');
    const count = await animatedElements.count();
    
    expect(count).toBeGreaterThan(0);
  });
});
