-- FASE 5: Limpiar datos existentes con estados inválidos
-- Verificar y corregir conductores con estados problemáticos
UPDATE conductores 
SET estado = 'disponible'
WHERE estado NOT IN ('disponible', 'en_viaje', 'descanso', 'vacaciones', 'baja_temporal', 'fuera_servicio');

-- FASE 1 Opción B: Corregir el trigger actualizar_metricas_tiempo_real
-- Eliminar el trigger problemático existente
DROP TRIGGER IF EXISTS trigger_actualizar_metricas_tiempo_real ON viajes;

-- Crear función corregida que usa solo estados válidos
CREATE OR REPLACE FUNCTION public.actualizar_metricas_tiempo_real_fixed()
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
      WHEN NEW.estado IN ('programado', 'en_transito') THEN 'en_uso'
      ELSE 'disponible'
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
  
  -- Actualizar remolque
  IF NEW.remolque_id IS NOT NULL THEN
    UPDATE public.remolques 
    SET estado = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN 'en_uso'
      ELSE 'disponible'
    END,
    viaje_actual_id = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN NEW.id 
      ELSE NULL 
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

-- Recrear trigger con la función corregida
CREATE TRIGGER trigger_actualizar_metricas_tiempo_real
AFTER INSERT OR UPDATE ON public.viajes
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_metricas_tiempo_real_fixed();