# 🪝 Guía de Referencia de Hooks - Interconecta Trucking

Esta guía documenta los hooks principales del sistema, su propósito, dependencias y ejemplos prácticos de uso.

## 📋 Tabla de Contenidos

- [Hooks de Autenticación](#hooks-de-autenticación)
- [Hooks de Entidades CRUD](#hooks-de-entidades-crud)
- [Hooks de Viajes](#hooks-de-viajes)
- [Hooks de Carta Porte](#hooks-de-carta-porte)
- [Hooks de Validación](#hooks-de-validación)
- [Hooks de UI/UX](#hooks-de-uiux)
- [Hooks de Integración](#hooks-de-integración)
- [Patrones Comunes](#patrones-comunes)

---

## Hooks de Autenticación

### useAuth / useUnifiedAuth

**Ubicación**: `src/hooks/useAuth.tsx`, `src/hooks/useUnifiedAuth.ts`

**Propósito**: Hook principal de autenticación que gestiona sesión, usuario y permisos.

**Dependencias**:
- `@supabase/supabase-js`
- `useOptimizedAuth` (interno)

**Interfaz**:
```typescript
interface AuthContext {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
```

**Ejemplo de uso**:
```tsx
import { useAuth } from '@/hooks/useAuth';

function MiComponente() {
  const { user, isAuthenticated, signOut, loading } = useAuth();

  if (loading) return <Spinner />;
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return (
    <div>
      <p>Bienvenido, {user?.email}</p>
      <Button onClick={signOut}>Cerrar sesión</Button>
    </div>
  );
}
```

**Notas importantes**:
- El hook mantiene la sesión sincronizada con Supabase Auth
- Incluye refresh automático de tokens
- RLS en la base de datos depende del `user.id` del JWT

---

### usePermissions / useUnifiedPermissionsV2

**Ubicación**: `src/hooks/useUnifiedPermissionsV2.tsx`

**Propósito**: Gestión de permisos y roles de usuario.

**Ejemplo**:
```tsx
const { hasPermission, userRole, canAccessModule } = useUnifiedPermissionsV2();

if (!canAccessModule('facturacion')) {
  return <AccessDenied />;
}
```

---

## Hooks de Entidades CRUD

### useVehiculos

**Ubicación**: `src/hooks/useVehiculos.ts`

**Propósito**: CRUD completo de vehículos con validaciones SAT.

**Dependencias**:
- `@tanstack/react-query`
- `useAuth`
- Tabla: `vehiculos`

**Interfaz**:
```typescript
interface UseVehiculosReturn {
  // Datos
  vehiculos: Vehiculo[];
  isLoading: boolean;
  error: Error | null;
  
  // Mutaciones
  crearVehiculo: UseMutationResult<Vehiculo, Error, CreateVehiculoInput>;
  actualizarVehiculo: UseMutationResult<Vehiculo, Error, UpdateVehiculoInput>;
  eliminarVehiculo: UseMutationResult<void, Error, string>;
  
  // Utilidades
  refetch: () => void;
}
```

**Ejemplo completo**:
```tsx
import { useVehiculos } from '@/hooks/useVehiculos';

function FormularioVehiculo() {
  const { 
    vehiculos, 
    crearVehiculo, 
    isLoading 
  } = useVehiculos();

  const handleSubmit = async (data: VehiculoFormData) => {
    try {
      await crearVehiculo.mutateAsync({
        placa: data.placa,
        marca: data.marca,
        modelo: data.modelo,
        anio: data.anio,
        config_vehicular: data.configVehicular, // Clave SAT
        num_permiso_sct: data.permisoSCT,
        peso_bruto_vehicular: data.pesoBruto
      });
      toast.success('Vehículo creado exitosamente');
    } catch (error) {
      toast.error('Error al crear vehículo');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
    </form>
  );
}
```

**Validaciones automáticas**:
- Placa única por usuario
- Configuración vehicular válida (catálogo SAT)
- Peso bruto vehicular requerido

---

### useConductores

**Ubicación**: `src/hooks/useConductores.ts`

**Propósito**: Gestión de conductores/operadores con validación de documentos.

**Dependencias**:
- `@tanstack/react-query`
- `useAuth`
- Tabla: `conductores`

**Campos críticos para Carta Porte**:
```typescript
interface Conductor {
  id: string;
  nombre: string;
  rfc: string;              // Requerido para Carta Porte
  num_licencia: string;     // Número de licencia federal
  tipo_licencia: string;    // Tipo de licencia (catálogo SAT)
  vigencia_licencia: string; // Fecha de vencimiento
  curp: string;             // CURP del conductor
  num_reg_id_trib?: string; // Para conductores extranjeros
  residencia_fiscal?: string;
  estado: 'disponible' | 'en_viaje' | 'descanso' | 'incapacidad';
}
```

**Ejemplo**:
```tsx
const { conductores, crearConductor } = useConductores();

// Filtrar solo conductores disponibles
const disponibles = conductores.filter(c => c.estado === 'disponible');

// Crear conductor con datos fiscales
await crearConductor.mutateAsync({
  nombre: 'Juan Pérez García',
  rfc: 'PEGJ850101ABC',
  num_licencia: '1234567890',
  tipo_licencia: 'C', // Licencia federal tipo C
  vigencia_licencia: '2025-12-31',
  curp: 'PEGJ850101HDFRRC09'
});
```

---

### useRemolques

**Ubicación**: `src/hooks/useRemolques.ts`

**Propósito**: Gestión de remolques y semirremolques.

**Ejemplo**:
```tsx
const { remolques, crearRemolque } = useRemolques();

await crearRemolque.mutateAsync({
  placa: 'ABC-123',
  subtipo_remolque: 'CTR004', // Clave SAT: Caja seca
  numero_serie: 'VIN12345678',
  capacidad_kg: 30000
});
```

---

### useCotizaciones

**Ubicación**: `src/hooks/useCotizaciones.ts`

**Propósito**: Gestión de cotizaciones con cálculo automático de costos.

**Flujo de datos**:
```
Cotización → (aprobada) → Viaje → Carta Porte → Factura
```

**Ejemplo**:
```tsx
const { cotizaciones, crearCotizacion, convertirAViaje } = useCotizaciones();

// Crear cotización
const cotizacion = await crearCotizacion.mutateAsync({
  cliente_id: clienteId,
  origen: 'CDMX',
  destino: 'Monterrey',
  distancia_total: 900,
  costos_internos: {
    combustible: 5000,
    casetas: 1200,
    salario: 2000
  },
  margen_ganancia: 25, // 25%
  precio_cotizado: 10250
});

// Convertir a viaje cuando se aprueba
await convertirAViaje(cotizacion.id);
```

---

## Hooks de Viajes

### useViajes

**Ubicación**: `src/hooks/useViajes.ts`

**Propósito**: Hook principal para gestión de viajes.

**Estados del viaje**:
```typescript
type EstadoViaje = 
  | 'programado'    // Recién creado
  | 'en_transito'   // Viaje iniciado
  | 'completado'    // Entregado
  | 'cancelado'     // Cancelado
  | 'retrasado';    // Con retraso
```

**Ejemplo completo**:
```tsx
const { 
  viajes, 
  viajesActivos,
  crearViaje, 
  actualizarEstado,
  isLoading 
} = useViajes();

// Crear viaje desde wizard
const nuevoViaje = await crearViaje.mutateAsync({
  cliente_id: clienteId,
  conductor_id: conductorId,
  vehiculo_id: vehiculoId,
  remolque_id: remolqueId,
  origen: 'Ciudad de México',
  destino: 'Guadalajara',
  fecha_inicio_programada: new Date().toISOString(),
  fecha_fin_programada: addDays(new Date(), 1).toISOString(),
  tracking_data: {
    ubicaciones: [origen, destino],
    mercancias: mercanciasList
  }
});

// Cambiar estado
await actualizarEstado.mutateAsync({
  id: viajeId,
  estado: 'en_transito',
  evento: 'inicio_viaje'
});
```

---

### useViajesData (hooks/viajes/)

**Ubicación**: `src/hooks/viajes/useViajesData.ts`

**Propósito**: Obtener viajes activos excluyendo borradores.

**Filtros automáticos**:
- Excluye borradores del wizard (`BORRADOR WIZARD`)
- Solo viajes con fechas definidas
- Ordenados por fecha de creación

```tsx
const { viajesActivos, obtenerEventosViaje } = useViajesData();

// Obtener eventos de un viaje específico
const eventos = await obtenerEventosViaje(viajeId);
```

---

### useCostosViaje

**Ubicación**: `src/hooks/useCostosViaje.ts`

**Propósito**: Cálculo y seguimiento de costos por viaje.

**Estructura de costos**:
```typescript
interface CostosViaje {
  // Estimados (antes del viaje)
  combustible_estimado: number;
  casetas_estimadas: number;
  peajes_estimados: number;
  salario_conductor_estimado: number;
  
  // Reales (después del viaje)
  combustible_real: number;
  casetas_reales: number;
  peajes_reales: number;
  salario_conductor_real: number;
  
  // Calculados
  costo_total_estimado: number;
  costo_total_real: number;
  margen_estimado: number;
  margen_real: number;
}
```

---

## Hooks de Carta Porte

### useCartasPorte

**Ubicación**: `src/hooks/useCartasPorte.ts`

**Propósito**: Gestión completa de Cartas Porte con generación de XML.

**Estados**:
```typescript
type EstadoCartaPorte = 
  | 'borrador'   // En edición
  | 'activa'     // Lista para timbrar
  | 'timbrada'   // Con UUID fiscal
  | 'cancelada'; // Cancelada ante SAT
```

**Ejemplo de flujo completo**:
```tsx
const { 
  cartasPorte,
  crearCartaPorte,
  timbrarCartaPorte,
  descargarPDF
} = useCartasPorte();

// 1. Crear carta porte desde viaje
const cartaPorte = await crearCartaPorte.mutateAsync({
  viaje_id: viajeId,
  rfc_emisor: empresaRFC,
  rfc_receptor: clienteRFC,
  ubicaciones: [origen, ...intermedios, destino],
  mercancias: mercanciasData,
  autotransporte: {
    vehiculo_id: vehiculoId,
    remolque_id: remolqueId
  }
});

// 2. Timbrar carta porte
const resultado = await timbrarCartaPorte.mutateAsync({
  cartaPorteId: cartaPorte.id,
  ambiente: 'sandbox' // o 'production'
});

console.log('UUID Fiscal:', resultado.uuid);

// 3. Descargar PDF
await descargarPDF(cartaPorte.id);
```

---

### useCartaPorteForm

**Ubicación**: `src/hooks/useCartaPorteForm.ts`

**Propósito**: Manejo de estado del formulario multi-paso de Carta Porte.

**Pasos del formulario**:
1. Datos generales (emisor/receptor)
2. Ubicaciones (origen/destino)
3. Mercancías
4. Autotransporte
5. Figuras de transporte
6. Resumen y validación

```tsx
const {
  currentStep,
  formData,
  updateFormData,
  nextStep,
  prevStep,
  validateCurrentStep,
  isValid
} = useCartaPorteForm();
```

---

### useCartaPorteValidation

**Ubicación**: `src/hooks/useCartaPorteValidation.ts`

**Propósito**: Validaciones específicas del SAT para Carta Porte.

**Validaciones incluidas**:
- RFC válido (persona física/moral)
- Claves de catálogos SAT
- Estructura de ubicaciones
- Peso total de mercancías vs capacidad vehículo
- Datos obligatorios por tipo de transporte

```tsx
const { 
  validarCartaPorte, 
  errores, 
  warnings 
} = useCartaPorteValidation();

const resultado = validarCartaPorte(cartaPorteData);

if (!resultado.isValid) {
  resultado.errors.forEach(error => {
    console.error(`${error.campo}: ${error.mensaje}`);
  });
}
```

---

## Hooks de Validación

### useCatalogos / useCatalogosSATInteligente

**Ubicación**: `src/hooks/useCatalogosSATInteligente.ts`

**Propósito**: Acceso a catálogos oficiales del SAT con caché inteligente.

**Catálogos disponibles**:
- `cat_clave_prod_serv_cp` - Productos y servicios
- `cat_clave_unidad` - Unidades de medida
- `cat_material_peligroso` - Materiales peligrosos
- `cat_config_autotransporte` - Configuraciones vehiculares
- `cat_tipo_permiso` - Tipos de permiso SCT
- `cat_figura_transporte` - Figuras de transporte
- `cat_estado` - Estados de México
- `cat_municipio` - Municipios
- `cat_codigo_postal` - Códigos postales

**Ejemplo**:
```tsx
const { 
  buscarProducto,
  buscarUnidad,
  obtenerConfiguracionesVehiculares,
  obtenerEstados
} = useCatalogosSATInteligente();

// Búsqueda con autocompletado
const productos = await buscarProducto('78101800'); // Transporte de carga

// Obtener catálogo completo
const estados = await obtenerEstados();
```

---

### useCodigoPostalMexicanoNacional

**Ubicación**: `src/hooks/useCodigoPostalMexicanoNacional.ts`

**Propósito**: Búsqueda y validación de códigos postales mexicanos.

**Datos retornados**:
```typescript
interface CodigoPostalInfo {
  codigo_postal: string;
  estado: string;
  estado_clave: string;
  municipio: string;
  municipio_clave: string;
  colonias: string[];
  localidad?: string;
}
```

**Ejemplo**:
```tsx
const { buscarCodigoPostal, isLoading } = useCodigoPostalMexicanoNacional();

const info = await buscarCodigoPostal('01000');
// {
//   codigo_postal: '01000',
//   estado: 'Ciudad de México',
//   estado_clave: 'CMX',
//   municipio: 'Álvaro Obregón',
//   municipio_clave: '010',
//   colonias: ['San Ángel', 'Guadalupe Inn', ...]
// }
```

---

## Hooks de UI/UX

### useFloatingNotifications

**Ubicación**: `src/hooks/useFloatingNotifications.ts`

**Propósito**: Sistema de notificaciones flotantes contextuales.

**Tipos de notificación**:
- `success` - Operación exitosa
- `error` - Error crítico
- `warning` - Advertencia
- `info` - Información general

```tsx
const { 
  notifications,
  addNotification,
  dismissNotification,
  vehicleNotifications,
  tripNotifications
} = useFloatingNotifications();

// Notificación simple
addNotification({
  type: 'success',
  title: 'Viaje creado',
  message: 'El viaje fue programado exitosamente'
});

// Notificaciones contextuales de vehículo
vehicleNotifications.documentoVencePronto('ABC-123', 'Verificación', 15);

// Notificaciones de viaje
tripNotifications.viajeIniciado('CDMX', 'Monterrey');
```

---

### useScrollReveal

**Ubicación**: `src/hooks/useScrollReveal.ts`

**Propósito**: Animaciones de revelado al hacer scroll.

```tsx
const { ref, isRevealed } = useScrollReveal({
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
  triggerOnce: true
});

return (
  <div 
    ref={ref} 
    className={cn(
      'transition-all duration-700',
      isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    )}
  >
    Contenido que aparece
  </div>
);
```

---

### useDebounce

**Ubicación**: `src/hooks/useDebounce.ts`

**Propósito**: Debounce de valores para búsquedas y optimización.

```tsx
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);

// La búsqueda solo se ejecuta después de 300ms sin cambios
useEffect(() => {
  if (debouncedSearch) {
    buscarProductos(debouncedSearch);
  }
}, [debouncedSearch]);
```

---

## Hooks de Integración

### useGoogleMapsAPI

**Ubicación**: `src/hooks/useGoogleMapsAPI.ts`

**Propósito**: Integración con Google Maps para rutas y geocodificación.

```tsx
const { 
  calcularRuta,
  geocodificar,
  obtenerDistancia,
  isLoading 
} = useGoogleMapsAPI();

// Calcular ruta entre puntos
const ruta = await calcularRuta({
  origen: { lat: 19.4326, lng: -99.1332 }, // CDMX
  destino: { lat: 25.6866, lng: -100.3161 }, // Monterrey
  waypoints: [] // Puntos intermedios opcionales
});

console.log('Distancia:', ruta.distancia, 'km');
console.log('Duración:', ruta.duracion, 'minutos');
```

---

### useCertificadosDigitales

**Ubicación**: `src/hooks/useCertificadosDigitales.ts`

**Propósito**: Gestión de Certificados de Sello Digital (CSD) del SAT.

```tsx
const { 
  certificados,
  certificadoActivo,
  subirCertificado,
  validarCertificado 
} = useCertificadosDigitales();

// Subir nuevo CSD
await subirCertificado({
  archivoCer: cerFile,
  archivoKey: keyFile,
  password: 'contraseña_csd'
});

// El certificado se valida automáticamente y se extrae:
// - RFC del titular
// - Número de certificado
// - Fechas de vigencia
```

---

## Patrones Comunes

### Patrón: Query con Cache

Todos los hooks de datos usan TanStack Query con cache inteligente:

```tsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['vehiculos', user?.id], // Key única por usuario
  queryFn: async () => {
    const { data, error } = await supabase
      .from('vehiculos')
      .select('*')
      .eq('user_id', user.id)
      .eq('activo', true);
    
    if (error) throw error;
    return data;
  },
  enabled: !!user?.id, // Solo ejecutar si hay usuario
  staleTime: 30000,    // Datos frescos por 30s
  refetchInterval: 60000 // Refrescar cada minuto
});
```

### Patrón: Mutación con Invalidación

```tsx
const crearVehiculo = useMutation({
  mutationFn: async (data: CreateVehiculoInput) => {
    const { data: vehiculo, error } = await supabase
      .from('vehiculos')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return vehiculo;
  },
  onSuccess: () => {
    // Invalidar cache para refrescar lista
    queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
    toast.success('Vehículo creado');
  },
  onError: (error) => {
    toast.error(`Error: ${error.message}`);
  }
});
```

### Patrón: Formulario con Validación

```tsx
const form = useForm<VehiculoFormData>({
  resolver: zodResolver(vehiculoSchema),
  defaultValues: {
    placa: '',
    marca: '',
    modelo: ''
  }
});

const onSubmit = form.handleSubmit(async (data) => {
  await crearVehiculo.mutateAsync(data);
  form.reset();
});
```

---

## Diagrama de Dependencias

```
┌─────────────────────────────────────────────────────────────┐
│                      CAPA DE PRESENTACIÓN                   │
│            Componentes, Páginas, Formularios                │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                       HOOKS PRINCIPALES                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ useVehiculos │  │useConductores│  │  useCartasPorte  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  useViajes   │  │useRemolques  │  │ useCotizaciones  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     HOOKS DE SOPORTE                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   useAuth    │  │useCatalogos  │  │   useDebounce    │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICIOS EXTERNOS                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Supabase   │  │ Google Maps  │  │    PAC SW        │   │
│  │   Client     │  │     API      │  │   (Timbrado)     │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Mejores Prácticas

1. **Siempre usar destructuring** para obtener solo lo necesario del hook
2. **Verificar loading state** antes de renderizar datos
3. **Manejar errores** con try/catch o el estado `error` del hook
4. **No llamar hooks condicionalmente** (regla de React)
5. **Usar `enabled`** para controlar cuándo ejecutar queries
6. **Invalidar queries** después de mutaciones exitosas

---

## Troubleshooting

### Error: "User not authenticated"
```tsx
// ❌ Mal: No verificar autenticación
const { vehiculos } = useVehiculos();

// ✅ Bien: Verificar primero
const { user } = useAuth();
const { vehiculos } = useVehiculos();

if (!user) return <LoginRedirect />;
```

### Error: "Query key mismatch"
```tsx
// ❌ Mal: Key inconsistente
queryKey: ['vehiculos', undefined]

// ✅ Bien: Esperar a tener user
queryKey: ['vehiculos', user?.id]
enabled: !!user?.id
```

### Error: "Too many re-renders"
```tsx
// ❌ Mal: Crear función en cada render
const handleClick = () => crearVehiculo(data);

// ✅ Bien: Usar useCallback
const handleClick = useCallback(() => {
  crearVehiculo.mutate(data);
}, [data]);
```
