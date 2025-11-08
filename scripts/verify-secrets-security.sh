#!/bin/bash

# ========================================
# 🔐 Script de Verificación de Seguridad
# ISO 27001 A.10.1 - Verificación de Secretos
# ========================================

echo "🔍 Iniciando verificación de seguridad ISO 27001..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# ========================================
# 1. Verificar que .env no esté en Git
# ========================================
echo "📋 1. Verificando archivos sensibles en Git..."
if git ls-files | grep -q "^\.env$"; then
    echo -e "${RED}❌ ERROR: .env está en Git! Elimínalo inmediatamente.${NC}"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✅ .env no está en Git${NC}"
fi

# ========================================
# 2. Verificar .gitignore
# ========================================
echo ""
echo "📋 2. Verificando .gitignore..."
if grep -q "^\.env$" .gitignore; then
    echo -e "${GREEN}✅ .env está en .gitignore${NC}"
else
    echo -e "${RED}❌ ERROR: .env NO está en .gitignore${NC}"
    ERRORS=$((ERRORS+1))
fi

# ========================================
# 3. Buscar claves hardcodeadas
# ========================================
echo ""
echo "📋 3. Buscando claves hardcodeadas sospechosas..."

# Buscar patrones de API keys
SUSPICIOUS_PATTERNS=(
    "sk_live_"
    "sk_test_"
    "pk_live_"
    "rk_live_"
    "AIza"
    "ya29\."
    "AKIA"
    "secret_key"
    "api_secret"
    "private_key"
)

for pattern in "${SUSPICIOUS_PATTERNS[@]}"; do
    if grep -r "$pattern" src/ --exclude-dir=node_modules --exclude="*.test.*" | grep -v "// Example" | grep -v "EXAMPLE" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️ ADVERTENCIA: Posible clave hardcodeada encontrada: $pattern${NC}"
        grep -rn "$pattern" src/ --exclude-dir=node_modules --exclude="*.test.*" | grep -v "// Example" | grep -v "EXAMPLE"
        WARNINGS=$((WARNINGS+1))
    fi
done

if [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ No se encontraron claves hardcodeadas sospechosas${NC}"
fi

# ========================================
# 4. Verificar uso de import.meta.env
# ========================================
echo ""
echo "📋 4. Verificando uso de import.meta.env..."

# Archivos que DEBEN usar import.meta.env (solo para desarrollo)
ALLOWED_FILES=(
    "src/config/publicKeys.ts"
    "src/vite-env.d.ts"
)

# Buscar usos de import.meta.env fuera de archivos permitidos
while IFS= read -r line; do
    file=$(echo "$line" | cut -d: -f1)
    allowed=false
    
    for allowed_file in "${ALLOWED_FILES[@]}"; do
        if [ "$file" = "$allowed_file" ]; then
            allowed=true
            break
        fi
    done
    
    if [ "$allowed" = false ]; then
        echo -e "${YELLOW}⚠️ ADVERTENCIA: import.meta.env usado en: $file${NC}"
        echo "   Debería usar PUBLIC_CONFIG en su lugar"
        WARNINGS=$((WARNINGS+1))
    fi
done < <(grep -rn "import\.meta\.env" src/ --exclude-dir=node_modules --exclude="*.test.*" 2>/dev/null)

# ========================================
# 5. Verificar que PUBLIC_CONFIG existe
# ========================================
echo ""
echo "📋 5. Verificando archivo de configuración pública..."
if [ -f "src/config/publicKeys.ts" ]; then
    echo -e "${GREEN}✅ src/config/publicKeys.ts existe${NC}"
else
    echo -e "${RED}❌ ERROR: src/config/publicKeys.ts no existe${NC}"
    ERRORS=$((ERRORS+1))
fi

# ========================================
# 6. Verificar documentación de secretos
# ========================================
echo ""
echo "📋 6. Verificando documentación de secretos..."
if [ -f "docs/SECRETS_MAPPING.md" ]; then
    echo -e "${GREEN}✅ docs/SECRETS_MAPPING.md existe${NC}"
else
    echo -e "${YELLOW}⚠️ ADVERTENCIA: docs/SECRETS_MAPPING.md no existe${NC}"
    WARNINGS=$((WARNINGS+1))
fi

# ========================================
# Resumen Final
# ========================================
echo ""
echo "========================================="
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "========================================="
echo -e "Errores críticos: ${RED}$ERRORS${NC}"
echo -e "Advertencias: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ VERIFICACIÓN FALLIDA - Corrige los errores críticos${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️ VERIFICACIÓN CON ADVERTENCIAS - Revisa las advertencias${NC}"
    exit 0
else
    echo -e "${GREEN}✅ VERIFICACIÓN EXITOSA - Todo en orden${NC}"
    exit 0
fi
