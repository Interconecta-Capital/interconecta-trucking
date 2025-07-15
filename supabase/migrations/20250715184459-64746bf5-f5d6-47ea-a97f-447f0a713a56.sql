-- Fase 1D: Funciones de validación y automatización

-- 1. Función para verificar disponibilidad de recursos
CREATE OR REPLACE FUNCTION public.verificar_disponibilidad_recurso(
  p_entidad_tipo text,
  p_entidad_id uuid,
  p_fecha_inicio timestamp with time zone,
  p_fecha_fin timestamp with time zone,
  p_user_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conflictos jsonb := '[]'::jsonb;
  recurso_estado text;
  fecha_disponible timestamp with time zone;
BEGIN
  -- Verificar estado actual del recurso
  IF p_entidad_tipo = 'conductor' THEN
    SELECT estado, fecha_proxima_disponibilidad 
    INTO recurso_estado, fecha_disponible
    FROM public.conductores 
    WHERE id = p_entidad_id AND user_id = p_user_id;
  ELSIF p_entidad_tipo = 'vehiculo' THEN
    SELECT estado, fecha_proxima_disponibilidad 
    INTO recurso_estado, fecha_disponible
    FROM public.vehiculos 
    WHERE id = p_entidad_id AND user_id = p_user_id;
  ELSIF p_entidad_tipo = 'remolque' THEN
    SELECT estado, fecha_proxima_disponibilidad 
    INTO recurso_estado, fecha_disponible
    FROM public.remolques 
    WHERE id = p_entidad_id AND user_id = p_user_id;
  END IF;

  -- Verificar si está disponible
  IF recurso_estado != 'disponible' THEN
    conflictos := jsonb_build_array(
      jsonb_build_object(
        'tipo', 'estado_no_disponible',
        'mensaje', 'El recurso está en estado: ' || recurso_estado,
        'fecha_disponible', fecha_disponible
      )
    );
  END IF;

  -- Verificar conflictos con programaciones existentes
  SELECT jsonb_agg(
    jsonb_build_object(
      'tipo', 'conflicto_programacion',
      'descripcion', descripcion,
      'fecha_inicio', fecha_inicio,
      'fecha_fin', fecha_fin,
      'tipo_programacion', tipo_programacion
    )
  ) INTO conflictos
  FROM public.programaciones
  WHERE entidad_tipo = p_entidad_tipo 
    AND entidad_id = p_entidad_id 
    AND user_id = p_user_id
    AND estado IN ('programado', 'en_curso')
    AND (
      (fecha_inicio <= p_fecha_fin AND fecha_fin >= p_fecha_inicio) OR
      (sin_fecha_fin = true AND fecha_inicio <= p_fecha_fin)
    );

  RETURN jsonb_build_object(
    'disponible', CASE WHEN conflictos = '[]'::jsonb AND recurso_estado = 'disponible' THEN true ELSE false END,
    'conflictos', COALESCE(conflictos, '[]'::jsonb),
    'estado_actual', recurso_estado,
    'fecha_proxima_disponibilidad', fecha_disponible
  );
END;
$$;

-- 2. Función para actualizar estados automáticamente
CREATE OR REPLACE FUNCTION public.actualizar_estados_viaje()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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

    -- Actualizar estado del vehículo
    IF NEW.vehiculo_id IS NOT NULL THEN
      UPDATE public.vehiculos 
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
        conductor_asignado_id = CASE NEW.estado
          WHEN 'completado' THEN NULL
          WHEN 'cancelado' THEN NULL
          ELSE NEW.conductor_id
        END,
        fecha_proxima_disponibilidad = CASE NEW.estado
          WHEN 'completado' THEN NULL
          WHEN 'cancelado' THEN NULL
          ELSE NEW.fecha_fin_programada
        END
      WHERE id = NEW.vehiculo_id;
    END IF;

    -- Crear registro de costos si no existe
    IF TG_OP = 'INSERT' AND NEW.costo_estimado > 0 THEN
      INSERT INTO public.costos_viaje (
        viaje_id, user_id, costo_total_estimado, precio_cotizado
      ) VALUES (
        NEW.id, NEW.user_id, NEW.costo_estimado, NEW.precio_cobrado
      ) ON CONFLICT DO NOTHING;
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

-- 3. Crear trigger para actualización automática de estados
CREATE TRIGGER trigger_actualizar_estados_viaje
  AFTER INSERT OR UPDATE ON public.viajes
  FOR EACH ROW
  EXECUTE FUNCTION public.actualizar_estados_viaje();