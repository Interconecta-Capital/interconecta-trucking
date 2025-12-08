# Tablas Principales del Negocio

## viajes

Tabla central que representa los viajes de transporte.

```sql
CREATE TABLE public.viajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Información básica
  nombre_viaje VARCHAR,
  descripcion TEXT,
  estado TEXT DEFAULT 'programado',
  -- Estados: programado, en_curso, completado, cancelado
  
  -- Fechas
  fecha_inicio_programada TIMESTAMPTZ,
  fecha_fin_programada TIMESTAMPTZ,
  fecha_inicio_real TIMESTAMPTZ,
  fecha_fin_real TIMESTAMPTZ,
  
  -- Recursos asignados
  conductor_id UUID REFERENCES conductores(id),
  vehiculo_id UUID REFERENCES vehiculos(id),
  remolque_id UUID REFERENCES remolques(id),
  socio_id UUID REFERENCES socios(id),
  
  -- Ubicaciones
  origen TEXT,
  destino TEXT,
  origen_coordenadas JSONB,
  destino_coordenadas JSONB,
  
  -- Tracking
  tracking_data JSONB DEFAULT '{}'::jsonb,
  
  -- Relación fiscal
  carta_porte_id UUID REFERENCES cartas_porte(id),
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### RLS Policies
```sql
-- Usuarios solo ven sus propios viajes
USING (auth.uid() = user_id OR is_superuser_secure(auth.uid()))
```

---

## conductores

Conductores/operadores de transporte.

```sql
CREATE TABLE public.conductores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Datos personales
  nombre VARCHAR NOT NULL,
  email VARCHAR,
  telefono VARCHAR,
  curp VARCHAR,
  rfc VARCHAR,
  
  -- Licencia
  tipo_licencia VARCHAR,
  num_licencia VARCHAR,
  vigencia_licencia DATE,
  foto_licencia_url TEXT,
  foto_licencia_encrypted BYTEA,
  
  -- Estado operativo
  estado TEXT DEFAULT 'disponible',
  -- Estados: disponible, en_viaje, descanso, no_disponible
  activo BOOLEAN DEFAULT true,
  operador_sct BOOLEAN DEFAULT false,
  
  -- Compensación
  salario_base NUMERIC DEFAULT 0,
  porcentaje_comision NUMERIC DEFAULT 0,
  banco_cuenta TEXT,
  banco_clabe TEXT,
  
  -- Contacto emergencia
  contacto_emergencia_nombre TEXT,
  contacto_emergencia_telefono TEXT,
  
  -- Dirección
  direccion JSONB,
  residencia_fiscal VARCHAR DEFAULT 'MEX',
  num_reg_id_trib VARCHAR,
  
  -- Performance
  historial_performance JSONB DEFAULT '{
    "viajes_completados": 0,
    "km_totales": 0,
    "calificacion_promedio": 5.0,
    "puntualidad_promedio": 95,
    "incidentes": 0
  }'::jsonb,
  
  -- Certificaciones
  certificaciones JSONB DEFAULT '{
    "materiales_peligrosos": false,
    "manejo_defensivo": false,
    "primeros_auxilios": false
  }'::jsonb,
  
  -- Preferencias
  preferencias JSONB,
  
  -- Asignaciones actuales
  vehiculo_asignado_id UUID,
  viaje_actual_id UUID,
  ubicacion_actual TEXT,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## vehiculos

Flota de vehículos.

```sql
CREATE TABLE public.vehiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Identificación
  placa VARCHAR NOT NULL,
  numero_economico VARCHAR,
  marca VARCHAR,
  modelo VARCHAR,
  anio_modelo INTEGER,
  numero_serie_vin VARCHAR,
  
  -- Tipo y configuración
  tipo_vehiculo VARCHAR,
  config_vehicular VARCHAR, -- Clave SAT: C2, C3, T2S1, etc.
  tipo_carroceria VARCHAR,
  
  -- Capacidades
  peso_bruto_vehicular NUMERIC,
  carga_maxima_kg NUMERIC,
  num_ejes INTEGER,
  num_llantas INTEGER,
  
  -- Permisos SCT
  perm_sct VARCHAR,
  num_permiso_sct VARCHAR,
  
  -- Combustible
  tipo_combustible VARCHAR, -- diesel, gasolina, gas
  capacidad_tanque NUMERIC,
  rendimiento_km_litro NUMERIC,
  
  -- Seguros
  aseguradora_resp_civil VARCHAR,
  poliza_resp_civil VARCHAR,
  vigencia_resp_civil DATE,
  aseguradora_carga VARCHAR,
  poliza_carga VARCHAR,
  aseguradora_ambiental VARCHAR,
  poliza_ambiental VARCHAR,
  
  -- Verificaciones
  tarjeta_circulacion VARCHAR,
  vigencia_tarjeta DATE,
  verificacion_ambiental DATE,
  
  -- Estado
  estado TEXT DEFAULT 'disponible',
  -- Estados: disponible, en_uso, mantenimiento, fuera_servicio
  activo BOOLEAN DEFAULT true,
  
  -- Mantenimiento
  ultimo_mantenimiento DATE,
  proximo_mantenimiento DATE,
  km_actual NUMERIC DEFAULT 0,
  km_proximo_servicio NUMERIC,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## remolques

Remolques y semirremolques.

```sql
CREATE TABLE public.remolques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Identificación
  placa VARCHAR NOT NULL,
  subtipo_rem VARCHAR, -- Clave SAT
  numero_economico VARCHAR,
  
  -- Capacidades
  peso_bruto NUMERIC,
  capacidad_kg NUMERIC,
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  estado TEXT DEFAULT 'disponible',
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## socios

Socios transportistas (propietarios de vehículos externos).

```sql
CREATE TABLE public.socios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Datos fiscales
  rfc VARCHAR NOT NULL,
  razon_social VARCHAR NOT NULL,
  nombre_comercial VARCHAR,
  regimen_fiscal VARCHAR,
  
  -- Contacto
  email VARCHAR,
  telefono VARCHAR,
  
  -- Dirección
  domicilio_fiscal JSONB,
  
  -- Bancarios
  banco VARCHAR,
  cuenta VARCHAR,
  clabe VARCHAR,
  
  -- Porcentajes
  porcentaje_comision NUMERIC DEFAULT 0,
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## clientes_proveedores

Clientes y proveedores (receptores de CFDI).

```sql
CREATE TABLE public.clientes_proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  
  -- Datos fiscales
  rfc VARCHAR NOT NULL,
  nombre_razon_social VARCHAR NOT NULL,
  regimen_fiscal VARCHAR,
  uso_cfdi VARCHAR,
  
  -- Tipo
  tipo VARCHAR, -- 'cliente', 'proveedor', 'ambos'
  
  -- Domicilio
  domicilio_fiscal JSONB,
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## configuracion_empresa

Configuración fiscal del emisor.

```sql
CREATE TABLE public.configuracion_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  
  -- Datos fiscales
  rfc_emisor VARCHAR NOT NULL,
  razon_social VARCHAR NOT NULL,
  regimen_fiscal VARCHAR NOT NULL,
  
  -- Domicilio
  domicilio_fiscal JSONB NOT NULL DEFAULT '{}'::jsonb,
  pais VARCHAR DEFAULT 'MEX',
  
  -- Folios
  serie_carta_porte VARCHAR,
  folio_actual_carta_porte INTEGER DEFAULT 1,
  serie_factura VARCHAR,
  folio_actual_factura INTEGER DEFAULT 1,
  
  -- Permisos SCT
  permisos_sct JSONB,
  
  -- Seguros
  seguro_resp_civil JSONB,
  seguro_carga JSONB,
  seguro_ambiental JSONB,
  
  -- Configuración de timbrado
  proveedor_timbrado VARCHAR,
  modo_pruebas BOOLEAN DEFAULT true,
  
  -- Validaciones
  configuracion_completa BOOLEAN DEFAULT false,
  validado_sat BOOLEAN DEFAULT false,
  fecha_ultima_validacion TIMESTAMPTZ,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```
