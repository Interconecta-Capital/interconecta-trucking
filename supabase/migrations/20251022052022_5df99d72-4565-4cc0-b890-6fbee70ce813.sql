-- Fix final batch of functions missing search_path protection

CREATE OR REPLACE FUNCTION public.buscar_codigo_postal(cp_input text)
RETURNS TABLE(codigo_postal text, estado text, estado_clave text, municipio text, municipio_clave text, localidad text, ciudad text, zona text, colonias jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
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

CREATE OR REPLACE FUNCTION public.sugerir_codigos_similares(cp_input text)
RETURNS TABLE(codigo_postal text, ubicacion text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
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

CREATE OR REPLACE FUNCTION public.buscar_codigo_postal_completo(cp_input text)
RETURNS TABLE(codigo_postal text, estado text, estado_clave text, municipio text, municipio_clave text, localidad text, ciudad text, zona text, total_colonias integer, colonias jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
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
        COUNT(cp.colonia)::INTEGER as total_colonias,
        json_agg(
            json_build_object(
                'nombre', cp.colonia,
                'tipo', COALESCE(cp.tipo_asentamiento, 'Colonia')
            ) ORDER BY cp.colonia
        )::JSONB as colonias
    FROM public.codigos_postales_mexico cp
    WHERE cp.codigo_postal = cp_input
    GROUP BY cp.codigo_postal, cp.estado, cp.estado_clave, cp.municipio, 
             cp.municipio_clave, cp.localidad, cp.ciudad, cp.zona
    LIMIT 1;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_documentos_procesados(user_uuid uuid)
RETURNS TABLE(id uuid, user_id uuid, file_path text, document_type text, extracted_text text, confidence numeric, mercancias_count integer, errors text, carta_porte_id uuid, documento_original_id uuid, metadata jsonb, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    dp.id,
    dp.user_id,
    dp.file_path,
    dp.document_type,
    dp.extracted_text,
    dp.confidence,
    dp.mercancias_count,
    dp.errors,
    dp.carta_porte_id,
    dp.documento_original_id,
    dp.metadata,
    dp.created_at
  FROM public.documentos_procesados dp
  WHERE dp.user_id = user_uuid
  ORDER BY dp.created_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_active_certificate(user_uuid uuid)
RETURNS TABLE(id uuid, nombre_certificado character varying, numero_certificado character varying, rfc_titular character varying, razon_social character varying, fecha_inicio_vigencia timestamp with time zone, fecha_fin_vigencia timestamp with time zone, archivo_cer_path text, archivo_key_path text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    cd.id,
    cd.nombre_certificado,
    cd.numero_certificado,
    cd.rfc_titular,
    cd.razon_social,
    cd.fecha_inicio_vigencia,
    cd.fecha_fin_vigencia,
    cd.archivo_cer_path,
    cd.archivo_key_path
  FROM public.certificados_digitales cd
  INNER JOIN public.certificados_activos ca ON cd.id = ca.certificado_id
  WHERE ca.user_id = user_uuid
    AND cd.activo = true
    AND cd.validado = true
    AND cd.fecha_fin_vigencia > now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN (
    SELECT p.empresa 
    FROM public.profiles p 
    WHERE p.id = auth.uid()
    LIMIT 1
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.generar_id_ccp_unico()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
DECLARE
  nuevo_id_ccp TEXT;
  existe BOOLEAN;
BEGIN
  LOOP
    nuevo_id_ccp := REPLACE(gen_random_uuid()::text, '-', '');
    nuevo_id_ccp := UPPER(SUBSTR(nuevo_id_ccp, 1, 36));
    
    SELECT EXISTS(
      SELECT 1 FROM public.cartas_porte 
      WHERE id_ccp = nuevo_id_ccp
    ) INTO existe;
    
    IF NOT existe THEN
      RETURN nuevo_id_ccp;
    END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_trial_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

CREATE OR REPLACE FUNCTION public.crear_notificacion_estado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  INSERT INTO public.notificaciones (
    user_id,
    tipo,
    titulo,
    mensaje,
    entidad_tipo,
    entidad_id
  ) VALUES (
    NEW.user_id,
    CASE 
      WHEN NEW.estado_nuevo IN ('mantenimiento', 'revision', 'fuera_servicio') THEN 'warning'
      WHEN NEW.estado_nuevo = 'disponible' THEN 'success'
      ELSE 'info'
    END,
    'Cambio de Estado',
    format('%s cambió de %s a %s', 
      CASE NEW.entidad_tipo 
        WHEN 'vehiculo' THEN 'Vehículo'
        WHEN 'conductor' THEN 'Conductor'
        WHEN 'socio' THEN 'Socio'
        ELSE 'Entidad'
      END,
      COALESCE(NEW.estado_anterior, 'N/A'),
      NEW.estado_nuevo
    ),
    NEW.entidad_tipo,
    NEW.entidad_id
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.record_rate_limit_attempt(p_identifier text, p_action_type text, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $function$
BEGIN
  INSERT INTO public.rate_limit_log (identifier, action_type, metadata)
  VALUES (p_identifier, p_action_type, p_metadata);
END;
$function$;