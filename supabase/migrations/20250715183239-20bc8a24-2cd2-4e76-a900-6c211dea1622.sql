-- Fase 1: Mejoras de Base de Datos para Unificación de Estados

-- 1. Agregar campos faltantes a tabla viajes
ALTER TABLE public.viajes 
ADD COLUMN IF NOT EXISTS socio_id uuid REFERENCES socios(id),
ADD COLUMN IF NOT EXISTS costo_estimado numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS costo_real numeric,
ADD COLUMN IF NOT EXISTS precio_cobrado numeric,
ADD COLUMN IF NOT EXISTS margen_estimado numeric,
ADD COLUMN IF NOT EXISTS margen_real numeric,
ADD COLUMN IF NOT EXISTS remolque_id uuid,
ADD COLUMN IF NOT EXISTS ruta_origen text,
ADD COLUMN IF NOT EXISTS ruta_destino text,
ADD COLUMN IF NOT EXISTS distancia_km numeric,
ADD COLUMN IF NOT EXISTS tiempo_estimado_horas numeric,
ADD COLUMN IF NOT EXISTS tiempo_real_horas numeric,
ADD COLUMN IF NOT EXISTS combustible_estimado numeric,
ADD COLUMN IF NOT EXISTS combustible_real numeric,
ADD COLUMN IF NOT EXISTS peajes_estimados numeric,
ADD COLUMN IF NOT EXISTS peajes_reales numeric;

-- 2. Agregar campos faltantes a tabla cartas_porte
ALTER TABLE public.cartas_porte 
ADD COLUMN IF NOT EXISTS viaje_id uuid REFERENCES viajes(id),
ADD COLUMN IF NOT EXISTS conductor_principal_id uuid,
ADD COLUMN IF NOT EXISTS vehiculo_principal_id uuid,
ADD COLUMN IF NOT EXISTS remolque_principal_id uuid;

-- 3. Agregar campos a tabla vehiculos para estado y relaciones
ALTER TABLE public.vehiculos 
ADD COLUMN IF NOT EXISTS conductor_asignado_id uuid REFERENCES conductores(id),
ADD COLUMN IF NOT EXISTS viaje_actual_id uuid REFERENCES viajes(id),
ADD COLUMN IF NOT EXISTS fecha_proxima_disponibilidad timestamp with time zone,
ADD COLUMN IF NOT EXISTS motivo_no_disponible text,
ADD COLUMN IF NOT EXISTS ubicacion_actual text,
ADD COLUMN IF NOT EXISTS kilometraje_actual numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS consumo_promedio_km_litro numeric DEFAULT 10,
ADD COLUMN IF NOT EXISTS costo_operacion_km numeric DEFAULT 5.50,
ADD COLUMN IF NOT EXISTS vigencia_seguro date,
ADD COLUMN IF NOT EXISTS verificacion_vigencia date,
ADD COLUMN IF NOT EXISTS ultima_ubicacion_lat numeric,
ADD COLUMN IF NOT EXISTS ultima_ubicacion_lng numeric,
ADD COLUMN IF NOT EXISTS ultima_actualizacion_ubicacion timestamp with time zone;

-- 4. Agregar campos a tabla conductores para estado y relaciones  
ALTER TABLE public.conductores 
ADD COLUMN IF NOT EXISTS vehiculo_asignado_id uuid REFERENCES vehiculos(id),
ADD COLUMN IF NOT EXISTS viaje_actual_id uuid REFERENCES viajes(id),
ADD COLUMN IF NOT EXISTS fecha_proxima_disponibilidad timestamp with time zone,
ADD COLUMN IF NOT EXISTS motivo_no_disponible text,
ADD COLUMN IF NOT EXISTS ubicacion_actual text,
ADD COLUMN IF NOT EXISTS salario_base numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS porcentaje_comision numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS banco_cuenta text,
ADD COLUMN IF NOT EXISTS banco_clabe text,
ADD COLUMN IF NOT EXISTS contacto_emergencia_nombre text,
ADD COLUMN IF NOT EXISTS contacto_emergencia_telefono text;

-- 5. Crear tabla de remolques
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
  vehiculo_asignado_id uuid REFERENCES vehiculos(id),
  viaje_actual_id uuid REFERENCES viajes(id),
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

-- 6. Crear tabla de programaciones/reservas de recursos
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

-- 7. Mejorar tabla socios agregando campos de seguimiento
ALTER TABLE public.socios 
ADD COLUMN IF NOT EXISTS viajes_activos integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ultimo_viaje_fecha timestamp with time zone,
ADD COLUMN IF NOT EXISTS ultimo_viaje_id uuid REFERENCES viajes(id),
ADD COLUMN IF NOT EXISTS total_viajes_completados integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ingresos_mes_actual numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS ingresos_totales numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS calificacion_promedio numeric DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS vehiculos_asignados integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS conductores_asignados integer DEFAULT 0;

-- 8. Crear tabla de costos por viaje (detallado)
CREATE TABLE IF NOT EXISTS public.costos_viaje (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viaje_id uuid NOT NULL REFERENCES viajes(id),
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

-- 9. Habilitar RLS en las nuevas tablas
ALTER TABLE public.remolques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programaciones ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.costos_viaje ENABLE ROW LEVEL SECURITY;

-- 10. Crear políticas RLS
CREATE POLICY "Users can manage their own remolques" ON public.remolques
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own programaciones" ON public.programaciones
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own costos_viaje" ON public.costos_viaje
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 11. Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_viajes_estado ON public.viajes(estado);
CREATE INDEX IF NOT EXISTS idx_viajes_conductor_vehiculo ON public.viajes(conductor_id, vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_viajes_fechas ON public.viajes(fecha_inicio_programada, fecha_fin_programada);
CREATE INDEX IF NOT EXISTS idx_vehiculos_estado ON public.vehiculos(estado);
CREATE INDEX IF NOT EXISTS idx_conductores_estado ON public.conductores(estado);
CREATE INDEX IF NOT EXISTS idx_remolques_estado ON public.remolques(estado);
CREATE INDEX IF NOT EXISTS idx_programaciones_fechas ON public.programaciones(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_programaciones_entidad ON public.programaciones(entidad_tipo, entidad_id);

-- 12. Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_remolques_updated_at
    BEFORE UPDATE ON public.remolques
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programaciones_updated_at
    BEFORE UPDATE ON public.programaciones
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_costos_viaje_updated_at
    BEFORE UPDATE ON public.costos_viaje
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();