# PrintAI ERP - Spec-Driven Development: Índice Mestre de Prompts

## 📋 O que é Spec-Driven Development?

Spec-Driven Development é uma metodologia onde você **primeiro define especificações detalhadas** antes de implementar código. Cada spec serve como **contrato** entre o que o sistema deve fazer e como será construído.

### Fluxo de Trabalho
```
1. Escolher módulo a implementar
2. Ler spec correspondente
3. Usar prompt de implementação com IA
4. Codificar seguindo spec como guia
5. Testar contra critérios de aceitação
6. Marcar spec como completo
```

---

## 📚 Índice de Especificações

### Módulos do Sistema

| # | Módulo | Spec | Status | Prompt de Implementação |
|---|--------|------|--------|------------------------|
| 1 | Autenticação e Usuários | [`01-auth-users-spec.md`](./01-auth-users-spec.md) | ⚠️ Parcial | [Ver Prompt ↓](#prompt-1-autenticação-e-usuários) |
| 2 | CRM (Clientes e Fornecedores) | [`02-crm-customers-suppliers-spec.md`](./02-crm-customers-suppliers-spec.md) | ❌ Não Implementado | [Ver Prompt ↓](#prompt-2-crm-clientes-e-fornecedores) |
| 3 | Catálogo e Produtos | [`03-catalog-products-spec.md`](./03-catalog-products-spec.md) | ⚠️ Parcial | [Ver Prompt ↓](#prompt-3-catálogo-e-produtos) |
| 4 | Estoque e Inventário | [`04-inventory-stock-spec.md`](./04-inventory-stock-spec.md) | ❌ Não Implementado | [Ver Prompt ↓](#prompt-4-estoque-e-inventário) |
| 5 | Vendas (Orçamentos e Pedidos) | [`05-sales-quotes-orders-spec.md`](./05-sales-quotes-orders-spec.md) | ⚠️ Parcial | [Ver Prompt ↓](#prompt-5-vendas-orçamentos-e-pedidos) |
| 6 | Produção (Kanban) | [`06-production-kanban-spec.md`](./06-production-kanban-spec.md) | ✅ Funcional | [Ver Prompt ↓](#prompt-6-produção-kanban) |
| 7 | Financeiro | [`07-financial-spec.md`](./07-financial-spec.md) | ❌ Não Implementado | [Ver Prompt ↓](#prompt-7-financeiro) |
| 8 | IA e Conversas | [`08-ai-conversations-spec.md`](./08-ai-conversations-spec.md) | ❌ Não Implementado | [Ver Prompt ↓](#prompt-8-ia-e-conversas) |
| 9 | Relatórios e Analytics | [`09-reports-analytics-spec.md`](./09-reports-analytics-spec.md) | ❌ Não Implementado | [Ver Prompt ↓](#prompt-9-relatórios-e-analytics) |
| 10 | Dashboard Admin | [`10-dashboard-admin-spec.md`](./10-dashboard-admin-spec.md) | ✅ Funcional | [Ver Prompt ↓](#prompt-10-dashboard-admin) |

---

## 🚀 Como Usar os Prompts

### Para Implementar um Módulo

1. **Leia a spec completa**: Abra o arquivo `.md` do módulo
2. **Copie o prompt**: Use o prompt abaixo correspondente
3. **Execute com IA**: Cole o prompt no Qwen Code ou similar
4. **Siga a implementação**: A IA seguirá a spec como guia
5. **Valide**: Confira contra os critérios de aceitação
6. **Teste**: Execute os testes listados na spec

### Estrutura de Cada Spec

Cada arquivo de spec contém:
- ✅ **Contexto**: Visão geral do módulo
- ✅ **Estado Atual**: O que já está implementado
- ✅ **Requisitos**: User stories detalhadas
- ✅ **Especificações Técnicas**: Rotas, actions, componentes
- ✅ **Validações**: Schemas Zod
- ✅ **Estrutura de Arquivos**: Organização proposta
- ✅ **Testes**: Lista de testes necessários
- ✅ **Dependências**: Módulos relacionados

---

## 💻 Prompts de Implementação

### Prompt 1: Autenticação e Usuários

```
Você é um desenvolvedor sênior especializado em Next.js 14 + Supabase.

CONTEXTO:
Estou implementando o módulo de Autenticação e Gestão de Usuários do PrintAI ERP.
Stack: Next.js 14.2.1 App Router, TypeScript, Supabase Auth, Prisma ORM.
Arquitetura: Multi-tenant, todos os dados isolados por tenantId.

ESPECIFICAÇÃO:
Siga rigorosamente a spec em: docs/specs/01-auth-users-spec.md

TAREFAS A IMPLEMENTAR:
1. Registro de Usuário (/register)
   - Formulário com validação Zod
   - Criação via Supabase Auth (signUp)
   - Vinculação com Tenant
   - Email de verificação

2. Recuperação de Senha
   - Página /forgot-password
   - Página /reset-password
   - Fluxo completo com token

3. Gestão de Perfis (/admin/usuarios)
   - Listagem de usuários do tenant
   - Edição de roles
   - Convite por email
   - Desativação

REQUISITOS TÉCNICOS:
- Server Components para páginas
- Client Components para formulários interativos
- Server Actions para operações de banco
- Zod para validação
- Framer Motion para animações
- Tailwind CSS para estilização
- Design consistente com o sistema existente

VALIDAÇÕES (Zod):
- Senha: mín 8 chars, maiúscula, minúscula, número
- Email: formato válido
- Nome: mín 2, máx 100 chars
- Role: enum ["OWNER", "ADMIN", "MANAGER", "OPERATOR", "VIEWER"]

ENTREGÁVEIS:
1. Páginas: /register, /forgot-password, /reset-password, /admin/usuarios
2. Server Actions em src/app/actions/auth.ts
3. Componentes de formulário em src/components/auth/
4. Testes contra critérios de aceitação

Siga a spec como guia definitivo. Em caso de dúvida, consulte a spec.
```

---

### Prompt 2: CRM (Clientes e Fornecedores)

```
Você é um desenvolvedor sênior especializado em Next.js 14 + Prisma.

CONTEXTO:
Estou implementando o módulo de CRM do PrintAI ERP.
Stack: Next.js 14.2.1 App Router, TypeScript, Prisma ORM, PostgreSQL.
Módulo gerencia: Clientes (Customer), Endereços (Address), Fornecedores (Supplier).

ESPECIFICAÇÃO:
Siga rigorosamente a spec em: docs/specs/02-crm-customers-suppliers-spec.md

TAREFAS A IMPLEMENTAR:
1. CRUD de Clientes
   - Listagem com busca e filtros
   - Formulário de criação/edição
   - Detail page completa
   - Soft delete

2. Gestão de Endereços
   - Múltiplos endereços por cliente
   - Tipos: BILLING, SHIPPING, BOTH
   - Busca automática por CEP (ViaCEP)
   - Endereço principal

3. CRUD de Fornecedores
   - Listagem e formulários
   - Vinculação com produtos
   - Condições de pagamento

4. Detail Page do Cliente
   - Informações completas
   - Endereços
   - Histórico de pedidos
   - Estatísticas

REQUISITOS TÉCNICOS:
- DataTable com busca, filtros, paginação
- Formulários com validação Zod
- Integração com API ViaCEP
- Server Actions para operações
- Componentes reutilizáveis
- Design responsivo

VALIDAÇÕES:
- CPF: 11 dígitos
- CNPJ: 14 dígitos
- Email: formato válido
- Documento único por tenant

ENTREGÁVEIS:
1. Rotas: /clientes, /clientes/novo, /clientes/[id], /clientes/[id]/editar
2. Rotas: /fornecedores (mesma estrutura)
3. Server Actions em src/app/actions/customers.ts, addresses.ts, suppliers.ts
4. Componentes em src/components/customers/, src/components/suppliers/

Siga a spec como guia definitivo.
```

---

### Prompt 3: Catálogo e Produtos

```
Você é um desenvolvedor sênior especializado em Next.js 14 + Prisma + Supabase Storage.

CONTEXTO:
Estou expandindo o módulo de Catálogo e Produtos do PrintAI ERP.
Já existe: Listagem básica de produtos.
Falta: Criação, edição, variações, upload de imagens, categorias.

ESPECIFICAÇÃO:
Siga rigorosamente a spec em: docs/specs/03-catalog-products-spec.md

TAREFAS A IMPLEMENTAR:
1. Criação de Produtos
   - Formulário completo com tipo (SIMPLE, VARIABLE, SERVICE, BUNDLE)
   - Geração automática de SKU
   - Upload de imagens para Supabase Storage
   - Validação completa

2. Gestão de Variações
   - UI para criar atributos (cor, tamanho)
   - Gerar combinações automaticamente
   - Preço e SKU por variante
   - Tabela de variantes editável

3. Gestão de Categorias
   - CRUD hierárquico (categorias e subcategorias)
   - Ícones e descrições
   - Slug automático

4. Upload de Imagens
   - Drag-and-drop
   - Preview e reordenação
   - Compressão automática
   - Integração com Supabase Storage

5. Importação em Lote
   - Upload CSV/Excel
   - Preview de validação
   - Importação assíncrona
   - Template para download

6. Detail Page do Produto
   - Informações completas
   - Variações
   - Fornecedores
   - Estatísticas de venda

REQUISITOS TÉCNICOS:
- Formulário multi-etapas
- Integração com Supabase Storage
- Geração de combinações (algoritmo)
- Validação de imagem (5MB, formatos)
- Zod para validação
- Componentes reutilizáveis

ENTREGÁVEIS:
1. Rotas: /produtos/novo, /produtos/[id], /produtos/[id]/editar
2. Rotas: /produtos/categorias, /produtos/importar
3. Server Actions expandidas em src/app/actions/products.ts
4. Componentes em src/components/products/

Siga a spec como guia definitivo.
```

---

### Prompt 4: Estoque e Inventário

```
Você é um desenvolvedor sênior especializado em Next.js 14 + Prisma.

CONTEXTO:
Estou implementando o módulo de Estoque e Inventário do PrintAI ERP.
Módulo controla: estoque atual, movimentações, reservas, ajustes, perdas.

ESPECIFICAÇÃO:
Siga rigorosamente a spec em: docs/specs/04-inventory-stock-spec.md

TAREFAS A IMPLEMENTAR:
1. Dashboard de Estoque
   - Visão geral com indicadores
   - Alertas de estoque baixo
   - Produtos sem estoque
   - Valor total em estoque

2. Registro de Entrada
   - Formulário de entrada
   - Motivos: COMPRA, PRODUCAO, DEVOLUCAO, AJUSTE
   - Vinculação com pedido/fornecedor
   - Atualização automática de inventory

3. Registro de Saída
   - Formulário de saída
   - Validação de estoque suficiente
   - Motivos: VENDA, CONSUMO, DEVOLUCAO_FORNECEDOR

4. Reserva de Estoque
   - Automática ao confirmar pedido
   - Liberação ao cancelar
   - Cálculo de availableStock

5. Ajuste e Perdas
   - Ajuste por inventário físico
   - Registro de perdas com motivo
   - Relatório de divergências

6. Histórico de Movimentações
   - Tabela completa com filtros
   - Badges coloridos por tipo
   - Exportação CSV

REQUISITOS TÉCNICOS:
- Transações atômicas para movimentações
- Validações de estoque (não negativo)
- Integração com módulo de produção
- Indicadores visuais de status
- Componentes reutilizáveis

ENTREGÁVEIS:
1. Rotas: /estoque, /estoque/entrada, /estoque/saida, /estoque/ajuste, /estoque/perda, /estoque/historico
2. Server Actions em src/app/actions/inventory.ts
3. Componentes em src/components/inventory/

Siga a spec como guia definitivo.
```

---

### Prompt 5: Vendas (Orçamentos e Pedidos)

```
Você é um desenvolvedor sênior especializado em Next.js 14 + Prisma.

CONTEXTO:
Estou implementando o módulo de Vendas do PrintAI ERP.
Já existe: Listagem básica de pedidos.
Falta: Orçamentos completos, criação de pedidos, detail pages.

ESPECIFICAÇÃO:
Siga rigorosamente a spec em: docs/specs/05-sales-quotes-orders-spec.md

TAREFAS A IMPLEMENTAR:
1. Criação de Orçamentos
   - Formulário multi-etapas
   - Seleção de cliente
   - Adição de múltiplos produtos
   - Cálculos automáticos (subtotal, desconto, impostos, total)
   - Validade do orçamento

2. Gestão de Orçamentos
   - Listagem com filtros
   - Envio por email
   - Geração de PDF
   - Link público para aprovação
   - Conversão em pedido

3. Criação de Pedidos
   - A partir de orçamento ou manual
   - Múltiplos itens
   - Configuração de entrega
   - Configuração de pagamento

4. Detail Page de Pedido
   - Informações completas
   - Itens do pedido
   - Status de produção
   - Status de pagamento
   - Timeline
   - Notas internas

5. Gestão de Itens
   - Atualização de status
   - Prioridade
   - Notas de produção
   - Histórico de alterações

6. Numeração Automática
   - Sequencial por tenant
   - Formato configurável
   - Sem duplicação

REQUISITOS TÉCNICOS:
- Cálculos financeiros precisos
- Transações atômicas
- Integração com módulo de estoque (reserva)
- Geração de PDF
- Templates de email
- Componentes reutilizáveis

ENTREGÁVEIS:
1. Rotas: /orcamentos (CRUD completo), /pedidos/novo, /pedidos/[id]
2. Server Actions em src/app/actions/quotes.ts, orders.ts
3. Componentes em src/components/quotes/, src/components/orders/

Siga a spec como guia definitivo.
```

---

### Prompt 6: Produção (Kanban)

```
Você é um desenvolvedor sênior especializado em Next.js 14 + Framer Motion.

CONTEXTO:
Estou expandindo o módulo de Produção do PrintAI ERP.
Já existe: Kanban básico com 5 colunas e drag-and-drop.
Falta: Atribuição de operadores, controle de tempo, alertas, relatórios.

ESPECIFICAÇÃO:
Siga rigorosamente a spec em: docs/specs/06-production-kanban-spec.md

TAREFAS A IMPLEMENTAR:
1. Melhorias no Kanban
   - Mais informações nos cards (operador, prazo, tempo)
   - Filtros avançados (prioridade, operador, pedido)
   - Ações em lote
   - Contadores por coluna

2. Detail Page do Item
   - Informações completas do item
   - Especificações técnicas
   - Notas de produção
   - Histórico de status
   - Controles de produção

3. Atribuição de Operadores
   - Dropdown de seleção
   - Dashboard de carga por operador
   - Filtro por operador

4. Controle de Tempo
   - startedAt, finishedAt
   - Cálculo de tempo decorrido
   - Alertas de atraso
   - Eficiência

5. Rejeição de Itens
   - Dialog de confirmação
   - Motivos comuns
   - Quantidade afetada
   - Fluxo pós-rejeição

6. Relatórios de Produção
   - Produção por período
   - Eficiência por operador
   - Taxa de rejeição
   - Dashboard de produção

REQUISITOS TÉCNICOS:
- Drag-and-drop otimista
- Animações com Framer Motion
- Cálculos de tempo em tempo real
- Integração com estoque (ao concluir)
- Componentes reutilizáveis

ENTREGÁVEIS:
1. Rotas: /producao/[itemId], /producao/relatorios, /producao/fila
2. Server Actions expandidas em src/app/actions/production.ts
3. Componentes em src/components/production/

Siga a spec como guia definitivo.
```

---

### Prompt 7: Financeiro

```
Você é um desenvolvedor sênior especializado em Next.js 14 + Prisma + cálculos financeiros.

CONTEXTO:
Estou implementando o módulo Financeiro do PrintAI ERP.
Módulo gerencia: contas a receber, contas a pagar, pagamentos, fluxo de caixa.

ESPECIFICAÇÃO:
Siga rigorosamente a spec em: docs/specs/07-financial-spec.md

TAREFAS A IMPLEMENTAR:
1. Contas a Receber
   - Geração automática de pedidos
   - Parcelamento
   - Listagem com filtros
   - Status de pagamento
   - Registro de recebimento

2. Contas a Pagar
   - Criação manual
   - Despesas recorrentes
   - Categorias de despesa
   - Registro de pagamento

3. Pagamentos
   - Múltiplos métodos (PIX, boleto, cartão, etc)
   - Status de processamento
   - Histórico completo

4. Fluxo de Caixa
   - Entradas vs saídas
   - Previsto vs realizado
   - Projeção futura
   - Gráficos

5. Dashboard Financeiro
   - Cards de resumo
   - Gráficos de fluxo
   - Contas a vencer
   - Inadimplentes

6. Notificações de Vencimento
   - Alertas automátos
   - Templates de email
   - Escalonamento

7. Relatórios Financeiros
   - DRE
   - Inadimplência
   - Análise por cliente/fornecedor

REQUISITOS TÉCNICOS:
- Cálculos financeiros precisos (Decimal)
- Parcelamento automático
- Transações atômicas
- Integração com vendas
- Componentes de gráficos
- Validações rigorosas

ENTREGÁVEIS:
1. Rotas: /financeiro, /financeiro/receber, /financeiro/pagar, /financeiro/pagamentos, /financeiro/fluxo-caixa, /financeiro/relatorios
2. Server Actions em src/app/actions/financial.ts
3. Componentes em src/components/financial/

Siga a spec como guia definitivo.
```

---

### Prompt 8: IA e Conversas

```
Você é um desenvolvedor sênior especializado em Next.js 14 + Supabase Realtime + Integração LLM.

CONTEXTO:
Estou implementando o módulo de IA e Conversas do PrintAI ERP.
Módulo gerencia: chat com clientes, respostas automáticas via IA, multi-canal.

ESPECIFICAÇÃO:
Siga rigorosamente a spec em: docs/specs/08-ai-conversations-spec.md

TAREFAS A IMPLEMENTAR:
1. Gestão de Conversas
   - Listagem tipo inbox
   - Status e canal visíveis
   - Atribuição de atendente
   - Filtros

2. Chat em Tempo Real
   - Interface de chat
   - Mensagens em tempo real (Supabase Realtime)
   - Indicador de "digitando"
   - Confirmação de leitura

3. Respostas Automáticas via IA
   - Integração com LLM (OpenAI/Anthropic)
   - Contexto do ERP no prompt
   - Escalada para humano
   - Validação de segurança

4. Base de Conhecimento (RAG)
   - Busca semântica com pgvector
   - Embeddings de produtos/FAQ
   - Contexto para LLM

5. Templates de Mensagem
   - CRUD de templates
   - Placeholders
   - Aplicação rápida

6. Métricas de Atendimento
   - Tempo médio de resposta
   - Taxa de resolução
   - CSAT
   - IA vs humano

REQUISITOS TÉCNICOS:
- Supabase Realtime subscriptions
- Integração com API de LLM
- pgvector para embeddings
- Webhooks para canais externos
- Componentes de chat
- Atualização otimista

ENTREGÁVEIS:
1. Rotas: /conversas, /conversas/[id], /conversas/templates, /conversas/metricas
2. Server Actions em src/app/actions/conversations.ts
3. API routes para webhooks
4. Componentes em src/components/conversations/

Siga a spec como guia definitivo.
```

---

### Prompt 9: Relatórios e Analytics

```
Você é um desenvolvedor sênior especializado em Next.js 14 + visualização de dados.

CONTEXTO:
Estou implementando o módulo de Relatórios e Analytics do PrintAI ERP.
Módulo fornece: relatórios, gráficos, dashboards customizáveis, exportação.

ESPECIFICAÇÃO:
Siga rigorosamente a spec em: docs/specs/09-reports-analytics-spec.md

TAREFAS A IMPLEMENTAR:
1. Relatórios de Vendas
   - Por período, produto, cliente, vendedor
   - Ticket médio
   - Comparativos

2. Relatórios Financeiros
   - DRE
   - Fluxo de caixa
   - Inadimplência

3. Relatórios de Produção e Estoque
   - Eficiência
   - Rejeição
   - Posição de estoque

4. Análise de Clientes (RFM)
   - Recência, Frequência, Montante
   - Segmentação
   - Lifetime Value

5. Dashboard Customizável
   - Widgets configuráveis
   - Drag-and-drop
   - Salvamento por usuário

6. Exportação
   - CSV, PDF, Excel
   - Relatórios agendados
   - Envio por email

REQUISITOS TÉCNICOS:
- Biblioteca de gráficos (Recharts recomendada)
- Queries otimizadas para relatórios
- Exportação eficiente
- Cache de dados
- Componentes de gráficos reutilizáveis

ENTREGÁVEIS:
1. Rotas: /relatorios/vendas, /relatorios/financeiro, /relatorios/producao, /relatorios/estoque, /relatorios/clientes, /relatorios/dashboard
2. Server Actions em src/app/actions/reports/
3. Componentes em src/components/reports/

Siga a spec como guia definitivo.
```

---

### Prompt 10: Dashboard Admin

```
Você é um desenvolvedor sênior especializado em Next.js 14 + dashboards.

CONTEXTO:
Estou expandindo o Dashboard Admin do PrintAI ERP.
Já existe: Dashboard básico com métricas e gráfico simples.
Falta: Filtros, alertas, notificações, customização, mais gráficos.

ESPECIFICAÇÃO:
Siga rigorosamente a spec em: docs/specs/10-dashboard-admin-spec.md

TAREFAS A IMPLEMENTAR:
1. Melhorias no Dashboard
   - Filtro de período global
   - Comparativos com período anterior
   - Mais métricas (receita, ticket médio, etc)

2. Widget de Alertas
   - Estoque baixo
   - Pedidos atrasados
   - Contas a vencer
   - Prioridades

3. Widget de Atividade Recente
   - Últimas ações no sistema
   - AuditLog

4. Gráficos Avançados
   - Receita ao longo do tempo
   - Vendas por produto
   - Pedidos por status
   - Faturamento mensal

5. Notificações
   - Sino na navbar
   - Dropdown de notificações
   - Marcar como lida
   - Página de notificações

6. Dashboard Customizável
   - Toggle de widgets
   - Reordenação
   - Salvamento de layout

REQUISITOS TÉCNICOS:
- Server Components com streaming
- Suspense boundaries
- Recharts para gráficos
- Framer Motion para animações
- Cache otimizado
- Performance (< 2s load)

ENTREGÁVEIS:
1. Expansão de /admin/page.tsx
2. Rotas: /admin/notificacoes, /admin/layout-customizar
3. Server Actions expandidas em src/app/actions/dashboard.ts
4. Componentes em src/components/dashboard/

Siga a spec como guia definitivo.
```

---

## 📊 Roadmap de Implementação Sugerido

### Fase 1 - Fundação (Semanas 1-2)
- [x] Dashboard Admin (já funcional)
- [ ] Autenticação completa (registro, recuperação de senha)
- [ ] Produção (melhorias)

### Fase 2 - Vendas (Semanas 3-4)
- [ ] Catálogo e Produtos (criação, edição, variações)
- [ ] Vendas (orçamentos, pedidos completos)

### Fase 3 - Operacional (Semanas 5-6)
- [ ] CRM (clientes, fornecedores)
- [ ] Estoque e Inventário

### Fase 4 - Financeiro (Semanas 7-8)
- [ ] Módulo Financeiro completo

### Fase 5 - Inteligência (Semanas 9-10)
- [ ] IA e Conversas
- [ ] Relatórios e Analytics

---

## 🎯 Métricas de Progresso

| Módulo | Status | % Completo | Testes Passando |
|--------|--------|-----------|-----------------|
| Autenticação | ⚠️ Parcial | 40% | 3/8 |
| CRM | ❌ Não Iniciado | 0% | 0/13 |
| Catálogo | ⚠️ Parcial | 20% | 2/16 |
| Estoque | ❌ Não Iniciado | 0% | 0/12 |
| Vendas | ⚠️ Parcial | 15% | 1/16 |
| Produção | ✅ Funcional | 60% | 5/13 |
| Financeiro | ❌ Não Iniciado | 0% | 0/13 |
| IA/Conversas | ❌ Não Iniciado | 0% | 0/12 |
| Relatórios | ❌ Não Iniciado | 0% | 0/11 |
| Dashboard | ✅ Funcional | 70% | 4/11 |

**Progresso Total**: ~20%

---

## 🔗 Recursos Relacionados

- **SPEC.md**: Especificação técnica completa do projeto
- **Schema Prisma**: `prisma/schema.prisma`
- **Documentação Existente**: `docs/` folder
- **Guia de Início Rápido**: `QUICKSTART.md`
- **Database Architecture**: `DATABASE_ARCHITECTURE.md`

---

## 📝 Convenções de Nomenclatura

### Arquivos de Spec
- Formato: `XX-nome-do-modulo-spec.md`
- XX: Número sequencial de 01 a 10
- kebab-case no nome

### Commits
- Formato: `feat(modulo): descrição`
- Ex: `feat(crm): adicionar CRUD de clientes`

### Branches
- Formato: `feature/XX-nome-modulo`
- Ex: `feature/02-crm-clientes`

---

**Última Atualização**: 2026-04-09
**Versão**: 1.0.0
**Mantido por**: Equipe PrintAI
