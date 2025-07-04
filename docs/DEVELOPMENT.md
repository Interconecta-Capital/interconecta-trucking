
# Guía de Desarrollo - Interconecta Trucking

## 🛠️ Flujo de Desarrollo

### Configuración del Entorno de Desarrollo

#### 1. Preparación Inicial
```bash
# Clonar repositorio
git clone https://github.com/interconecta/trucking-platform.git
cd trucking-platform

# Instalar dependencias
npm install

# Configurar entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar desarrollo
npm run dev
```

#### 2. Configuración de IDE (VS Code)
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

#### 3. Extensiones Recomendadas
```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## 🏗️ Arquitectura de Desarrollo

### Estructura de Directorios
```
src/
├── components/          # Componentes React
│   ├── auth/           # Autenticación
│   ├── carta-porte/    # Módulo CFDI
│   ├── conductores/    # Gestión conductores
│   ├── vehiculos/      # Gestión vehículos
│   ├── mantenimiento/  # Sistema mantenimiento
│   ├── dashboard/      # Dashboard principal
│   ├── ui/             # Componentes base
│   └── common/         # Componentes compartidos
├── hooks/              # Custom hooks
│   ├── auth/           # Hooks de autenticación
│   ├── carta-porte/    # Hooks de Carta Porte
│   └── notifications/  # Hooks de notificaciones
├── pages/              # Páginas/Rutas
├── lib/                # Utilidades
├── integrations/       # APIs externas
│   └── supabase/       # Cliente Supabase
└── types/              # Tipos globales
```

### Patrones de Componentes

#### 1. Componente Básico
```typescript
// src/components/ejemplo/EjemploCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EjemploCardProps {
  title: string;
  content: string;
  onAction: () => void;
}

export const EjemploCard: React.FC<EjemploCardProps> = ({
  title,
  content,
  onAction
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{content}</p>
        <button 
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Acción
        </button>
      </CardContent>
    </Card>
  );
};
```

#### 2. Hook Personalizado
```typescript
// src/hooks/useEjemplo.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEjemplo = () => {
  const queryClient = useQueryClient();

  // Obtener datos
  const { data, isLoading, error } = useQuery({
    queryKey: ['ejemplo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tabla_ejemplo')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Crear nuevo item
  const createMutation = useMutation({
    mutationFn: async (newItem: any) => {
      const { data, error } = await supabase
        .from('tabla_ejemplo')
        .insert(newItem)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ejemplo'] });
    }
  });

  return {
    data: data || [],
    isLoading,
    error,
    create: createMutation.mutate,
    isCreating: createMutation.isPending
  };
};
```

#### 3. Formulario con Validación
```typescript
// src/components/ejemplo/EjemploForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

interface EjemploFormProps {
  onSubmit: (data: FormData) => void;
  initialData?: Partial<FormData>;
  isSubmitting?: boolean;
}

export const EjemploForm: React.FC<EjemploFormProps> = ({
  onSubmit,
  initialData,
  isSubmitting = false
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: initialData?.nombre || '',
      email: initialData?.email || '',
      telefono: initialData?.telefono || ''
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Ingresa el nombre" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </form>
    </Form>
  );
};
```

## 🎨 Desarrollo de UI

### Sistema de Diseño

#### 1. Colores y Temas
```css
/* src/index.css - Variables CSS */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}
```

#### 2. Componentes de UI Personalizados
```typescript
// src/components/ui/data-table.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No hay datos disponibles'
}: DataTableProps<T>) {
  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (data.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={String(column.key)}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index}>
            {columns.map((column) => (
              <TableCell key={String(column.key)}>
                {column.render 
                  ? column.render(row[column.key], row)
                  : String(row[column.key])
                }
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Responsive Design
```typescript
// Hook para responsive design
import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

// Breakpoints predefinidos
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
```

## 🗄️ Desarrollo de Base de Datos

### Creación de Migraciones
```sql
-- supabase/migrations/YYYYMMDDHHMMSS_nueva_funcionalidad.sql

-- Crear nueva tabla
CREATE TABLE public.nueva_tabla (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.nueva_tabla ENABLE ROW LEVEL SECURITY;

-- Crear política de acceso
CREATE POLICY "Users can manage their own records"
ON public.nueva_tabla
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Crear índices para performance
CREATE INDEX nueva_tabla_user_id_idx ON public.nueva_tabla(user_id);
CREATE INDEX nueva_tabla_activo_idx ON public.nueva_tabla(activo);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_nueva_tabla_updated_at
  BEFORE UPDATE ON public.nueva_tabla
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### Funciones de Base de Datos
```sql
-- Función para operaciones complejas
CREATE OR REPLACE FUNCTION public.operacion_compleja(
  p_user_id UUID,
  p_parametro TEXT
)
RETURNS TABLE(
  resultado TEXT,
  cantidad INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validar entrada
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID es requerido';
  END IF;

  -- Lógica de negocio
  RETURN QUERY
  SELECT 
    'resultado' as resultado,
    COUNT(*)::INTEGER as cantidad
  FROM public.nueva_tabla
  WHERE user_id = p_user_id
    AND nombre ILIKE '%' || p_parametro || '%';
END;
$$;
```

## 🔧 Herramientas de Desarrollo

### Debugging
```typescript
// Debug personalizado
const DEBUG = process.env.NODE_ENV === 'development';

export const debug = {
  log: (message: string, data?: any) => {
    if (DEBUG) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  error: (message: string, error?: Error) => {
    if (DEBUG) {
      console.error(`[ERROR] ${message}`, error);
    }
  },
  table: (label: string, data: any[]) => {
    if (DEBUG) {
      console.log(`[TABLE] ${label}`);
      console.table(data);
    }
  }
};

// Uso en componentes
const MyComponent = () => {
  const { data, error } = useQuery(['data'], fetchData);
  
  debug.log('Component rendered', { data, error });
  
  if (error) {
    debug.error('Query failed', error);
  }
  
  return <div>{/* ... */}</div>;
};
```

### Performance Profiling
```typescript
// Hook para medir rendimiento
export const usePerformance = (name: string) => {
  useEffect(() => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      console.log(`[PERF] ${name}: ${(end - start).toFixed(2)}ms`);
    };
  }, [name]);
};

// Uso en componentes pesados
const HeavyComponent = () => {
  usePerformance('HeavyComponent');
  
  // ... lógica del componente
  
  return <div>{/* ... */}</div>;
};
```

### Error Boundary
```typescript
// src/components/common/ErrorBoundary.tsx
import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="text-center py-8">
            <h2 className="text-lg font-semibold text-destructive">
              Algo salió mal
            </h2>
            <p className="text-muted-foreground mt-2">
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Recargar
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

## 🧪 Testing

### Setup de Testing
```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
```

### Mocks para Supabase
```typescript
// tests/mocks/supabase.ts
import { vi } from 'vitest';

export const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: {}, error: null }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: {}, error: null }))
        }))
      }))
    }))
  })),
  auth: {
    signInWithPassword: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    signUp: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null }))
  }
};
```

### Test de Componente
```typescript
// tests/components/VehiculoCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VehiculoCard } from '@/components/vehiculos/VehiculoCard';

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('VehiculoCard', () => {
  const mockVehiculo = {
    id: '1',
    placa: 'ABC-123',
    marca: 'Volvo',
    modelo: 'FH',
    estado: 'disponible'
  };

  it('should display vehiculo information correctly', () => {
    renderWithProviders(
      <VehiculoCard 
        vehiculo={mockVehiculo}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('ABC-123')).toBeInTheDocument();
    expect(screen.getByText('Volvo FH')).toBeInTheDocument();
    expect(screen.getByText('disponible')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    
    renderWithProviders(
      <VehiculoCard 
        vehiculo={mockVehiculo}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );

    const editButton = screen.getByRole('button', { name: /editar/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledWith(mockVehiculo.id);
    });
  });
});
```

## 🚀 Optimización

### Code Splitting
```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy loading de páginas
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Vehiculos = lazy(() => import('./pages/Vehiculos'));
const CartaPorte = lazy(() => import('./pages/CartaPorte'));
const Mantenimiento = lazy(() => import('./pages/Mantenimiento'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vehiculos" element={<Vehiculos />} />
          <Route path="/carta-porte" element={<CartaPorte />} />
          <Route path="/mantenimiento" element={<Mantenimiento />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### Memoización
```typescript
import { memo, useMemo, useCallback } from 'react';

interface ExpensiveListProps {
  items: any[];
  onItemClick: (id: string) => void;
}

export const ExpensiveList = memo<ExpensiveListProps>(({
  items,
  onItemClick
}) => {
  // Memoizar cálculos costosos
  const processedItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      displayName: `${item.name} (${item.category})`
    }));
  }, [items]);

  // Memoizar callbacks
  const handleItemClick = useCallback((id: string) => {
    onItemClick(id);
  }, [onItemClick]);

  return (
    <div>
      {processedItems.map(item => (
        <div key={item.id} onClick={() => handleItemClick(item.id)}>
          {item.displayName}
        </div>
      ))}
    </div>
  );
});
```

## 📊 Monitoreo y Analytics

### Logging Estructurado
```typescript
// src/lib/logger.ts
interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: any;
  timestamp: string;
  userId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private createLogEntry(
    level: LogEntry['level'], 
    message: string, 
    context?: any
  ): LogEntry {
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId()
    };
  }

  private getCurrentUserId(): string | undefined {
    // Obtener user ID del contexto de auth
    return undefined; // Implementar según el contexto
  }

  info(message: string, context?: any) {
    const entry = this.createLogEntry('info', message, context);
    
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context);
    }
    
    // En producción, enviar a servicio de logging
    this.sendToLoggingService(entry);
  }

  error(message: string, error?: Error, context?: any) {
    const entry = this.createLogEntry('error', message, { error, ...context });
    
    console.error(`[ERROR] ${message}`, error, context);
    this.sendToLoggingService(entry);
  }

  private sendToLoggingService(entry: LogEntry) {
    // Implementar envío a servicio de logging
    // Por ejemplo: Sentry, LogRocket, etc.
  }
}

export const logger = new Logger();
```

Esta guía proporciona una base sólida para el desarrollo continuo del proyecto Interconecta Trucking.
