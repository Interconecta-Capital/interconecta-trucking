-- Fix remaining functions missing search_path protection (Part 2)

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles
    WHERE user_id = _user_id 
      AND role = _role
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_or_superuser(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles
    WHERE user_id = _user_id 
      AND role IN ('admin', 'superuser')
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_superuser_secure(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles
    WHERE user_id = _user_id 
      AND role = 'superuser'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_maintenance_alerts(p_user_id uuid)
RETURNS TABLE(vehiculo_id uuid, placa character varying, tipo_alerta character varying, descripcion text, dias_restantes integer, kilometros_restantes integer, urgencia character varying)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    v.id as vehiculo_id,
    v.placa,
    CASE 
      WHEN mp.fecha_programada <= CURRENT_DATE + INTERVAL '7 days' THEN 'fecha_proxima'
      WHEN (v.kilometraje_actual + 500) >= mp.kilometraje_programado THEN 'kilometraje_proximo'
      WHEN v.vigencia_seguro <= CURRENT_DATE + INTERVAL '30 days' THEN 'seguro_vence'
      WHEN v.verificacion_vigencia <= CURRENT_DATE + INTERVAL '30 days' THEN 'verificacion_vence'
      ELSE 'general'
    END as tipo_alerta,
    CASE 
      WHEN mp.fecha_programada <= CURRENT_DATE + INTERVAL '7 days' THEN 
        'Mantenimiento ' || mp.tipo_mantenimiento || ' programado para ' || TO_CHAR(mp.fecha_programada, 'DD/MM/YYYY')
      WHEN (v.kilometraje_actual + 500) >= mp.kilometraje_programado THEN 
        'Próximo a alcanzar kilometraje de mantenimiento (' || mp.kilometraje_programado || ' km)'
      WHEN v.vigencia_seguro <= CURRENT_DATE + INTERVAL '30 days' THEN 
        'Seguro vence el ' || TO_CHAR(v.vigencia_seguro::date, 'DD/MM/YYYY')
      WHEN v.verificacion_vigencia <= CURRENT_DATE + INTERVAL '30 days' THEN 
        'Verificación vence el ' || TO_CHAR(v.verificacion_vigencia::date, 'DD/MM/YYYY')
      ELSE mp.descripcion
    END as descripcion,
    COALESCE(
      EXTRACT(days FROM mp.fecha_programada - CURRENT_DATE)::INTEGER,
      EXTRACT(days FROM v.vigencia_seguro::date - CURRENT_DATE)::INTEGER,
      EXTRACT(days FROM v.verificacion_vigencia::date - CURRENT_DATE)::INTEGER,
      0
    ) as dias_restantes,
    COALESCE(
      mp.kilometraje_programado - v.kilometraje_actual,
      0
    ) as kilometros_restantes,
    CASE 
      WHEN mp.fecha_programada <= CURRENT_DATE + INTERVAL '3 days' OR 
           (v.kilometraje_actual + 100) >= mp.kilometraje_programado OR
           v.vigencia_seguro <= CURRENT_DATE + INTERVAL '7 days' OR
           v.verificacion_vigencia <= CURRENT_DATE + INTERVAL '7 days' THEN 'urgente'
      WHEN mp.fecha_programada <= CURRENT_DATE + INTERVAL '7 days' OR 
           (v.kilometraje_actual + 300) >= mp.kilometraje_programado OR
           v.vigencia_seguro <= CURRENT_DATE + INTERVAL '15 days' OR
           v.verificacion_vigencia <= CURRENT_DATE + INTERVAL '15 days' THEN 'pronto'
      ELSE 'normal'
    END as urgencia
  FROM public.vehiculos v
  LEFT JOIN public.mantenimientos_programados mp ON v.id = mp.vehiculo_id AND mp.estado = 'pendiente'
  WHERE v.user_id = p_user_id 
    AND v.activo = true
    AND (
      mp.fecha_programada <= CURRENT_DATE + INTERVAL '30 days' OR
      (v.kilometraje_actual + 500) >= COALESCE(mp.kilometraje_programado, 999999) OR
      v.vigencia_seguro <= CURRENT_DATE + INTERVAL '30 days' OR
      v.verificacion_vigencia <= CURRENT_DATE + INTERVAL '30 days'
    )
  ORDER BY 
    CASE 
      WHEN urgencia = 'urgente' THEN 1
      WHEN urgencia = 'pronto' THEN 2
      ELSE 3
    END,
    dias_restantes ASC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_superuser_safe_v2(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN COALESCE(
    (SELECT raw_user_meta_data->>'is_superuser' = 'true' 
     FROM auth.users 
     WHERE id = user_uuid), 
    false
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_user_access(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN COALESCE(auth.uid() = user_uuid, false);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_superuser_simple(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN COALESCE(
    (SELECT raw_user_meta_data->>'is_superuser' = 'true' 
     FROM auth.users 
     WHERE id = user_uuid), 
    false
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN COALESCE(
    (SELECT raw_user_meta_data->>'is_admin' = 'true' OR raw_user_meta_data->>'is_superuser' = 'true'
     FROM auth.users 
     WHERE id = auth.uid()), 
    false
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_superuser_optimized()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN COALESCE(
    (SELECT raw_user_meta_data->>'is_superuser' = 'true' 
     FROM auth.users 
     WHERE id = auth.uid()), 
    false
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calcular_precision_ruta(p_user_id uuid, p_ruta_hash character varying)
RETURNS TABLE(exactitud_costo numeric, exactitud_tiempo numeric, factor_correccion_costo numeric, factor_correccion_tiempo numeric, total_viajes integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(
      100 - (AVG(ABS(a.costo_real - a.costo_estimado) / NULLIF(a.costo_estimado, 0)) * 100), 
      0
    )::NUMERIC as exactitud_costo,
    COALESCE(
      100 - (AVG(ABS(a.tiempo_real - a.tiempo_estimado) / NULLIF(a.tiempo_estimado, 0)) * 100), 
      0
    )::NUMERIC as exactitud_tiempo,
    COALESCE(AVG(a.costo_real / NULLIF(a.costo_estimado, 0)), 1)::NUMERIC as factor_correccion_costo,
    COALESCE(AVG(a.tiempo_real / NULLIF(a.tiempo_estimado, 0)), 1)::NUMERIC as factor_correccion_tiempo,
    COUNT(*)::INTEGER as total_viajes
  FROM public.analisis_viajes a
  WHERE a.user_id = p_user_id 
    AND a.ruta_hash = p_ruta_hash
    AND a.costo_real IS NOT NULL 
    AND a.costo_estimado IS NOT NULL
    AND a.tiempo_real IS NOT NULL 
    AND a.tiempo_estimado IS NOT NULL
    AND a.fecha_viaje >= CURRENT_DATE - INTERVAL '6 months';
END;
$function$;

CREATE OR REPLACE FUNCTION public.analizar_mercado_ruta(p_user_id uuid, p_ruta_hash character varying)
RETURNS TABLE(precio_promedio numeric, precio_minimo numeric, precio_maximo numeric, margen_promedio numeric, total_cotizaciones integer, tendencia text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  precio_mes_actual NUMERIC;
  precio_mes_anterior NUMERIC;
BEGIN
  SELECT AVG(precio_cobrado) INTO precio_mes_actual
  FROM public.analisis_viajes
  WHERE user_id = p_user_id 
    AND ruta_hash = p_ruta_hash
    AND fecha_viaje >= DATE_TRUNC('month', CURRENT_DATE);
    
  SELECT AVG(precio_cobrado) INTO precio_mes_anterior
  FROM public.analisis_viajes
  WHERE user_id = p_user_id 
    AND ruta_hash = p_ruta_hash
    AND fecha_viaje >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
    AND fecha_viaje < DATE_TRUNC('month', CURRENT_DATE);

  RETURN QUERY
  SELECT 
    COALESCE(AVG(a.precio_cobrado), 0)::NUMERIC as precio_promedio,
    COALESCE(MIN(a.precio_cobrado), 0)::NUMERIC as precio_minimo,
    COALESCE(MAX(a.precio_cobrado), 0)::NUMERIC as precio_maximo,
    COALESCE(AVG(a.margen_real), 0)::NUMERIC as margen_promedio,
    COUNT(*)::INTEGER as total_cotizaciones,
    CASE 
      WHEN precio_mes_actual > precio_mes_anterior * 1.05 THEN 'subida'
      WHEN precio_mes_actual < precio_mes_anterior * 0.95 THEN 'bajada'
      ELSE 'estable'
    END::TEXT as tendencia
  FROM public.analisis_viajes a
  WHERE a.user_id = p_user_id 
    AND a.ruta_hash = p_ruta_hash
    AND a.precio_cobrado IS NOT NULL
    AND a.fecha_viaje >= CURRENT_DATE - INTERVAL '6 months';
END;
$function$;

CREATE OR REPLACE FUNCTION public.calcular_performance_conductor(p_conductor_id uuid, p_user_id uuid)
RETURNS TABLE(eficiencia_combustible numeric, puntualidad numeric, cuidado_vehiculo numeric, satisfaccion_cliente numeric, tendencia_mejora boolean, areas_mejora text[], fortalezas text[], recomendaciones_capacitacion text[], rutas_optimas text[], tipos_carga_ideales text[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  efic_combustible NUMERIC;
  punt_promedio NUMERIC;
  calif_promedio NUMERIC;
  cuidado_vh NUMERIC;
  mejora_bool BOOLEAN;
  areas_arr TEXT[];
  fort_arr TEXT[];
  rec_cap TEXT[];
  rutas_arr TEXT[];
  carga_arr TEXT[];
BEGIN
  SELECT COALESCE(AVG(
    CASE WHEN combustible_consumido > 0 
    THEN km_recorridos / combustible_consumido 
    ELSE 0 END
  ), 0) INTO efic_combustible
  FROM metricas_conductor 
  WHERE conductor_id = p_conductor_id 
    AND fecha >= CURRENT_DATE - INTERVAL '30 days';

  SELECT COALESCE(AVG(
    CASE WHEN total_entregas > 0 
    THEN (entregas_a_tiempo::NUMERIC / total_entregas) * 100 
    ELSE 95 END
  ), 95) INTO punt_promedio
  FROM metricas_conductor 
  WHERE conductor_id = p_conductor_id 
    AND fecha >= CURRENT_DATE - INTERVAL '30 days';

  SELECT COALESCE(AVG(calificacion::NUMERIC), 5.0) INTO calif_promedio
  FROM calificaciones_conductores 
  WHERE conductor_id = p_conductor_id 
    AND tipo_calificacion = 'cliente_a_conductor'
    AND created_at >= CURRENT_DATE - INTERVAL '30 days';

  SELECT CASE 
    WHEN SUM(incidentes) = 0 THEN 5.0
    WHEN SUM(incidentes) <= 2 THEN 4.0
    WHEN SUM(incidentes) <= 5 THEN 3.0
    ELSE 2.0
  END INTO cuidado_vh
  FROM metricas_conductor 
  WHERE conductor_id = p_conductor_id 
    AND fecha >= CURRENT_DATE - INTERVAL '30 days';

  mejora_bool := (calif_promedio >= 4.0 AND punt_promedio >= 90);

  areas_arr := ARRAY[]::TEXT[];
  IF punt_promedio < 85 THEN
    areas_arr := array_append(areas_arr, 'Puntualidad');
  END IF;
  IF efic_combustible < 8 THEN
    areas_arr := array_append(areas_arr, 'Eficiencia de combustible');
  END IF;
  IF calif_promedio < 4.0 THEN
    areas_arr := array_append(areas_arr, 'Satisfacción del cliente');
  END IF;

  fort_arr := ARRAY[]::TEXT[];
  IF punt_promedio >= 95 THEN
    fort_arr := array_append(fort_arr, 'Excelente puntualidad');
  END IF;
  IF calif_promedio >= 4.5 THEN
    fort_arr := array_append(fort_arr, 'Alta satisfacción del cliente');
  END IF;
  IF efic_combustible >= 10 THEN
    fort_arr := array_append(fort_arr, 'Manejo eficiente');
  END IF;

  rec_cap := ARRAY[]::TEXT[];
  IF punt_promedio < 90 THEN
    rec_cap := array_append(rec_cap, 'Gestión del tiempo');
  END IF;
  IF efic_combustible < 9 THEN
    rec_cap := array_append(rec_cap, 'Manejo eco-eficiente');
  END IF;
  IF calif_promedio < 4.0 THEN
    rec_cap := array_append(rec_cap, 'Atención al cliente');
  END IF;

  rutas_arr := ARRAY['Ruta Regional', 'Distribución Urbana'];
  carga_arr := ARRAY['Carga General', 'Productos Perecederos'];

  RETURN QUERY SELECT 
    efic_combustible,
    punt_promedio,
    cuidado_vh,
    calif_promedio,
    mejora_bool,
    areas_arr,
    fort_arr,
    rec_cap,
    rutas_arr,
    carga_arr;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_action_type text, p_max_attempts integer DEFAULT 5, p_window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO attempt_count
  FROM public.rate_limit_log
  WHERE identifier = p_identifier
    AND action_type = p_action_type
    AND created_at > now() - (p_window_minutes || ' minutes')::INTERVAL;
    
  IF attempt_count >= p_max_attempts THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_rfc_format(rfc_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  IF rfc_input IS NULL OR length(trim(rfc_input)) < 12 OR length(trim(rfc_input)) > 13 THEN
    RETURN FALSE;
  END IF;
  
  IF NOT (trim(upper(rfc_input)) ~ '^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$') THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_storage_usage(user_uuid uuid, bytes_delta bigint, files_delta integer DEFAULT 0)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  INSERT INTO public.usuario_almacenamiento (user_id, bytes_utilizados, archivos_count)
  VALUES (user_uuid, GREATEST(0, bytes_delta), GREATEST(0, files_delta))
  ON CONFLICT (user_id)
  DO UPDATE SET
    bytes_utilizados = GREATEST(0, usuario_almacenamiento.bytes_utilizados + bytes_delta),
    archivos_count = GREATEST(0, usuario_almacenamiento.archivos_count + files_delta),
    ultima_actualizacion = NOW();
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_storage_usage(user_uuid uuid)
RETURNS TABLE(bytes_utilizados bigint, gb_utilizados numeric, archivos_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ua.bytes_utilizados, 0) as bytes_utilizados,
    ROUND(COALESCE(ua.bytes_utilizados, 0) / 1073741824.0, 2) as gb_utilizados,
    COALESCE(ua.archivos_count, 0) as archivos_count
  FROM public.usuario_almacenamiento ua
  WHERE ua.user_id = user_uuid
  
  UNION ALL
  
  SELECT 0::BIGINT, 0.00::NUMERIC, 0::INTEGER
  WHERE NOT EXISTS (
    SELECT 1 FROM public.usuario_almacenamiento 
    WHERE user_id = user_uuid
  )
  LIMIT 1;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_tenant_id(user_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN (
    SELECT COALESCE(p.empresa::uuid, '00000000-0000-0000-0000-000000000000'::uuid)
    FROM public.profiles p 
    WHERE p.id = user_uuid
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN '00000000-0000-0000-0000-000000000000'::uuid;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  plan_basico_id UUID;
BEGIN
  SELECT id INTO plan_basico_id 
  FROM public.planes_suscripcion 
  WHERE nombre = 'Plan Esencial SAT' 
  LIMIT 1;

  INSERT INTO public.profiles (id, nombre, email, empresa, rfc, telefono, trial_end_date)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.email,
    NEW.raw_user_meta_data->>'empresa',
    NEW.raw_user_meta_data->>'rfc',
    NEW.raw_user_meta_data->>'telefono',
    NOW() + INTERVAL '14 days'
  );
  
  INSERT INTO public.usuarios (
    auth_user_id,
    nombre,
    email,
    tenant_id
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.email,
    NEW.id
  );

  INSERT INTO public.suscripciones (
    user_id, 
    plan_id, 
    status, 
    fecha_fin_prueba,
    fecha_vencimiento
  ) VALUES (
    NEW.id,
    plan_basico_id,
    'trial'::subscription_status_enum,
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '14 days'
  );
  
  RETURN NEW;
END;
$function$;