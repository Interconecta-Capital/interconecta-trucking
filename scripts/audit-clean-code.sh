#!/bin/bash
# ============================================
# AUDITORÍA CLEAN CODE - DETECCIÓN AUTOMÁTICA
# ============================================
# Este script detecta automáticamente problemas de código
# según estándares Clean Code, SOLID y buenas prácticas

set -e

echo "🔍 =========================================="
echo "🔍 AUDITORÍA CLEAN CODE - PROYECTO CFDI 4.0"
echo "🔍 =========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# ==================== 1. CÓDIGO MUERTO ====================
echo "📂 [1/10] Buscando código muerto..."
DEAD_MAPPER=$(rg "ViajeCartaPorteMapper" src/ --count-matches 2>/dev/null | awk -F: '{sum+=$2} END {print sum}')
DEAD_MODAL=$(rg "MigracionDatosModal" src/ --count-matches 2>/dev/null | awk -F: '{sum+=$2} END {print sum}')

if [ "$DEAD_MAPPER" -gt 0 ] || [ "$DEAD_MODAL" -gt 0 ]; then
  echo -e "${RED}❌ Encontrado código muerto:${NC}"
  if [ "$DEAD_MAPPER" -gt 0 ]; then
    echo "   - ViajeCartaPorteMapper: $DEAD_MAPPER referencias"
    rg "ViajeCartaPorteMapper" src/ -n | head -5
  fi
  if [ "$DEAD_MODAL" -gt 0 ]; then
    echo "   - MigracionDatosModal: $DEAD_MODAL referencias"
    rg "MigracionDatosModal" src/ -n | head -5
  fi
  ((ERRORS++))
else
  echo -e "${GREEN}✅ Sin código muerto detectado${NC}"
fi
echo ""

# ==================== 2. REFERENCIAS FISCAL_API ====================
echo "🔍 [2/10] Buscando referencias a fiscal_api..."
FISCAL_API_COUNT=$(rg -i "fiscal_api|fiscal-api|fiscalapi" src/ --count-matches 2>/dev/null | awk -F: '{sum+=$2} END {print sum}')

if [ "$FISCAL_API_COUNT" -gt 0 ]; then
  echo -e "${RED}❌ Encontradas $FISCAL_API_COUNT referencias a fiscal_api:${NC}"
  rg -i "fiscal_api|fiscal-api|fiscalapi" src/ -n | head -10
  ((ERRORS++))
else
  echo -e "${GREEN}✅ Sin referencias a fiscal_api${NC}"
fi
echo ""

# ==================== 3. CONSOLE.LOG ====================
echo "📝 [3/10] Contando console.log..."
CONSOLE_LOGS=$(rg "console\.log\(" src/ --count-matches 2>/dev/null | awk -F: '{sum+=$2} END {print sum}')
CONSOLE_ERRORS=$(rg "console\.error\(" src/ --count-matches 2>/dev/null | awk -F: '{sum+=$2} END {print sum}')

echo "   Total console.log: $CONSOLE_LOGS"
echo "   Total console.error: $CONSOLE_ERRORS"

if [ "$CONSOLE_LOGS" -gt 50 ]; then
  echo -e "${YELLOW}⚠️  Muchos console.log detectados (objetivo: migrar a logger)${NC}"
  ((WARNINGS++))
elif [ "$CONSOLE_LOGS" -eq 0 ]; then
  echo -e "${GREEN}✅ Todos los logs migrados a logger${NC}"
fi
echo ""

# ==================== 4. AMBIENTE HARDCODED ====================
echo "🌍 [4/10] Buscando ambiente hardcoded..."
HARDCODED_SANDBOX=$(rg "ambiente: ['\"]sandbox['\"]" src/ --count-matches 2>/dev/null | awk -F: '{sum+=$2} END {print sum}')
HARDCODED_PRODUCTION=$(rg "ambiente: ['\"]production['\"]" src/ --count-matches 2>/dev/null | awk -F: '{sum+=$2} END {print sum}')

if [ "$HARDCODED_SANDBOX" -gt 0 ] || [ "$HARDCODED_PRODUCTION" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Ambiente hardcoded encontrado:${NC}"
  echo "   - sandbox: $HARDCODED_SANDBOX ocurrencias"
  echo "   - production: $HARDCODED_PRODUCTION ocurrencias"
  rg "ambiente: ['\"]" src/ -n | head -5
  ((WARNINGS++))
else
  echo -e "${GREEN}✅ Sin ambiente hardcoded${NC}"
fi
echo ""

# ==================== 5. MÉTODO AMBIGUO ====================
echo "🔍 [5/10] Buscando método ambiguo validarPreTimbrado..."
METODO_AMBIGUO=$(rg "validarPreTimbrado" src/ --count-matches 2>/dev/null | awk -F: '{sum+=$2} END {print sum}')

if [ "$METODO_AMBIGUO" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Método ambiguo encontrado: $METODO_AMBIGUO ocurrencias${NC}"
  echo "   Debe renombrarse a: validarEmisorReceptor"
  rg "validarPreTimbrado" src/ -n | head -5
  ((WARNINGS++))
else
  echo -e "${GREEN}✅ Método renombrado correctamente${NC}"
fi
echo ""

# ==================== 6. TYPESCRIPT STRICT ====================
echo "🔍 [6/10] Verificando TypeScript estricto..."
if [ -f "tsconfig.json" ]; then
  STRICT_MODE=$(grep -c '"strict": true' tsconfig.json 2>/dev/null || echo "0")
  
  if [ "$STRICT_MODE" -eq 0 ]; then
    echo -e "${RED}❌ TypeScript strict mode NO está habilitado${NC}"
    ((ERRORS++))
  else
    echo -e "${GREEN}✅ TypeScript strict mode habilitado${NC}"
    
    # Verificar errores TypeScript
    echo "   Verificando errores TypeScript..."
    if command -v pnpm &> /dev/null; then
      if pnpm tsc --noEmit 2>&1 | grep -q "error TS"; then
        echo -e "${RED}❌ Hay errores TypeScript${NC}"
        pnpm tsc --noEmit 2>&1 | grep "error TS" | head -5
        ((ERRORS++))
      else
        echo -e "${GREEN}   ✅ Sin errores TypeScript${NC}"
      fi
    else
      echo -e "${YELLOW}   ⚠️  pnpm no disponible, saltando verificación TypeScript${NC}"
    fi
  fi
else
  echo -e "${YELLOW}⚠️  tsconfig.json no encontrado${NC}"
  ((WARNINGS++))
fi
echo ""

# ==================== 7. ESLINT ====================
echo "🔍 [7/10] Ejecutando ESLint..."
if command -v pnpm &> /dev/null; then
  if pnpm lint 2>&1 | grep -q "error"; then
    echo -e "${RED}❌ Hay errores ESLint${NC}"
    pnpm lint 2>&1 | grep "error" | head -10
    ((ERRORS++))
  elif pnpm lint 2>&1 | grep -q "warning"; then
    LINT_WARNINGS=$(pnpm lint 2>&1 | grep -c "warning" || echo "0")
    echo -e "${YELLOW}⚠️  ESLint warnings: $LINT_WARNINGS${NC}"
    ((WARNINGS++))
  else
    echo -e "${GREEN}✅ Sin errores ni warnings ESLint${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  pnpm no disponible, saltando ESLint${NC}"
  ((WARNINGS++))
fi
echo ""

# ==================== 8. IMPORTS NO UTILIZADOS ====================
echo "📦 [8/10] Buscando imports no utilizados..."
UNUSED_IMPORTS=$(rg "^import.*from" src/ | wc -l)
echo "   Total imports: $UNUSED_IMPORTS"
echo -e "${YELLOW}   ℹ️  Ejecutar 'pnpm lint --fix' para limpiar imports${NC}"
echo ""

# ==================== 9. ESTRUCTURA SMARTWEB ====================
echo "📋 [9/10] Verificando estructura SmartWeb..."
if [ -f "src/types/smartweb.ts" ]; then
  echo -e "${GREEN}✅ Tipos SmartWeb definidos${NC}"
else
  echo -e "${RED}❌ Falta archivo src/types/smartweb.ts${NC}"
  ((ERRORS++))
fi

if [ -f "src/constants/erroresSmartWeb.ts" ]; then
  echo -e "${GREEN}✅ Catálogo de errores SmartWeb definido${NC}"
else
  echo -e "${RED}❌ Falta archivo src/constants/erroresSmartWeb.ts${NC}"
  ((ERRORS++))
fi

if [ -f "src/services/validacion/ValidadorPreTimbradoFrontend.ts" ]; then
  echo -e "${GREEN}✅ Validador pre-timbrado frontend definido${NC}"
else
  echo -e "${RED}❌ Falta archivo ValidadorPreTimbradoFrontend.ts${NC}"
  ((ERRORS++))
fi
echo ""

# ==================== 10. TESTS ====================
echo "🧪 [10/10] Ejecutando tests..."
if command -v pnpm &> /dev/null; then
  if [ -f "package.json" ] && grep -q '"test"' package.json; then
    if pnpm test 2>&1 | grep -q "FAIL"; then
      echo -e "${RED}❌ Hay tests fallando${NC}"
      ((ERRORS++))
    else
      echo -e "${GREEN}✅ Tests pasando${NC}"
    fi
  else
    echo -e "${YELLOW}⚠️  Script de test no configurado${NC}"
    ((WARNINGS++))
  fi
else
  echo -e "${YELLOW}⚠️  pnpm no disponible, saltando tests${NC}"
  ((WARNINGS++))
fi
echo ""

# ==================== RESUMEN ====================
echo "📊 =========================================="
echo "📊 RESUMEN DE AUDITORÍA"
echo "📊 =========================================="
echo ""
echo -e "Errores críticos: ${RED}$ERRORS${NC}"
echo -e "Advertencias: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
  echo -e "${GREEN}✅ =========================================="
  echo -e "✅ AUDITORÍA COMPLETADA - TODO CORRECTO"
  echo -e "✅ ==========================================${NC}"
  exit 0
elif [ "$ERRORS" -eq 0 ]; then
  echo -e "${YELLOW}⚠️  =========================================="
  echo -e "⚠️  AUDITORÍA COMPLETADA CON ADVERTENCIAS"
  echo -e "⚠️  ==========================================${NC}"
  exit 0
else
  echo -e "${RED}❌ =========================================="
  echo -e "❌ AUDITORÍA FALLIDA - HAY ERRORES CRÍTICOS"
  echo -e "❌ ==========================================${NC}"
  exit 1
fi
