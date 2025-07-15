-- Mejorar la función verificar_disponibilidad_recurso para detectar mejor los conflictos

CREATE OR REPLACE FUNCTION public.verificar_disponibilidad_recurso(
  p_entidad_tipo text, 
  p_entidad_id uuid, 
  p_fecha_inicio timestamp with time zone, 
  p_fecha_fin timestamp with time zone, 
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  conflictos jsonb := '[]'::jsonb;
  recurso_estado text;
  fecha_disponible timestamp with time zone;
  viajes_conflicto record;
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

  -- Verificar si está disponible por estado
  IF recurso_estado != 'disponible' THEN
    conflictos := jsonb_build_array(
      jsonb_build_object(
        'tipo', 'estado_no_disponible',
        'mensaje', 'El recurso está en estado: ' || COALESCE(recurso_estado, 'desconocido'),
        'fecha_disponible', fecha_disponible
      )
    );
  END IF;

  -- Verificar conflictos con viajes existentes
  IF p_entidad_tipo = 'conductor' THEN
    FOR viajes_conflicto IN
      SELECT 
        id, estado, fecha_inicio_programada, fecha_fin_programada,
        origen, destino
      FROM public.viajes
      WHERE conductor_id = p_entidad_id 
        AND user_id = p_user_id
        AND estado IN ('programado', 'en_transito')
        AND (
          (fecha_inicio_programada <= p_fecha_fin AND fecha_fin_programada >= p_fecha_inicio)
        )
    LOOP
      conflictos := conflictos || jsonb_build_array(
        jsonb_build_object(
          'tipo', 'conflicto_programacion',
          'descripcion', 'Viaje ' || viajes_conflicto.estado || ': ' || 
                        COALESCE(viajes_conflicto.origen, 'Sin origen') || ' - ' || 
                        COALESCE(viajes_conflicto.destino, 'Sin destino'),
          'fecha_inicio', viajes_conflicto.fecha_inicio_programada,
          'fecha_fin', viajes_conflicto.fecha_fin_programada,
          'tipo_programacion', 'Viaje ' || viajes_conflicto.estado
        )
      );
    END LOOP;
  ELSIF p_entidad_tipo = 'vehiculo' THEN
    FOR viajes_conflicto IN
      SELECT 
        id, estado, fecha_inicio_programada, fecha_fin_programada,
        origen, destino
      FROM public.viajes
      WHERE vehiculo_id = p_entidad_id 
        AND user_id = p_user_id
        AND estado IN ('programado', 'en_transito')
        AND (
          (fecha_inicio_programada <= p_fecha_fin AND fecha_fin_programada >= p_fecha_inicio)
        )
    LOOP
      conflictos := conflictos || jsonb_build_array(
        jsonb_build_object(
          'tipo', 'conflicto_programacion',
          'descripcion', 'Viaje ' || viajes_conflicto.estado || ': ' || 
                        COALESCE(viajes_conflicto.origen, 'Sin origen') || ' - ' || 
                        COALESCE(viajes_conflicto.destino, 'Sin destino'),
          'fecha_inicio', viajes_conflicto.fecha_inicio_programada,
          'fecha_fin', viajes_conflicto.fecha_fin_programada,
          'tipo_programacion', 'Viaje ' || viajes_conflicto.estado
        )
      );
    END LOOP;
  ELSIF p_entidad_tipo = 'remolque' THEN
    FOR viajes_conflicto IN
      SELECT 
        id, estado, fecha_inicio_programada, fecha_fin_programada,
        origen, destino
      FROM public.viajes
      WHERE remolque_id = p_entidad_id 
        AND user_id = p_user_id
        AND estado IN ('programado', 'en_transito')
        AND (
          (fecha_inicio_programada <= p_fecha_fin AND fecha_fin_programada >= p_fecha_inicio)
        )
    LOOP
      conflictos := conflictos || jsonb_build_array(
        jsonb_build_object(
          'tipo', 'conflicto_programacion',
          'descripcion', 'Viaje ' || viajes_conflicto.estado || ': ' || 
                        COALESCE(viajes_conflicto.origen, 'Sin origen') || ' - ' || 
                        COALESCE(viajes_conflicto.destino, 'Sin destino'),
          'fecha_inicio', viajes_conflicto.fecha_inicio_programada,
          'fecha_fin', viajes_conflicto.fecha_fin_programada,
          'tipo_programacion', 'Viaje ' || viajes_conflicto.estado
        )
      );
    END LOOP;
  END IF;

  -- Verificar conflictos con programaciones existentes (mantenimiento, etc.)
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
      (fecha_inicio <= p_fecha_fin AND (fecha_fin >= p_fecha_inicio OR sin_fecha_fin = true))
    );

  -- Combinar conflictos si existen ambos tipos
  IF conflictos IS NULL THEN
    conflictos := '[]'::jsonb;
  END IF;

  RETURN jsonb_build_object(
    'disponible', CASE WHEN conflictos = '[]'::jsonb AND recurso_estado = 'disponible' THEN true ELSE false END,
    'conflictos', conflictos,
    'estado_actual', COALESCE(recurso_estado, 'desconocido'),
    'fecha_proxima_disponibilidad', fecha_disponible
  );
END;
$function$;