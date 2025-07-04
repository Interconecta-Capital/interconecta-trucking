
# API Reference - Interconecta Trucking

## 🔗 Endpoints y Servicios

### Base URL
```
Desarrollo: http://localhost:3000
Producción: https://trucking.interconecta.capital
Supabase API: https://tu-proyecto.supabase.co/rest/v1/
```

## 🔐 Autenticación

### Headers Requeridos
```http
Authorization: Bearer <jwt_token>
apikey: <supabase_anon_key>
Content-Type: application/json
```

### Login
```typescript
// POST /auth/v1/token?grant_type=password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

### Registro
```typescript
// POST /auth/v1/signup
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      nombre: 'Juan Pérez',
      empresa: 'Mi Empresa SA'
    }
  }
});
```

## 🚛 Gestión de Vehículos

### Obtener Vehículos
```typescript
// GET /vehiculos
const { data, error } = await supabase
  .from('vehiculos')
  .select(`
    *,
    mantenimientos_programados(*)
  `)
  .eq('activo', true)
  .order('created_at', { ascending: false });

// Response
interface Vehiculo {
  id: string;
  user_id: string;
  placa: string;
  tipo: string;
  marca: string;
  modelo: string;
  año: number;
  kilometraje_actual: number;
  estado: 'disponible' | 'en_servicio' | 'mantenimiento';
  vigencia_seguro: string;
  verificacion_vigencia: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}
```

### Crear Vehículo
```typescript
// POST /vehiculos
const { data, error } = await supabase
  .from('vehiculos')
  .insert({
    placa: 'ABC-123-XYZ',
    tipo: 'Camión',
    marca: 'Volvo',
    modelo: 'FH',
    año: 2022,
    kilometraje_actual: 50000,
    vigencia_seguro: '2025-12-31',
    verificacion_vigencia: '2024-06-30'
  })
  .select()
  .single();
```

### Actualizar Vehículo
```typescript
// PATCH /vehiculos?id=eq.{id}
const { data, error } = await supabase
  .from('vehiculos')
  .update({
    kilometraje_actual: 55000,
    estado: 'mantenimiento'
  })
  .eq('id', vehiculoId)
  .select()
  .single();
```

## 👨‍💼 Gestión de Conductores

### Obtener Conductores
```typescript
// GET /conductores
const { data, error } = await supabase
  .from('conductores')
  .select('*')
  .eq('activo', true)
  .order('nombre');

interface Conductor {
  id: string;
  user_id: string;
  nombre: string;
  rfc?: string;
  curp?: string;
  num_licencia?: string;
  tipo_licencia?: string;
  vigencia_licencia?: string;
  telefono?: string;
  email?: string;
  direccion?: any;
  operador_sct: boolean;
  num_reg_id_trib?: string;
  residencia_fiscal: string;
  estado: string;
  activo: boolean;
}
```

### Crear Conductor
```typescript
// POST /conductores
const { data, error } = await supabase
  .from('conductores')
  .insert({
    nombre: 'Juan Pérez García',
    rfc: 'PEGJ800101ABC',
    curp: 'PEGJ800101HDFXXX01',
    num_licencia: 'LIC123456',
    tipo_licencia: 'Profesional',
    vigencia_licencia: '2025-08-15',
    telefono: '5551234567',
    email: 'juan.perez@example.com',
    operador_sct: true
  })
  .select()
  .single();
```

## 📋 Carta Porte CFDI

### Obtener Cartas Porte
```typescript
// GET /cartas_porte
const { data, error } = await supabase
  .from('cartas_porte')
  .select(`
    *,
    mercancias(*),
    ubicaciones(*),
    figuras_transporte(*),
    autotransporte(*)
  `)
  .order('created_at', { ascending: false })
  .limit(50);

interface CartaPorte {
  id: string;
  usuario_id: string;
  folio?: string;
  id_ccp: string;
  version_carta_porte: string;
  tipo_cfdi?: string;
  rfc_emisor: string;
  nombre_emisor?: string;
  rfc_receptor: string;
  nombre_receptor?: string;
  uso_cfdi?: string;
  status: string;
  datos_formulario?: any;
  xml_generado?: string;
  uuid_fiscal?: string;
  fecha_timbrado?: string;
}
```

### Crear Carta Porte
```typescript
// POST /cartas_porte
const { data, error } = await supabase
  .from('cartas_porte')
  .insert({
    id_ccp: generateUniqueId(),
    version_carta_porte: '3.1',
    tipo_cfdi: 'T',
    rfc_emisor: 'ABC123456789',
    nombre_emisor: 'Mi Empresa SA',
    rfc_receptor: 'XYZ987654321',
    nombre_receptor: 'Cliente SA',
    uso_cfdi: 'S01',
    status: 'borrador',
    datos_formulario: {
      // Datos del formulario
    }
  })
  .select()
  .single();
```

### Validar Carta Porte v3.1
```typescript
// RPC /validate_carta_porte_v31_compliance
const { data, error } = await supabase.rpc(
  'validate_carta_porte_v31_compliance',
  { carta_porte_data: formData }
);

// Response
interface ValidationResult {
  valido: boolean;
  errores: string[];
  warnings: string[];
  score: number;
}
```

## 🔧 Sistema de Mantenimiento

### Obtener Alertas de Mantenimiento
```typescript
// RPC /check_maintenance_alerts
const { data, error } = await supabase.rpc(
  'check_maintenance_alerts',
  { p_user_id: userId }
);

interface AlertaMantenimiento {
  vehiculo_id: string;
  placa: string;
  tipo_alerta: string;
  descripcion: string;
  dias_restantes: number;
  kilometros_restantes: number;
  urgencia: 'normal' | 'pronto' | 'urgente';
}
```

### Crear Mantenimiento Programado
```typescript
// POST /mantenimientos_programados
const { data, error } = await supabase
  .from('mantenimientos_programados')
  .insert({
    vehiculo_id: 'uuid-vehiculo',
    tipo_mantenimiento: 'preventivo',
    descripcion: 'Cambio de aceite y filtros',
    fecha_programada: '2024-08-15',
    kilometraje_programado: 55000,
    costo_estimado: 2500.00,
    taller_id: 'uuid-taller'
  })
  .select()
  .single();
```

### Obtener Talleres Disponibles
```typescript
// GET /talleres
const { data, error } = await supabase
  .from('talleres')
  .select(`
    *,
    reviews_talleres(calificacion, comentario)
  `)
  .eq('activo', true)
  .order('calificacion_promedio', { ascending: false });

interface Taller {
  id: string;
  nombre: string;
  rfc?: string;
  direccion: any;
  telefono?: string;
  email?: string;
  especialidades: string[];
  certificaciones: string[];
  calificacion_promedio: number;
  total_reviews: number;
  precios_promedio: any;
  horarios: any;
  activo: boolean;
}
```

## 📊 Analytics y Reportes

### Obtener Métricas del Dashboard
```typescript
// Custom hook para métricas
const { data } = useQuery(['dashboard-metrics'], async () => {
  const [vehiculos, conductores, cartasPorte, mantenimientos] = await Promise.all([
    supabase.from('vehiculos').select('*', { count: 'exact', head: true }),
    supabase.from('conductores').select('*', { count: 'exact', head: true }),
    supabase.from('cartas_porte').select('*', { count: 'exact', head: true }),
    supabase.from('mantenimientos_programados')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente')
  ]);

  return {
    totalVehiculos: vehiculos.count,
    totalConductores: conductores.count,
    totalCartasPorte: cartasPorte.count,
    mantenimientosPendientes: mantenimientos.count
  };
});
```

### Análisis de Viajes
```typescript
// GET /analisis_viajes
const { data, error } = await supabase
  .from('analisis_viajes')
  .select('*')
  .gte('fecha_viaje', startDate)
  .lte('fecha_viaje', endDate)
  .order('fecha_viaje', { ascending: false });

interface AnalisisViaje {
  id: string;
  user_id: string;
  viaje_id?: string;
  ruta_hash: string;
  fecha_viaje: string;
  costo_estimado?: number;
  costo_real?: number;
  tiempo_estimado?: number;
  tiempo_real?: number;
  precio_cobrado?: number;
  margen_real?: number;
  vehiculo_tipo?: string;
  cliente_id?: string;
}
```

## 🗂️ Catálogos SAT

### Códigos Postales
```typescript
// RPC /buscar_codigo_postal
const { data, error } = await supabase.rpc(
  'buscar_codigo_postal',
  { cp_input: '01000' }
);

// Response
interface CodigoPostal {
  codigo_postal: string;
  estado: string;
  estado_clave: string;
  municipio: string;
  municipio_clave: string;
  localidad: string;
  ciudad: string;
  zona: string;
  colonias: Array<{
    nombre: string;
    tipo: string;
  }>;
}
```

### Catálogo de Productos y Servicios
```typescript
// GET /cat_clave_prod_serv_cp
const { data, error } = await supabase
  .from('cat_clave_prod_serv_cp')
  .select('*')
  .ilike('descripcion', `%${searchTerm}%`)
  .limit(50);
```

### Catálogo de Unidades
```typescript
// GET /cat_clave_unidad
const { data, error } = await supabase
  .from('cat_clave_unidad')
  .select('*')
  .order('clave_unidad');
```

## 🔄 Real-time Subscriptions

### Suscripción a Cambios
```typescript
// Escuchar cambios en tiempo real
const channel = supabase
  .channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'vehiculos'
    },
    (payload) => {
      console.log('Nuevo vehículo:', payload.new);
      // Actualizar UI
    }
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

## 🚀 Edge Functions

### Timbrado de CFDI
```typescript
// POST /functions/v1/timbrar-invoice
const { data, error } = await supabase.functions.invoke('timbrar-invoice', {
  body: {
    cartaPorteId: 'uuid',
    xmlContent: xmlString,
    rfcEmisor: 'ABC123456789'
  }
});
```

### Cálculo de Rutas
```typescript
// POST /functions/v1/google-directions
const { data, error } = await supabase.functions.invoke('google-directions', {
  body: {
    origin: 'Ciudad de México',
    destination: 'Guadalajara, Jalisco',
    waypoints: ['Querétaro']
  }
});
```

## ❌ Manejo de Errores

### Códigos de Error Comunes
```typescript
interface SupabaseError {
  message: string;
  details: string;
  hint?: string;
  code: string;
}

// Códigos comunes:
// 23505: unique_violation
// 23503: foreign_key_violation
// 42501: insufficient_privilege
// PGRST116: row_not_found
```

### Manejo de Errores en Hooks
```typescript
const useVehiculos = () => {
  const { data, error, isLoading } = useQuery(
    ['vehiculos'],
    fetchVehiculos,
    {
      onError: (error) => {
        console.error('Error fetching vehiculos:', error);
        toast.error('Error al cargar vehículos');
      }
    }
  );

  return { data, error, isLoading };
};
```

## 📊 Rate Limiting

### Límites por Endpoint
```
GET requests: 100/minute
POST requests: 60/minute
PUT/PATCH requests: 60/minute
DELETE requests: 30/minute
```

### Headers de Rate Limit
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

Esta documentación cubre los endpoints principales del sistema Interconecta Trucking con ejemplos prácticos de uso.
