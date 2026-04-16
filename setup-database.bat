@echo off
echo ========================================
echo  PrintAI ERP - Database Setup Helper
echo ========================================
echo.
echo Este script vai verificar a configuracao do banco de dados
echo e ajudar a conectar ao Supabase.
echo.
pause

echo.
echo ----------------------------------------
echo  PASSO 1: Verificando arquivos .env
echo ----------------------------------------
echo.

if exist ".env.local" (
    echo [OK] Arquivo .env.local encontrado!
    echo.
    findstr "DATABASE_URL" .env.local
    findstr "SUPABASE_URL" .env.local
) else (
    echo [ERRO] Arquivo .env.local NAO encontrado!
    echo.
    echo Voce precisa criar o arquivo .env.local na raiz do projeto.
    echo.
    echo O arquivo .env.example foi criado como modelo.
    echo Copie-o e preencha com suas credenciais do Supabase:
    echo.
    echo   copy .env.example .env.local
    echo.
)

echo.
echo ----------------------------------------
echo  PASSO 2: Verificando Prisma Client
echo ----------------------------------------
echo.

if exist "node_modules\@prisma\client" (
    echo [OK] Prisma Client instalado
) else (
    echo [AVISO] Prisma Client NAO instalado
    echo Execute: npm install
)

echo.
echo ----------------------------------------
echo  PASSO 3: Status do banco de dados
echo ----------------------------------------
echo.

if exist ".env.local" (
    echo Verificando conexao com o banco...
    echo.
    npx prisma migrate status 2>&1
) else (
    echo [ERRO] Nao e possivel verificar o banco sem .env.local
    echo.
    echo INSTRUCCOES PARA CONFIGURAR:
    echo.
    echo 1. Acesse https://supabase.com/dashboard
    echo 2. Selecione seu projeto
    echo 3. V em Settings ^> Database
    echo 4. Em "Connection string", copie a URI Transaction (porta 6543)
    echo 5. Cole no arquivo .env.local como DATABASE_URL
    echo.
    echo Formato esperado:
    echo DATABASE_URL="postgresql://postgres.xxxxx:SENHA@aws-0-xx-xxxx.pooler.supabase.com:6543/postgres?pgbouncer=true"
)

echo.
echo ----------------------------------------
echo  CONCLUIDO
echo ----------------------------------------
echo.
echo Se o banco esta configurado, execute:
echo   npx prisma generate
echo   npx prisma migrate deploy
echo.
pause
