# Configurao do Banco de Dados - Guia Completo

## Problema

```
Invalid `prisma.user.findUnique()` invocation:
Can't reach database server at `localhost:5432`
```

## Causa

O sistema usa **Supabase como backend completo**. O Supabase inclui:
1. **Supabase Auth** - Gerencia autenticao (email/senha, JWT)
2. **Supabase PostgreSQL** - Banco de dados PostgreSQL completo

O **Prisma** precisa da string de conexo direta ao PostgreSQL do Supabase para funcionar. **Esta string no existe no arquivo `.env.local`.**

---

## Soluo Passo-a-Passo

### Passo 1: Obter String de Conexo do Supabase

1. Acesse **https://supabase.com/dashboard**
2. Faa login e selecione seu projeto
3. No menu lateral, v em **Settings** (engrenagem) **Database**
4. Role at **Connection string**
5. Selecione **Transaction** (usa porta 6543 - recomendado para Prisma)
6. A string ser algo como:
   ```
   postgresql://postgres.abc123xyz789:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
7. Substitua `[YOUR-PASSWORD]` pela **senha do banco** que voc definiu ao criar o projeto

### Passo 2: Obter Chaves de Autenticao

Na mesma pgina **Settings > API**:

1. **Project URL** - algo como `https://abc123xyz789.supabase.co`
2. **anon public** - a chave que comea com `eyJ...`

### Passo 3: Criar Arquivo `.env.local`

Crie o arquivo `c:\Users\Jhef\Documents\printai\printai\.env.local` com o seguinte contedo:

```env
# ============================================
# PrintAI ERP - Configurao de Ambiente
# ============================================

# Supabase - URL do projeto (obter em Settings > API)
NEXT_PUBLIC_SUPABASE_URL="https://SEU_PROJETO.supabase.co"

# Supabase - Chave annima (obter em Settings > API > anon public)
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Supabase - String de conexo ao banco de dados
# Obter em: Settings > Database > Connection string > Transaction (porta 6543)
# IMPORTANTE: Substitua [YOUR-PASSWORD] pela senha do banco!
DATABASE_URL="postgresql://postgres.SEU_PROJETO:SENHA_SUPABASE@aws-0-REGIAO.pooler.supabase.com:6543/postgres?pgbouncer=true"

# URL da aplicao (desenvolvimento)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### Passo 4: Aplicar Configurao

Execute no terminal:

```bash
# 1. Gerar cliente Prisma
npx prisma generate

# 2. Verificar status das migraes
npx prisma migrate status

# 3. Aplicar migraes no banco do Supabase
npx prisma migrate deploy

# 4. (Opcional) Popular banco com dados de teste
npx prisma db seed
```

### Passo 5: Verificar

```bash
# Reinicie o servidor de desenvolvimento
npm run dev
```

Acesse http://localhost:3000 e verifique se o erro desapareceu.

---

## Soluo de Problemas

### Erro: "Invalid DATABASE_URL"

**Causas possveis:**
- Senha incorreta
- String de conexo mal formatada
- Pooler no habilitado no Supabase

**Como resolver:**
1. No painel do Supabase, v em **Settings > Database**
2. Verifique se o **Connection Pooler** est ativado
3. Copie a string novamente e substitua a senha
4. Certifique-se de usar o modo **Transaction** (porta 6543), no Direct (porta 5432)

### Erro: "Relation 'User' does not exist"

**Causa:** As tabelas ainda no foram criadas no banco.

**Como resolver:**
```bash
npx prisma migrate deploy
```

### Erro: "PrismaClientInitializationError"

**Causa:** Cliente Prisma no gerado aps mudana de env.

**Como resolver:**
```bash
npx prisma generate
```

### Erro: "P1001 - Can't reach database server"

**Causa:** String de conexo incorreta ou firewall bloqueando.

**Como resolver:**
1. Verifique se a string est no formato correto
2. Teste a conexo com um cliente SQL (DBeaver, pgAdmin)
3. Verifique se o projeto Supabase est ativo

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────┐
│                   PrintAI ERP                        │
│                                                      │
│  ┌─────────────┐    ┌────────────────────────────┐  │
│  │  Frontend   │    │       Server Components     │  │
│  │  (React)    │    │       Server Actions        │  │
│  └──────┬──────┘    └─────────────┬──────────────┘  │
│         │                         │                  │
│         │ Auth                    │ Dados            │
│         ▼                         ▼                  │
│  ┌─────────────┐    ┌────────────────────────────┐  │
│  │  Supabase   │    │  Prisma ORM → PostgreSQL   │  │
│  │  Auth (SSR) │    │  (Supabase Database)       │  │
│  └──────┬──────┘    └─────────────┬──────────────┘  │
│         │                         │                  │
│         └─────────┬───────────────┘                  │
│                   ▼                                  │
│          Supabase PostgreSQL                         │
│          (mesmo banco, schemas diferentes)           │
└─────────────────────────────────────────────────────┘
```

- **Supabase Auth**: Gerencia `auth.users` (schema interno do Supabase)
- **Prisma**: Gerencia tabelas de negcio no schema `public`
- **User.id** no Prisma = **auth.users.id** do Supabase

---

## Variveis de Ambiente Necessrias

| Varivel | Obrigatria? | Descrio |
|---------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | **SIM** | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **SIM** | Chave annima para Auth |
| `DATABASE_URL` | **SIM** | String de conexo ao PostgreSQL |
| `NEXT_PUBLIC_SITE_URL` | No | URL base da aplicao |

---

## Aps Configurar Corretamente

O sistema ir funcionar completamente:

- Login e registro Supabase Auth
- Dashboard com dados reais do banco
- Kanban de produo funcional
- CRUD de produtos completo
- Lista de pedidos com filtros
- Todas as 12 rotas protegidas funcionando

---

*ltima atualizao: Abril 2026*
