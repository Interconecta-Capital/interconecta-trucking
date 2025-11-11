-- ============================================================================
-- FASE 4 - SPRINT 2 - PARTE 1: CORRECCIÓN DE FUNCIONES SQL
-- ============================================================================
-- Objetivo: Añadir SET search_path a funciones SECURITY DEFINER sin protección
-- Funciones a corregir: 5 funciones identificadas sin search_path
-- ============================================================================

-- 1. get_auth - Función para obtener información del usuario autenticado
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

COMMENT ON FUNCTION public.get_auth() IS 
'Retorna información básica del usuario autenticado. Protegida con search_path.';

-- ============================================================================

-- 2. verificar_disponibilidad_recurso - Verificación de disponibilidad para viajes
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
  -- Verificar disponibilidad según tipo de recurso
  IF recurso_tipo = 'conductor' THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM public.viajes 
      WHERE conductor_id = recurso_id
        AND estado IN ('programado', 'en_transito')
        AND (
          (fecha_inicio_programada, fecha_fin_programada) OVERLAPS (fecha_inicio, fecha_fin)
        )
    ) INTO esta_disponible;
    
  ELSIF recurso_tipo = 'vehiculo' THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM public.viajes 
      WHERE vehiculo_id = recurso_id
        AND estado IN ('programado', 'en_transito')
        AND (
          (fecha_inicio_programada, fecha_fin_programada) OVERLAPS (fecha_inicio, fecha_fin)
        )
    ) INTO esta_disponible;
    
  ELSIF recurso_tipo = 'remolque' THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM public.viajes 
      WHERE remolque_id = recurso_id
        AND estado IN ('programado', 'en_transito')
        AND (
          (fecha_inicio_programada, fecha_fin_programada) OVERLAPS (fecha_inicio, fecha_fin)
        )
    ) INTO esta_disponible;
    
  ELSE
    -- Tipo de recurso no reconocido
    esta_disponible := FALSE;
  END IF;
  
  RETURN esta_disponible;
END;
$$;

COMMENT ON FUNCTION public.verificar_disponibilidad_recurso(TEXT, UUID, TIMESTAMPTZ, TIMESTAMPTZ) IS 
'Verifica si un conductor, vehículo o remolque está disponible en un rango de fechas. Protegida con search_path.';

-- ============================================================================

-- 3. increment_schema_version - Función administrativa (OPCIONAL)
-- NOTA: Solo crear si se utiliza un sistema de versionado de esquema
CREATE OR REPLACE FUNCTION public.increment_schema_version()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  new_version INTEGER;
BEGIN
  -- Verificar que solo superusuarios puedan ejecutar
  IF NOT public.is_superuser_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Solo superusuarios pueden incrementar la versión del esquema';
  END IF;
  
  -- Incrementar versión en tabla de configuración (si existe)
  -- Esta función asume que existe una tabla schema_version
  UPDATE public.schema_version 
  SET version = version + 1, 
      updated_at = NOW()
  RETURNING version INTO new_version;
  
  -- Auditar cambio
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data
  ) VALUES (
    auth.uid(),
    'schema_version_incremented',
    jsonb_build_object(
      'new_version', new_version,
      'timestamp', NOW()
    )
  );
  
  RETURN new_version;
END;
$$;

COMMENT ON FUNCTION public.increment_schema_version() IS 
'Incrementa la versión del esquema de BD. Solo superusuarios. Protegida con search_path.';

-- ============================================================================

-- 4. get_schema_version - Obtener versión actual del esquema
CREATE OR REPLACE FUNCTION public.get_schema_version()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  current_version INTEGER;
BEGIN
  -- Obtener versión actual (si existe tabla schema_version)
  SELECT version INTO current_version
  FROM public.schema_version
  LIMIT 1;
  
  RETURN COALESCE(current_version, 0);
END;
$$;

COMMENT ON FUNCTION public.get_schema_version() IS 
'Retorna la versión actual del esquema de BD. Protegida con search_path.';

-- ============================================================================

-- 5. restore_rls_policies_from_backup - Función administrativa crítica
-- ADVERTENCIA: Esta función es peligrosa y debe usarse con extremo cuidado
-- Solo crear si es absolutamente necesaria para disaster recovery

CREATE OR REPLACE FUNCTION public.restore_rls_policies_from_backup(
  backup_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  policies_restored INTEGER := 0;
  result JSONB;
BEGIN
  -- Verificar que solo superusuarios puedan ejecutar
  IF NOT public.is_superuser_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Solo superusuarios pueden restaurar políticas RLS';
  END IF;
  
  -- Registrar intento de restauración
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data,
    severity
  ) VALUES (
    auth.uid(),
    'rls_restore_attempted',
    jsonb_build_object(
      'backup_id', backup_id,
      'timestamp', NOW()
    ),
    'critical'
  );
  
  -- Lógica de restauración (implementar según tu sistema de backup)
  -- PLACEHOLDER: Aquí iría la lógica real de restauración
  
  RAISE NOTICE 'Función de restauración ejecutada. Revisar implementación.';
  
  result := jsonb_build_object(
    'success', false,
    'message', 'Función necesita implementación específica',
    'policies_restored', policies_restored
  );
  
  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.restore_rls_policies_from_backup(UUID) IS 
'Restaura políticas RLS desde backup. FUNCIÓN CRÍTICA - Solo superusuarios. Protegida con search_path.';

-- ============================================================================
-- VERIFICACIÓN POST-CORRECCIÓN
-- ============================================================================

-- Ejecutar esta consulta para verificar que las funciones tienen search_path configurado
SELECT 
  proname,
  pg_get_function_identity_arguments(p.oid) as arguments,
  prosecdef as is_security_definer,
  (proconfig IS NOT NULL AND proconfig::text LIKE '%search_path%') as has_search_path,
  proconfig
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND prosecdef = true
  AND proname IN (
    'get_auth',
    'verificar_disponibilidad_recurso',
    'increment_schema_version',
    'get_schema_version',
    'restore_rls_policies_from_backup'
  )
ORDER BY proname;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- Todas las funciones deben mostrar has_search_path = true
-- Si alguna muestra false, revisar la sintaxis del CREATE OR REPLACE FUNCTION
-- ============================================================================
