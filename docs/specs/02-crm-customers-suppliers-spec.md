# Spec: Módulo de CRM - Clientes e Fornecedores

## Contexto
Sistema ERP multi-tenant para gráficas. Módulo de CRM gerencia clientes finais e fornecedores de insumos.

## Estado Atual
- ❌ Não implementado
- Modelos prontos no schema: `Customer`, `Address`, `Supplier`

## Requisitos do Módulo

### 1. Gestão de Clientes (Customers)
**User Story**: Como vendedor, quero cadastrar e gerenciar clientes para realizar vendas.

**Critérios de Aceitação**:
- CRUD completo de clientes
- Busca por nome, email, CPF/CNPJ
- Filtros por cidade/estado
- Histórico de pedidos por cliente
- Dados fiscais completos (required para emissão de pedido)

**Especificação Técnica**:
```
Rotas:
  GET  /clientes              - Listagem com busca e filtros
  GET  /clientes/novo         - Formulário de criação
  GET  /clientes/[id]         - Detalhe do cliente
  GET  /clientes/[id]/editar  - Formulário de edição

Server Actions:
  - createCustomer(formData)
  - updateCustomer(id, formData)
  - deleteCustomer(id)          - Soft delete
  - searchCustomers(query)      - Busca textual
  - getCustomerById(id)         - Detalhe completo
  - getCustomerOrders(id)       - Histórico de pedidos

Campos Obrigatórios:
  - tenantId (automático)
  - name (razão social ou nome)
  - documentType (CPF ou CNPJ)
  - document (formatado conforme tipo)
  - email
  - phone
  - isTenant (boolean - se também usa o sistema)

Campos Opcionais:
  - tradeName (nome fantasia)
  - website
  - notes (observações internas)
  - metadata (JSON customizável)
```

**Validações (Zod)**:
```typescript
customerSchema = z.object({
  name: z.string().min(2).max(200),
  tradeName: z.string().max(200).optional(),
  documentType: z.enum(["CPF", "CNPJ"]),
  document: z.string()
    .min(11, "Documento inválido")
    .max(18, "Documento inválido"),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  website: z.string().url().optional(),
  notes: z.string().max(1000).optional(),
  isTenant: z.boolean().default(false)
})

// Validação de CPF/CNPJ conforme documentType
cpfRegex = /^\d{11}$/
cnpjRegex = /^\d{14}$/
```

### 2. Gestão de Endereços
**User Story**: Como operador, quero cadastrar múltiplos endereços por cliente para faturamento e entrega.

**Critérios de Aceitação**:
- Múltiplos endereços por cliente
- Tipos: BILLING (cobrança), SHIPPING (entrega), BOTH (ambos)
- Definição de endereço principal
- Validação de CEP via API (ViaCEP)

**Especificação Técnica**:
```
Server Actions:
  - createAddress(customerId, formData)
  - updateAddress(id, formData)
  - deleteAddress(id)
  - setPrimaryAddress(id)
  - fetchAddressByCep(cep)        - Integração ViaCEP

Campos:
  - customerId (FK)
  - type (BILLING, SHIPPING, BOTH)
  - street
  - number
  - complement
  - neighborhood
  - city
  - state (UF - 2 caracteres)
  - zipCode (CEP)
  - country (default: "Brasil")
  - isPrimary (boolean)
```

### 3. Gestão de Fornecedores (Suppliers)
**User Story**: Como comprador, quero gerenciar fornecedores para adquirir insumos.

**Critérios de Aceitação**:
- CRUD de fornecedores
- Produtos/serviços fornecidos
- Condições de pagamento negociadas
- Histórico de compras por fornecedor
- Avaliação de desempenho (futuro)

**Especificação Técnica**:
```
Rotas:
  GET  /fornecedores            - Listagem
  GET  /fornecedores/novo       - Criação
  GET  /fornecedores/[id]       - Detalhe

Server Actions:
  - createSupplier(formData)
  - updateSupplier(id, formData)
  - deleteSupplier(id)
  - getSupplierById(id)
  - getSupplierProducts(id)     - Produtos vinculados

Campos:
  - name
  - contactPerson
  - email
  - phone
  - document (CNPJ)
  - website
  - paymentTerms (condições negociadas)
  - rating (avaliação 1-5, futuro)
  - notes
  - metadata (JSON)
```

### 4. Vinculação Fornecedor-Produto
**User Story**: Como comprador, quero saber quais fornecedores vendem quais produtos.

**Especificação Técnica**:
```
Model: SupplierProduct
  - supplierId (FK)
  - productId (FK)
  - sku (código do produto no fornecedor)
  - costPrice (preço de custo)
  - leadTimeDays (prazo de entrega)
  - minimumOrderQuantity
  - isActive (disponível para compra)

Server Actions:
  - linkSupplierProduct(supplierId, productId, data)
  - updateSupplierProduct(id, data)
  - removeSupplierProduct(id)
  - getSupplierProductsBySupplier(supplierId)
  - getProductSuppliers(productId)   - Todos fornecedores de um produto
```

### 5. Listagem Avançada com Filtros
**User Story**: Como usuário, quero filtrar e buscar clientes/fornecedores rapidamente.

**Funcionalidades**:
- Busca textual (nome, email, documento)
- Filtro por cidade/estado
- Filtro por tipo de documento (CPF/CNPJ)
- Ordenação por nome, data de criação, último pedido
- Paginação (20 itens por página)
- Exportação para CSV

**Especificação Técnica**:
```
Componente: DataTable com:
  - Search input (debounce 300ms)
  - Filtros colapsáveis
  - Ordenação por colunas
  - Paginação
  - Botão de exportação

Query otimizada:
  SELECT * FROM Customer
  WHERE tenantId = $1
    AND deletedAt IS NULL
    AND (
      name ILIKE %query% OR
      email ILIKE %query% OR
      document ILIKE %query%
    )
  ORDER BY createdAt DESC
  LIMIT 20 OFFSET page * 20
```

### 6. Detail Page do Cliente
**User Story**: Como usuário, quero ver todas as informações de um cliente em um lugar.

**Layout Proposto**:
```
┌─────────────────────────────────────────────┐
│  [Voltar]  Cliente: João Silva              │
│  ┌─────────────────┬───────────────────────┐│
│  │ Informações     │  Ações Rápidas        ││
│  │ Nome:           │  [Novo Orçamento]     ││
│  │ Email:          │  [Novo Pedido]        ││
│  │ CPF/CNPJ:       │  [Editar]             ││
│  │ Telefone:       │                       ││
│  └─────────────────┴───────────────────────┘│
│                                             │
│  ┌─ Endereços ────────────────────────────┐ │
│  │ [Adicionar]                            │ │
│  │ 📍 Rua X, 123 - Principal (Billing)   │ │
│  │ 📍 Av. Y, 456 - Shipping              │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌─ Histórico de Pedidos ─────────────────┐ │
│  │ Data    | Nº   | Valor   | Status     │ │
│  │ 01/04   | 1234 | R$ 500  | Entregue   │ │
│  │ 15/03   | 1189 | R$ 1200 | Em Produção│ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌─ Estatísticas ─────────────────────────┐ │
│  │ Total Gasto: R$ 15.400                │ │
│  │ Último Pedido: 01/04/2026             │ │
│  │ Qtd. Pedidos: 23                      │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Estrutura de Arquivos Proposta
```
src/app/
└── clientes/
    ├── page.tsx                    - Listagem
    ├── novo/page.tsx               - Formulário de criação
    └── [id]/
        ├── page.tsx                - Detail page
        └── editar/page.tsx         - Formulário de edição

src/app/fornecedores/
├── page.tsx
├── novo/page.tsx
└── [id]/
    └── page.tsx

src/app/actions/
├── customers.ts
│   ├── createCustomer(formData)
│   ├── updateCustomer(id, formData)
│   ├── deleteCustomer(id)
│   ├── searchCustomers(params)
│   ├── getCustomerById(id)
│   └── getCustomerOrders(id)
├── addresses.ts
│   ├── createAddress(customerId, formData)
│   ├── updateAddress(id, formData)
│   ├── deleteAddress(id)
│   ├── setPrimaryAddress(id)
│   └── fetchAddressByCep(cep)
└── suppliers.ts
    ├── createSupplier(formData)
    ├── updateSupplier(id, formData)
    ├── deleteSupplier(id)
    ├── getSupplierById(id)
    └── getSupplierProducts(id)

src/components/
├── customers/
│   ├── customer-form.tsx
│   ├── customer-list.tsx
│   ├── customer-detail-header.tsx
│   ├── customer-addresses.tsx
│   └── customer-order-history.tsx
└── suppliers/
    ├── supplier-form.tsx
    └── supplier-list.tsx
```

## Integrações Externas
- **ViaCEP API**: `https://viacep.com.br/ws/{cep}/json/`
  - Autopreenchimento de endereço
  - Fallback manual se indisponível

## Testes Necessários
- [ ] Teste de criação de cliente com CPF válido
- [ ] Teste de criação de cliente com CNPJ válido
- [ ] Teste de validação de email duplicado
- [ ] Teste de busca por texto
- [ ] Teste de filtros combinados
- [ ] Teste de paginação
- [ ] Teste de criação de endereço
- [ ] Teste de busca por CEP
- [ ] Teste de definição de endereço principal
- [ ] Teste de soft delete
- [ ] Teste de isolamento por tenant
- [ ] Teste de criação de fornecedor
- [ ] Teste de vinculação fornecedor-produto

## Métricas de Sucesso
- Tempo de criação de cliente < 30 segundos
- Taxa de preenchimento automático de CEP > 90%
- Zero duplicidade de clientes (mesmo CPF/CNPJ)

## Dependências
- Módulo de Autenticação (para tenantId)
- Módulo de Vendas (para histórico de pedidos)
- Módulo de Catálogo (para vinculação de produtos)
