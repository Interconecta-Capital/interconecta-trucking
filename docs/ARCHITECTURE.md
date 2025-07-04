
# Arquitectura del Sistema Interconecta Trucking

## 🏗️ Visión General

Interconecta Trucking es una plataforma SaaS para gestión logística que sigue una arquitectura moderna de aplicación web con:

- **Frontend:** React SPA con TypeScript
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Arquitectura:** JAMstack con APIs serverless
- **Patrón:** Event-driven con real-time updates

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERCONECTA TRUCKING                    │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)                             │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │   Auth      │ Dashboard   │ Carta Porte │Mantenimiento│ │
│  │   Module    │   Module    │   Module    │   Module    │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  State Management (Zustand + React Query)                  │
├─────────────────────────────────────────────────────────────┤
│  API Layer (Supabase Client)                               │
├─────────────────────────────────────────────────────────────┤
│  Backend Services (Supabase)                               │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │   Auth      │ PostgreSQL  │ Edge Funcs  │  Storage    │ │
│  │  Service    │   Database  │ (Serverless)│   Buckets   │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  External Integrations                                      │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │ Google APIs │ WhatsApp    │ Fiscal APIs │ Payment     │ │
│  │ (Maps, etc) │ Business    │ (Timbrado)  │ Gateways    │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🧩 Componentes del Sistema

### 1. Frontend Architecture

#### Estructura de Módulos
```
src/
├── components/
│   ├── auth/           # Autenticación y autorización
│   ├── carta-porte/    # Módulo CFDI/Carta Porte
│   ├── vehiculos/      # Gestión de flota
│   ├── conductores/    # Gestión de personal
│   ├── mantenimiento/  # Sistema predictivo
│   ├── dashboard/      # Analytics y métricas
│   └── ui/             # Componentes base (Shadcn/UI)
├── hooks/              # Lógica de negocio reutilizable
├── pages/              # Routing y layouts
└── lib/                # Utilidades y configuraciones 
```

#### Patrón de Componentes
```typescript
// Estructura típica de un módulo
ModuleDirectory/
├── index.ts                    # Exports principales
├── ModuleProvider.tsx          # Context Provider
├── ModuleTable.tsx            # Lista/Tabla principal
├── ModuleForm.tsx             # Formularios
├── ModuleFilters.tsx          # Filtros y búsqueda
├── hooks/
│   ├── useModuleData.ts       # Data fetching
│   ├── useModuleMutations.ts  # CRUD operations
│   └── useModuleValidation.ts # Validaciones
└── types/
    └── index.ts               # Tipos TypeScript
```

### 2. Backend Architecture (Supabase)

#### Database Schema
```sql
-- Jerarquía de tablas principales
auth.users                    -- Autenticación base
├── profiles                  -- Perfiles extendidos
├── usuarios                  -- Info de tenant
├── suscripciones            -- Gestión de planes
├── vehiculos                -- Flota
├── conductores              -- Personal
├── cartas_porte            -- Documentos CFDI
├── mantenimientos_programados -- Servicios
└── talleres                 -- Red de talleres
```

#### Row Level Security (RLS)
```sql
-- Patrón de políticas RLS
CREATE POLICY "policy_name" ON table_name
FOR operation_type
USING (auth.uid() = user_id)        -- Filtro de lectura
WITH CHECK (auth.uid() = user_id);  -- Filtro de escritura

-- Política de superusuario
USING (auth.uid() = user_id OR is_superuser_optimized())
```

#### Edge Functions
```typescript
// Estructura de funciones serverless
supabase/functions/
├── timbrar-invoice/      # Timbrado de CFDI
├── google-directions/    # Cálculo de rutas
├── whatsapp-notify/     # Notificaciones
└── process-documents/   # Procesamiento de PDFs
```

### 3. Data Flow Architecture

#### Flujo de Datos Principal
```
User Action → Component → Hook → Supabase Client → Database
     ↓                                               ↓
UI Update ← State Update ← React Query ← Response ←─┘
```

#### Patrón de Hooks Personalizados
```typescript
// Hook típico para operaciones CRUD
const useModuleData = () => {
  // 1. Data fetching con React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['module', filters],
    queryFn: () => fetchModuleData(filters)
  });

  // 2. Mutations para CRUD
  const createMutation = useMutation({
    mutationFn: createModuleItem,
    onSuccess: () => queryClient.invalidateQueries(['module'])
  });

  // 3. Return interface limpia
  return {
    data,
    isLoading,
    error,
    create: createMutation.mutate,
    // ...otras operaciones
  };
};
```

### 4. Security Architecture

#### Capas de Seguridad
```
1. Frontend Validation    → Validación en tiempo real
2. TypeScript Types      → Type safety
3. Supabase RLS         → Database-level security
4. JWT Tokens           → Authentication
5. HTTPS/SSL            → Transport security
```

#### Implementación de Roles
```typescript
// Sistema de permisos unificado
interface UserPermissions {
  accessLevel: 'trial' | 'paid' | 'superuser';
  hasFullAccess: boolean;
  canCreateVehicles: boolean;
  canCreateDrivers: boolean;
  canAccessMantenimiento: boolean;
  // ...más permisos granulares
}

const useUnifiedPermissions = () => {
  // Lógica centralizada de permisos
  // Basada en suscripción + roles
};
```

## 🔄 Patrones de Diseño Implementados

### 1. Compound Component Pattern
```typescript
// Componentes compuestos para flexibilidad
<DataTable>
  <DataTable.Filters />
  <DataTable.Content />
  <DataTable.Pagination />
</DataTable>
```

### 2. Provider Pattern
```typescript
// Context para estado compartido
<MantenimientoProvider>
  <MantenimientoDashboard />
  <AlertasPanel />
</MantenimientoProvider>
```

### 3. Custom Hooks Pattern
```typescript
// Encapsulación de lógica compleja
const useCartaPorteForm = () => {
  // Validación, persistencia, auto-save
};
```

### 4. Repository Pattern
```typescript
// Abstracción de acceso a datos
const vehiculosRepository = {
  getAll: (filters) => supabase.from('vehiculos').select(),
  create: (data) => supabase.from('vehiculos').insert(data),
  // ...más operaciones
};
```

## 🚀 Performance Architecture

### 1. Code Splitting
```typescript
// Lazy loading de rutas
const CartaPorte = lazy(() => import('./pages/CartaPorte'));
const Mantenimiento = lazy(() => import('./pages/Mantenimiento'));
```

### 2. React Query Cache
```typescript
// Configuración de cache inteligente
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});
```

### 3. Virtualization
```typescript
// Para listas grandes
<VirtualizedTable
  data={vehiculos}
  rowHeight={60}
  renderRow={VehiculoRow}
/>
```

### 4. Optimistic Updates
```typescript
// Updates optimistas para mejor UX
const updateVehiculo = useMutation({
  mutationFn: updateVehiculoAPI,
  onMutate: async (newData) => {
    // Update UI immediately
    queryClient.setQueryData(['vehiculos'], (old) => 
      old.map(v => v.id === newData.id ? { ...v, ...newData } : v)
    );
  },
  onError: (error, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['vehiculos'], context.previousData);
  }
});
```

## 🌐 Integration Architecture

### 1. External APIs
```typescript
// Abstracción de APIs externas
interface ExternalAPI {
  authenticate: () => Promise<Token>;
  call: (endpoint: string, data: any) => Promise<Response>;
  handleError: (error: Error) => void;
}

// Implementaciones específicas
class GoogleMapsAPI implements ExternalAPI { }
class FiscalAPI implements ExternalAPI { }
class WhatsAppAPI implements ExternalAPI { }
```

### 2. Webhook Handling
```typescript
// Edge functions para webhooks
export default async function handler(req: Request) {
  const { type, data } = await req.json();
  
  switch (type) {
    case 'payment_completed':
      await activateSubscription(data.userId);
      break;
    case 'maintenance_alert':
      await sendNotification(data);
      break;
  }
}
```

## 📱 Mobile Architecture

### 1. Responsive Design
```typescript
// Breakpoints consistentes
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};

// Hook para responsive
const useIsMobile = () => {
  return useMediaQuery('(max-width: 768px)');
};
```

### 2. Touch-Friendly Components
```typescript
// Componentes adaptados para móvil
<MobileForm>
  <FloatingActionButton />
  <SwipeableCard />
  <TouchableDataTable />
</MobileForm>
```

## 🔧 Development Architecture

### 1. Environment Configuration
```typescript
// Multi-environment setup
const config = {
  development: {
    supabaseUrl: 'http://localhost:54321',
    logLevel: 'debug',
  },
  production: {
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    logLevel: 'error',
  },
};
```

### 2. Type Safety
```typescript
// Generated types from Supabase
import { Database } from '@/integrations/supabase/types';

type Vehiculo = Database['public']['Tables']['vehiculos']['Row'];
type VehiculoInsert = Database['public']['Tables']['vehiculos']['Insert'];
```

### 3. Error Boundaries
```typescript
// Manejo de errores centralizado
<ErrorBoundary
  fallback={<ErrorFallback />}
  onError={logError}
>
  <App />
</ErrorBoundary>
```

## 🔍 Monitoring Architecture

### 1. Logging Strategy
```typescript
// Logging estructurado
const logger = {
  info: (message: string, context?: any) => {
    console.log(`[INFO] ${message}`, context);
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
    // Send to monitoring service
  },
};
```

### 2. Performance Monitoring
```typescript
// Métricas de rendimiento
const usePerformanceMonitor = () => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Track loading times
      });
    });
    observer.observe({ entryTypes: ['navigation'] });
  }, []);
};
```

## 🚀 Deployment Architecture

### 1. CI/CD Pipeline
```yaml
# GitHub Actions workflow
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
      - name: Deploy
        uses: vercel/action@v1
```

### 2. Environment Management
```bash
# Diferentes entornos
├── .env.development    # Desarrollo local
├── .env.staging       # Staging/QA
└── .env.production    # Producción
```

Esta arquitectura garantiza escalabilidad, mantenibilidad y seguridad del sistema Interconecta Trucking.
