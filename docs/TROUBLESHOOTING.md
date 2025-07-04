
# Guía de Solución de Problemas - Interconecta Trucking

## 🚨 Problemas Comunes y Soluciones

### 1. Problemas de Configuración Inicial

#### Error: "Cannot find module '@/components/ui/...'"
```bash
# Verificar que las dependencias estén instaladas
npm install

# Verificar configuración de alias en vite.config.ts
# Debe contener:
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
}
```

#### Error: "VITE_SUPABASE_URL is not defined"
```bash
# Verificar que existe el archivo .env
ls -la .env

# Verificar que las variables tengan el prefijo VITE_
cat .env | grep VITE_

# Reiniciar el servidor de desarrollo
npm run dev
```

#### Error: "Failed to connect to Supabase"
```typescript
// Verificar configuración en src/integrations/supabase/client.ts
const SUPABASE_URL = "https://tu-proyecto.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "tu-anon-key";

// Verificar en Supabase Dashboard:
// 1. Project Settings > API
// 2. Copiar URL y anon key correctas
```

### 2. Problemas de Base de Datos

#### Error: "relation 'tabla' does not exist"
```sql
-- Verificar que las migraciones se ejecutaron
-- En Supabase SQL Editor:
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'nombre_tabla';

-- Si no existe, ejecutar migraciones manualmente
-- Ir a supabase/migrations/ y ejecutar archivos en orden
```

#### Error: "RLS policy violation"
```sql
-- Verificar políticas RLS activas
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'tabla_problema';

-- Verificar si el usuario está autenticado
SELECT auth.uid(); -- Debe retornar UUID, no null

-- Verificar superusuario
SELECT raw_user_meta_data->>'is_superuser' = 'true' 
FROM auth.users 
WHERE id = auth.uid();
```

#### Error: "User not found in profiles"
```sql
-- Verificar que el perfil se creó correctamente
SELECT * FROM profiles WHERE id = auth.uid();

-- Si no existe, crear manualmente o verificar trigger handle_new_user
INSERT INTO profiles (id, nombre, email) 
VALUES (auth.uid(), 'Nombre Usuario', 'email@ejemplo.com');
```

### 3. Problemas de Autenticación

#### Error: "Email not confirmed"
```typescript
// En el hook de auth, manejar usuarios no confirmados
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

if (error?.message === 'Email not confirmed') {
  // Mostrar mensaje para confirmar email
  toast.error('Por favor confirma tu email antes de continuar');
  // Opción para reenviar confirmación
  await supabase.auth.resend({
    type: 'signup',
    email: email
  });
}
```

#### Error: "Invalid login credentials"
```typescript
// Verificar datos de login
console.log('Attempting login with:', { email, password: password ? 'PROVIDED' : 'MISSING' });

// Verificar que el usuario existe
const { data: userExists } = await supabase
  .from('profiles')
  .select('email')
  .eq('email', email)
  .single();

if (!userExists) {
  toast.error('Usuario no encontrado. Verifica tu email.');
}
```

#### Error: "Session expired"
```typescript
// Implementar refresh automático de sesión
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Session refreshed successfully');
  }
  
  if (event === 'SIGNED_OUT') {
    // Limpiar cache y redirigir a login
    queryClient.clear();
    navigate('/login');
  }
});
```

### 4. Problemas de Rendimiento

#### Carga lenta de listas grandes
```typescript
// Implementar paginación
const useVehiculosPaginated = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['vehiculos', page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await supabase
        .from('vehiculos')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, count };
    }
  });
};

// Implementar virtualización para listas muy grandes
import { FixedSizeList as List } from 'react-window';

const VirtualizedVehiculosList = ({ vehiculos }) => (
  <List
    height={600}
    itemCount={vehiculos.length}
    itemSize={80}
    itemData={vehiculos}
  >
    {VehiculoRow}
  </List>
);
```

#### Queries lentas
```sql
-- Crear índices para mejorar performance
CREATE INDEX vehiculos_user_id_activo_idx 
ON vehiculos(user_id, activo) 
WHERE activo = true;

CREATE INDEX cartas_porte_usuario_fecha_idx 
ON cartas_porte(usuario_id, created_at);

-- Analizar queries lentas
EXPLAIN ANALYZE 
SELECT * FROM vehiculos 
WHERE user_id = 'uuid' AND activo = true;
```

#### Re-renders excesivos
```typescript
// Usar React.memo para componentes pesados
const ExpensiveComponent = React.memo(({ data, onAction }) => {
  return <div>{/* componente pesado */}</div>;
});

// Memoizar callbacks
const ParentComponent = () => {
  const handleAction = useCallback((id: string) => {
    // lógica del callback
  }, []);

  return <ExpensiveComponent data={data} onAction={handleAction} />;
};

// Usar useMemo para cálculos costosos
const processedData = useMemo(() => {
  return rawData.map(item => ({
    ...item,
    calculated: expensiveCalculation(item)
  }));
}, [rawData]);
```

### 5. Problemas de Carta Porte

#### Error: "Validation failed for CFDI v3.1"
```typescript
// Verificar datos requeridos para v3.1
const validateCartaPorteV31 = (data: any) => {
  const errors = [];
  
  // Validaciones obligatorias
  if (!data.ubicaciones || data.ubicaciones.length < 2) {
    errors.push('Se requieren al menos 2 ubicaciones');
  }
  
  if (!data.mercancias || data.mercancias.length === 0) {
    errors.push('Se requiere al menos una mercancía');
  }
  
  // Verificar fracción arancelaria (obligatoria en v3.1)
  const mercanciasSinFraccion = data.mercancias?.filter(m => !m.fraccion_arancelaria);
  if (mercanciasSinFraccion?.length > 0) {
    errors.push('Fracción arancelaria es obligatoria en versión 3.1');
  }
  
  return errors;
};
```

#### Error: "IdCCP already exists"
```sql
-- Verificar función de generación de IdCCP único
SELECT public.generar_id_ccp_unico();

-- Si persiste el error, limpiar duplicados
DELETE FROM cartas_porte 
WHERE id_ccp IN (
  SELECT id_ccp 
  FROM cartas_porte 
  GROUP BY id_ccp 
  HAVING COUNT(*) > 1
) AND id NOT IN (
  SELECT MIN(id) 
  FROM cartas_porte 
  GROUP BY id_ccp 
  HAVING COUNT(*) > 1
);
```

#### Error: "XML generation failed"
```typescript
// Debug de generación XML
const debugXMLGeneration = (cartaPorteData: any) => {
  console.log('Datos de entrada:', JSON.stringify(cartaPorteData, null, 2));
  
  // Verificar campos obligatorios
  const requiredFields = ['rfc_emisor', 'rfc_receptor', 'ubicaciones', 'mercancias'];
  const missingFields = requiredFields.filter(field => !cartaPorteData[field]);
  
  if (missingFields.length > 0) {
    console.error('Campos faltantes:', missingFields);
    return { error: `Campos obligatorios faltantes: ${missingFields.join(', ')}` };
  }
  
  return { success: true };
};
```

### 6. Problemas de APIs Externas

#### Error: "Google Maps API quota exceeded"
```typescript
// Implementar cache para requests de Google Maps
const geocodeCache = new Map();

const geocodeWithCache = async (address: string) => {
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address);
  }
  
  try {
    const result = await geocode(address);
    geocodeCache.set(address, result);
    return result;
  } catch (error) {
    console.error('Geocoding failed:', error);
    throw error;
  }
};

// Implementar rate limiting
const rateLimit = {
  requests: [],
  maxRequests: 50,
  timeWindow: 60000, // 1 minuto
  
  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    return this.requests.length < this.maxRequests;
  },
  
  recordRequest() {
    this.requests.push(Date.now());
  }
};
```

#### Error: "Fiscal API connection timeout"
```typescript
// Implementar retry con exponential backoff
const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Uso
try {
  const result = await retryWithBackoff(async () => {
    return await fiscalAPI.timbrarCFDI(xmlData);
  });
} catch (error) {
  console.error('Failed after all retries:', error);
}
```

### 7. Problemas de Build y Deployment

#### Error: "Build failed due to TypeScript errors"
```bash
# Verificar errores de TypeScript
npx tsc --noEmit

# Verificar configuración de TypeScript
cat tsconfig.json

# Verificar imports relativos
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "from '\.\./\.\./\.\."
```

#### Error: "Module not found in production"
```bash
# Verificar que todos los imports usen rutas correctas
# Mal: import { Component } from '../../../components/Component'
# Bien: import { Component } from '@/components/Component'

# Verificar configuración de alias en build
npm run build -- --debug

# Verificar que no hay imports de desarrollo en producción
grep -r "process.env.NODE_ENV" src/
```

### 8. Herramientas de Debug

#### React Query DevTools
```typescript
// Agregar en desarrollo
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

#### Supabase Debug
```typescript
// Habilitar logs detallados de Supabase
const supabase = createClient(url, key, {
  auth: {
    debug: process.env.NODE_ENV === 'development'
  }
});

// Log de todas las queries
const originalFrom = supabase.from;
supabase.from = function(table: string) {
  const query = originalFrom.call(this, table);
  console.log(`Supabase query on table: ${table}`);
  return query;
};
```

#### Browser DevTools
```javascript
// En la consola del navegador, debug de estado de la app
// Ver estado de React Query
window.__REACT_QUERY_CLIENT__.getQueryCache().getAll();

// Ver estado de autenticación
window.__SUPABASE_CLIENT__.auth.getSession();

// Ver localStorage
Object.keys(localStorage).forEach(key => {
  console.log(key, localStorage.getItem(key));
});
```

### 9. Logs y Monitoreo

#### Configurar Logging Estructurado
```typescript
// src/lib/logger.ts
const logger = {
  info: (message: string, context?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, context);
  },
  error: (message: string, error?: Error, context?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, {
      error: error?.message,
      stack: error?.stack,
      ...context
    });
  },
  warn: (message: string, context?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, context);
  }
};

// Uso en la aplicación
try {
  const result = await apiCall();
  logger.info('API call successful', { endpoint: '/api/vehiculos' });
} catch (error) {
  logger.error('API call failed', error, { endpoint: '/api/vehiculos' });
}
```

### 10. Checklist de Troubleshooting

Cuando encuentres un problema, sigue este checklist:

- [ ] **Reproduce el error** de manera consistente
- [ ] **Revisa la consola** del navegador para errores JavaScript
- [ ] **Revisa la pestaña Network** para errores de API
- [ ] **Verifica las variables de entorno** y configuración
- [ ] **Revisa los logs de Supabase** en el dashboard
- [ ] **Verifica el estado de autenticación** del usuario
- [ ] **Comprueba las políticas RLS** de la base de datos
- [ ] **Verifica los permisos** del usuario actual
- [ ] **Revisa las migraciones** de base de datos ejecutadas
- [ ] **Verifica la conectividad** a servicios externos

### 📞 Contacto para Soporte

Si no puedes resolver el problema con esta guía:

- **GitHub Issues:** [Crear issue](https://github.com/interconecta/trucking-platform/issues)
- **Email:** desarrollo@interconecta.capital
- **Documentación:** [Wiki del proyecto](https://github.com/interconecta/trucking-platform/wiki)

¡Recuerda incluir toda la información relevante al reportar un problema!
