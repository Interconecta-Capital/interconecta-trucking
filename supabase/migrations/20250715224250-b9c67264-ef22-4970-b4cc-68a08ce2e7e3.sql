-- Mejorar trigger para manejar eliminación y cancelación de viajes

-- Actualizar función para manejar DELETE y cambios de estado
CREATE OR REPLACE FUNCTION public.actualizar_estados_viaje()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Manejar DELETE (cuando se elimina un viaje)
  IF TG_OP = 'DELETE' THEN
    -- Liberar conductor
    IF OLD.conductor_id IS NOT NULL THEN
      UPDATE public.conductores 
      SET 
        estado = 'disponible',
        viaje_actual_id = NULL,
        fecha_proxima_disponibilidad = NULL
      WHERE id = OLD.conductor_id;
    END IF;

    -- Liberar vehículo
    IF OLD.vehiculo_id IS NOT NULL THEN
      UPDATE public.vehiculos 
      SET 
        estado = 'disponible',
        viaje_actual_id = NULL,
        fecha_proxima_disponibilidad = NULL
      WHERE id = OLD.vehiculo_id;
    END IF;

    -- Liberar remolque
    IF OLD.remolque_id IS NOT NULL THEN
      UPDATE public.remolques 
      SET 
        estado = 'disponible',
        viaje_actual_id = NULL,
        fecha_proxima_disponibilidad = NULL
      WHERE id = OLD.remolque_id;
    END IF;

    RETURN OLD;
  END IF;

  -- Manejar INSERT y UPDATE
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.estado != NEW.estado) THEN
    
    -- Actualizar estado del conductor
    IF NEW.conductor_id IS NOT NULL THEN
      UPDATE public.conductores 
      SET 
        estado = CASE NEW.estado
          WHEN 'programado' THEN 'disponible'
          WHEN 'en_transito' THEN 'en_viaje'
          WHEN 'completado' THEN 'disponible'
          WHEN 'cancelado' THEN 'disponible'
          ELSE estado
        END,
        viaje_actual_id = CASE NEW.estado
          WHEN 'completado' THEN NULL
          WHEN 'cancelado' THEN NULL
          ELSE NEW.id
        END,
        fecha_proxima_disponibilidad = CASE NEW.estado
          WHEN 'completado' THEN NULL
          WHEN 'cancelado' THEN NULL
          ELSE NEW.fecha_fin_programada
        END
      WHERE id = NEW.conductor_id;
    END IF;

    -- Actualizar estado del vehículo
    IF NEW.vehiculo_id IS NOT NULL THEN
      UPDATE public.vehiculos 
      SET 
        estado = CASE NEW.estado
          WHEN 'programado' THEN 'disponible'
          WHEN 'en_transito' THEN 'en_viaje'
          WHEN 'completado' THEN 'disponible'
          WHEN 'cancelado' THEN 'disponible'
          ELSE estado
        END,
        viaje_actual_id = CASE NEW.estado
          WHEN 'completado' THEN NULL
          WHEN 'cancelado' THEN NULL
          ELSE NEW.id
        END,
        fecha_proxima_disponibilidad = CASE NEW.estado
          WHEN 'completado' THEN NULL
          WHEN 'cancelado' THEN NULL
          ELSE NEW.fecha_fin_programada
        END
      WHERE id = NEW.vehiculo_id;
    END IF;

    -- Actualizar estado del remolque si existe
    IF NEW.remolque_id IS NOT NULL THEN
      UPDATE public.remolques 
      SET 
        estado = CASE NEW.estado
          WHEN 'programado' THEN 'disponible'
          WHEN 'en_transito' THEN 'en_viaje'
          WHEN 'completado' THEN 'disponible'
          WHEN 'cancelado' THEN 'disponible'
          ELSE estado
        END,
        viaje_actual_id = CASE NEW.estado
          WHEN 'completado' THEN NULL
          WHEN 'cancelado' THEN NULL
          ELSE NEW.id
        END,
        fecha_proxima_disponibilidad = CASE NEW.estado
          WHEN 'completado' THEN NULL
          WHEN 'cancelado' THEN NULL
          ELSE NEW.fecha_fin_programada
        END
      WHERE id = NEW.remolque_id;
    END IF;

  END IF;

  RETURN NEW;
END;
$function$;

-- Recrear trigger para incluir DELETE
DROP TRIGGER IF EXISTS trigger_actualizar_estados_viaje ON public.viajes;

CREATE TRIGGER trigger_actualizar_estados_viaje
  AFTER INSERT OR UPDATE OR DELETE ON public.viajes
  FOR EACH ROW
  EXECUTE FUNCTION public.actualizar_estados_viaje();