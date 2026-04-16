# Testes de UI - PrintAI ERP

Testes automatizados de interface do usuário usando **Playwright**.

## 📋 Visão Geral

Este suite de testes cobre:

- ✅ **Landing Page** - Estrutura, conteúdo e navegação
- ✅ **Componentes UI** - Formulários, botões, inputs e interações
- ✅ **Acessibilidade** - Semântica HTML, labels, foco e contraste
- ✅ **Performance** - Tempos de carregamento e otimizações
- ✅ **Responsividade** - Mobile, tablet e desktop

## 🚀 Executando os Testes

### Pré-requisitos

```bash
# Instalar dependências
npm install

# Instalar browsers do Playwright
npx playwright install chromium
```

### Comandos Disponíveis

```bash
# Executar todos os testes (headless)
npm run test:ui

# Executar testes com browser visível
npm run test:ui:headed

# Executar testes em modo debug (step-by-step)
npm run test:ui:debug

# Visualizar relatório dos testes
npm run test:ui:report
```

## 📁 Estrutura de Arquivos

```
tests/
├── landing-page.spec.ts          # Testes da página principal
├── ui-components.spec.ts         # Testes de componentes UI
├── accessibility-performance.spec.ts  # Testes de a11y e performance
├── user-flows.spec.ts            # Testes de fluxos completos de usuário
├── all-menus.spec.ts             # Teste de TODOS os menus do painel
└── helpers/
    └── ui-helpers.ts             # Helpers e fixtures customizadas
```

## 🎯 Cobertura de Testes

### Landing Page (`landing-page.spec.ts`)
- **Estrutura Básica**: Logo, navbar, top bar
- **Hero Section**: Título, descrição, CTAs, grid de imagens
- **Categorias**: 4 cards com imagens, preços e botões
- **Mais Pedidos**: Cards de destaque e novidades
- **Lançamentos**: 4 produtos novos com detalhes
- **CTA Final**: Seção de call-to-action com botões
- **Footer**: Links, redes sociais, informações
- **Menu Mobile**: Abrir/fechar, links de navegação
- **Responsividade**: Mobile vs Desktop

### Componentes UI (`ui-components.spec.ts`)
- **Login Page**: Formulário, validação, erros
- **Buttons**: Variantes e estados
- **Inputs**: Focus, placeholders, ícones
- **Cards**: Bordas, sombras, layout
- **Navegação**: Fluxo entre páginas
- **Formulários**: Labels, placeholders, submit

### User Flows (`user-flows.spec.ts`)
- **Visitante → Login**: Jornada completa de exploração
- **Exploração de Produtos**: Navegação por categorias
- **Experiência Mobile**: Fluxo completo em dispositivos móveis
- **Acesso ao Dashboard**: Redirecionamento e autenticação
- **Múltiplas Páginas**: Navegação sem erros
- **Formulário de Login**: Preenchimento e submissão completa

### Acessibilidade & Performance (`accessibility-performance.spec.ts`)
- **Semântica HTML**: header, nav, main, footer
- **Heading Hierarchy**: h1, h2 corretos
- **Labels**: Inputs com labels associados
- **Focus Visible**: Outline em elementos interativos
- **Touch Targets**: Tamanho mínimo 44x44px
- **Performance**: Load time < 3s, First Paint < 1.5s
- **Responsividade**: 6 viewports diferentes
- **SEO**: Title, meta description, Open Graph

## 📊 Viewports Testados

| Device | Width | Height |
|--------|-------|--------|
| Mobile Small | 320px | 568px |
| Mobile | 375px | 667px |
| Mobile Large | 414px | 736px |
| Tablet | 768px | 1024px |
| Desktop | 1280px | 720px |
| Desktop Large | 1920px | 1080px |

## 🔧 Configuração

Arquivo de configuração: `playwright.config.ts`

### Projetos de Teste

- **chromium**: Desktop Chrome
- **Desktop**: 1920x1080
- **Tablet**: iPad Pro
- **Mobile**: iPhone 13

### Opções

- Screenshots: Capturados apenas em falhas
- Vídeo: Retido em falhas
- Trace: Ativado no primeiro retry
- Reporter: HTML em `test-results/`

## 📝 Escrevendo Novos Testes

### Estrutura Básica

```typescript
import { test, expect } from '@playwright/test';

test.describe('Nome da Seção', () => {
  test('deve fazer algo', async ({ page }) => {
    await page.goto('/url');
    
    // Verificações
    await expect(page.getByText('Texto')).toBeVisible();
  });
});
```

### Usando Helpers

```typescript
import { test, expect } from './helpers/ui-helpers';

test.describe('Meus Testes', () => {
  test('exemplo', async ({ landingPage }) => {
    // landingPage já está na página /
    await expect(landingPage.heroTitle).toBeVisible();
  });
});
```

## ✅ Boas Práticas

1. **Sempre use `await expect()`** para verificações
2. **Use selectors robustos**: `getByText`, `getByRole`, `getByPlaceholder`
3. **Evite sleeps**: Use `waitFor` ou aguardadores específicos
4. **Teste independente**: Cada teste deve rodar isoladamente
5. **Nomes descritivos**: Explique o que o teste verifica

## 🐛 Debug de Testes Falhando

```bash
# Rodar teste específico em modo headed
npx playwright test landing-page.spec.ts --headed

# Rodar com inspector
npx playwright test --debug

# Ver relatório HTML
npm run test:ui:report
```

## 🎯 Métricas Alvo

| Métrica | Target |
|---------|--------|
| Load Time | < 3s |
| First Paint | < 1.5s |
| Accessibility Score | > 90 |
| Mobile Responsiveness | 100% |
| Zero Console Errors | < 3 erros |

## 📚 Recursos Úteis

- [Playwright Docs](https://playwright.dev/docs/intro)
- [Test Generator](https://playwright.dev/docs/codegen)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Actionability](https://playwright.dev/docs/actionability)

## 🔄 CI/CD

Os testes podem ser integrados ao pipeline de CI/CD:

```yaml
# Exemplo GitHub Actions
- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Run UI Tests
  run: npm run test:ui
```

---

**Última atualização**: Abril 2026
