-- Arreglar la sincronización de estados entre viajes y recursos (con estados correctos)

-- Crear o reemplazar el trigger para actualizar estados
CREATE OR REPLACE FUNCTION public.actualizar_estados_viaje()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Al crear o actualizar un viaje, actualizar estados de recursos
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.estado != NEW.estado) THEN
    
    -- Actualizar estado del conductor
    IF NEW.conductor_id IS NOT NULL THEN
      UPDATE public.conductores 
      SET 
        estado = CASE NEW.estado
          WHEN 'programado' THEN 'asignado'
          WHEN 'en_transito' THEN 'en_transito'
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

    -- Actualizar estado del vehículo (usando estados válidos)
    IF NEW.vehiculo_id IS NOT NULL THEN
      UPDATE public.vehiculos 
      SET 
        estado = CASE NEW.estado
          WHEN 'programado' THEN 'disponible'  -- Mantener disponible para programado
          WHEN 'en_transito' THEN 'en_viaje'   -- Mapear a en_viaje
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
          WHEN 'programado' THEN 'asignado'
          WHEN 'en_transito' THEN 'en_transito'
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

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS trigger_actualizar_estados_viaje ON public.viajes;

-- Crear el trigger
CREATE TRIGGER trigger_actualizar_estados_viaje
  AFTER INSERT OR UPDATE ON public.viajes
  FOR EACH ROW
  EXECUTE FUNCTION public.actualizar_estados_viaje();

-- Sincronizar estados existentes basándose en viajes activos
UPDATE public.vehiculos 
SET 
  estado = CASE v.estado
    WHEN 'programado' THEN 'disponible'  -- Mantener disponible para programado
    WHEN 'en_transito' THEN 'en_viaje'   -- Mapear a en_viaje
    ELSE 'disponible'
  END,
  viaje_actual_id = CASE v.estado
    WHEN 'completado' THEN NULL
    WHEN 'cancelado' THEN NULL
    ELSE v.id
  END,
  fecha_proxima_disponibilidad = CASE v.estado
    WHEN 'completado' THEN NULL
    WHEN 'cancelado' THEN NULL
    ELSE v.fecha_fin_programada
  END
FROM public.viajes v
WHERE vehiculos.id = v.vehiculo_id 
  AND v.estado IN ('programado', 'en_transito');

-- Sincronizar estados de conductores
UPDATE public.conductores 
SET 
  estado = CASE v.estado
    WHEN 'programado' THEN 'asignado'
    WHEN 'en_transito' THEN 'en_transito'
    ELSE 'disponible'
  END,
  viaje_actual_id = CASE v.estado
    WHEN 'completado' THEN NULL
    WHEN 'cancelado' THEN NULL
    ELSE v.id
  END,
  fecha_proxima_disponibilidad = CASE v.estado
    WHEN 'completado' THEN NULL
    WHEN 'cancelado' THEN NULL
    ELSE v.fecha_fin_programada
  END
FROM public.viajes v
WHERE conductores.id = v.conductor_id 
  AND v.estado IN ('programado', 'en_transito');

-- Asegurar que recursos sin viajes activos estén disponibles
UPDATE public.vehiculos 
SET 
  estado = 'disponible',
  viaje_actual_id = NULL,
  fecha_proxima_disponibilidad = NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.viajes v 
  WHERE v.vehiculo_id = vehiculos.id 
    AND v.estado IN ('programado', 'en_transito')
);

UPDATE public.conductores 
SET 
  estado = 'disponible',
  viaje_actual_id = NULL,
  fecha_proxima_disponibilidad = NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.viajes v 
  WHERE v.conductor_id = conductores.id 
    AND v.estado IN ('programado', 'en_transito')
);