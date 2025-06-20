
-- Fase 2: Corregir advertencias de search_path mutable sin afectar funcionalidad
-- Solo agregamos SET search_path a funciones existentes para mayor seguridad

-- Corregir función de búsqueda de códigos postales
DROP FUNCTION IF EXISTS public.buscar_codigo_postal_completo(text);
CREATE OR REPLACE FUNCTION public.buscar_codigo_postal_completo(cp_input TEXT)
RETURNS TABLE(
    codigo_postal TEXT,
    estado TEXT,
    estado_clave TEXT,
    municipio TEXT,
    municipio_clave TEXT,
    localidad TEXT,
    ciudad TEXT,
    zona TEXT,
    total_colonias INTEGER,
    colonias JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
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
$$;

-- Corregir funciones de validación
CREATE OR REPLACE FUNCTION public.validate_rfc_format(rfc_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF rfc_input IS NULL OR length(trim(rfc_input)) < 12 OR length(trim(rfc_input)) > 13 THEN
    RETURN FALSE;
  END IF;
  
  IF NOT (trim(upper(rfc_input)) ~ '^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$') THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Corregir funciones de seguridad y logs
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_user_id uuid, 
    p_event_type text, 
    p_event_data jsonb DEFAULT '{}'::jsonb, 
    p_ip_address inet DEFAULT NULL::inet, 
    p_user_agent text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_event_type,
    p_event_data,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Corregir funciones de rate limiting
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_identifier text, 
    p_action_type text, 
    p_max_attempts integer DEFAULT 5, 
    p_window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
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
$$;

-- Corregir función de sugerencias de códigos postales
CREATE OR REPLACE FUNCTION public.sugerir_codigos_similares(cp_input text)
RETURNS TABLE(codigo_postal text, ubicacion text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
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
$$;

-- Comentario: Solo agregamos SET search_path a funciones existentes
-- Mantiene exactamente la misma funcionalidad pero con mayor seguridad
-- No afecta ningún comportamiento de la aplicación
