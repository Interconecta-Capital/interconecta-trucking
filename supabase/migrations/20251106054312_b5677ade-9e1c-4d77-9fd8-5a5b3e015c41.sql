-- Fix SECURITY DEFINER functions without fixed search_path
-- This prevents SQL injection through search path manipulation

-- Note: This migration updates all SECURITY DEFINER functions to include
-- SET search_path = public, pg_catalog which prevents malicious schemas
-- from intercepting function calls

-- 1. update_esquemas_xml_updated_at
CREATE OR REPLACE FUNCTION public.update_esquemas_xml_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_catalog
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 2. update_creditos_usuarios_updated_at
CREATE OR REPLACE FUNCTION public.update_creditos_usuarios_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_catalog
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 3. calcular_proyeccion_consumo
CREATE OR REPLACE FUNCTION public.calcular_proyeccion_consumo()
 RETURNS TABLE(proyeccion_mensual numeric, dias_transcurridos integer, promedio_diario numeric, estimado_fin_mes numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_catalog
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::NUMERIC as proyeccion_mensual,
    EXTRACT(DAY FROM NOW() - DATE_TRUNC('month', NOW()))::INT as dias_transcurridos,
    (COUNT(*)::NUMERIC / NULLIF(EXTRACT(DAY FROM NOW() - DATE_TRUNC('month', NOW())), 0)) as promedio_diario,
    (COUNT(*)::NUMERIC / NULLIF(EXTRACT(DAY FROM NOW() - DATE_TRUNC('month', NOW())), 0) * 30) as estimado_fin_mes
  FROM transacciones_creditos
  WHERE tipo = 'consumo'
  AND created_at >= DATE_TRUNC('month', NOW());
END;
$function$;

-- 4. has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public, pg_catalog
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

-- 5. is_admin_or_superuser
CREATE OR REPLACE FUNCTION public.is_admin_or_superuser(_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public, pg_catalog
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

-- 6. is_superuser_secure
CREATE OR REPLACE FUNCTION public.is_superuser_secure(_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public, pg_catalog
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

-- 7. buscar_codigo_postal
CREATE OR REPLACE FUNCTION public.buscar_codigo_postal(cp_input text)
 RETURNS TABLE(codigo_postal text, estado text, estado_clave text, municipio text, municipio_clave text, localidad text, ciudad text, zona text, colonias jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_catalog
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        cp.codigo_postal::TEXT,
        cp.estado::TEXT,
        cp.estado_clave::TEXT,
        cp.municipio::TEXT,
        cp.municipio_clave::TEXT,
        cp.localidad::TEXT,
        cp.ciudad::TEXT,
        cp.zona::TEXT,
        json_agg(
            json_build_object(
                'colonia', cp.colonia,
                'tipo_asentamiento', cp.tipo_asentamiento
            ) ORDER BY cp.colonia
        )::JSONB as colonias
    FROM public.codigos_postales_mexico cp
    WHERE cp.codigo_postal = cp_input
    GROUP BY cp.codigo_postal, cp.estado, cp.estado_clave, cp.municipio, 
             cp.municipio_clave, cp.localidad, cp.ciudad, cp.zona
    LIMIT 1;
END;
$function$;

-- 8. check_maintenance_alerts
CREATE OR REPLACE FUNCTION public.check_maintenance_alerts(p_user_id uuid)
 RETURNS TABLE(vehiculo_id uuid, placa character varying, tipo_alerta character varying, descripcion text, dias_restantes integer, kilometros_restantes integer, urgencia character varying)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_catalog
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

-- 9. create_trial_subscription
CREATE OR REPLACE FUNCTION public.create_trial_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_catalog
AS $function$
BEGIN
  INSERT INTO public.suscripciones (
    user_id, 
    plan_id, 
    status, 
    fecha_fin_prueba,
    fecha_vencimiento
  ) 
  SELECT 
    NEW.id,
    id,
    'trial',
    now() + INTERVAL '7 days',
    now() + INTERVAL '7 days'
  FROM public.planes_suscripcion 
  WHERE nombre = 'Básico' 
  LIMIT 1;
  
  RETURN NEW;
END;
$function$;

-- Continue with remaining functions (10-27)...

-- 10. check_superuser_safe_v2
CREATE OR REPLACE FUNCTION public.check_superuser_safe_v2(user_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public, pg_catalog
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

-- 11. check_user_access
CREATE OR REPLACE FUNCTION public.check_user_access(user_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public, pg_catalog
AS $function$
BEGIN
  RETURN COALESCE(auth.uid() = user_uuid, false);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$function$;

-- 12. get_documentos_procesados
CREATE OR REPLACE FUNCTION public.get_documentos_procesados(user_uuid uuid)
 RETURNS TABLE(id uuid, user_id uuid, file_path text, document_type text, extracted_text text, confidence numeric, mercancias_count integer, errors text, carta_porte_id uuid, documento_original_id uuid, metadata jsonb, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_catalog
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    dp.id, dp.user_id, dp.file_path, dp.document_type, dp.extracted_text,
    dp.confidence, dp.mercancias_count, dp.errors, dp.carta_porte_id,
    dp.documento_original_id, dp.metadata, dp.created_at
  FROM public.documentos_procesados dp
  WHERE dp.user_id = user_uuid
  ORDER BY dp.created_at DESC;
END;
$function$;

-- 13. get_active_certificate
CREATE OR REPLACE FUNCTION public.get_active_certificate(user_uuid uuid)
 RETURNS TABLE(id uuid, nombre_certificado character varying, numero_certificado character varying, rfc_titular character varying, razon_social character varying, fecha_inicio_vigencia timestamp with time zone, fecha_fin_vigencia timestamp with time zone, archivo_cer_path text, archivo_key_path text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_catalog
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    cd.id, cd.nombre_certificado, cd.numero_certificado, cd.rfc_titular,
    cd.razon_social, cd.fecha_inicio_vigencia, cd.fecha_fin_vigencia,
    cd.archivo_cer_path, cd.archivo_key_path
  FROM public.certificados_digitales cd
  INNER JOIN public.certificados_activos ca ON cd.id = ca.certificado_id
  WHERE ca.user_id = user_uuid
    AND cd.activo = true
    AND cd.validado = true
    AND cd.fecha_fin_vigencia > now();
END;
$function$;

-- 14. is_admin_user
CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public, pg_catalog
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

-- 15. is_superuser_optimized
CREATE OR REPLACE FUNCTION public.is_superuser_optimized()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public, pg_catalog
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

-- 16. is_superuser_simple
CREATE OR REPLACE FUNCTION public.is_superuser_simple(user_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public, pg_catalog
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

-- 17. record_rate_limit_attempt
CREATE OR REPLACE FUNCTION public.record_rate_limit_attempt(p_identifier text, p_action_type text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_catalog
AS $function$
BEGIN
  INSERT INTO public.rate_limit_log (identifier, action_type, metadata)
  VALUES (p_identifier, p_action_type, p_metadata);
END;
$function$;

-- 18. sugerir_codigos_similares
CREATE OR REPLACE FUNCTION public.sugerir_codigos_similares(cp_input text)
 RETURNS TABLE(codigo_postal text, ubicacion text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_catalog
AS $function$
DECLARE
    prefijo TEXT;
BEGIN
    prefijo := substring(cp_input, 1, 2);
    
    RETURN QUERY
    SELECT DISTINCT 
        cp.codigo_postal::TEXT,
        (cp.municipio || ', ' || cp.estado)::TEXT as ubicacion
    FROM public.codigos_postales_mexico cp
    WHERE cp.codigo_postal LIKE (prefijo || '%')
      AND cp.codigo_postal != cp_input
    ORDER BY cp.codigo_postal
    LIMIT 10;
END;
$function$;

-- Continue with more functions...
-- 19. validate_rfc_format
CREATE OR REPLACE FUNCTION public.validate_rfc_format(rfc_input text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_catalog
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

-- 20. update_user_storage_usage
CREATE OR REPLACE FUNCTION public.update_user_storage_usage(user_uuid uuid, bytes_delta bigint, files_delta integer DEFAULT 0)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_catalog
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

-- 21. actualizar_estados_viaje (abbreviated for space)
CREATE OR REPLACE FUNCTION public.actualizar_estados_viaje()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_catalog
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.conductor_id IS NOT NULL THEN
      UPDATE public.conductores 
      SET estado = 'disponible', viaje_actual_id = NULL, fecha_proxima_disponibilidad = NULL
      WHERE id = OLD.conductor_id;
    END IF;
    IF OLD.vehiculo_id IS NOT NULL THEN
      UPDATE public.vehiculos 
      SET estado = 'disponible', viaje_actual_id = NULL, fecha_proxima_disponibilidad = NULL
      WHERE id = OLD.vehiculo_id;
    END IF;
    IF OLD.remolque_id IS NOT NULL THEN
      UPDATE public.remolques 
      SET estado = 'disponible', viaje_actual_id = NULL, fecha_proxima_disponibilidad = NULL
      WHERE id = OLD.remolque_id;
    END IF;
    RETURN OLD;
  END IF;
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.estado != NEW.estado) THEN
    IF NEW.conductor_id IS NOT NULL THEN
      UPDATE public.conductores 
      SET estado = CASE NEW.estado WHEN 'programado' THEN 'disponible' WHEN 'en_transito' THEN 'en_viaje' WHEN 'completado' THEN 'disponible' WHEN 'cancelado' THEN 'disponible' ELSE estado END,
          viaje_actual_id = CASE NEW.estado WHEN 'completado' THEN NULL WHEN 'cancelado' THEN NULL ELSE NEW.id END,
          fecha_proxima_disponibilidad = CASE NEW.estado WHEN 'completado' THEN NULL WHEN 'cancelado' THEN NULL ELSE NEW.fecha_fin_programada END
      WHERE id = NEW.conductor_id;
    END IF;
    IF NEW.vehiculo_id IS NOT NULL THEN
      UPDATE public.vehiculos 
      SET estado = CASE NEW.estado WHEN 'programado' THEN 'disponible' WHEN 'en_transito' THEN 'en_viaje' WHEN 'completado' THEN 'disponible' WHEN 'cancelado' THEN 'disponible' ELSE estado END,
          viaje_actual_id = CASE NEW.estado WHEN 'completado' THEN NULL WHEN 'cancelado' THEN NULL ELSE NEW.id END,
          fecha_proxima_disponibilidad = CASE NEW.estado WHEN 'completado' THEN NULL WHEN 'cancelado' THEN NULL ELSE NEW.fecha_fin_programada END
      WHERE id = NEW.vehiculo_id;
    END IF;
    IF NEW.remolque_id IS NOT NULL THEN
      UPDATE public.remolques 
      SET estado = CASE NEW.estado WHEN 'programado' THEN 'disponible' WHEN 'en_transito' THEN 'en_viaje' WHEN 'completado' THEN 'disponible' WHEN 'cancelado' THEN 'disponible' ELSE estado END,
          viaje_actual_id = CASE NEW.estado WHEN 'completado' THEN NULL WHEN 'cancelado' THEN NULL ELSE NEW.id END,
          fecha_proxima_disponibilidad = CASE NEW.estado WHEN 'completado' THEN NULL WHEN 'cancelado' THEN NULL ELSE NEW.fecha_fin_programada END
      WHERE id = NEW.remolque_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 22-27 additional functions...
CREATE OR REPLACE FUNCTION public.buscar_codigo_postal_completo(cp_input text) RETURNS TABLE(codigo_postal text, estado text, estado_clave text, municipio text, municipio_clave text, localidad text, ciudad text, zona text, total_colonias integer, colonias jsonb) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $function$ BEGIN RETURN QUERY SELECT cp.codigo_postal::TEXT, cp.estado::TEXT, cp.estado_clave::TEXT, cp.municipio::TEXT, cp.municipio_clave::TEXT, cp.localidad::TEXT, cp.ciudad::TEXT, cp.zona::TEXT, COUNT(cp.colonia)::INTEGER as total_colonias, json_agg(json_build_object('nombre', cp.colonia, 'tipo', COALESCE(cp.tipo_asentamiento, 'Colonia')) ORDER BY cp.colonia)::JSONB as colonias FROM public.codigos_postales_mexico cp WHERE cp.codigo_postal = cp_input GROUP BY cp.codigo_postal, cp.estado, cp.estado_clave, cp.municipio, cp.municipio_clave, cp.localidad, cp.ciudad, cp.zona LIMIT 1; END; $function$;
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_action_type text, p_max_attempts integer DEFAULT 5, p_window_minutes integer DEFAULT 15) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $function$ DECLARE attempt_count INTEGER; BEGIN SELECT COUNT(*) INTO attempt_count FROM public.rate_limit_log WHERE identifier = p_identifier AND action_type = p_action_type AND created_at > now() - (p_window_minutes || ' minutes')::INTERVAL; IF attempt_count >= p_max_attempts THEN RETURN FALSE; END IF; RETURN TRUE; END; $function$;
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(user_uuid uuid) RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_catalog AS $function$ BEGIN RETURN (SELECT COALESCE(p.empresa::uuid, '00000000-0000-0000-0000-000000000000'::uuid) FROM public.profiles p WHERE p.id = user_uuid LIMIT 1); EXCEPTION WHEN OTHERS THEN RETURN '00000000-0000-0000-0000-000000000000'::uuid; END; $function$;
CREATE OR REPLACE FUNCTION public.get_user_storage_usage(user_uuid uuid) RETURNS TABLE(bytes_utilizados bigint, gb_utilizados numeric, archivos_count integer) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $function$ BEGIN RETURN QUERY SELECT COALESCE(ua.bytes_utilizados, 0) as bytes_utilizados, ROUND(COALESCE(ua.bytes_utilizados, 0) / 1073741824.0, 2) as gb_utilizados, COALESCE(ua.archivos_count, 0) as archivos_count FROM public.usuario_almacenamiento ua WHERE ua.user_id = user_uuid UNION ALL SELECT 0::BIGINT, 0.00::NUMERIC, 0::INTEGER WHERE NOT EXISTS (SELECT 1 FROM public.usuario_almacenamiento WHERE user_id = user_uuid) LIMIT 1; END; $function$;
CREATE OR REPLACE FUNCTION public.log_security_event(p_user_id uuid, p_event_type text, p_event_data jsonb DEFAULT '{}'::jsonb, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $function$ DECLARE log_id UUID; BEGIN INSERT INTO public.security_audit_log (user_id, event_type, event_data, ip_address, user_agent) VALUES (p_user_id, p_event_type, p_event_data, p_ip_address, p_user_agent) RETURNING id INTO log_id; RETURN log_id; END; $function$;
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $function$ DECLARE plan_basico_id UUID; new_tenant_id UUID; BEGIN RAISE NOTICE 'handle_new_user triggered for user: %', NEW.id; SELECT id INTO plan_basico_id FROM public.planes_suscripcion WHERE nombre = 'Plan Esencial SAT' LIMIT 1; INSERT INTO public.tenants (nombre_empresa, rfc_empresa) VALUES (COALESCE(NEW.raw_user_meta_data->>'empresa', 'Empresa de ' || COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email)), COALESCE(NEW.raw_user_meta_data->>'rfc', 'XAXX010101000')) RETURNING id INTO new_tenant_id; INSERT INTO public.profiles (id, nombre, email, empresa, rfc, telefono, trial_end_date) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', 'Usuario'), NEW.email, NEW.raw_user_meta_data->>'empresa', NEW.raw_user_meta_data->>'rfc', NEW.raw_user_meta_data->>'telefono', NOW() + INTERVAL '14 days'); INSERT INTO public.usuarios (auth_user_id, nombre, email, tenant_id, rol) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', 'Usuario'), NEW.email, new_tenant_id, 'admin'); INSERT INTO public.suscripciones (user_id, plan_id, status, fecha_fin_prueba, fecha_vencimiento) VALUES (NEW.id, plan_basico_id, 'trial'::subscription_status_enum, NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days'); RETURN NEW; EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM; RETURN NEW; END; $function$;