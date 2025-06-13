
-- Fix security warnings by setting search_path for all functions
-- This prevents search_path injection attacks

-- Fix get_user_tenant_safe function
CREATE OR REPLACE FUNCTION public.get_user_tenant_safe(user_uuid uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Use auth.users directly to avoid recursion
  RETURN (
    SELECT COALESCE(
      (raw_user_meta_data->>'tenant_id')::uuid, 
      '00000000-0000-0000-0000-000000000000'::uuid
    )
    FROM auth.users 
    WHERE id = user_uuid
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN '00000000-0000-0000-0000-000000000000'::uuid;
END;
$function$;

-- Fix crear_notificacion_estado function
CREATE OR REPLACE FUNCTION public.crear_notificacion_estado()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
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

-- Fix check_superuser_safe function
CREATE OR REPLACE FUNCTION public.check_superuser_safe(user_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Check directly from auth metadata to avoid recursion
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

-- Fix get_user_tenant_id function
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(user_uuid uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Obtener tenant_id desde profiles para evitar recursión
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

-- Fix is_user_admin function
CREATE OR REPLACE FUNCTION public.is_user_admin(user_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Verificar desde profiles si es admin o enterprise
  RETURN (
    SELECT COALESCE(p.plan_type = 'enterprise', false)
    FROM public.profiles p 
    WHERE p.id = user_uuid
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$function$;

-- Fix is_superuser function
CREATE OR REPLACE FUNCTION public.is_superuser(user_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN (
    SELECT COALESCE(u.rol_especial = 'superuser', false)
    FROM public.usuarios u 
    WHERE u.auth_user_id = user_uuid
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$function$;

-- Fix buscar_codigo_postal function
CREATE OR REPLACE FUNCTION public.buscar_codigo_postal(cp_input text)
 RETURNS TABLE(codigo_postal text, estado text, estado_clave text, municipio text, municipio_clave text, localidad text, ciudad text, zona text, colonias jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
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

-- Fix sugerir_codigos_similares function
CREATE OR REPLACE FUNCTION public.sugerir_codigos_similares(cp_input text)
 RETURNS TABLE(codigo_postal text, ubicacion text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
    prefijo TEXT;
BEGIN
    -- Obtener prefijo de 2-3 dígitos para buscar similares
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

-- Fix get_current_user_tenant_id function
CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Get tenant_id from profiles table instead of usuarios to avoid recursion
  RETURN (
    SELECT p.empresa 
    FROM public.profiles p 
    WHERE p.id = auth.uid()
    LIMIT 1
  );
END;
$function$;

-- Fix is_current_user_admin function
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Check if user has admin role from profiles or other safe source
  RETURN (
    SELECT CASE 
      WHEN p.plan_type = 'enterprise' THEN true
      ELSE false
    END
    FROM public.profiles p 
    WHERE p.id = auth.uid()
    LIMIT 1
  );
END;
$function$;

-- Fix is_superuser_safe function
CREATE OR REPLACE FUNCTION public.is_superuser_safe()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN (
    SELECT COALESCE(u.rol_especial = 'superuser', false)
    FROM public.usuarios u 
    WHERE u.auth_user_id = auth.uid()
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, nombre, email, empresa, rfc, telefono)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.email,
    NEW.raw_user_meta_data->>'empresa',
    NEW.raw_user_meta_data->>'rfc',
    NEW.raw_user_meta_data->>'telefono'
  );
  RETURN NEW;
END;
$function$;

-- Fix validate_rfc_format function
CREATE OR REPLACE FUNCTION public.validate_rfc_format(rfc_input text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Check if RFC matches Mexican RFC pattern (12-13 characters)
  IF rfc_input IS NULL OR length(trim(rfc_input)) < 12 OR length(trim(rfc_input)) > 13 THEN
    RETURN FALSE;
  END IF;
  
  -- Check basic RFC pattern
  IF NOT (trim(upper(rfc_input)) ~ '^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$') THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- Fix log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(p_user_id uuid, p_event_type text, p_event_data jsonb DEFAULT '{}'::jsonb, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Fix check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_action_type text, p_max_attempts integer DEFAULT 5, p_window_minutes integer DEFAULT 15)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Count attempts in the time window
  SELECT COUNT(*)
  INTO attempt_count
  FROM public.rate_limit_log
  WHERE identifier = p_identifier
    AND action_type = p_action_type
    AND created_at > now() - (p_window_minutes || ' minutes')::INTERVAL;
    
  -- Return false if rate limit exceeded
  IF attempt_count >= p_max_attempts THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- Fix record_rate_limit_attempt function
CREATE OR REPLACE FUNCTION public.record_rate_limit_attempt(p_identifier text, p_action_type text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.rate_limit_log (identifier, action_type, metadata)
  VALUES (p_identifier, p_action_type, p_metadata);
END;
$function$;

-- Fix create_trial_subscription function
CREATE OR REPLACE FUNCTION public.create_trial_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Crear suscripción de prueba con plan básico
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

-- Fix check_subscription_expiry function
CREATE OR REPLACE FUNCTION public.check_subscription_expiry()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Bloquear usuarios con suscripciones vencidas
  INSERT INTO public.bloqueos_usuario (user_id, motivo, mensaje_bloqueo)
  SELECT 
    s.user_id,
    'falta_pago',
    'Su suscripción ha vencido. Para continuar usando la plataforma, realice el pago correspondiente.'
  FROM public.suscripciones s
  WHERE s.fecha_vencimiento < now()
    AND s.status IN ('trial', 'past_due')
    AND NOT EXISTS (
      SELECT 1 FROM public.bloqueos_usuario b 
      WHERE b.user_id = s.user_id AND b.activo = true
    );
    
  -- Actualizar status de suscripciones vencidas
  UPDATE public.suscripciones 
  SET status = 'past_due', updated_at = now()
  WHERE fecha_vencimiento < now() 
    AND status = 'trial';
END;
$function$;
