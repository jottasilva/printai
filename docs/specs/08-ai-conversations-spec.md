# Spec: Módulo de IA e Conversas

## Contexto
Sistema ERP multi-tenant para gráficas. Módulo de conversas gerencia atendimento ao cliente com IA.

## Estado Atual
- ❌ Não implementado
- Modelos prontos: `Conversation`, `Message`
- Enums: `ConversationChannel`, `ConversationStatus`, `MessageRole`, `MessageContentType`
- Preparado para RAG: `Message.embedding Float[]` (pgvector)

## Requisitos do Módulo

### 1. Gestão de Conversas
**User Story**: Como atendente, quero gerenciar conversas com clientes.

**Critérios de Aceitação**:
- Listagem de conversas ativas e fechadas
- Status da conversa visível
- Canal de origem (WhatsApp, Email, Chat, etc)
- Atribuição de atendente
- Priorização

**Especificação Técnica**:
```
Rota: /conversas (Server Component)

Model: Conversation
  - customerId (FK, opcional, se cliente conhecido)
  - assignedTo (userId, opcional)
  - channel (WHATSAPP, EMAIL, CHAT, SMS, INSTAGRAM, OTHER)
  - status (OPEN, AI_HANDLING, WAITING_HUMAN, IN_PROGRESS, RESOLVED, CLOSED)
  - subject (assunto, opcional)
  - priority (LOW, NORMAL, HIGH, URGENT)
  - lastMessageAt (timestamp da última mensagem)
  - closedAt (timestamp de fechamento)
  - metadata (JSON)
    Ex: { "whatsappPhone": "+5511987654321" }

Server Actions:
  - getConversations(params)
  - getConversationById(id)
  - createConversation(formData)
  - assignConversation(userId)
  - updateConversationStatus(id, status)
  - closeConversation(id)
  - reopenConversation(id)
  - getConversationMessages(id)

Status da Conversa:
  OPEN → Recém criada, aguardando resposta
  AI_HANDLING → IA está processando resposta
  WAITING_HUMAN → IA solicitou intervenção humana
  IN_PROGRESS → Atendente humano respondendo
  RESOLVED → Resolvida, aguardando confirmação
  CLOSED → Finalizada

Fluxo de Status:
  OPEN → AI_HANDLING → WAITING_HUMAN → IN_PROGRESS → RESOLVED → CLOSED
       ↓                                              ↓
       → WAITING_HUMAN -------------------------------→

Filtros:
  - Status
  - Canal
  - Atendente
  - Prioridade
  - Período
  - Cliente
  - Não atribuídas (toggle)

Componentes:
  ConversationList:
    - Lista lateral estilo inbox
    - Preview da última mensagem
    - Badge de status e canal
    - Indicador de não lidas
    - Tempo desde última mensagem
```

### 2. Chat em Tempo Real
**User Story**: Como atendente, quero conversar com clientes em tempo real.

**Especificação Técnica**:
```
Rota: /conversas/[id] (Client Component)

UI:
  ┌─────────────────────────────────────────┐
  │ [Voltar]  Conversa #CONV-2026-0089      │
  │ Cliente: João Silva | Canal: WhatsApp   │
  │ Status: [IN_PROGRESS]  Atendente: Maria │
  │                                         │
  │ ┌─ Chat ──────────────────────────────┐ │
  │ │                                     │ │
  │ │ [10:05] Cliente:                   │ │
  │ │ Olá, quero fazer um orçamento       │ │
  │ │ de cartões de visita                │ │
  │ │                                     │ │
  │ │ [10:06] IA (assistente):           │ │
  │ │ Claro! Posso ajudar. Quantas        │ │
  │ │ unidades você precisa?              │ │
  │ │                                     │ │
  │ │ [10:08] Cliente:                   │ │
  │ │ 500 unidades                        │ │
  │ │                                     │ │
  │ │ [10:08] Maria (atendente):         │ │
  │ │ Perfeito! Vou preparar o orçamento  │ │
  │ │                                     │ │
  │ └─────────────────────────────────────┘ │
  │                                         │
  │ [Digitar mensagem...]          [Enviar] │
  │                                         │
  │ [Transferir para IA] [Encerrar]        │
  └─────────────────────────────────────────┘

Model: Message
  - conversationId (FK)
  - role (USER - cliente, ASSISTANT - IA/atendente, SYSTEM - sistema, TOOL - ferramenta)
  - contentType (TEXT, IMAGE, AUDIO, DOCUMENT, TEMPLATE)
  - content (string, texto ou URL)
  - metadata (JSON)
    Ex: { "templateId": "quote-request", "aiConfidence": 0.92 }
  - embedding Float[] @db.Vector(1536)  // Para busca semântica (pgvector)
  - createdAt

Server Actions:
  - sendMessage(conversationId, content, role)
  - sendBulkMessage(conversationId, messages[])
  - getMessages(conversationId, limit, before)
  - getMessageById(id)
  - deleteMessage(id)                 // Soft delete via metadata

Integração em Tempo Real:
  - Supabase Realtime para mensagens novas
  - Subscription: messages WHERE conversationId = X
  - Atualização otimista na UI
  - Indicador de "digitando..."
  - Confirmação de leitura (double check)
```

### 3. Respostas Automáticas via IA
**User Story**: Como sistema, quero que IA responda perguntas frequentes automaticamente.

**Especificação Técnica**:
```
Fluxo de IA:
  1. Cliente envia mensagem
  2. Sistema analisa intenção:
     → Se intenção clara e resposta disponível: IA responde
     → Se dúvida ou complexidade: WAITING_HUMAN
  3. IA gera resposta contextual
  4. Resposta enviada ao cliente
  5. Sistema monitora satisfação

Server Actions:
  - processIncomingMessage(messageId)
    → Analisa conteúdo da mensagem
    → Busca contexto da conversa
    → Consulta base de conhecimento (RAG)
    → Gera resposta via LLM
    → Retorna resposta ou sinaliza para humano
  
  - generateAIResponse(conversationId, userMessage)
    → Chama API de LLM (OpenAI, Anthropic, etc)
    → Prompt com contexto do ERP
    → Templates de resposta
    → Validação de segurança
  
  - escalateToHuman(conversationId, reason)
    → Muda status para WAITING_HUMAN
    → Notifica atendentes disponíveis
    → Inclui contexto da conversa
    → Motivo da escalada

Integração com LLM:
  Provider: OpenAI GPT-4 ou Anthropic Claude
  Contexto incluído no prompt:
    - Histórico da conversa
    - Dados do cliente (se conhecido)
    - Pedidos recentes
    - Produtos e preços
    - Políticas da empresa
  
  Exemplo de Prompt:
    ```
    Você é um assistente virtual da PrintAI, uma gráfica online.
    
    Cliente: João Silva
    Últimos pedidos: 
      - #PED-2026-0123: 500 cartões de visita (entregue)
      - #PED-2026-0145: 1000 panfletos (em produção)
    
    Histórico da conversa:
    [mensagens recentes]
    
    Mensagem do cliente: "Quero fazer um novo pedido de cartões"
    
    Responda de forma útil, oferecendo:
    1. Repetir último pedido de cartões
    2. Criar orçamento personalizado
    3. Ver catálogo de produtos
    
    Seja amigável e profissional. Não invente informações.
    ```

Configurações de IA (futuro - AIConfig):
  - enabled (boolean)
  - maxAutoResponses (limite por conversa)
  - escalationKeywords (palavras que forçam humano)
  - confidenceThreshold (mínimo para auto-resposta)
  - responseTemplates (templates base)
```

### 4. Base de Conhecimento e RAG
**User Story**: Como IA, quero acessar informações do ERP para responder precisamente.

**Especificação Técnica**:
```
RAG (Retrieval-Augmented Generation):
  
  Fontes de Dados:
    1. Catálogo de produtos
    2. Preços e promoções
    3. Pedidos do cliente
    4. Status de produção
    5. Políticas de entrega
    6. FAQ da empresa
    7. Histórico de conversas passadas
  
  Embeddings:
    - Mensagens armazenam embeddings (pgvector)
    - Base de conhecimento indexada com embeddings
    - Busca semântica por similaridade
  
  Server Actions:
    - searchKnowledgeBase(query, limit)
      → Gera embedding da query
      → Busca similares no pgvector
      → Retorna top N resultados
      → Contexto para LLM
    
    - indexProductInKB(productId)
      → Gera embedding de descrição do produto
      → Armazena para busca futura
    
    - indexFAQInKB(faqId)
      → Embedding de pergunta/resposta FAQ
    
    - updateEmbeddings()
      → Re-indexa base de conhecimento
      → Cron job periódico

Query de Similaridade (PostgreSQL + pgvector):
  SELECT content, metadata, 
         embedding <-> query_embedding AS similarity
  FROM knowledge_base
  ORDER BY similarity
  LIMIT 5
```

### 5. Múltiplos Canais
**User Story**: Como cliente, quero conversar pelo canal que preferir.

**Especificação Técnica**:
```
Canais Suportados:
  
  1. CHAT (Web Chat)
     - Widget no site
     - Implementação própria
     - Tempo real via Supabase
  
  2. WhatsApp (API Oficial ou Baileys)
     - Integração com WhatsApp Business API
     - Ou biblioteca Baileys (não oficial)
     - Webhook para receber mensagens
     - Template messages para notificações
  
  3. Email
     - IMAP para receber emails
     - SMTP para enviar
     - Thread por conversationId
     - Assunto como referência
  
  4. Instagram DM
     - API do Instagram Business
     - Webhook para mensagens
  
  5. SMS (Twilio)
     - Integração com Twilio
     - Para alertas urgentes
  
  6. OTHER (genérico)
     - Para integrações customizadas

Webhook Endpoint:
  /api/webhooks/whatsapp
  /api/webhooks/email
  /api/webhooks/instagram
  
  Recebe mensagem externa
  → Identifica/cria Conversation
  → Salva Message (role=USER)
  → Dispara processamento IA
  → Se resposta IA: envia de volta
  → Se humano: notifica atendente
```

### 6. Templates de Mensagem
**User Story**: Como atendente, quero usar templates para respostas rápidas.

**Especificação Técnica**:
```
Model: MessageTemplate (futuro)
  - name
  - category
  - content (texto com placeholders)
  - variables (array de variáveis)
  - usageCount
  - isActive
  - createdBy
  - tenantId

Exemplos de Templates:
  1. Solicitação de Orçamento
     "Olá! Para preparar seu orçamento, preciso de:\n
      - Produto desejado: {produto}\n
      - Quantidade: {quantidade}\n
      - Especificações: {detalhes}"
  
  2. Status de Pedido
     "Seu pedido #{numero} está {status}.\n
      Previsão de entrega: {data}"
  
  3. Pós-Venda
     "Oi {nome}! Sua entrega foi realizada.\n
      Tudo certo com seu pedido?
      Avalie nosso atendimento: {link}"

Server Actions:
  - createTemplate(formData)
  - updateTemplate(id, formData)
  - deleteTemplate(id)
  - getTemplates(category)
  - applyTemplate(templateId, variables)
    → Substitui placeholders
    → Retorna texto pronto
  - incrementTemplateUsage(id)

UI:
  - Botão de template no chat
  - Lista de templates por categoria
  - Preview antes de enviar
  - Edição rápida
```

### 7. Métricas de Atendimento
**User Story**: Como gestor, quero analisar performance do atendimento.

**Especificação Técnica**:
```
Métricas:
  - Tempo médio de resposta (TMR)
  - Tempo médio de resolução (TMR)
  - Taxa de resolução na primeira interação
  - Satisfação do cliente (CSAT)
  - Conversas por canal
  - Conversas resolvidas por IA vs humanas
  - Volume por período
  - Picos de atendimento

Server Actions:
  - getSupportMetrics(dateRange)
  - getResponseTimeAnalysis()
  - getResolutionRate()
  - getChannelDistribution()
  - getAIVsHumanResolution()
  - getSatisfactionScore()

Dashboard de Métricas:
  ┌─ Atendimento - Últimos 30 Dias ───────────┐
  │ Conversas: 234     Resolvidas: 198 (85%)  │
  │ TMR: 4min        CSAT: 4.6/5              │
  │ IA resolveu: 62%  Humano: 38%             │
  └────────────────────────────────────────────┘

  ┌─ Por Canal ────────────────────────────────┐
  │ WhatsApp: 145 (62%)  ▓▓▓▓▓▓▓▓▓▓          │
  │ Chat: 56 (24%)       ▓▓▓▓                  │
  │ Email: 33 (14%)      ▓▓▓                   │
  └────────────────────────────────────────────┘

  ┌─ Volume Diário ────────────────────────────┐
  │ [Gráfico de linhas por dia]                │
  └────────────────────────────────────────────┘
```

### 8. Satisfação do Cliente (CSAT)
**User Story**: Como cliente, quero avaliar o atendimento recebido.

**Especificação Técnica**:
```
Fluxo:
  1. Conversa marcada como RESOLVED
  2. Sistema envia pesquisa de satisfação
  3. Cliente avalia de 1 a 5 estrelas
  4. Opcional: comentário
  5. Sistema registra e agradece

Model: ConversationFeedback (futuro)
  - conversationId (FK)
  - rating (Int, 1-5)
  - comment (string, opcional)
  - createdAt

Server Actions:
  - sendSatisfactionSurvey(conversationId)
  - submitFeedback(conversationId, rating, comment)
  - getFeedbackStats(dateRange)

Template de Pesquisa:
  "Como foi seu atendimento? ⭐⭐⭐⭐⭐
   (1 = Ruim, 5 = Excelente)
   Deixe um comentário (opcional)"
```

### 9. Integração com Pedidos e Orçamentos
**User Story**: Como atendente, quero criar pedidos/orçamentos durante conversa.

**Especificação Técnica**:
```
Ações durante Conversa:
  - Criar orçamento (abre modal de quote)
  - Criar pedido (abre modal de order)
  - Consultar status de pedido
  - Ver histórico do cliente
  - Gerar segundo via de boleto

Server Actions:
  - createQuoteFromConversation(customerId, items)
  - createOrderFromConversation(customerId, items)
  - getCustomerOrders(customerId)
  - getOrderStatus(orderId)
  - generateBoletoCopy(orderId)

UI:
  - Toolbar de ações rápidas no chat
  - Modais inline
  - Preview de documentos
  - Envio automático de confirmação ao cliente

Exemplo:
  Atendente clica "Criar Orçamento"
  → Modal abre com dados do cliente
  → Adiciona produtos mencionados na conversa
  → Gera orçamento
  → Envia resumo no chat
  → Link para aprovação
```

## Estrutura de Arquivos Proposta
```
src/app/
└── conversas/
    ├── page.tsx                    - Listagem de conversas
    ├── [id]/
    │   └── page.tsx                - Chat room
    ├── templates/
    │   └── page.tsx                - Gestão de templates
    └── metricas/
        └── page.tsx                - Dashboard de métricas

src/app/api/
└── webhooks/
    ├── whatsapp/route.ts           - Webhook WhatsApp
    ├── email/route.ts              - Webhook email
    └── instagram/route.ts          - Webhook Instagram

src/app/actions/
└── conversations.ts
    ├── getConversations(params)
    ├── getConversationById(id)
    ├── createConversation(formData)
    ├── assignConversation(userId)
    ├── updateConversationStatus(id, status)
    ├── closeConversation(id)
    ├── reopenConversation(id)
    ├── getConversationMessages(id)
    ├── sendMessage(conversationId, content, role)
    ├── processIncomingMessage(messageId)
    ├── generateAIResponse(conversationId, message)
    ├── escalateToHuman(conversationId, reason)
    ├── searchKnowledgeBase(query, limit)
    ├── createTemplate(formData)
    ├── applyTemplate(templateId, variables)
    ├── getSupportMetrics(dateRange)
    ├── sendSatisfactionSurvey(conversationId)
    └── submitFeedback(conversationId, rating, comment)

src/components/
└── conversations/
    ├── conversation-list.tsx
    ├── conversation-item.tsx
    ├── chat-room.tsx
    ├── chat-message.tsx
    ├── chat-input.tsx
    ├── ai-indicator.tsx
    ├── template-picker.tsx
    ├── quick-actions-toolbar.tsx
    ├── satisfaction-survey.tsx
    ├── conversation-status-badge.tsx
    └── support-metrics-dashboard.tsx
```

## Validações (Zod)
```typescript
conversationSchema = z.object({
  customerId: z.string().uuid().optional(),
  channel: z.enum(["WHATSAPP", "EMAIL", "CHAT", "SMS", "INSTAGRAM", "OTHER"]),
  subject: z.string().max(200).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  metadata: z.record(z.unknown()).optional()
})

messageSchema = z.object({
  conversationId: z.string().uuid(),
  role: z.enum(["USER", "ASSISTANT", "SYSTEM", "TOOL"]),
  contentType: z.enum(["TEXT", "IMAGE", "AUDIO", "DOCUMENT", "TEMPLATE"]),
  content: z.string().min(1, "Mensagem não pode ser vazia"),
  metadata: z.record(z.unknown()).optional()
})

templateSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.string().max(50),
  content: z.string().min(10).max(2000),
  variables: z.array(z.string()).default([]),
  isActive: z.boolean().default(true)
})

feedbackSchema = z.object({
  conversationId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional()
})
```

## Testes Necessários
- [ ] Teste de criação de conversa
- [ ] Teste de envio de mensagem
- [ ] Teste de recebimento em tempo real
- [ ] Teste de resposta automática via IA
- [ ] Teste de escalada para humano
- [ ] Teste de busca na base de conhecimento
- [ ] Teste de aplicação de template
- [ ] Teste de mudança de status
- [ ] Teste de pesquisa de satisfação
- [ ] Teste de integração com webhook
- [ ] Teste de criação de orçamento durante conversa
- [ ] Teste de isolamento por tenant

## Métricas de Sucesso
- Taxa de resolução automática pela IA > 60%
- Tempo médio de resposta < 5 minutos
- CSAT > 4.5/5
- Taxa de escalada < 40%

## Dependências
- Módulo de CRM (clientes)
- Módulo de Vendas (pedidos/orçamentos)
- Módulo de Catálogo (produtos)
- Integração com LLM externo
- pgvector extension (PostgreSQL)
