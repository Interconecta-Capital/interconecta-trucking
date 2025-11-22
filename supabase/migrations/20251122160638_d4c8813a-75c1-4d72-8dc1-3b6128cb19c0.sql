-- FASE 1: Corrección de esquema y funciones para remolques
-- ISO 27001 A.18.1.3 - Integridad de datos y trazabilidad

-- 1.1 Agregar columna faltante a remolques
ALTER TABLE public.remolques 
ADD COLUMN IF NOT EXISTS fecha_proxima_disponibilidad TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.remolques.fecha_proxima_disponibilidad 
IS 'ISO 27001 A.18.1.3 - Fecha estimada de disponibilidad del remolque tras viaje asignado';

-- 1.2 Actualizar función trigger para manejar remolques correctamente
CREATE OR REPLACE FUNCTION public.actualizar_metricas_tiempo_real_v2()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  -- Actualizar conductor: usar estados válidos del CHECK constraint
  IF NEW.conductor_id IS NOT NULL THEN
    UPDATE public.conductores 
    SET viaje_actual_id = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN NEW.id 
      ELSE NULL 
    END,
    estado = CASE 
      WHEN NEW.estado = 'en_transito' THEN 'en_viaje'
      WHEN NEW.estado = 'programado' THEN 'disponible'
      WHEN NEW.estado IN ('completado', 'cancelado') THEN 'disponible'
      ELSE estado
    END,
    fecha_proxima_disponibilidad = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN NEW.fecha_fin_programada
      ELSE NULL
    END
    WHERE id = NEW.conductor_id;
  END IF;
  
  -- Actualizar vehículo
  IF NEW.vehiculo_id IS NOT NULL THEN
    UPDATE public.vehiculos 
    SET estado = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN 'en_viaje'
      WHEN NEW.estado IN ('completado', 'cancelado') THEN 'disponible'
      ELSE estado
    END,
    viaje_actual_id = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN NEW.id 
      ELSE NULL 
    END,
    fecha_proxima_disponibilidad = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN NEW.fecha_fin_programada
      ELSE NULL
    END
    WHERE id = NEW.vehiculo_id;
  END IF;
  
  -- Actualizar remolque con la columna ahora existente
  IF NEW.remolque_id IS NOT NULL THEN
    UPDATE public.remolques 
    SET viaje_actual_id = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN NEW.id 
      ELSE NULL 
    END,
    estado = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN 'asignado'
      WHEN NEW.estado IN ('completado', 'cancelado') THEN 'disponible'
      ELSE estado
    END,
    fecha_proxima_disponibilidad = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN NEW.fecha_fin_programada
      ELSE NULL
    END
    WHERE id = NEW.remolque_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 1.3 Índice para mejorar consultas de disponibilidad
CREATE INDEX IF NOT EXISTS idx_remolques_disponibilidad 
ON public.remolques(estado, fecha_proxima_disponibilidad) 
WHERE activo = true;

COMMENT ON INDEX idx_remolques_disponibilidad 
IS 'Optimiza consultas de disponibilidad de remolques para asignación de viajes';