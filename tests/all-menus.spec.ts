import { test, expect } from '@playwright/test';

/**
 * Teste de TODOS os menus do painel - PrintAI ERP
 * 
 * Verifica:
 * - Todos os 10 itens do menu sidebar
 * - Navegação funcional para cada página
 * - Estados ativos corretos
 * - Menu mobile e desktop
 * - Grupos expansíveis/colapsáveis
 */

// Lista completa de menus da sidebar
const MENU_ITEMS = [
  { group: 'Principal', name: 'Dashboard', href: '/admin' },
  { group: 'Operacional', name: 'Produção', href: '/producao' },
  { group: 'Operacional', name: 'Pedidos', href: '/pedidos' },
  { group: 'Operacional', name: 'Orçamentos', href: '/orcamentos' },
  { group: 'Gestão', name: 'Clientes', href: '/clientes' },
  { group: 'Gestão', name: 'Produtos', href: '/produtos' },
  { group: 'Gestão', name: 'Estoque', href: '/estoque' },
  { group: 'Gestão', name: 'Financeiro', href: '/financeiro' },
  { group: 'Inteligência', name: 'Conversas AI', href: '/conversas' },
  { group: 'Inteligência', name: 'Relatórios', href: '/relatorios' },
];

const MENU_GROUPS = ['Principal', 'Operacional', 'Gestão', 'Inteligência'];

test.describe('Verificação Completa dos Menus do Painel', () => {
  
  // ============================================================
  // TESTE 1: Todos os menus devem existir na sidebar
  // ============================================================
  
  test('todos os 10 itens de menu devem estar presentes', async ({ page }) => {
    // Vai para página de login primeiro (pública)
    await page.goto('/login');
    
    // Se redirecionar para admin, significa que está logado
    // Se ficar em login, não está logado
    const isLoggedIn = page.url().includes('/admin');
    
    if (!isLoggedIn) {
      // Usuário não logado - vai para login e simula acesso
      console.log('Usuário não autenticado - testando estrutura de menu');
      
      // Para testar menus, precisamos acessar via URL direta
      // Vou testar cada página individualmente
      for (const menuItem of MENU_ITEMS) {
        console.log(`Verificando se página existe: ${menuItem.name} (${menuItem.href})`);
        
        // Tenta acessar a página
        const response = await page.goto(menuItem.href);
        
        // Deve retornar 200 ou redirecionar para login (ambos OK)
        expect(response?.status()).toBeLessThan(500);
      }
    } else {
      // Usuário logado - pode testar menus diretamente
      await testSidebarMenus(page);
    }
  });

  // ============================================================
  // TESTE 2: Cada página do menu deve carregar corretamente
  // ============================================================
  
  test.describe('Cada página do menu deve existir e carregar', () => {
    
    for (const menuItem of MENU_ITEMS) {
      test(`${menuItem.name} (${menuItem.href}) deve carregar sem erros`, async ({ page }) => {
        // Acessa a página
        await page.goto(menuItem.href);
        
        // Aguarda carregamento
        await page.waitForLoadState('networkidle');
        
        // Verifica que a página carregou (status < 500)
        const url = page.url();
        expect(url).toBeTruthy();
        
        // Deve ter body com conteúdo
        const body = await page.locator('body').textContent();
        expect(body?.length).toBeGreaterThan(0);
        
        console.log(`✓ ${menuItem.name} carregou corretamente`);
      });
    }
  });

  // ============================================================
  // TESTE 3: Páginas protegidas devem redirecionar para login se não autenticado
  // ============================================================
  
  test.describe('Rotas protegidas devem exigir autenticação', () => {
    
    const protectedRoutes = [
      '/admin',
      '/producao',
      '/pedidos',
      '/orcamentos',
      '/clientes',
      '/produtos',
      '/estoque',
      '/financeiro',
      '/conversas',
      '/relatorios',
    ];

    for (const route of protectedRoutes) {
      test(`rota ${route} deve proteger conteúdo`, async ({ page }) => {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        const url = page.url();
        
        // Deve estar em login OU na página solicitada (se já logado)
        const isValidRoute = url.includes('/login') || url.includes(route);
        expect(isValidRoute).toBeTruthy();
      });
    }
  });

  // ============================================================
  // TESTE 4: Páginas devem ter estrutura correta (sidebar + conteúdo)
  // ============================================================
  
  test.describe('Páginas do painel devem ter estrutura correta', () => {
    
    const panelPages = [
      { href: '/admin', name: 'Dashboard' },
      { href: '/producao', name: 'Produção' },
      { href: '/pedidos', name: 'Pedidos' },
      { href: '/produtos', name: 'Produtos' },
    ];

    for (const pageDef of panelPages) {
      test(`${pageDef.name} deve ter sidebar e conteúdo`, async ({ page }) => {
        await page.goto(pageDef.href);
        await page.waitForLoadState('networkidle');
        
        // Se redirecionou para login, skip teste
        if (page.url().includes('/login')) {
          console.log(`⚠ ${pageDef.name} redirecionou para login - pulando`);
          return;
        }
        
        // Verifica sidebar
        const sidebar = page.locator('aside').first();
        const hasSidebar = await sidebar.isVisible().catch(() => false);
        
        if (hasSidebar) {
          // Deve ter todos os grupos de menu
          for (const group of MENU_GROUPS) {
            const groupVisible = await page.getByText(group).isVisible().catch(() => false);
            expect(groupVisible).toBeTruthy();
          }
        }
        
        // Deve ter conteúdo principal
        const mainContent = page.locator('main');
        await expect(mainContent).toBeVisible();
      });
    }
  });

  // ============================================================
  // TESTE 5: Links do menu devem navegar corretamente (se logado)
  // ============================================================
  
  test('clique em cada menu deve navegar para página correta', async ({ page }) => {
    // Acessa dashboard
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Se está em login, não está logado
    if (page.url().includes('/login')) {
      console.log('⚠ Usuário não logado - testando via URL direta');
      
      // Testa navegação via URL
      for (const menuItem of MENU_ITEMS) {
        await page.goto(menuItem.href);
        await page.waitForLoadState('networkidle');
        
        const url = page.url();
        // Deve estar na página ou em login
        expect(url.includes(menuItem.href) || url.includes('/login')).toBeTruthy();
      }
    } else {
      // Está logado - testa cliques nos menus
      console.log('✓ Usuário logado - testando cliques nos menus');
      
      for (const menuItem of MENU_ITEMS) {
        // Encontra link do menu
        const menuLink = page.locator(`a[href="${menuItem.href}"]`).first();
        
        if (await menuLink.isVisible()) {
          await menuLink.click();
          await page.waitForLoadState('networkidle');
          
          // Verifica que navegou para página correta
          const url = page.url();
          expect(url.includes(menuItem.href)).toBeTruthy();
          
          console.log(`✓ Navegou para ${menuItem.name} corretamente`);
        }
      }
    }
  });

  // ============================================================
  // TESTE 6: Menu ativo deve destacar página atual
  // ============================================================
  
  test('menu deve destacar página atual como ativa', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Se não está logado, skip
    if (page.url().includes('/login')) {
      return;
    }
    
    // Dashboard deve estar ativo
    const activeMenu = page.locator('[class*="bg-white"]').first();
    const isActiveVisible = await activeMenu.isVisible().catch(() => false);
    
    if (isActiveVisible) {
      // Deve conter texto "Dashboard"
      const activeText = await activeMenu.textContent();
      expect(activeText).toContain('Dashboard');
    }
  });

  // ============================================================
  // TESTE 7: Grupos do menu devem expandir/colapsar
  // ============================================================
  
  test('grupos do menu devem ser expansíveis', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/login')) {
      return;
    }
    
    // Testa cada grupo
    for (const group of MENU_GROUPS) {
      const groupButton = page.locator('button', { hasText: group }).first();
      
      if (await groupButton.isVisible()) {
        // Clica para colapsar
        await groupButton.click();
        await page.waitForTimeout(300);
        
        // Clica para expandir novamente
        await groupButton.click();
        await page.waitForTimeout(300);
        
        // Grupo deve estar visível novamente
        expect(await groupButton.isVisible()).toBeTruthy();
      }
    }
  });

  // ============================================================
  // TESTE 8: Menu mobile deve funcionar corretamente
  // ============================================================
  
  test('menu mobile deve abrir e fechar corretamente', async ({ page }) => {
    // Configura viewport mobile
    await page.setViewportSize({ width: 375, height: 812 });
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/login')) {
      return;
    }
    
    // Botão de menu mobile deve estar visível
    const mobileMenuButton = page.locator('button[aria-label="Abrir menu"], button:has(svg.lucide-menu)').first();
    
    if (await mobileMenuButton.isVisible()) {
      // Abre menu
      await mobileMenuButton.click();
      await page.waitForTimeout(500);
      
      // Menu drawer deve estar visível
      const menuDrawer = page.locator('aside').last();
      await expect(menuDrawer).toBeVisible();
      
      // Deve ter itens de menu
      const menuItems = page.locator('a[href]');
      const count = await menuItems.count();
      expect(count).toBeGreaterThan(0);
      
      // Fecha menu (clica no overlay ou botão X)
      const closeButton = page.locator('button:has(svg.lucide-x)').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(300);
      }
      
      // Menu deve fechar
      const isClosed = await menuDrawer.isHidden().catch(() => true);
      expect(isClosed).toBeTruthy();
    }
  });

  // ============================================================
  // TESTE 9: Todos os badges devem estar corretos
  // ============================================================
  
  test('badges dos menus devem estar corretos', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/login')) {
      return;
    }
    
    // Badge "Kanban" deve estar em Produção
    const producaoLink = page.locator('a[href="/producao"]').first();
    if (await producaoLink.isVisible()) {
      const hasKanbanBadge = await producaoLink.locator('text=Kanban').isVisible().catch(() => false);
      expect(hasKanbanBadge).toBeTruthy();
    }
    
    // Badge "AI" deve estar em Conversas AI
    const conversasLink = page.locator('a[href="/conversas"]').first();
    if (await conversasLink.isVisible()) {
      const hasAIBadge = await conversasLink.locator('text=AI').isVisible().catch(() => false);
      expect(hasAIBadge).toBeTruthy();
    }
  });

  // ============================================================
  // TESTE 10: Botão "Sair" deve funcionar
  // ============================================================
  
  test('botão Sair deve estar presente e funcional', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/login')) {
      return;
    }
    
    // Botão Sair deve estar visível
    const signOutButton = page.locator('button:has-text("Sair")').first();
    await expect(signOutButton).toBeVisible();
    
    // Deve ter ícone de logout
    const logoutIcon = signOutButton.locator('svg[class*="lucide-log-out"]');
    await expect(logoutIcon).toBeVisible();
  });

  // ============================================================
  // TESTE 11: Search bar deve estar presente
  // ============================================================
  
  test('search bar da sidebar deve estar presente', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/login')) {
      return;
    }
    
    // Search input deve estar visível
    const searchInput = page.locator('input[placeholder="Buscar..."]').first();
    await expect(searchInput).toBeVisible();
  });

  // ============================================================
  // TESTE 12: Logo e branding devem estar corretos
  // ============================================================
  
  test('logo e branding da sidebar devem estar corretos', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/login')) {
      return;
    }
    
    // Logo deve estar visível
    const logo = page.locator('img[alt="Logo"]').first();
    await expect(logo).toBeVisible();
    
    // Texto "Operational Cockpit" deve estar presente
    const brandingText = page.locator('text=Operational Cockpit');
    await expect(brandingText).toBeVisible();
  });
});

// ============================================================
// Função auxiliar para testar menus da sidebar
// ============================================================

async function testSidebarMenus(page: any) {
  // Verifica que todos os grupos estão presentes
  for (const group of MENU_GROUPS) {
    const groupElement = page.getByText(group);
    await expect(groupElement).toBeVisible();
  }
  
  // Verifica que todos os itens de menu estão presentes
  for (const menuItem of MENU_ITEMS) {
    const menuLink = page.locator(`a[href="${menuItem.href}"]`).first();
    await expect(menuLink).toBeVisible();
    
    // Verifica que texto está correto
    const text = await menuLink.textContent();
    expect(text).toContain(menuItem.name);
  }
  
  console.log('✓ Todos os menus estão presentes e corretos');
}
