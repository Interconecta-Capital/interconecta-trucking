-- CORRECCIÓN COMPLETA: Vehículos, Remolques y Trigger de Métricas
-- Limpiar datos existentes de vehículos con estados inválidos
UPDATE vehiculos 
SET estado = 'disponible'
WHERE estado NOT IN ('disponible', 'en_viaje', 'mantenimiento', 'revision', 'fuera_servicio');

-- Eliminar trigger y función anteriores
DROP TRIGGER IF EXISTS trigger_actualizar_metricas_tiempo_real ON viajes;
DROP FUNCTION IF EXISTS actualizar_metricas_tiempo_real_fixed();

-- Crear función corregida v2 que maneja correctamente todos los recursos
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
  
  -- Actualizar vehículo: USAR 'en_viaje' en lugar de 'en_uso'
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
  
  -- Actualizar remolque: SOLO viaje_actual_id (no tiene columna estado)
  IF NEW.remolque_id IS NOT NULL THEN
    -- Verificar si la columna viaje_actual_id existe antes de actualizar
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'remolques' 
      AND column_name = 'viaje_actual_id'
    ) THEN
      UPDATE public.remolques 
      SET viaje_actual_id = CASE 
        WHEN NEW.estado IN ('programado', 'en_transito') THEN NEW.id 
        ELSE NULL 
      END
      WHERE id = NEW.remolque_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recrear trigger con la función v2
CREATE TRIGGER trigger_actualizar_metricas_tiempo_real
AFTER INSERT OR UPDATE ON public.viajes
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_metricas_tiempo_real_v2();