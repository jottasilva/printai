@echo off
echo ============================================
echo  PrintAI ERP - Setup do Banco de Dados
echo ============================================
echo.
echo Projeto Supabase: wlxuevhxnxyvvjtocnrc
echo.
echo Para obter a string de conexao do banco:
echo.
echo 1. Acesse: https://supabase.com/dashboard/project/wlxuevhxnxyvvjtocnrc
echo 2. V em Settings (engrenagem) ^> Database
echo 3. Role ate "Connection string"
echo 4. Selecione "Transaction" (porta 6543)
echo 5. Copie a string COMPLETA
echo 6. Cole abaixo:
echo.
set /p DATABASE_URL="DATABASE_URL: "
echo.
if "%DATABASE_URL%"=="" (
    echo [ERRO] String de conexao nao pode ser vazia!
    pause
    exit /b 1
)

echo.
echo Atualizando arquivo .env.local...
echo.

REM Ler conteudo atual do .env.local e substituir DATABASE_URL
powershell -Command "$content = Get-Content '.env.local'; $content = $content -replace 'DATABASE_URL=.*', 'DATABASE_URL=\"%DATABASE_URL%\"'; $content | Set-Content '.env.local'"

echo [OK] .env.local atualizado!
echo.
echo Gerando Prisma Client...
npx prisma generate

echo.
echo Verificando status das migraes...
npx prisma migrate status

echo.
echo ============================================
echo  Configuracao concluida!
echo ============================================
echo.
echo Agora execute:
echo   npx prisma migrate dev
echo   npm run dev
echo.
pause
