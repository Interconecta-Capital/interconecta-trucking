-- Fase 1A: Agregar campos básicos a tablas existentes

-- 1. Agregar campos faltantes a tabla viajes
ALTER TABLE public.viajes 
ADD COLUMN IF NOT EXISTS socio_id uuid,
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
ADD COLUMN IF NOT EXISTS viaje_id uuid,
ADD COLUMN IF NOT EXISTS conductor_principal_id uuid,
ADD COLUMN IF NOT EXISTS vehiculo_principal_id uuid,
ADD COLUMN IF NOT EXISTS remolque_principal_id uuid;

-- 3. Agregar campos a tabla vehiculos para estado y relaciones
ALTER TABLE public.vehiculos 
ADD COLUMN IF NOT EXISTS conductor_asignado_id uuid,
ADD COLUMN IF NOT EXISTS viaje_actual_id uuid,
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
ADD COLUMN IF NOT EXISTS vehiculo_asignado_id uuid,
ADD COLUMN IF NOT EXISTS viaje_actual_id uuid,
ADD COLUMN IF NOT EXISTS fecha_proxima_disponibilidad timestamp with time zone,
ADD COLUMN IF NOT EXISTS motivo_no_disponible text,
ADD COLUMN IF NOT EXISTS ubicacion_actual text,
ADD COLUMN IF NOT EXISTS salario_base numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS porcentaje_comision numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS banco_cuenta text,
ADD COLUMN IF NOT EXISTS banco_clabe text,
ADD COLUMN IF NOT EXISTS contacto_emergencia_nombre text,
ADD COLUMN IF NOT EXISTS contacto_emergencia_telefono text;

-- 5. Mejorar tabla socios agregando campos de seguimiento
ALTER TABLE public.socios 
ADD COLUMN IF NOT EXISTS viajes_activos integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ultimo_viaje_fecha timestamp with time zone,
ADD COLUMN IF NOT EXISTS ultimo_viaje_id uuid,
ADD COLUMN IF NOT EXISTS total_viajes_completados integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ingresos_mes_actual numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS ingresos_totales numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS calificacion_promedio numeric DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS vehiculos_asignados integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS conductores_asignados integer DEFAULT 0;