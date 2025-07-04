
# Guía de Contribución - Interconecta Trucking

## 🤝 Cómo Contribuir

¡Bienvenido al proyecto Interconecta Trucking! Esta guía te ayudará a contribuir de manera efectiva al desarrollo de la plataforma.

## 📋 Antes de Empezar

### Prerrequisitos
- Node.js 18+ instalado
- Git configurado
- Conocimientos de React, TypeScript y PostgreSQL
- Acceso al repositorio (solicitar permisos si es necesario)

### Configuración del Entorno
1. Fork del repositorio (para contribuidores externos)
2. Clonar el repositorio
3. Instalar dependencias: `npm install`
4. Configurar variables de entorno (ver [SETUP.md](./SETUP.md))
5. Ejecutar migraciones de base de datos

## 🌟 Tipos de Contribuciones

### 1. **Reportar Bugs**
- Usar plantilla de issue para bugs
- Incluir pasos para reproducir
- Adjuntar screenshots si es relevante
- Especificar navegador y versión

### 2. **Nuevas Funcionalidades**
- Crear issue de feature request
- Discutir con el equipo antes de implementar
- Seguir arquitectura existente
- Incluir tests cuando sea posible

### 3. **Mejoras de Código**
- Refactoring de código existente
- Optimizaciones de rendimiento
- Mejoras de accesibilidad
- Actualización de dependencias

### 4. **Documentación**
- Corrección de typos
- Mejoras en explicaciones
- Nuevos ejemplos de código
- Traducción de contenido

## 📝 Proceso de Desarrollo

### 1. **Planificación**
```bash
# Crear branch para nueva funcionalidad
git checkout -b feature/nueva-funcionalidad

# Para fixes
git checkout -b fix/descripcion-del-fix

# Para documentación
git checkout -b docs/tema-documentacion
```

### 2. **Nomenclatura de Branches**
```
feature/    # Nuevas funcionalidades
fix/        # Corrección de bugs
docs/       # Documentación
refactor/   # Refactoring
test/       # Tests
chore/      # Tareas de mantenimiento
```

### 3. **Convenciones de Commits**
Usar [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add vehicle maintenance prediction system
fix: resolve login redirect issue
docs: update API documentation
style: format code with prettier
refactor: extract common form validation logic
test: add unit tests for useMantenimiento hook
chore: update dependencies
```

### 4. **Estructura de Commits**
```
<type>(<scope>): <description>

<body>

<footer>
```

Ejemplos:
```bash
feat(mantenimiento): add predictive maintenance alerts

- Implement automatic alerts for maintenance schedules
- Add integration with workshop network
- Include cost optimization recommendations

Closes #123
```

## 🏗️ Estándares de Código

### TypeScript
```typescript
// ✅ Correcto: Tipos explícitos
interface VehiculoFormData {
  placa: string;
  marca: string;
  modelo: string;
  año: number;
}

const createVehiculo = (data: VehiculoFormData): Promise<Vehiculo> => {
  return supabase.from('vehiculos').insert(data);
};

// ❌ Incorrecto: Tipos implícitos
const createVehiculo = (data: any) => {
  return supabase.from('vehiculos').insert(data);
};
```

### React Components
```typescript
// ✅ Correcto: Componente funcional con tipos
interface VehiculoCardProps {
  vehiculo: Vehiculo;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const VehiculoCard: React.FC<VehiculoCardProps> = ({
  vehiculo,
  onEdit,
  onDelete
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{vehiculo.placa}</CardTitle>
      </CardHeader>
      {/* ... */}
    </Card>
  );
};
```

### Custom Hooks
```typescript
// ✅ Correcto: Hook con tipos y error handling
export const useVehiculos = () => {
  const { data, error, isLoading } = useQuery<Vehiculo[]>({
    queryKey: ['vehiculos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehiculos')
        .select('*')
        .eq('activo', true);
      
      if (error) throw error;
      return data || [];
    }
  });

  return {
    vehiculos: data || [],
    isLoading,
    error
  };
};
```

### CSS/Tailwind
```tsx
// ✅ Correcto: Clases organizadas y consistentes
<div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4 shadow-sm">
  <div className="flex items-center gap-3">
    <TruckIcon className="h-5 w-5 text-muted-foreground" />
    <span className="font-medium">{vehiculo.placa}</span>
  </div>
  <Badge variant="outline">{vehiculo.estado}</Badge>
</div>

// ❌ Incorrecto: Clases desordenadas
<div className="p-4 bg-card rounded-lg border flex items-center shadow-sm justify-between gap-4">
```

## 🧪 Testing

### Unit Tests
```typescript
// tests/hooks/useVehiculos.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useVehiculos } from '@/hooks/useVehiculos';

describe('useVehiculos', () => {
  it('should fetch vehiculos successfully', async () => {
    const { result } = renderHook(() => useVehiculos());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.vehiculos).toHaveLength(5);
  });
});
```

### Component Tests
```typescript
// tests/components/VehiculoCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { VehiculoCard } from '@/components/vehiculos/VehiculoCard';

describe('VehiculoCard', () => {
  const mockVehiculo = {
    id: '1',
    placa: 'ABC-123',
    marca: 'Volvo',
    estado: 'disponible'
  };

  it('should display vehiculo information', () => {
    render(<VehiculoCard vehiculo={mockVehiculo} onEdit={jest.fn()} onDelete={jest.fn()} />);
    
    expect(screen.getByText('ABC-123')).toBeInTheDocument();
    expect(screen.getByText('disponible')).toBeInTheDocument();
  });
});
```

## 📁 Estructura de Archivos

### Crear Nuevos Componentes
```
src/components/modulo/
├── index.ts                    # Exports
├── ModuloProvider.tsx          # Context
├── ModuloTable.tsx            # Lista principal
├── ModuloForm.tsx             # Formularios
├── ModuloCard.tsx             # Card individual
├── hooks/
│   ├── useModuloData.ts       # Data fetching
│   └── useModuloMutations.ts  # CRUD operations
├── types/
│   └── index.ts               # Tipos TypeScript
└── tests/
    ├── ModuloTable.test.tsx
    └── hooks/
        └── useModuloData.test.ts
```

### Naming Conventions
```typescript
// Archivos: PascalCase para componentes, camelCase para utilidades
VehiculoCard.tsx
useVehiculos.ts
vehiculoUtils.ts

// Componentes: PascalCase
export const VehiculoCard = () => {};

// Hooks: camelCase con prefijo 'use'
export const useVehiculos = () => {};

// Funciones: camelCase
export const formatPlaca = (placa: string) => {};

// Constantes: UPPER_SNAKE_CASE
export const MAX_VEHICULOS_PER_PAGE = 20;

// Tipos/Interfaces: PascalCase
interface VehiculoFormData {}
type VehiculoStatus = 'disponible' | 'en_servicio';
```

## 🔧 Herramientas de Desarrollo

### Linting y Formatting
```bash
# Ejecutar linting
npm run lint

# Fix automático de linting
npm run lint:fix

# Formatear código
npm run format

# Pre-commit hooks (automático)
# - ESLint
# - Prettier
# - TypeScript check
```

### Configuración del Editor
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 🚀 Pull Request Process

### 1. **Antes de Crear PR**
- [ ] Tests pasan: `npm test`
- [ ] Build exitoso: `npm run build`
- [ ] Linting limpio: `npm run lint`
- [ ] Código formateado: `npm run format`
- [ ] Documentación actualizada si es necesario

### 2. **Plantilla de PR**
```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de Cambio
- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva funcionalidad (cambio que añade funcionalidad)
- [ ] Breaking change (cambio que puede romper funcionalidad existente)
- [ ] Documentación

## Cómo Probar
1. Ir a la página...
2. Hacer clic en...
3. Verificar que...

## Screenshots
Si aplica, incluir screenshots de los cambios visuales.

## Checklist
- [ ] Mi código sigue las convenciones del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He añadido tests que prueban mi funcionalidad
- [ ] Los tests nuevos y existentes pasan
- [ ] Mis cambios no generan nuevas advertencias
```

### 3. **Proceso de Revisión**
1. Crear PR contra `develop` branch
2. Asignar reviewers apropiados
3. Responder a comentarios de revisión
4. Hacer ajustes según feedback
5. Obtener al menos 1 aprobación
6. Merge por parte del maintainer

## 🐛 Debugging

### Supabase Queries
```typescript
// Debug queries en desarrollo
const { data, error } = await supabase
  .from('vehiculos')
  .select('*')
  .eq('user_id', userId);

if (error) {
  console.error('Supabase error:', error);
  console.error('Error details:', error.details);
  console.error('Error hint:', error.hint);
}
```

### React Query DevTools
```typescript
// En desarrollo, usar React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      <MyApp />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </>
  );
}
```

## 📚 Recursos Adicionales

### Documentación Interna
- [Arquitectura del Sistema](./ARCHITECTURE.md)
- [Guía de Configuración](./SETUP.md)
- [API Reference](./API.md)

### Recursos Externos
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 💬 Comunicación

### Canales
- **GitHub Issues:** Para bugs y feature requests
- **Discussions:** Para preguntas generales
- **Pull Requests:** Para revisión de código
- **Email:** desarrollo@interconecta.capital

### Etiquetas de Issues
- `bug` - Errores en el código
- `enhancement` - Nuevas funcionalidades
- `documentation` - Mejoras en documentación
- `good first issue` - Para nuevos contribuidores
- `help wanted` - Necesita ayuda de la comunidad
- `priority:high` - Alta prioridad
- `priority:low` - Baja prioridad

## 🏆 Reconocimientos

Los contribuidores serán reconocidos en:
- README.md del proyecto
- Releases notes
- Página de agradecimientos (cuando esté disponible)

¡Gracias por contribuir a Interconecta Trucking! 🚛✨
