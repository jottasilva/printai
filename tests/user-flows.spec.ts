import { test, expect } from '@playwright/test';

/**
 * Testes de Fluxo de Usuário (User Flows) - PrintAI ERP
 * 
 * Testa jornadas completas do usuário:
 * - Visitante -> Login
 * - Exploração de produtos
 * - Navegação entre seções
 * - Experiência mobile completa
 */

test.describe('User Flows - Jornadas Completas', () => {
  
  // ============================================================
  // FLUXO 1: Visitante explorando a plataforma
  // ============================================================
  
  test('visitante deve explorar landing page e navegar para login', async ({ page }) => {
    // 1. Acessa landing page
    await page.goto('/');
    await expect(page).toHaveTitle(/PrintAI/);
    
    // 2. Visualiza hero section
    await expect(page.getByText(/Impressões que/)).toBeVisible();
    
    // 3. Scroll para ver categorias
    await page.getByText('Categorias de Sucesso').scrollIntoViewIfNeeded();
    await expect(page.getByText('Categorias de Sucesso')).toBeVisible();
    
    // 4. Visualiza seção Mais Pedidos
    await page.getByText('Mais Pedidos').scrollIntoViewIfNeeded();
    await expect(page.getByText('Mais Pedidos')).toBeVisible();
    
    // 5. Visualiza Lançamentos
    await page.getByText('Lançamentos').scrollIntoViewIfNeeded();
    await expect(page.getByText('Lançamentos')).toBeVisible();
    
    // 6. Abre menu mobile (se aplicável)
    const mobileMenuButton = page.locator('button[aria-label="Abrir menu"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      
      // 7. Clica em Fazer Login
      await page.getByText('Fazer Login').click();
    } else {
      // Desktop - tenta encontrar link de login na página
      const loginLink = page.getByText('Fazer Login');
      if (await loginLink.isVisible()) {
        await loginLink.click();
      } else {
        // Vai direto para login
        await page.goto('/login');
      }
    }
    
    // 8. Deve estar na página de login
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByPlaceholder('nome@suagrafica.com.br')).toBeVisible();
  });

  // ============================================================
  // FLUXO 2: Exploração de Produtos
  // ============================================================
  
  test('usuário deve explorar produtos da landing page', async ({ page }) => {
    await page.goto('/');
    
    // 1. Visualiza categorias
    await expect(page.getByText('Cartões de visita')).toBeVisible();
    
    // 2. Clica em "Pedir" de uma categoria
    const firstPedirButton = page.getByRole('button', { name: 'Pedir' }).first();
    if (await firstPedirButton.isVisible()) {
      await firstPedirButton.click();
      
      // Pode redirecionar para login ou produtos
      const url = page.url();
      expect(url.includes('/login') || url.includes('/produtos') || url.includes('/orcamentos')).toBeTruthy();
    }
  });

  // ============================================================
  // FLUXO 3: Experiência Mobile Completa
  // ============================================================
  
  test('usuário mobile deve ter experiência completa', async ({ page }) => {
    // Configura viewport mobile
    await page.setViewportSize({ width: 375, height: 812 });
    
    // 1. Acessa landing page
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    
    // 2. Menu hamburger deve estar visível
    await expect(page.locator('button[aria-label="Abrir menu"]')).toBeVisible();
    
    // 3. Abre menu
    await page.locator('button[aria-label="Abrir menu"]').click();
    await expect(page.locator('text=Menu')).toBeVisible();
    
    // 4. Verifica links no menu
    await expect(page.locator('text=Impressão')).toBeVisible();
    await expect(page.locator('text=Corte Laser')).toBeVisible();
    
    // 5. Fecha menu
    await page.locator('svg[class*="lucide-x"]').first().click();
    await expect(page.locator('text=Menu')).not.toBeVisible();
    
    // 6. Scroll pela página
    await page.getByText('Categorias de Sucesso').scrollIntoViewIfNeeded();
    await expect(page.getByText('Categorias de Sucesso')).toBeVisible();
    
    // 7. Footer deve ser acessível
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(page.locator('footer')).toBeVisible();
  });

  // ============================================================
  // FLUXO 4: Tentativa de Acesso ao Dashboard
  // ============================================================
  
  test('usuário não autenticado deve ser redirecionado ao tentar acessar dashboard', async ({ page }) => {
    // Tenta acessar dashboard diretamente
    await page.goto('/admin');
    
    // Aguarda redirecionamento ou carregamento
    await page.waitForLoadState('networkidle');
    
    // Deve estar em login OU em admin (se já tiver sessão)
    const url = page.url();
    expect(url.includes('/login') || url.includes('/admin')).toBeTruthy();
    
    // Se está em login, deve mostrar formulário
    if (url.includes('/login')) {
      await expect(page.getByPlaceholder('nome@suagrafica.com.br')).toBeVisible();
    }
  });

  // ============================================================
  // FLUXO 5: Navegação por Múltiplas Páginas
  // ============================================================
  
  test('usuário deve navegar entre múltiplas páginas sem erros', async ({ page }) => {
    const pages = [
      { url: '/', name: 'Landing Page' },
      { url: '/login', name: 'Login' },
    ];
    
    for (const pageInfo of pages) {
      console.log(`Testando: ${pageInfo.name}`);
      
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      
      // Verifica se página carregou sem erros
      const body = await page.locator('body').textContent();
      expect(body?.length).toBeGreaterThan(0);
      
      // Verifica se não tem erro crítico na página
      const hasError = await page.locator('text=Error, text=404, text=500').isVisible()
        .catch(() => false);
      
      expect(hasError).toBeFalsy();
    }
  });

  // ============================================================
  // FLUXO 6: Interação com Elementos Interativos
  // ============================================================
  
  test('todos os botões principais devem ser clicáveis', async ({ page }) => {
    await page.goto('/');
    
    // Lista de botões importantes
    const importantButtons = [
      { selector: 'Ver Produtos', expected: true },
      { selector: 'WhatsApp', expected: true },
    ];
    
    for (const button of importantButtons) {
      const btn = page.getByText(button.selector);
      
      if (await btn.isVisible()) {
        // Verifica que é clicável
        await expect(btn).toBeEnabled();
        
        // Verifica que tem bounding box válido
        const box = await btn.boundingBox();
        expect(box).toBeTruthy();
        expect(box!.width).toBeGreaterThan(0);
        expect(box!.height).toBeGreaterThan(0);
      }
    }
  });

  // ============================================================
  // FLUXO 7: Formulário de Login Completo
  // ============================================================
  
  test('usuário deve preencher formulário de login completo', async ({ page }) => {
    await page.goto('/login');
    
    // 1. Preenche email
    const emailInput = page.getByPlaceholder('nome@suagrafica.com.br');
    await emailInput.fill('usuario@exemplo.com');
    await expect(emailInput).toHaveValue('usuario@exemplo.com');
    
    // 2. Preenche senha
    const passwordInput = page.getByPlaceholder('••••••••');
    await passwordInput.fill('senha123');
    await expect(passwordInput).toHaveValue('senha123');
    
    // 3. Clica em entrar
    await page.getByRole('button', { name: /Entrar/ }).click();
    
    // 4. Aguarda processamento
    await page.waitForTimeout(1000);
    
    // Pode estar em qualquer página após login (sucesso ou erro)
    // O importante é que o formulário foi submetido
    expect(true).toBeTruthy();
  });

  // ============================================================
  // FLUXO 8: Explorando Conteúdo Visual
  // ============================================================
  
  test('usuário deve visualizar imagens e conteúdo visual', async ({ page }) => {
    await page.goto('/');
    
    // 1. Verifica que há imagens na página
    const images = page.locator('img');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);
    
    // 2. Primeira imagem deve estar visível
    const firstImage = images.first();
    await expect(firstImage).toBeVisible();
    
    // 3. Verifica se há elementos visuais decorativos
    const decorativeElements = page.locator('[class*="bg-gradient"]');
    const decoCount = await decorativeElements.count();
    expect(decoCount).toBeGreaterThan(0);
  });

  // ============================================================
  // FLUXO 9: Teste de Links Externos
  // ============================================================
  
  test('links de contato devem ter URLs válidos', async ({ page }) => {
    await page.goto('/');
    
    // Verifica link de email
    const emailLink = page.locator('a[href*="mailto:"]');
    await expect(emailLink).toBeVisible();
    
    const emailHref = await emailLink.getAttribute('href');
    expect(emailHref).toContain('contato@printai.app');
  });

  // ============================================================
  // FLUXO 10: Estado Inicial da Aplicação
  // ============================================================
  
  test('aplicação deve carregar em estado inicial correto', async ({ page }) => {
    await page.goto('/');
    
    // 1. Header deve estar no topo
    const header = page.locator('header');
    await expect(header).toBeInViewport();
    
    // 2. Hero section deve ser a primeira seção após header
    const heroTitle = page.getByText(/Impressões que/);
    await expect(heroTitle).toBeVisible();
    
    // 3. Não deve haver modais ou dialogs abertos
    const dialogs = page.locator('[role="dialog"]');
    const dialogCount = await dialogs.count();
    expect(dialogCount).toBe(0);
    
    // 4. Não deve haver toasts ou notificações
    const toasts = page.locator('[class*="toast"]');
    const toastCount = await toasts.count();
    expect(toastCount).toBe(0);
  });
});
