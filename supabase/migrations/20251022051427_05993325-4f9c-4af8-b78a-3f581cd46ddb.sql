-- Add search_path protection to all database functions
-- This prevents schema injection attacks by fixing the search path

-- Trigger functions
CREATE OR REPLACE FUNCTION public.actualizar_metricas_tiempo_real()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  IF NEW.conductor_id IS NOT NULL THEN
    UPDATE public.conductores 
    SET viaje_actual_id = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN NEW.id 
      ELSE NULL 
    END,
    estado = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN 'ocupado'
      ELSE 'disponible'
    END
    WHERE id = NEW.conductor_id;
  END IF;
  
  IF NEW.vehiculo_id IS NOT NULL THEN
    UPDATE public.vehiculos 
    SET estado = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN 'en_uso'
      ELSE 'disponible'
    END
    WHERE id = NEW.vehiculo_id;
  END IF;
  
  IF NEW.remolque_id IS NOT NULL THEN
    UPDATE public.remolques 
    SET estado = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN 'en_uso'
      ELSE 'disponible'
    END
    WHERE id = NEW.remolque_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.enforce_single_active_certificate()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  IF NEW.activo = true THEN
    UPDATE public.certificados_digitales 
    SET activo = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
    
    INSERT INTO public.certificados_activos (user_id, certificado_id)
    VALUES (NEW.user_id, NEW.id)
    ON CONFLICT (user_id) 
    DO UPDATE SET certificado_id = NEW.id, updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_document_expiration()
RETURNS void
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  INSERT INTO public.notificaciones (user_id, tipo, titulo, mensaje, urgente, metadata)
  SELECT DISTINCT
    de.user_id,
    'warning',
    'Documento próximo a vencer',
    'El documento ' || de.tipo_documento || ' de ' || 
    CASE de.entidad_tipo 
      WHEN 'vehiculo' THEN 'vehículo'
      WHEN 'conductor' THEN 'conductor' 
      ELSE de.entidad_tipo 
    END || ' vence el ' || TO_CHAR(de.fecha_vencimiento, 'DD/MM/YYYY'),
    false,
    jsonb_build_object(
      'documento_id', de.id,
      'entidad_tipo', de.entidad_tipo,
      'entidad_id', de.entidad_id,
      'fecha_vencimiento', de.fecha_vencimiento
    )
  FROM public.documentos_entidades de
  WHERE de.fecha_vencimiento IS NOT NULL
    AND de.fecha_vencimiento BETWEEN NOW() AND NOW() + INTERVAL '30 days'
    AND de.activo = true
    AND NOT EXISTS (
      SELECT 1 FROM public.notificaciones n 
      WHERE n.user_id = de.user_id 
        AND n.metadata->>'documento_id' = de.id::text
        AND n.created_at > NOW() - INTERVAL '7 days'
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  DELETE FROM public.notificaciones 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$function$;

CREATE OR REPLACE FUNCTION public.process_expired_trials()
RETURNS void
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  UPDATE public.suscripciones 
  SET 
    status = 'grace_period',
    grace_period_start = NOW(),
    grace_period_end = NOW() + INTERVAL '90 days',
    cleanup_warning_sent = FALSE,
    final_warning_sent = FALSE
  WHERE status = 'trial' 
    AND (fecha_fin_prueba < NOW() OR fecha_vencimiento < NOW());

  INSERT INTO public.notificaciones (user_id, tipo, titulo, mensaje, urgente)
  SELECT 
    s.user_id,
    'warning',
    'Tu período de prueba termina pronto',
    'Tu período de prueba de 14 días termina en ' || 
    EXTRACT(days FROM s.fecha_fin_prueba - NOW()) || ' días. Adquiere un plan para continuar.',
    true
  FROM public.suscripciones s
  WHERE s.status = 'trial'
    AND s.fecha_fin_prueba BETWEEN NOW() AND NOW() + INTERVAL '3 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.notificaciones n 
      WHERE n.user_id = s.user_id 
        AND n.titulo = 'Tu período de prueba termina pronto'
        AND n.created_at > NOW() - INTERVAL '24 hours'
    );

  INSERT INTO public.notificaciones (user_id, tipo, titulo, mensaje, urgente)
  SELECT 
    s.user_id,
    'error',
    'Período de gracia: Datos serán eliminados pronto',
    'Tu período de gracia termina en ' || 
    EXTRACT(days FROM s.grace_period_end - NOW()) || ' días. Todos tus datos serán eliminados permanentemente.',
    true
  FROM public.suscripciones s
  WHERE s.status = 'grace_period'
    AND s.grace_period_end BETWEEN NOW() AND NOW() + INTERVAL '7 days'
    AND s.final_warning_sent = FALSE;

  UPDATE public.suscripciones 
  SET final_warning_sent = TRUE
  WHERE status = 'grace_period'
    AND grace_period_end BETWEEN NOW() AND NOW() + INTERVAL '7 days'
    AND final_warning_sent = FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.run_automated_tasks()
RETURNS void
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  PERFORM process_expired_trials();
  PERFORM cleanup_old_notifications();
  PERFORM check_document_expiration();
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_trial_expiry()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    IF OLD.status = 'trial' AND NEW.status = 'past_due' THEN
        NEW.status = 'grace_period';
        NEW.grace_period_start = NOW();
        NEW.grace_period_end = NOW() + INTERVAL '90 days';
        NEW.cleanup_warning_sent = FALSE;
        NEW.final_warning_sent = FALSE;
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.registrar_cambio_estado_cotizacion()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO public.historial_cotizaciones (
      cotizacion_id, 
      estado_anterior, 
      estado_nuevo, 
      cambiado_por
    ) VALUES (
      NEW.id, 
      OLD.estado, 
      NEW.estado, 
      NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_trial_dates()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  IF NEW.status = 'trial' AND NEW.fecha_fin_prueba IS NOT NULL THEN
    UPDATE public.profiles 
    SET trial_end_date = NEW.fecha_fin_prueba
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_taller_rating()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  UPDATE public.talleres 
  SET 
    calificacion_promedio = (
      SELECT AVG(calificacion)::DECIMAL(3,2) 
      FROM public.reviews_talleres 
      WHERE taller_id = COALESCE(NEW.taller_id, OLD.taller_id)
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM public.reviews_talleres 
      WHERE taller_id = COALESCE(NEW.taller_id, OLD.taller_id)
    )
  WHERE id = COALESCE(NEW.taller_id, OLD.taller_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_peso_vs_capacidad()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  IF (
    SELECT SUM(COALESCE(peso_bruto_total, peso_kg * cantidad))
    FROM mercancias 
    WHERE carta_porte_id = NEW.carta_porte_id
  ) > (
    SELECT COALESCE(peso_bruto_vehicular, carga_maxima, 0)
    FROM autotransporte 
    WHERE carta_porte_id = NEW.carta_porte_id
  ) THEN
    RAISE EXCEPTION 'El peso total de mercancías excede la capacidad del vehículo';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_carta_porte_fields_v31()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    IF NEW.datos_formulario IS NOT NULL THEN
        NEW.rfc_emisor = COALESCE(
            NEW.datos_formulario->>'rfcEmisor',
            NEW.datos_formulario->'configuracion'->'emisor'->>'rfc',
            NEW.rfc_emisor
        );
        
        NEW.uso_cfdi = COALESCE(
            NEW.datos_formulario->>'uso_cfdi',
            NEW.datos_formulario->'configuracion'->'receptor'->>'uso_cfdi',
            'S01'
        );
        
        NEW.regimen_fiscal_emisor = COALESCE(
            NEW.datos_formulario->'configuracion'->'emisor'->>'regimenFiscal',
            NEW.regimen_fiscal_emisor
        );
        
        NEW.domicilio_fiscal_emisor = COALESCE(
            NEW.datos_formulario->'configuracion'->'emisor'->'domicilio',
            NEW.domicilio_fiscal_emisor,
            '{}'::jsonb
        );
        
        NEW.version_carta_porte = '3.1';
        
        IF NEW.id_ccp IS NULL OR LENGTH(NEW.id_ccp) != 36 THEN
            NEW.id_ccp = gen_random_uuid()::text;
        END IF;
        
        IF NEW.datos_formulario->'mercancias' IS NOT NULL THEN
            SELECT COALESCE(SUM(
                CASE 
                    WHEN (mercancia->>'peso_bruto_total')::numeric > 0 
                    THEN (mercancia->>'peso_bruto_total')::numeric
                    ELSE (mercancia->>'peso_kg')::numeric * (mercancia->>'cantidad')::numeric
                END
            ), 0)
            INTO NEW.peso_bruto_total
            FROM jsonb_array_elements(NEW.datos_formulario->'mercancias') AS mercancia;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_borrador_ultima_edicion()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  NEW.ultima_edicion = now();
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_carta_porte_v31_compliance(carta_porte_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
    errores text[] := '{}';
    warnings text[] := '{}';
    ubicaciones_count integer;
    mercancias_count integer;
    peso_total numeric;
    capacidad_vehicular numeric;
BEGIN
    ubicaciones_count := jsonb_array_length(carta_porte_data->'ubicaciones');
    IF ubicaciones_count < 2 THEN
        errores := array_append(errores, 'Se requieren mínimo 2 ubicaciones (origen y destino)');
    END IF;
    
    IF EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(carta_porte_data->'ubicaciones') AS ubicacion
        WHERE ubicacion->>'tipo_ubicacion' = 'Origen' 
        AND NOT (ubicacion->>'id_ubicacion' ~ '^OR\d{6}$')
    ) THEN
        errores := array_append(errores, 'ID de ubicación origen debe tener formato OR000001');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(carta_porte_data->'ubicaciones') AS ubicacion
        WHERE ubicacion->>'tipo_ubicacion' = 'Destino' 
        AND (ubicacion->>'distancia_recorrida')::numeric > 0
    ) THEN
        errores := array_append(errores, 'Ubicación destino debe tener distancia recorrida mayor a 0');
    END IF;
    
    mercancias_count := jsonb_array_length(carta_porte_data->'mercancias');
    IF mercancias_count = 0 THEN
        errores := array_append(errores, 'Se requiere al menos una mercancía');
    END IF;
    
    SELECT 
        COALESCE(SUM((mercancia->>'peso_bruto_total')::numeric), 0),
        COALESCE((carta_porte_data->'autotransporte'->>'peso_bruto_vehicular')::numeric, 0)
    INTO peso_total, capacidad_vehicular
    FROM jsonb_array_elements(carta_porte_data->'mercancias') AS mercancia;
    
    IF peso_total > capacidad_vehicular AND capacidad_vehicular > 0 THEN
        warnings := array_append(warnings, 'Peso total excede capacidad del vehículo');
    END IF;
    
    IF EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(carta_porte_data->'mercancias') AS mercancia
        WHERE (mercancia->>'especie_protegida')::boolean = true
        AND (mercancia->>'descripcion_detallada' IS NULL OR LENGTH(mercancia->>'descripcion_detallada') < 50)
    ) THEN
        errores := array_append(errores, 'Especies protegidas requieren descripción detallada (mínimo 50 caracteres)');
    END IF;
    
    RETURN jsonb_build_object(
        'valido', array_length(errores, 1) IS NULL,
        'errores', errores,
        'warnings', warnings,
        'score', CASE WHEN array_length(errores, 1) IS NULL THEN 100 ELSE 0 END
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.actualizar_estados_viaje()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.conductor_id IS NOT NULL THEN
      UPDATE public.conductores 
      SET 
        estado = 'disponible',
        viaje_actual_id = NULL,
        fecha_proxima_disponibilidad = NULL
      WHERE id = OLD.conductor_id;
    END IF;

    IF OLD.vehiculo_id IS NOT NULL THEN
      UPDATE public.vehiculos 
      SET 
        estado = 'disponible',
        viaje_actual_id = NULL,
        fecha_proxima_disponibilidad = NULL
      WHERE id = OLD.vehiculo_id;
    END IF;

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

  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.estado != NEW.estado) THEN
    
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

CREATE OR REPLACE FUNCTION public.assign_missing_trials()
RETURNS void
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  INSERT INTO public.suscripciones (
    user_id, 
    plan_id, 
    status, 
    fecha_fin_prueba,
    fecha_vencimiento
  ) 
  SELECT DISTINCT
    p.id,
    (SELECT id FROM public.planes_suscripcion WHERE nombre = 'Plan Esencial SAT' LIMIT 1),
    'trial'::subscription_status_enum,
    CASE 
      WHEN p.created_at + INTERVAL '14 days' > NOW() 
      THEN p.created_at + INTERVAL '14 days'
      ELSE NOW() + INTERVAL '1 day'
    END,
    CASE 
      WHEN p.created_at + INTERVAL '14 days' > NOW() 
      THEN p.created_at + INTERVAL '14 days'
      ELSE NOW() + INTERVAL '1 day'
    END
  FROM public.profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM public.suscripciones s WHERE s.user_id = p.id
  );

  UPDATE public.profiles 
  SET trial_end_date = s.fecha_fin_prueba
  FROM public.suscripciones s
  WHERE profiles.id = s.user_id 
    AND s.status = 'trial'::subscription_status_enum
    AND profiles.trial_end_date IS NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_subscription_expiry()
RETURNS void
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    UPDATE public.suscripciones 
    SET status = 'grace_period',
        grace_period_start = NOW(),
        grace_period_end = NOW() + INTERVAL '90 days',
        cleanup_warning_sent = FALSE,
        final_warning_sent = FALSE
    WHERE status = 'trial' 
      AND fecha_vencimiento < NOW();
    
    PERFORM public.send_cleanup_warnings();
    
    PERFORM public.cleanup_expired_grace_users();
    
    INSERT INTO public.bloqueos_usuario (user_id, motivo, mensaje_bloqueo)
    SELECT 
        s.user_id,
        'falta_pago',
        'Su suscripción ha vencido. Para continuar usando la plataforma, realice el pago correspondiente.'
    FROM public.suscripciones s
    WHERE s.fecha_vencimiento < NOW()
      AND s.status = 'past_due'
      AND NOT EXISTS (
        SELECT 1 FROM public.bloqueos_usuario b 
        WHERE b.user_id = s.user_id AND b.activo = true
      );
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_grace_users()
RETURNS void
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    WITH expired_users AS (
        SELECT user_id 
        FROM public.suscripciones 
        WHERE status = 'grace_period' 
          AND grace_period_end < NOW()
    )
    DELETE FROM public.cartas_porte 
    WHERE usuario_id IN (SELECT user_id FROM expired_users);
    
    WITH expired_users AS (
        SELECT user_id 
        FROM public.suscripciones 
        WHERE status = 'grace_period' 
          AND grace_period_end < NOW()
    )
    DELETE FROM public.vehiculos 
    WHERE user_id IN (SELECT user_id FROM expired_users);
    
    WITH expired_users AS (
        SELECT user_id 
        FROM public.suscripciones 
        WHERE status = 'grace_period' 
          AND grace_period_end < NOW()
    )
    DELETE FROM public.conductores 
    WHERE user_id IN (SELECT user_id FROM expired_users);
    
    WITH expired_users AS (
        SELECT user_id 
        FROM public.suscripciones 
        WHERE status = 'grace_period' 
          AND grace_period_end < NOW()
    )
    DELETE FROM public.socios 
    WHERE user_id IN (SELECT user_id FROM expired_users);
    
    INSERT INTO public.notificaciones (user_id, tipo, titulo, mensaje)
    SELECT 
        s.user_id,
        'info',
        'Datos eliminados',
        'Tu período de gracia ha terminado y tus datos han sido eliminados. Puedes crear una nueva cuenta cuando gustes.',
        false
    FROM public.suscripciones s
    WHERE s.status = 'grace_period' 
      AND s.grace_period_end < NOW();
    
    UPDATE public.suscripciones 
    SET status = 'canceled'
    WHERE status = 'grace_period' 
      AND grace_period_end < NOW();
END;
$function$;

CREATE OR REPLACE FUNCTION public.crear_costos_viaje_automatico()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  combustible_est NUMERIC;
  peajes_est NUMERIC;
  salario_est NUMERIC;
  mantenimiento_est NUMERIC;
BEGIN
  combustible_est := COALESCE(NEW.distancia_km * 2.5, 1000);
  peajes_est := COALESCE(NEW.distancia_km * 0.8, 400);
  salario_est := COALESCE(NEW.tiempo_estimado_horas * 150, 1200);
  mantenimiento_est := COALESCE(NEW.distancia_km * 0.3, 200);

  INSERT INTO public.costos_viaje (
    viaje_id,
    user_id,
    combustible_estimado,
    peajes_estimados,
    casetas_estimadas,
    salario_conductor_estimado,
    mantenimiento_estimado,
    costo_total_estimado,
    margen_estimado,
    precio_cotizado
  ) VALUES (
    NEW.id,
    NEW.user_id,
    combustible_est,
    peajes_est,
    peajes_est * 0.5,
    salario_est,
    mantenimiento_est,
    combustible_est + peajes_est + (peajes_est * 0.5) + salario_est + mantenimiento_est,
    (NEW.precio_cobrado - (combustible_est + peajes_est + (peajes_est * 0.5) + salario_est + mantenimiento_est)),
    NEW.precio_cobrado
  );

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generar_analisis_viaje_automatico()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  costos_record RECORD;
  hash_ruta VARCHAR;
BEGIN
  IF NEW.estado = 'completado' AND (OLD.estado IS NULL OR OLD.estado != 'completado') THEN
    
    SELECT * INTO costos_record 
    FROM public.costos_viaje 
    WHERE viaje_id = NEW.id;
    
    hash_ruta := public.generar_hash_ruta(NEW.origen, NEW.destino);
    
    INSERT INTO public.analisis_viajes (
      viaje_id,
      user_id,
      ruta_hash,
      fecha_viaje,
      precio_cobrado,
      costo_estimado,
      costo_real,
      tiempo_estimado,
      tiempo_real,
      margen_real,
      vehiculo_tipo
    ) VALUES (
      NEW.id,
      NEW.user_id,
      hash_ruta,
      COALESCE(NEW.fecha_inicio_real::date, NEW.fecha_inicio_programada::date),
      NEW.precio_cobrado,
      COALESCE(costos_record.costo_total_estimado, 0),
      COALESCE(costos_record.costo_total_real, costos_record.costo_total_estimado),
      COALESCE(NEW.tiempo_estimado_horas * 60, 480),
      COALESCE(NEW.tiempo_real_horas * 60, NEW.tiempo_estimado_horas * 60, 480),
      COALESCE(costos_record.margen_real, costos_record.margen_estimado, 0),
      (SELECT tipo FROM public.vehiculos WHERE id = NEW.vehiculo_id)
    );
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_subscription_transition()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  IF OLD.status = 'trial'::subscription_status_enum AND NEW.status = 'active'::subscription_status_enum THEN
    UPDATE public.profiles 
    SET trial_end_date = NULL,
        plan_type = CASE 
          WHEN NEW.plan_id IS NOT NULL THEN 'paid'
          ELSE 'trial'
        END
    WHERE id = NEW.user_id;
    
    INSERT INTO public.notificaciones (
      user_id,
      tipo,
      titulo,
      mensaje,
      urgente
    ) VALUES (
      NEW.user_id,
      'success',
      '¡Bienvenido a tu nuevo plan!',
      'Tu suscripción ha sido activada exitosamente. Ya tienes acceso a todas las funciones de tu plan.',
      false
    );
  END IF;

  IF NEW.status = 'trial'::subscription_status_enum AND NEW.fecha_fin_prueba IS NOT NULL THEN
    UPDATE public.profiles 
    SET trial_end_date = NEW.fecha_fin_prueba
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generar_hash_ruta(origen text, destino text)
RETURNS character varying
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN encode(sha256((lower(trim(origen)) || '|' || lower(trim(destino)))::bytea), 'hex');
END;
$function$;