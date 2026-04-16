# DOCUMENTAÇÃO SDD - Modernização Tipográfica PrintAI ERP

Esta documentação detalha o processo de refatoração visual e tipográfica realizado no módulo administrativo do **PrintAI Industrial ERP**, seguindo os princípios de **Spec-Driven Development (SDD)**, **Clean Code** e as diretrizes de design minimalista de alta performance.

## 1. Visão Geral e Motivação

O objetivo central desta intervenção foi elevar a estética do sistema para um patamar "high-tech" e "weightless". Identificamos que o uso excessivo de pesos de fonte pesados (`font-bold`, `font-black`) gerava ruído visual e cansaço cognitivo em interfaces ricas em dados.

### Objetivos Alcançados:
- **Redução de Ruído**: Substituição de pesos agressivos por `font-light` (300) e `font-normal` (400).
- **Hierarquia Visual**: Uso de escala tipográfica e contraste de cores em vez de peso para destacar informações.
- **Consistência Sistêmica**: Unificação da linguagem visual entre todos os módulos administrativos e componentes de UI base.
- **Estética Premium**: Interface que transmite precisão técnica, modernidade e sofisticação industrial.

---

## 2. Especificações de Implementação por Módulo

### 2.1 Dashboard & Business Intelligence
- **Arquivos**: `admin/page.tsx`, `stat-card.tsx`, `activity-chart.tsx`.
- **Ações**: 
    - Os indicadores de performance (KPIs) agora utilizam pesos leves para os valores numéricos.
    - Legendagem e eixos de gráficos foram simplificados para focar na tendência dos dados.

### 2.2 Gestão de Pedidos (Workflow Comercial)
- **Arquivos**: `order-list-client.tsx`, `order-details-modal.tsx`, `pedidos/[id]/page.tsx`.
- **Ações**:
    - IDs de pedidos e nomes de clientes convertidos para `font-normal`.
    - Resumo financeiro e balanço operacional totalmente reestruturados para uma leitura fluida e técnica.

### 2.3 Produção Industrial (Workflow Fabril)
- **Arquivos**: `producao/page.tsx`, `kanban-board.tsx`.
- **Ações**:
    - Cabeçalhos de colunas do Kanban e identificadores de tarefas suavizados.
    - Informações de operadores e prioridades agora utilizam cores e ícones como drivers de destaque, não negrito.

### 2.4 Catálogo de Produtos
- **Arquivos**: `produtos/page.tsx`.
- **Ações**:
    - Nomes de produtos e preços base ajustados para `font-light`.
    - Refinamento das badges de status e tags de identificação (SKU).

### 2.5 Acesso e Autenticação
- **Arquivos**: `login/page.tsx`, `register/page.tsx`.
- **Ações**:
    - Portas de entrada do sistema redesenhadas para uma primeira impressão minimalista e elegante.

---

## 3. Componentização e UI System (Clean Code)

Para manter a escalabilidade, as alterações foram aplicadas em componentes fundamentais:
- **Dialog System**: Modais de confirmação e formulários agora seguem o padrão leve.
- **Toast Notifications**: Alertas e feedbacks agora são discretos e sofisticados.
- **AI Widget**: O assistente PrintAI teve sua interface refinada para não competir visualmente com os dados principais.

---

## 4. Debugging & Estabilidade Técnica

Durante o processo, enfrentamos um erro de build causado por uma falha de balanceamento de tags JSX (tag `</div>` órfã) em um dos componentes de alta complexidade.

### Resolução de Erros:
- **Identificação**: Erro de sintaxe `Unexpected token AnimatePresence` detectado pelo Webpack/SWC.
- **Correção**: Auditoria manual da árvore DOM virtual e restauração do equilíbrio das tags.
- **Prevenção**: Implementação de verificações de sanidade em componentes adjacentes após cada alteração estrutural.

---

## 5. Próximos Passos Recomendados

1. **Auditoria de Acessibilidade**: Verificar se o contraste das fontes leves atende aos padrões WCAG em todos os temas.
2. **Performance Tipográfica**: Garantir que as variantes de peso (300, 400) estejam sendo carregadas corretamente via Font-Face ou Google Fonts para evitar FOIT (Flash of Invisible Text).
3. **Expansão do Estilo**: Aplicar a mesma lógica de "peso leve" às áreas de configurações e relatórios avançados.

---
**Documento gerado em**: 12 de Abril de 2026
**Responsável**: Antigravity Agent
**Escopo**: Modernização Visual Adm-Core
