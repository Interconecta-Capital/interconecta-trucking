# 💻 Guía de Desarrollo sin Lovable

Este documento explica cómo desarrollar en el proyecto **Interconecta Trucking** sin depender de la plataforma Lovable, usando tu entorno local.

## 📋 Tabla de Contenidos

- [¿Por qué Desarrollar Localmente?](#-por-qué-desarrollar-localmente)
- [Configuración Inicial](#-configuración-inicial)
- [Ejecutar Frontend](#-ejecutar-frontend)
- [Ejecutar Edge Functions](#-ejecutar-edge-functions)
- [Probar Funciones](#-probar-funciones)
- [Simular Timbrado](#-simular-timbrado)
- [Hot Reload y Desarrollo](#-hot-reload-y-desarrollo)
- [Ver Logs](#-ver-logs)
- [Ejecutar Tests](#-ejecutar-tests)
- [Verificar Cambios](#-verificar-cambios)
- [Tips y Trucos](#-tips-y-trucos)

---

## 🎯 ¿Por qué Desarrollar Localmente?

### Ventajas

| Ventaja | Descripción |
|---------|-------------|
| **Sin límites de créditos** | No consumes créditos de Lovable |
| **Velocidad** | Hot reload instantáneo |
| **Control total** | Acceso completo al código y logs |
| **Debugging avanzado** | Usar DevTools, breakpoints, etc. |
| **Trabajo offline** | Frontend funciona sin conexión |
| **CI/CD** | Integrar con pipelines propios |

### Cuándo Usar Lovable vs Local

| Usar Lovable | Usar Local |
|--------------|------------|
| Prototipado rápido | Desarrollo intensivo |
| Cambios visuales menores | Features complejos |
| Demos a clientes | Debugging profundo |
| Sin conocimiento técnico | Tests automatizados |

---

## ⚙️ Configuración Inicial

### Requisitos

```bash
# Verificar Node.js (18+)
node --version

# Verificar npm (9+)
npm --version

# Verificar Git
git --version

# Opcional: Supabase CLI
npx supabase --version
```

### Clonar y Configurar

```bash
# Clonar repositorio
git clone https://github.com/interconecta/trucking-platform.git
cd trucking-platform

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

### Archivo .env Mínimo

```env
# Supabase (requerido)
VITE_SUPABASE_URL=https://qulhweffinppyjpfkknh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Opcional para desarrollo
NODE_ENV=development
```

---

## 🖥️ Ejecutar Frontend

### Servidor de Desarrollo

```bash
# Iniciar con Vite
npm run dev

# Output:
#   VITE v5.x.x  ready in xxx ms
#
#   ➜  Local:   http://localhost:5173/
#   ➜  Network: http://192.168.x.x:5173/
#   ➜  press h + enter to show help
```

### Opciones de Vite

```bash
# Puerto específico
npm run dev -- --port 3000

# Exponer en red
npm run dev -- --host

# Modo verbose
npm run dev -- --debug
```

### Hot Module Replacement (HMR)

Vite tiene HMR automático. Cuando guardas un archivo:
- **CSS/Tailwind**: Actualización instantánea sin refresh
- **Componentes React**: Fast Refresh preserva estado
- **Otros archivos**: Full reload automático

---

## ⚡ Ejecutar Edge Functions

### Opción 1: Usar Supabase CLI (Local)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar Supabase local (Docker requerido)
supabase start

# Servir functions localmente
supabase functions serve

# Output:
# Serving functions on http://localhost:54321/functions/v1/
```

### Opción 2: Llamar Functions en Producción

Las Edge Functions desplegadas en Supabase Cloud siguen disponibles:

```typescript
// El código normal funciona contra producción
const { data, error } = await supabase.functions.invoke('mi-funcion', {
  body: { param: 'valor' }
});
```

### Desarrollar Nueva Edge Function

```bash
# Crear nueva función
supabase functions new mi-nueva-funcion

# Estructura creada:
# supabase/functions/mi-nueva-funcion/
# └── index.ts
```

### Probar Function Localmente

```bash
# En una terminal: servir functions
supabase functions serve mi-nueva-funcion

# En otra terminal: invocar
curl -X POST http://localhost:54321/functions/v1/mi-nueva-funcion \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"param": "valor"}'
```

---

## 🧪 Probar Funciones

### Tests Unitarios

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch (re-ejecuta al guardar)
npm run test -- --watch

# Tests con coverage
npm run test -- --coverage

# Tests de un archivo específico
npm run test -- src/services/ViajeService.test.ts
```

### Tests con Vitest UI

```bash
# Interfaz visual para tests
npm run test -- --ui
```

### Probar Servicios Individualmente

```typescript
// En un archivo de prueba temporal o en consola
import { CatalogosService } from '@/services/catalogos/CatalogosService';

// Probar función
const resultado = await CatalogosService.lookupByCp('06600');
console.log(resultado);
```

### Usar REPL de Node

```bash
# Iniciar REPL con ts-node
npx ts-node

# Importar y probar
> const { supabase } = require('./src/integrations/supabase/client');
> const { data } = await supabase.from('viajes').select('*').limit(1);
> console.log(data);
```

---

## 🧾 Simular Timbrado

### Ambiente Sandbox de SmartWeb

El sistema ya está configurado para usar sandbox. Para probar timbrado:

1. **Verificar modo pruebas activo**
   ```sql
   -- En Supabase SQL Editor
   SELECT modo_pruebas FROM configuracion_empresa 
   WHERE user_id = 'tu-user-id';
   -- Debe ser TRUE para sandbox
   ```

2. **Usar RFCs de prueba SAT**
   | RFC | Descripción |
   |-----|-------------|
   | `EKU9003173C9` | Emisor de prueba |
   | `XAXX010101000` | Público general |

3. **Invocar timbrado**
   ```typescript
   // El código normal invoca el sandbox
   const resultado = await supabase.functions.invoke('timbrar-con-sw', {
     body: {
       viaje_id: 'uuid-viaje',
       ambiente: 'sandbox' // Forzar sandbox
     }
   });
   ```

### Mock de Timbrado (Sin PAC)

Para desarrollo sin conexión al PAC:

```typescript
// src/services/mocks/timbradoMock.ts
export const mockTimbrado = async (xml: string) => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    uuid: crypto.randomUUID(),
    fechaTimbrado: new Date().toISOString(),
    selloSAT: 'MOCK_SELLO_SAT_' + Date.now(),
    xml: xml.replace('</cfdi:Comprobante>', `
      <cfdi:Complemento>
        <tfd:TimbreFiscalDigital UUID="${crypto.randomUUID()}" />
      </cfdi:Complemento>
    </cfdi:Comprobante>`)
  };
};
```

---

## 🔥 Hot Reload y Desarrollo

### Configuración de Vite

El proyecto ya tiene Vite configurado óptimamente. Características:

- **Fast Refresh** para React
- **HMR** para CSS/Tailwind
- **Pre-bundling** de dependencias

### Optimizar Desarrollo

```typescript
// vite.config.ts ya incluye:
export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: true // Mostrar errores en pantalla
    }
  },
  // ...
});
```

### Debugging en VS Code

Crear `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug en Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

Ahora puedes:
1. Poner breakpoints en VS Code
2. F5 para iniciar debugging
3. Inspeccionar variables, call stack, etc.

---

## 📊 Ver Logs

### Logs del Frontend

```typescript
// Usar el logger sanitizado
import { logger } from '@/lib/logger';

logger.info('viajes', 'Creando viaje', { datos: sanitizedData });
logger.error('timbrado', 'Error', { error: error.message });
```

En el navegador:
- Abrir DevTools (F12)
- Ir a pestaña **Console**
- Filtrar por tipo: info, warn, error

### Logs de Edge Functions

```bash
# Si usas Supabase CLI local
supabase functions logs mi-funcion

# Ver en Supabase Dashboard
# https://supabase.com/dashboard/project/[PROJECT_ID]/functions/[FUNCTION_NAME]/logs
```

### Logs de Base de Datos

```sql
-- Logs de PostgreSQL
SELECT * FROM postgres_logs
ORDER BY timestamp DESC
LIMIT 100;

-- Logs de autenticación
SELECT * FROM auth_logs
ORDER BY timestamp DESC
LIMIT 100;
```

### React Query DevTools

El proyecto incluye React Query DevTools:

```typescript
// Ya configurado en App.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// En desarrollo, aparece un ícono flotante
// Click para ver todas las queries, cache, etc.
```

---

## ✅ Ejecutar Tests

### Tipos de Tests

| Tipo | Comando | Ubicación |
|------|---------|-----------|
| Unitarios | `npm run test` | `src/**/*.test.ts` |
| Integración | `npm run test:integration` | `src/__tests__/integration/` |
| E2E | `npm run test:e2e` | `src/__tests__/e2e/` |

### Comandos de Test

```bash
# Todos los tests
npm run test

# En modo watch
npm run test -- --watch

# Un archivo específico
npm run test -- src/services/catalogos/CatalogosService.test.ts

# Con coverage
npm run test -- --coverage

# Solo tests que coincidan con patrón
npm run test -- --grep "validar"
```

### Escribir Tests

```typescript
// src/services/__tests__/MiServicio.test.ts
import { describe, it, expect, vi } from 'vitest';
import { MiServicio } from '../MiServicio';

describe('MiServicio', () => {
  describe('miFuncion', () => {
    it('debería retornar resultado esperado', async () => {
      const resultado = await MiServicio.miFuncion('input');
      expect(resultado).toBe('expected');
    });

    it('debería manejar errores', async () => {
      await expect(MiServicio.miFuncion('')).rejects.toThrow();
    });
  });
});
```

---

## 🔍 Verificar Cambios

### Antes de Commit

```bash
# 1. Verificar que compila
npm run build

# 2. Verificar linting
npm run lint

# 3. Ejecutar tests
npm run test

# 4. Verificar tipos TypeScript
npx tsc --noEmit
```

### Script de Verificación

Crear `scripts/verify.sh`:

```bash
#!/bin/bash
set -e

echo "🔍 Verificando cambios..."

echo "📦 Build..."
npm run build

echo "🔧 Lint..."
npm run lint

echo "🧪 Tests..."
npm run test

echo "✅ Todo OK!"
```

### Pre-commit Hook

Configurar con Husky:

```bash
# Instalar husky
npm install -D husky lint-staged

# Configurar
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

## 💡 Tips y Trucos

### Alias de Terminal

```bash
# Agregar a ~/.bashrc o ~/.zshrc
alias truck="cd ~/projects/trucking-platform"
alias tdev="npm run dev"
alias tbuild="npm run build"
alias ttest="npm run test"
alias tlint="npm run lint"
```

### Extensiones VS Code Recomendadas

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### Snippets Útiles

```json
// .vscode/snippets.code-snippets
{
  "React Component": {
    "prefix": "rfc",
    "body": [
      "interface ${1:Component}Props {",
      "  $2",
      "}",
      "",
      "export function ${1:Component}({ $3 }: ${1:Component}Props) {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  );",
      "}"
    ]
  }
}
```

### Performance

```bash
# Analizar bundle
npm run build -- --analyze

# Limpiar cache de Vite
rm -rf node_modules/.vite

# Reinstalar dependencias limpio
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Recursos

- [Vite Documentation](https://vitejs.dev/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Vitest](https://vitest.dev/)

---

## 🆘 Problemas Comunes

### "Module not found"

```bash
rm -rf node_modules
npm install
```

### "Port already in use"

```bash
# Encontrar proceso
lsof -i :5173

# Matar proceso
kill -9 <PID>
```

### "TypeScript errors"

```bash
# Verificar tipos
npx tsc --noEmit

# Reiniciar servidor TS en VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### HMR no funciona

```bash
# Verificar que no hay errores de sintaxis
npm run lint

# Reiniciar servidor
# Ctrl+C y npm run dev
```
