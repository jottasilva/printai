#!/bin/bash

# Script para rodar testes de UI do PrintAI ERP
# Uso: ./run-tests.sh [opções]

echo "🎨 PrintAI ERP - UI Test Runner"
echo "================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verifica se o servidor está rodando
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓${NC} Servidor detectado em localhost:3000"
else
    echo -e "${YELLOW}⚠${NC} Servidor não detectado. Iniciando..."
    npm run dev &
    SERVER_PID=$!
    sleep 5
fi

# Função para rodar testes
run_tests() {
    local test_type=$1
    local args=$2
    
    case $test_type in
        "all")
            echo -e "\n${YELLOW}🚀 Rodando TODOS os testes...${NC}"
            npx playwright test $args
            ;;
        "landing")
            echo -e "\n${YELLOW}🏠 Rodando testes da Landing Page...${NC}"
            npx playwright test landing-page.spec.ts $args
            ;;
        "components")
            echo -e "\n${YELLOW}🧩 Rodando testes de Componentes UI...${NC}"
            npx playwright test ui-components.spec.ts $args
            ;;
        "a11y")
            echo -e "\n${YELLOW}♿ Rodando testes de Acessibilidade...${NC}"
            npx playwright test accessibility-performance.spec.ts $args
            ;;
        "headed")
            echo -e "\n${YELLOW}👁️ Rodando testes com browser visível...${NC}"
            npx playwright test --headed $args
            ;;
        "debug")
            echo -e "\n${YELLOW}🐛 Rodando testes em modo DEBUG...${NC}"
            npx playwright test --debug $args
            ;;
        *)
            echo -e "${RED}✗${NC} Opção inválida!"
            show_help
            exit 1
            ;;
    esac
}

# Mostra ajuda
show_help() {
    echo "Uso: ./run-tests.sh [opção] [arquivo]"
    echo ""
    echo "Opções:"
    echo "  all          - Roda todos os testes (padrão)"
    echo "  landing      - Testes da Landing Page"
    echo "  components   - Testes de Componentes UI"
    echo "  a11y         - Testes de Acessibilidade e Performance"
    echo "  headed       - Roda com browser visível"
    echo "  debug        - Roda em modo debug"
    echo "  report       - Mostra relatório dos testes"
    echo "  help         - Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  ./run-tests.sh all"
    echo "  ./run-tests.sh landing"
    echo "  ./run-tests.sh headed landing-page.spec.ts"
    echo "  ./run-tests.sh debug"
    echo "  ./run-tests.sh report"
}

# Parser de argumentos
case ${1:-all} in
    "help"|"-h"|"--help")
        show_help
        exit 0
        ;;
    "report")
        echo -e "\n${YELLOW}📊 Abrindo relatório de testes...${NC}"
        npx playwright show-report test-results
        exit 0
        ;;
    *)
        run_tests ${1:-all} "${2:-}"
        ;;
esac

# Limpa servidor se foi iniciado por este script
if [ ! -z "$SERVER_PID" ]; then
    echo -e "\n${YELLOW}🛑 Parando servidor de desenvolvimento...${NC}"
    kill $SERVER_PID 2>/dev/null
fi

echo ""
echo -e "${GREEN}✓${NC} Testes concluídos!"
