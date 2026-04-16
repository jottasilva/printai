# 🧪 Guia Rápido - Testes de UI PrintAI ERP

## Instalação Única

```bash
# 1. Instalar Playwright
npm install -D @playwright/test

# 2. Instalar browsers
npx playwright install chromium
```

## 🚀 Executar Testes

### Opção 1: Usando scripts prontos (Recomendado)

```bash
# Windows
run-tests.bat all
run-tests.bat landing
run-tests.bat headed
run-tests.bat report

# Linux/Mac
./run-tests.sh all
./run-tests.sh landing
./run-tests.sh headed
./run-tests.sh report
```

### Opção 2: Usando npm scripts

```bash
# Todos os testes (headless)
npm run test:ui

# Com browser visível
npm run test:ui:headed

# Modo debug
npm run test:ui:debug

# Ver relatório
npm run test:ui:report
```

### Opção 3: Comando direto

```bash
# Todos os testes
npx playwright test

# Arquivo específico
npx playwright test landing-page.spec.ts

# Teste específico
npx playwright test -g "deve carregar a landing page"

# Com browser visível
npx playwright test --headed

# Com debug
npx playwright test --debug
```

## 📊 O Que é Testado

### ✅ Landing Page (25+ testes)
- Estrutura e layout
- Hero section com CTAs
- Categorias e produtos
- Menu mobile
- Navegação
- Footer

### ✅ Componentes UI (20+ testes)
- Formulário de login
- Inputs e botões
- Validações
- Estados de loading
- Navegação entre páginas

### ✅ Acessibilidade (15+ testes)
- Semântica HTML
- Labels e foco
- Touch targets
- Heading hierarchy
- Links acessíveis

### ✅ Performance (10+ testes)
- Load time < 3s
- First Paint < 1.5s
- Imagens com lazy loading
- Scripts eficientes

### ✅ Responsividade (6 viewports)
- Mobile Small (320px)
- Mobile (375px)
- Mobile Large (414px)
- Tablet (768px)
- Desktop (1280px)
- Desktop Large (1920px)

### ✅ User Flows (10+ testes)
- Jornada visitante → login
- Exploração de produtos
- Experiência mobile completa
- Acesso ao dashboard
- Formulário de login completo

## 📁 Arquivos de Teste

| Arquivo | O que testa | Quantidade |
|---------|-------------|------------|
| `landing-page.spec.ts` | Página principal | 25+ testes |
| `ui-components.spec.ts` | Componentes e forms | 20+ testes |
| `accessibility-performance.spec.ts` | A11y e performance | 25+ testes |
| `user-flows.spec.ts` | Fluxos completos | 10+ testes |

**Total: 80+ testes automatizados! 🎉**

## 🎯 Exemplos Práticos

### Testar apenas a Landing Page

```bash
npx playwright test landing-page.spec.ts
```

### Testar apenas Login

```bash
npx playwright test ui-components.spec.ts -g "Login"
```

### Ver testes rodando no browser

```bash
npx playwright test landing-page.spec.ts --headed
```

### Debug passo-a-passo

```bash
npx playwright test user-flows.spec.ts --debug
```

## 📈 Ver Resultados

```bash
# Abrir relatório HTML
npm run test:ui:report

# ou
npx playwright show-report test-results
```

## ⚡ Dicas Pro

### 1. Rodar teste específico
```bash
npx playwright test -g "deve carregar a landing page"
```

### 2. Rodar em múltiplos browsers
```bash
npx playwright test --project=chromium
npx playwright test --project=Mobile
```

### 3. Ver traces de falhas
```bash
npx playwright show-trace test-results/**/trace.zip
```

### 4. Snapshot de tela em falhas
Os screenshots são salvos automaticamente em `test-results/`

## 🔧 Troubleshooting

### Erro: "Browser not found"
```bash
npx playwright install chromium
```

### Erro: "Cannot connect to server"
```bash
# Garanta que o dev server está rodando
npm run dev
```

### Testes muito lentos
```bash
# Rodar em paralelo (CI)
npx playwright test --workers=4
```

### Falso positivo/negativo
```bash
# Rodar teste específico várias vezes
npx playwright test landing-page.spec.ts --retries=3
```

## 📚 Próximos Passos

1. **Adicionar mais testes** para páginas internas
2. **Testar formulários** de criação de produtos/pedidos
3. **Testar autenticação** com Supabase
4. **Integrar com CI/CD** (GitHub Actions)
5. **Adicionar testes visuais** com screenshots

## 💡 Contribuindo

Para adicionar novos testes:

1. Crie arquivo em `tests/`
2. Use estrutura `test.describe` e `test`
3. Use `expect` para verificações
4. Siga padrões existentes
5. Documente no README

---

**Total de testes: 80+** ✅  
**Tempo estimado: 2-5 minutos** ⏱️  
**Cobertura: Landing, Components, A11y, Performance, Flows** 🎯
