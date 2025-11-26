# 🤝 Manual de Contribución

Este documento establece las guías y estándares para contribuir al proyecto **Interconecta Trucking**.

## 📋 Tabla de Contenidos

- [Estructura del Repositorio](#-estructura-del-repositorio)
- [Estándares de Código](#-estándares-de-código)
- [Estilo de Commits](#-estilo-de-commits)
- [Estrategia de Branches](#-estrategia-de-branches)
- [Proceso de Pull Request](#-proceso-de-pull-request)
- [Reportar Issues](#-reportar-issues)
- [Proponer Mejoras](#-proponer-mejoras)
- [Documentar Cambios](#-documentar-cambios)
- [Code Review](#-code-review)

---

## 📁 Estructura del Repositorio

```
trucking-platform/
├── .github/                    # Configuración GitHub
│   ├── ISSUE_TEMPLATE/        # Templates para issues
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/             # GitHub Actions
│
├── docs/                       # Documentación
│   ├── 00-instalacion-local.md
│   ├── 01-conexion-supabase.md
│   ├── 02-arquitectura.md
│   └── ...
│
├── public/                     # Assets públicos
│   ├── favicon.ico
│   └── ...
│
├── src/                        # Código fuente
│   ├── assets/                # Imágenes, fuentes
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes base (Shadcn)
│   │   └── [modulo]/         # Componentes por módulo
│   ├── hooks/                 # Custom hooks
│   ├── integrations/          # Integraciones externas
│   ├── lib/                   # Utilidades
│   ├── pages/                 # Páginas/Rutas
│   ├── services/              # Servicios de negocio
│   ├── stores/                # Estado global (Zustand)
│   ├── types/                 # Definiciones TypeScript
│   └── utils/                 # Funciones utilitarias
│
├── supabase/                   # Backend Supabase
│   ├── functions/             # Edge Functions
│   ├── migrations/            # Migraciones SQL
│   └── config.toml            # Configuración
│
├── .env.example               # Variables de entorno ejemplo
├── package.json               # Dependencias
├── tailwind.config.ts         # Configuración Tailwind
├── tsconfig.json              # Configuración TypeScript
├── vite.config.ts             # Configuración Vite
└── README.md                  # Documentación principal
```

### Convenciones de Nombres

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componentes | PascalCase | `ViajeCard.tsx` |
| Hooks | camelCase con "use" | `useViajes.ts` |
| Servicios | PascalCase + "Service" | `ViajeService.ts` |
| Utilidades | camelCase | `formatDate.ts` |
| Tipos | PascalCase | `ViajeTypes.ts` |
| Constantes | UPPER_SNAKE_CASE | `API_ENDPOINTS.ts` |

---

## 📝 Estándares de Código

### TypeScript

```typescript
// ✅ CORRECTO: Tipado explícito
interface ViajeProps {
  id: string;
  origen: string;
  destino: string;
  estado: 'programado' | 'en_transito' | 'completado';
}

function ViajeCard({ id, origen, destino, estado }: ViajeProps) {
  return (/* ... */);
}

// ❌ INCORRECTO: Sin tipado
function ViajeCard(props) {
  return (/* ... */);
}
```

### React

```typescript
// ✅ CORRECTO: Componente funcional con hooks
export function ViajesTable() {
  const { data: viajes, isLoading } = useQuery({
    queryKey: ['viajes'],
    queryFn: fetchViajes
  });

  if (isLoading) return <Skeleton />;
  
  return (
    <Table>
      {viajes?.map(viaje => (
        <ViajeRow key={viaje.id} viaje={viaje} />
      ))}
    </Table>
  );
}

// ❌ INCORRECTO: Componente de clase
class ViajesTable extends React.Component {
  // No usar componentes de clase
}
```

### CSS/Tailwind

```tsx
// ✅ CORRECTO: Usar tokens del sistema de diseño
<div className="bg-background text-foreground p-4 rounded-lg border">
  <h2 className="text-lg font-semibold text-primary">Título</h2>
</div>

// ❌ INCORRECTO: Colores hardcodeados
<div className="bg-white text-black p-4 rounded-lg border-gray-200">
  <h2 className="text-lg font-semibold text-blue-500">Título</h2>
</div>
```

### Imports

```typescript
// ✅ CORRECTO: Orden de imports
// 1. React/Next
import { useState, useEffect } from 'react';

// 2. Librerías externas
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

// 3. Componentes UI
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Componentes propios
import { ViajeCard } from '@/components/viajes/ViajeCard';

// 5. Hooks
import { useViajes } from '@/hooks/useViajes';

// 6. Servicios/Utils
import { formatCurrency } from '@/lib/utils';

// 7. Tipos
import type { Viaje } from '@/types/viaje';
```

### ESLint y Prettier

El proyecto usa ESLint y Prettier. Antes de hacer commit:

```bash
# Verificar linting
npm run lint

# Arreglar automáticamente
npm run lint:fix
```

---

## 📌 Estilo de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

### Formato

```
<tipo>(<alcance>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos de Commit

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `feat(viajes): agregar wizard de creación` |
| `fix` | Corrección de bug | `fix(timbrado): corregir error CFDI40147` |
| `docs` | Documentación | `docs: actualizar README con instalación` |
| `style` | Estilos (sin lógica) | `style(button): ajustar padding` |
| `refactor` | Refactorización | `refactor(services): extraer validador` |
| `test` | Tests | `test(viajes): agregar tests unitarios` |
| `chore` | Tareas de mantenimiento | `chore: actualizar dependencias` |
| `perf` | Mejoras de rendimiento | `perf(queries): optimizar consulta de viajes` |

### Ejemplos

```bash
# Funcionalidad nueva
git commit -m "feat(carta-porte): implementar generación de PDF"

# Corrección de bug
git commit -m "fix(validacion): corregir validación de RFC"

# Con cuerpo explicativo
git commit -m "refactor(services): separar ViajeService en módulos

- Extraer ViajeOrchestrationService
- Extraer ViajeCartaPorteService
- Mejorar tipado de respuestas

BREAKING CHANGE: ViajeService.crear() ahora retorna Promise<Result>"
```

---

## 🌿 Estrategia de Branches

### Branches Principales

| Branch | Propósito | Protección |
|--------|-----------|------------|
| `main` | Producción | ✅ Protegido |
| `develop` | Desarrollo | ✅ Protegido |

### Branches de Trabajo

| Prefijo | Propósito | Ejemplo |
|---------|-----------|---------|
| `feature/` | Nueva funcionalidad | `feature/wizard-viajes` |
| `fix/` | Corrección de bug | `fix/error-timbrado` |
| `hotfix/` | Fix urgente en producción | `hotfix/login-crash` |
| `docs/` | Documentación | `docs/actualizar-readme` |
| `refactor/` | Refactorización | `refactor/services` |

### Flujo de Trabajo

```
main ─────────────────────────────────────────▶
  │
  └── develop ────────────────────────────────▶
        │
        ├── feature/nueva-funcionalidad ──┐
        │                                 │ PR
        │◀────────────────────────────────┘
        │
        ├── fix/corregir-bug ─────────────┐
        │                                 │ PR
        │◀────────────────────────────────┘
```

### Crear Branch

```bash
# Desde develop
git checkout develop
git pull origin develop
git checkout -b feature/mi-nueva-funcionalidad

# Trabajar en el feature
git add .
git commit -m "feat: descripción del cambio"

# Push
git push origin feature/mi-nueva-funcionalidad
```

---

## 🔄 Proceso de Pull Request

### Antes de Crear PR

1. ✅ Código compila sin errores: `npm run build`
2. ✅ Linting pasa: `npm run lint`
3. ✅ Tests pasan: `npm run test`
4. ✅ Commits siguen convención
5. ✅ Branch actualizado con develop

```bash
# Actualizar branch con develop
git checkout develop
git pull origin develop
git checkout feature/mi-funcionalidad
git rebase develop
```

### Template de PR

```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de Cambio
- [ ] 🚀 Nueva funcionalidad (feature)
- [ ] 🐛 Corrección de bug (fix)
- [ ] 📝 Documentación
- [ ] 🔧 Refactorización
- [ ] ⚡ Mejora de rendimiento

## Cambios Realizados
- Cambio 1
- Cambio 2
- Cambio 3

## Screenshots (si aplica)
<!-- Agregar capturas de pantalla -->

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He revisado mi propio código
- [ ] He agregado comentarios donde es necesario
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevos warnings
- [ ] He agregado tests que prueban mi fix/feature
- [ ] Tests unitarios pasan localmente
- [ ] Dependencias actualizadas (si aplica)

## Issues Relacionados
Closes #123
```

### Proceso de Review

1. **Crear PR** → develop
2. **Asignar reviewers** (mínimo 1)
3. **CI/CD** ejecuta tests automáticos
4. **Review** de código
5. **Aprobar** o solicitar cambios
6. **Merge** (squash o rebase)

---

## 🐛 Reportar Issues

### Template para Bug

```markdown
## Descripción del Bug
Descripción clara y concisa del problema.

## Pasos para Reproducir
1. Ir a '...'
2. Click en '....'
3. Scroll down a '....'
4. Ver error

## Comportamiento Esperado
Lo que debería pasar.

## Comportamiento Actual
Lo que realmente pasa.

## Screenshots
Si aplica, agregar capturas de pantalla.

## Entorno
- Navegador: [e.g. Chrome 120]
- OS: [e.g. macOS 14.0]
- Versión del proyecto: [e.g. 1.0.0]

## Logs de Consola
```
Pegar logs relevantes aquí
```

## Contexto Adicional
Cualquier otro contexto sobre el problema.
```

### Labels para Issues

| Label | Descripción |
|-------|-------------|
| `bug` | Error confirmado |
| `enhancement` | Mejora solicitada |
| `documentation` | Relacionado a docs |
| `help wanted` | Se busca colaboración |
| `good first issue` | Bueno para principiantes |
| `priority: high` | Prioridad alta |
| `priority: low` | Prioridad baja |

---

## 💡 Proponer Mejoras

### Template para Feature Request

```markdown
## Problema o Necesidad
Descripción del problema que esta mejora resolvería.

## Solución Propuesta
Descripción clara de lo que te gustaría que pase.

## Alternativas Consideradas
Otras soluciones que has considerado.

## Contexto Adicional
Mockups, diagramas, o cualquier otro contexto.

## Criterios de Aceptación
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3
```

---

## 📄 Documentar Cambios

### Cuándo Documentar

- ✅ Nueva funcionalidad
- ✅ Cambio en API
- ✅ Nuevo servicio/hook
- ✅ Cambio en configuración
- ✅ Nuevo edge function
- ✅ Cambio en esquema de BD

### Dónde Documentar

| Tipo de Cambio | Ubicación |
|----------------|-----------|
| API/Endpoints | `docs/API.md` |
| Arquitectura | `docs/02-arquitectura.md` |
| Configuración | `docs/07-variables-entorno.md` |
| Edge Functions | Comentarios en código + README en carpeta |
| Componentes | JSDoc + Storybook (si aplica) |

### Formato de Documentación

```typescript
/**
 * Servicio de orquestación de viajes.
 * 
 * Maneja el ciclo completo de un viaje:
 * - Creación con validación
 * - Asignación de recursos
 * - Generación de documentos fiscales
 * - Timbrado
 * 
 * @example
 * ```typescript
 * const resultado = await ViajeOrchestrationService.crearViajeCompleto(data);
 * if (resultado.success) {
 *   console.log('Viaje creado:', resultado.viajeId);
 * }
 * ```
 */
export class ViajeOrchestrationService {
  /**
   * Crea un viaje completo con todos sus documentos asociados.
   * 
   * @param data - Datos del wizard de viaje
   * @returns Resultado con el ID del viaje o errores
   * @throws {ValidationError} Si los datos no son válidos
   */
  static async crearViajeCompleto(data: ViajeWizardData): Promise<CrearViajeResult> {
    // ...
  }
}
```

---

## 👀 Code Review

### Checklist para Reviewers

- [ ] El código es legible y mantenible
- [ ] Sigue los estándares del proyecto
- [ ] No hay código duplicado
- [ ] Los nombres son descriptivos
- [ ] Hay manejo de errores apropiado
- [ ] Los tipos están correctos
- [ ] No hay console.log innecesarios
- [ ] Los tests cubren los cambios
- [ ] La documentación está actualizada
- [ ] No hay vulnerabilidades de seguridad

### Feedback Constructivo

```markdown
# ✅ Buen feedback
"Sugiero extraer esta lógica a un hook separado para mejorar 
la reusabilidad. Podrías crear `useViajeValidation.ts`."

# ❌ Mal feedback
"Este código está mal."
```

### Responder a Feedback

1. Agradecer el feedback
2. Hacer los cambios solicitados
3. Explicar si hay desacuerdo
4. Marcar como resuelto cuando esté listo

---

## 🔗 Referencias

- [Conventional Commits](https://www.conventionalcommits.org/)
- [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)
