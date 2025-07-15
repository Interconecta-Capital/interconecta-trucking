-- Fase 1B: Crear nuevas tablas

-- 1. Crear tabla de remolques
CREATE TABLE IF NOT EXISTS public.remolques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  numero_serie text NOT NULL,
  placa text NOT NULL,
  marca text,
  modelo text,
  año integer,
  tipo_remolque text NOT NULL DEFAULT 'semirremolque',
  capacidad_carga_kg numeric NOT NULL DEFAULT 0,
  estado text NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'asignado', 'en_transito', 'mantenimiento', 'fuera_servicio', 'vendido', 'robado')),
  vehiculo_asignado_id uuid,
  viaje_actual_id uuid,
  fecha_proxima_disponibilidad timestamp with time zone,
  motivo_no_disponible text,
  ubicacion_actual text,
  vigencia_seguro date,
  verificacion_vigencia date,
  observaciones text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(placa),
  UNIQUE(numero_serie)
);

-- 2. Crear tabla de programaciones/reservas de recursos
CREATE TABLE IF NOT EXISTS public.programaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  entidad_tipo text NOT NULL CHECK (entidad_tipo IN ('conductor', 'vehiculo', 'remolque', 'socio')),
  entidad_id uuid NOT NULL,
  tipo_programacion text NOT NULL CHECK (tipo_programacion IN ('viaje', 'mantenimiento', 'baja_temporal', 'vacaciones', 'reparacion', 'inspeccion', 'capacitacion')),
  fecha_inicio timestamp with time zone NOT NULL,
  fecha_fin timestamp with time zone,
  sin_fecha_fin boolean DEFAULT false,
  estado text NOT NULL DEFAULT 'programado' CHECK (estado IN ('programado', 'en_curso', 'completado', 'cancelado', 'reprogramado')),
  descripcion text NOT NULL,
  costo numeric,
  proveedor text,
  observaciones text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Crear tabla de costos por viaje (detallado)
CREATE TABLE IF NOT EXISTS public.costos_viaje (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viaje_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  
  -- Costos estimados (al crear viaje)
  combustible_estimado numeric DEFAULT 0,
  peajes_estimados numeric DEFAULT 0,
  casetas_estimadas numeric DEFAULT 0,
  mantenimiento_estimado numeric DEFAULT 0,
  salario_conductor_estimado numeric DEFAULT 0,
  otros_costos_estimados numeric DEFAULT 0,
  costo_total_estimado numeric DEFAULT 0,
  
  -- Costos reales (al finalizar viaje)  
  combustible_real numeric,
  peajes_reales numeric,
  casetas_reales numeric,
  mantenimiento_real numeric,
  salario_conductor_real numeric,
  otros_costos_reales numeric,
  costo_total_real numeric,
  
  -- Precios y márgenes
  precio_cotizado numeric DEFAULT 0,
  precio_final_cobrado numeric,
  margen_estimado numeric DEFAULT 0,
  margen_real numeric,
  
  -- Metadatos
  notas_costos text,
  comprobantes_urls jsonb DEFAULT '[]'::jsonb,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Habilitar RLS en las nuevas tablas
ALTER TABLE public.remolques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programaciones ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.costos_viaje ENABLE ROW LEVEL SECURITY;