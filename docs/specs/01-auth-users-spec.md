# Spec: Módulo de Autenticação e Gestão de Usuários

## Contexto
Sistema ERP multi-tenant para gráficas usando Supabase Auth + Next.js 14 App Router.

## Estado Atual
- ✅ Login com email/senha implementado
- ✅ Middleware de proteção de rotas
- ✅ Auth context com estado global
- ✅ Tenant context vinculado ao usuário

## Requisitos do Módulo

### 1. Registro de Usuário
**User Story**: Como administrador da empresa, quero registrar novos usuários para acessar o sistema.

**Critérios de Aceitação**:
- Formulário com: nome, email, senha, confirmação de senha
- Validação de força de senha (mínimo 8 caracteres, maiúscula, número)
- Verificação de email já cadastrado
- Seleção de perfil inicial (OWNER convida outros perfis)
- Redirecionamento para setup pós-registro

**Especificação Técnica**:
```
Endpoint: /register (Client Component)
Ações:
  1. Validação do formulário com Zod
  2. Criação de usuário via Supabase Auth (signUp)
  3. Criação de registro em User no banco (RPC ou webhook)
  4. Vinculação com Tenant existente ou criação de novo tenant
  5. Envio de email de verificação
  6. Redirecionamento para /login com mensagem de sucesso
```

**Modelos do Schema**:
- `User`: id (UUID), email, name, role (OWNER, ADMIN, MANAGER, OPERATOR, VIEWER), tenantId
- `Tenant`: id (UUID), name, plan, status

### 2. Recuperação de Senha
**User Story**: Como usuário, quero recuperar minha senha caso esqueça.

**Critérios de Aceitação**:
- Página `/forgot-password` com campo de email
- Envio de email com link de reset
- Página `/reset-password` com token
- Validação de token (expiração de 1 hora)
- Nova senha com mesma validação do registro

**Especificação Técnica**:
```
Fluxo:
  1. Usuário insere email em /forgot-password
  2. Supabase envia email com link tokenizado
  3. Usuário clica no link -> /reset-password?token=xxx
  4. Validação do token via Supabase
  5. Formulário de nova senha
  6. Atualização via Supabase Auth
  7. Redirecionamento para /login
```

### 3. Gestão de Perfis e Permissões
**User Story**: Como administrador, quero gerenciar permissões dos usuários da minha empresa.

**Critérios de Aceitação**:
- Listagem de usuários do tenant
- Edição de perfil (role)
- Desativação de usuários
- Convite de novos usuários por email

**Especificação Técnica**:
```
Rota: /admin/usuarios (Server Component)
Ações:
  - getUsersByTenant(tenantId): Lista usuários ativos
  - updateUserRole(userId, role): Atualiza perfil
  - deactivateUser(userId): Soft delete
  - inviteUser(email, role): Envia convite

Hierarquia de Permissões:
  OWNER > ADMIN > MANAGER > OPERATOR > VIEWER
  
  OWNER: Acesso total + gestão de assinatura
  ADMIN: Acesso total exceto billing
  MANAGER: Gestão operacional (pedidos, produção, estoque)
  OPERATOR: Execução (produção, estoque)
  VIEWER: Apenas visualização
```

### 4. Verificação de Email
**User Story**: Como sistema, quero verificar emails para garantir segurança.

**Critérios de Aceitação**:
- Banner alertando email não verificado
- Reenvio de email de verificação
- Bloqueio de funcionalidades críticas sem verificação

### 5. Autenticação em Dois Fatores (2FA) - Futuro
**User Story**: Como usuário, quero adicionar camada extra de segurança.

**Critérios de Aceitação**:
- Suporte a TOTP (Google Authenticator, Authy)
- Backup codes
- Forçar 2FA para perfis ADMIN/OWNER

## Estrutura de Arquivos Proposta
```
src/app/
├── register/page.tsx
├── forgot-password/page.tsx
├── reset-password/page.tsx
├── verify-email/page.tsx
└── admin/
    └── usuarios/page.tsx

src/app/actions/
└── auth.ts
    ├── registerUser(formData)
    ├── forgotPassword(email)
    ├── resetPassword(token, password)
    ├── getUsersByTenant()
    ├── updateUserRole(userId, role)
    ├── deactivateUser(userId)
    └── inviteUser(email, role)
```

## Validações (Zod Schema)
```typescript
registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Deve conter maiúscula")
    .regex(/[a-z]/, "Deve conter minúscula")
    .regex(/[0-9]/, "Deve conter número"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Senhas não coincidem"
})

updateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["OWNER", "ADMIN", "MANAGER", "OPERATOR", "VIEWER"])
})
```

## Testes Necessários
- [ ] Teste de registro com dados válidos
- [ ] Teste de registro com email duplicado
- [ ] Teste de validação de senha fraca
- [ ] Teste de fluxo de forgot password completo
- [ ] Teste de expiração de token de reset
- [ ] Teste de permissões por role
- [ ] Teste de desativação de usuário
- [ ] Teste de isolamento por tenant

## Dependências
- Supabase Auth (já configurado)
- Email templates (a criar)
- Zod (já instalado)

## Métricas de Sucesso
- Taxa de conclusão de registro > 80%
- Taxa de recuperação de senha < 10% dos logins
- Zero incidentes de acesso entre tenants
