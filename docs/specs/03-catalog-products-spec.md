# Spec: Módulo de Catálogo e Produtos

## Contexto
Sistema ERP multi-tenant para gráficas. Módulo de catálogo gerencia produtos, variações e categorias.

## Estado Atual
- ⚠️ Listagem básica implementada (`/produtos/page.tsx`)
- Server action `getProducts()` funcional
- Soft delete implementado
- Modelos prontos: `Category`, `Product`, `ProductVariant`, `SupplierProduct`

## Requisitos do Módulo

### 1. Criação de Produtos
**User Story**: Como gestor, quero cadastrar produtos com suas variações para venda.

**Critérios de Aceitação**:
- Formulário completo de produto
- Suporte a 4 tipos: SIMPLE, VARIABLE, SERVICE, BUNDLE
- Upload de imagem do produto
- Múltiplas variações (cor, tamanho, acabamento)
- Preço por variante
- SKU automático

**Especificação Técnica**:
```
Rota: /produtos/novo (Client Component com formulário)

Server Actions:
  - createProduct(formData)
  - createProductWithVariants(formData)
  - generateSKU(productData)
  - uploadProductImage(productId, file)

Tipos de Produto:
  SIMPLE: Produto único sem variações
    Ex: "Cartão de Visita 500un"
    → Preço único, SKU único
  
  VARIABLE: Produto com variações
    Ex: "Camiseta" → Variações: P, M, G / Vermelha, Azul
    → Preço por variante, SKU por variante
  
  SERVICE: Serviço sem produto físico
    Ex: "Design de Logo", "Consultoria"
    → Sem controle de estoque, preço por hora/unidade
  
  BUNDLE: Pacote de produtos
    Ex: "Kit Empresarial" → 500 cartões + 100 panfletos
    → Preço do bundle, lista de produtos incluídos

Campos do Produto:
  - name (obrigatório)
  - description (rich text)
  - type (SIMPLE, VARIABLE, SERVICE, BUNDLE)
  - categoryId (FK)
  - basePrice (Decimal)
  - costPrice (Decimal)
  - sku (string, único por tenant)
  - barcode (string, opcional)
  - images (array de URLs)
  - tags (array de strings)
  - isActive (boolean)
  - trackInventory (boolean - controla estoque?)
  - metadata (JSON)
```

### 2. Gestão de Variações
**User Story**: Como operador, quero configurar variações de produtos com preços diferentes.

**Especificação Técnica**:
```
Model: ProductVariant
  - productId (FK)
  - name (ex: "P / Vermelha")
  - sku (único)
  - price (Decimal)
  - costPrice (Decimal)
  - stock (Int)
  - image (URL)
  - attributes (JSON)
    Ex: { "tamanho": "P", "cor": "Vermelha" }

UI de Criação de Variações:
  ┌──────────────────────────────────────┐
  │ Variação: Cor                        │
  │ [Vermelha] [Azul] [Verde] [+]       │
  │                                      │
  │ Variação: Tamanho                    │
  │ [P] [M] [G] [GG] [+]                │
  │                                      │
  │ [Gerar Combinações] → 12 variantes  │
  │                                      │
  │ ┌─ Tabela de Variantes ────────────┐│
  │ │ SKU       | Nome        | Preço  ││
  │ │ CAM-P-VER | P/Vermelha  | R$ 50  ││
  │ │ CAM-P-AZU | P/Azul      | R$ 50  ││
  │ │ ...                               ││
  │ └───────────────────────────────────┘│
  └──────────────────────────────────────┘
```

### 3. Gestão de Categorias
**User Story**: Como gestor, quero organizar produtos em categorias para fácil navegação.

**Especificação Técnica**:
```
Model: Category
  - name
  - slug (URL-friendly, único por tenant)
  - description
  - icon (lucide icon name)
  - parentId (auto-referencial para subcategorias)
  - sortOrder
  - isActive

Server Actions:
  - createCategory(formData)
  - updateCategory(id, formData)
  - deleteCategory(id)
  - getCategoriesTree()         - Hierárquico
  - getCategoryById(id)

Rotas:
  GET /produtos/categorias         - Listagem
  GET /produtos/categorias/novo    - Criação
```

### 4. Upload de Imagens
**User Story**: Como usuário, quero adicionar imagens aos produtos para melhor apresentação.

**Especificação Técnica**:
```
Integração: Supabase Storage
  Bucket: "product-images"
  Path: {tenantId}/{productId}/{timestamp}-{filename}
  Max size: 5MB por imagem
  Formatos: JPG, PNG, WebP
  Qualidade: Auto-compress para WebP

Server Actions:
  - uploadProductImage(productId, file)
    → Valida tamanho/formato
    → Upload para Supabase Storage
    → Retorna URL pública
    → Atualiza Product.images array
  
  - deleteProductImage(productId, imageUrl)
    → Remove de Product.images
    → Remove do Storage (opcional)

Componente:
  ImageUploader:
    - Drag & drop
    - Preview de imagens
    - Reordenação (drag)
    - Remoção individual
    - Barra de progresso
    - Validação de tamanho
```

### 5. Edição de Produtos
**User Story**: Como operador, quero editar produtos existentes para manter catálogo atualizado.

**Especificação Técnica**:
```
Rota: /produtos/[id]/editar

Funcionalidades:
  - Carregar dados completos do produto
  - Edição inline de campos
  - Adicionar/remover variações
  - Trocar imagem principal
  - Atualizar preços em lote
  - Duplicar produto (criar cópia)
  - Ativar/desativar produto

Server Actions:
  - updateProduct(id, formData)
  - updateVariant(variantId, formData)
  - deleteVariant(variantId)
  - duplicateProduct(id)
  - toggleProductActive(id)
```

### 6. Listagem Avançada
**User Story**: Como usuário, quero buscar e filtrar produtos rapidamente.

**Especificações da Listagem Atual**:
- ✅ Busca por nome
- ✅ Exibição de tipo e categoria
- ⚠️ Adicionar: filtro por categoria
- ⚠️ Adicionar: filtro por tipo
- ⚠️ Adicionar: filtro por status (ativo/inativo)
- ⚠️ Adicionar: ordenação
- ⚠️ Adicionar: paginação
- ⚠️ Adicionar: visualização em grid (cards)

**Componentes Propostos**:
```
ProductDataTable:
  - Colunas: Imagem, Nome, Categoria, SKU, Tipo, Preço, Ações
  - Ordenação por coluna
  - Paginação (20 itens)
  - Toggle listagem/grid
  - Seleção em lote para ações
  - Exportação CSV

ProductGrid:
  - Cards com imagem
  - Hover com ações rápidas
  - Badge de tipo e status
  - Preço visível
```

### 7. Importação em Lote
**User Story**: Como gestor, quero importar produtos via planilha para acelerar cadastro.

**Especificação Técnica**:
```
Formatos: CSV, Excel (XLSX)
Template disponível para download
Validação antes de importação:
  - Campos obrigatórios
  - SKU duplicado
  - Categoria existente
  - Preços válidos

Preview de importação:
  - X itens válidos
  - Y itens com erro (lista de erros)
  - [Confirmar Importação]

Server Actions:
  - validateProductImport(file)
  - importProducts(file)
  - exportProductTemplate()     - Download template vazio
  - exportProducts(filters)     - Exportar catálogo atual
```

### 8. Detail Page do Produto
**User Story**: Como usuário, quero ver todas as informações de um produto.

**Layout Proposto**:
```
┌─────────────────────────────────────────────────┐
│  [Voltar]  Produto: Cartão de Visita            │
│  ┌────────────┬────────────────────────────────┐│
│  │ [Imagem]   │ Nome: Cartão de Visita 500un   ││
│  │            │ Categoria: Cartões             ││
│  │            │ Tipo: SIMPLE                   ││
│  │            │ SKU: CV-500-001                ││
│  │            │ Preço: R$ 89,90                ││
│  │            │ Custo: R$ 35,00                ││
│  │            │ Margem: 61%                    ││
│  │            │ [Editar] [Desativar]           ││
│  └────────────┴────────────────────────────────┘│
│                                                 │
│  ┌─ Variações (se VARIABLE) ───────────────────┐│
│  │ Nome        | SKU      | Preço | Estoque   ││
│  │ P/Vermelha  | CAM-P-VER| R$ 50 | 45        ││
│  │ M/Azul      | CAM-M-AZU| R$ 55 | 32        ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│  ┌─ Fornecedores ──────────────────────────────┐│
│  │ Fornecedor      | Custo   | Lead Time     ││
│  │ Gráfica X       | R$ 35   | 5 dias        ││
│  │ Gráfica Y       | R$ 38   | 3 dias        ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│  ┌─ Estatísticas de Venda ─────────────────────┐│
│  │ Vendidos (30d): 156                         ││
│  │ Receita (30d): R$ 14.024                    ││
│  │ Em pedidos em aberto: 234 unidades          ││
│  └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

## Estrutura de Arquivos Proposta
```
src/app/
└── produtos/
    ├── page.tsx                    - Listagem avançada
    ├── novo/page.tsx               - Formulário de criação
    ├── categorias/
    │   ├── page.tsx                - Gestão de categorias
    │   └── novo/page.tsx
    ├── importar/page.tsx           - Importação em lote
    └── [id]/
        ├── page.tsx                - Detail page
        ├── editar/page.tsx         - Formulário de edição
        └── variantes/novo/page.tsx

src/app/actions/
└── products.ts (expandir)
    ├── createProduct(formData)
    ├── createProductWithVariants(formData)
    ├── updateProduct(id, formData)
    ├── deleteProduct(id)           - já existe
    ├── duplicateProduct(id)
    ├── toggleProductActive(id)
    ├── uploadProductImage(productId, file)
    ├── deleteProductImage(productId, imageUrl)
    ├── getProducts(params)         - já existe, melhorar
    ├── getProductById(id)
    ├── generateSKU(productData)
    └── import/export functions

src/components/
└── products/
    ├── product-form.tsx
    ├── product-list-table.tsx
    ├── product-grid.tsx
    ├── product-detail.tsx
    ├── product-image-uploader.tsx
    ├── variant-manager.tsx
    ├── category-form.tsx
    ├── category-list.tsx
    └── import-preview.tsx
```

## Validações (Zod)
```typescript
productSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  type: z.enum(["SIMPLE", "VARIABLE", "SERVICE", "BUNDLE"]),
  categoryId: z.string().uuid().optional(),
  basePrice: z.number().positive("Preço deve ser positivo"),
  costPrice: z.number().positive().optional(),
  sku: z.string().max(100).optional(),
  barcode: z.string().max(100).optional(),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  trackInventory: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional()
})

variantSchema = z.object({
  name: z.string().min(1).max(100),
  sku: z.string().max(100),
  price: z.number().positive(),
  costPrice: z.number().positive().optional(),
  attributes: z.record(z.string()),
  image: z.string().url().optional()
})

categorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  parentId: z.string().uuid().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true)
})
```

## Testes Necessários
- [ ] Teste de criação de produto SIMPLE
- [ ] Teste de criação de produto VARIABLE com variantes
- [ ] Teste de criação de produto SERVICE
- [ ] Teste de criação de produto BUNDLE
- [ ] Teste de geração automática de SKU
- [ ] Teste de upload de imagem
- [ ] Teste de validação de imagem (tamanho/formato)
- [ ] Teste de edição de produto
- [ ] Teste de duplicação de produto
- [ ] Teste de criação de categoria
- [ ] Teste de subcategoria
- [ ] Teste de importação CSV
- [ ] Teste de validação de importação
- [ ] Teste de filtros combinados
- [ ] Teste de isolamento por tenant
- [ ] Teste de soft delete

## Métricas de Sucesso
- Tempo de criação de produto < 1 minuto
- Taxa de produtos com imagem > 80%
- Zero SKU duplicado
- Importação de 1000 produtos < 30 segundos

## Dependências
- Módulo de Autenticação (tenantId)
- Supabase Storage (imagens)
- Módulo de Estoque (para trackInventory)
- Módulo de Vendas (para estatísticas)
