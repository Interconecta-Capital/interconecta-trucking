-- ============================================================================
-- FASE 4 - SPRINT 2 - PARTE 1: CORRECCIÓN DE FUNCIONES SQL
-- ============================================================================

-- 1. get_auth
CREATE OR REPLACE FUNCTION public.get_auth()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN jsonb_build_object(
    'uid', auth.uid(),
    'email', (SELECT email FROM auth.users WHERE id = auth.uid())
  );
END;
$$;

-- 2. verificar_disponibilidad_recurso
CREATE OR REPLACE FUNCTION public.verificar_disponibilidad_recurso(
  recurso_tipo TEXT,
  recurso_id UUID,
  fecha_inicio TIMESTAMPTZ,
  fecha_fin TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  esta_disponible BOOLEAN;
BEGIN
  IF recurso_tipo = 'conductor' THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM public.viajes 
      WHERE conductor_id = recurso_id
        AND estado IN ('programado', 'en_transito')
        AND (fecha_inicio_programada, fecha_fin_programada) OVERLAPS (fecha_inicio, fecha_fin)
    ) INTO esta_disponible;
  ELSIF recurso_tipo = 'vehiculo' THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM public.viajes 
      WHERE vehiculo_id = recurso_id
        AND estado IN ('programado', 'en_transito')
        AND (fecha_inicio_programada, fecha_fin_programada) OVERLAPS (fecha_inicio, fecha_fin)
    ) INTO esta_disponible;
  ELSIF recurso_tipo = 'remolque' THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM public.viajes 
      WHERE remolque_id = recurso_id
        AND estado IN ('programado', 'en_transito')
        AND (fecha_inicio_programada, fecha_fin_programada) OVERLAPS (fecha_inicio, fecha_fin)
    ) INTO esta_disponible;
  ELSE
    esta_disponible := FALSE;
  END IF;
  RETURN esta_disponible;
END;
$$;

-- 3. increment_schema_version
CREATE OR REPLACE FUNCTION public.increment_schema_version()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  new_version INTEGER;
BEGIN
  IF NOT public.is_superuser_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Solo superusuarios pueden incrementar la versión del esquema';
  END IF;
  
  UPDATE public.schema_version 
  SET version = version + 1, 
      updated_at = NOW()
  RETURNING version INTO new_version;
  
  INSERT INTO public.security_audit_log (
    user_id, event_type, event_data
  ) VALUES (
    auth.uid(),
    'schema_version_incremented',
    jsonb_build_object('new_version', new_version, 'timestamp', NOW())
  );
  
  RETURN new_version;
END;
$$;

-- 4. get_schema_version
CREATE OR REPLACE FUNCTION public.get_schema_version()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  current_version INTEGER;
BEGIN
  SELECT version INTO current_version
  FROM public.schema_version
  LIMIT 1;
  RETURN COALESCE(current_version, 0);
END;
$$;

-- 5. restore_rls_policies_from_backup
CREATE OR REPLACE FUNCTION public.restore_rls_policies_from_backup(backup_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  policies_restored INTEGER := 0;
  result JSONB;
BEGIN
  IF NOT public.is_superuser_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Solo superusuarios pueden restaurar políticas RLS';
  END IF;
  
  INSERT INTO public.security_audit_log (
    user_id, event_type, event_data, severity
  ) VALUES (
    auth.uid(),
    'rls_restore_attempted',
    jsonb_build_object('backup_id', backup_id, 'timestamp', NOW()),
    'critical'
  );
  
  result := jsonb_build_object(
    'success', false,
    'message', 'Función necesita implementación específica',
    'policies_restored', policies_restored
  );
  
  RETURN result;
END;
$$;