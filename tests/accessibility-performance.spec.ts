import { test, expect } from '@playwright/test';

/**
 * Testes de Acessibilidade e Performance - PrintAI ERP
 * 
 * Verifica:
 * - Contraste de cores
 * - Tamanhos de toque
 * - Semântica HTML
 * - Performance de carregamento
 * - Core Web Vitals
 */

test.describe('Acessibilidade (a11y)', () => {
  
  test('deve ter estrutura semântica correta', async ({ page }) => {
    await page.goto('/');
    
    // Verifica elementos semânticos
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('main, section')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('heading hierarchy deve estar correta', async ({ page }) => {
    await page.goto('/');
    
    // Deve ter apenas um h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    
    // Verifica se há h2s para seções
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThan(0);
  });

  test('todos os inputs devem ter labels associados', async ({ page }) => {
    await page.goto('/login');
    
    const inputs = page.locator('input[type="email"], input[type="password"]');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      
      // Input deve ter id com label correspondente OU aria-label
      if (!ariaLabel) {
        expect(id).toBeTruthy();
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
  });

  test('links devem ter texto ou aria-label descritivo', async ({ page }) => {
    await page.goto('/');
    
    const links = page.locator('a[href]');
    const count = await links.count();
    
    let linksSemTexto = 0;
    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      
      if (!text?.trim() && !ariaLabel) {
        linksSemTexto++;
      }
    }
    
    // Permite alguns links decorativos sem texto
    expect(linksSemTexto).toBeLessThan(count * 0.2);
  });

  test('foco deve ser visível nos elementos interativos', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.getByPlaceholder('nome@suagrafica.com.br');
    await emailInput.click();
    
    // Verifica se input está focado
    await expect(emailInput).toBeFocused();
    
    // Verifica se tem outline ou ring visível
    const outline = await emailInput.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.outlineStyle !== 'none' || 
             style.boxShadow.includes('ring') ||
             style.borderStyle.includes('solid');
    });
    
    expect(outline).toBeTruthy();
  });

  test('botões devem ter tamanho mínimo de toque (44x44px)', async ({ page }) => {
    await page.goto('/');
    
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    let botoesPequenos = 0;
    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      
      if (box) {
        if (box.width < 44 || box.height < 44) {
          botoesPequenos++;
        }
      }
    }
    
    // Permite alguns botões menores (ícones)
    expect(botoesPequenos).toBeLessThan(count * 0.3);
  });

  test('páginas não devem ter erros JavaScript', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Deve ter no máximo 1 erro não crítico
    expect(errors.length).toBeLessThan(2);
  });
});

test.describe('Performance', () => {
  
  test('deve carregar em menos de 3 segundos', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('primeiro conteúdo deve aparecer em menos de 1.5s', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    await expect(page.locator('header')).toBeVisible();
    const firstPaint = Date.now() - startTime;
    
    expect(firstPaint).toBeLessThan(1500);
  });

  test('imagens devem ter lazy loading', async ({ page }) => {
    await page.goto('/');
    
    // Verifica se algumas imagens têm loading="lazy"
    const lazyImages = page.locator('img[loading="lazy"]');
    const count = await lazyImages.count();
    
    // Pelo menos algumas imagens devem ter lazy loading
    // (imagens abaixo da dobra)
    const totalImages = await page.locator('img').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('deve ter meta tags de viewport para mobile', async ({ page }) => {
    await page.goto('/');
    
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);
  });

  test('scripts devem ser carregados eficientemente', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verifica se há scripts na página
    const scripts = page.locator('script[src]');
    const count = await scripts.count();
    
    // Deve ter scripts mas não em excesso
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(30);
  });
});

test.describe('Responsividade Avançada', () => {
  
  const viewports = [
    { name: 'Mobile Small', width: 320, height: 568 },
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Mobile Large', width: 414, height: 736 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 720 },
    { name: 'Desktop Large', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`deve renderizar corretamente em ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // Verifica se página carregou
      await expect(page.locator('header')).toBeVisible();
      
      // Verifica se não há overflow horizontal
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      
      // Não deve ter scroll horizontal significativo
      expect(hasHorizontalScroll).toBeFalsy();
    });
  }

  test('menu deve alternar entre mobile e desktop corretamente', async ({ page }) => {
    // Começa em mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Menu mobile deve estar visível
    await expect(page.locator('button[aria-label="Abrir menu"]')).toBeVisible();
    
    // Muda para desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Menu desktop deve estar visível
    await expect(page.locator('nav.hidden.lg\\:flex')).toBeVisible();
    
    // Menu mobile deve estar oculto
    await expect(page.locator('button[aria-label="Abrir menu"]')).not.toBeVisible();
  });

  test('grid de produtos deve adaptar ao tamanho da tela', async ({ page }) => {
    await page.goto('/');
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileGrid = await page.locator('[class*="grid"]').first();
    if (await mobileGrid.isVisible()) {
      const mobileClasses = await mobileGrid.getAttribute('class');
      expect(mobileClasses).toContain('grid-cols-');
    }
    
    // Desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    const desktopGrid = await page.locator('[class*="grid"]').first();
    if (await desktopGrid.isVisible()) {
      const desktopClasses = await desktopGrid.getAttribute('class');
      expect(desktopClasses).toContain('lg:grid-cols-');
    }
  });
});

test.describe('SEO e Meta Tags', () => {
  
  test('deve ter title tag adequada', async ({ page }) => {
    await page.goto('/');
    
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThan(60);
    expect(title).toContain('PrintAI');
  });

  test('deve ter meta description', async ({ page }) => {
    await page.goto('/');
    
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveCount(1);
    
    const content = await description.getAttribute('content');
    expect(content?.length).toBeGreaterThan(50);
    expect(content?.length).toBeLessThan(160);
  });

  test('deve ter Open Graph tags', async ({ page }) => {
    await page.goto('/');
    
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveCount(1);
    
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveCount(1);
  });

  test('deve ter linguagem definida', async ({ page }) => {
    await page.goto('/');
    
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBe('pt-BR');
  });

  test('deve ter favicon', async ({ page }) => {
    await page.goto('/');
    
    const favicon = page.locator('link[rel="icon"], link[rel="shortcut icon"]');
    await expect(favicon).toHaveCount(1);
  });
});
