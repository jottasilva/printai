@echo off
REM Script para rodar testes de UI do PrintAI ERP (Windows)
REM Uso: run-tests.bat [opções]

echo.
echo ====================================
echo PrintAI ERP - UI Test Runner
echo ====================================
echo.

REM Verifica argumentos
if "%1"=="" goto all
if "%1"=="help" goto help
if "%1"=="-h" goto help
if "%1"=="--help" goto help
if "%1"=="report" goto report
if "%1"=="all" goto all
if "%1"=="landing" goto landing
if "%1"=="components" goto components
if "%1"=="a11y" goto a11y
if "%1"=="headed" goto headed
if "%1"=="debug" goto debug

goto help

:help
echo.
echo Uso: run-tests.bat [opcao]
echo.
echo Opcoes:
echo   all          - Roda todos os testes (padrao)
echo   landing      - Testes da Landing Page
echo   components   - Testes de Componentes UI
echo   a11y         - Testes de Acessibilidade e Performance
echo   headed       - Roda com browser visivel
echo   debug        - Roda em modo debug
echo   report       - Mostra relatorio dos testes
echo   help         - Mostra esta ajuda
echo.
echo Exemplos:
echo   run-tests.bat all
echo   run-tests.bat landing
echo   run-tests.bat headed
echo   run-tests.bat debug
echo   run-tests.bat report
echo.
goto end

:all
echo [INFO] Rodando TODOS os testes...
echo.
call npx playwright test
goto end

:landing
echo [INFO] Rodando testes da Landing Page...
echo.
call npx playwright test landing-page.spec.ts
goto end

:components
echo [INFO] Rodando testes de Componentes UI...
echo.
call npx playwright test ui-components.spec.ts
goto end

:a11y
echo [INFO] Rodando testes de Acessibilidade...
echo.
call npx playwright test accessibility-performance.spec.ts
goto end

:headed
echo [INFO] Rodando testes com browser visivel...
echo.
if "%2"=="" (
    call npx playwright test --headed
) else (
    call npx playwright test %2 --headed
)
goto end

:debug
echo [INFO] Rodando testes em modo DEBUG...
echo.
call npx playwright test --debug
goto end

:report
echo [INFO] Abrindo relatorio de testes...
echo.
call npx playwright show-report test-results
goto end

:end
echo.
echo ====================================
echo Testes concluidos!
echo ====================================
echo.
