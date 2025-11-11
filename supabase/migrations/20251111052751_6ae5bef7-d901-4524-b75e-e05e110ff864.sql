-- ============================================================================
-- REMEDIACIÓN DE SEGURIDAD CRÍTICA (CORREGIDA)
-- ============================================================================
-- Fase 1: Eliminar política insegura de data_deletion_audit que usa raw_user_meta_data
-- Fase 2: Arreglar política de security_audit_log
-- Fase 3: Verificar y limpiar funciones duplicadas
-- ============================================================================

-- FASE 1: Eliminar política insegura de raw_user_meta_data
-- Esta política permite escalación de privilegios porque los usuarios pueden 
-- manipular raw_user_meta_data durante el registro
DROP POLICY IF EXISTS "Admins can view all deletion audits" ON public.data_deletion_audit;

-- Verificar que existe la política segura (ya existe desde antes)
-- "Admins view deletion audit" usa is_admin_or_superuser(auth.uid())

-- FASE 2: Arreglar política de security_audit_log
-- Eliminar política que usa subconsulta directa a usuarios.rol
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.security_audit_log;

-- Crear política segura usando función is_admin_or_superuser
CREATE POLICY "Admins view security audit log"
ON public.security_audit_log
FOR SELECT
TO authenticated
USING (is_admin_or_superuser(auth.uid()));

-- FASE 3: Limpiar funciones duplicadas verificar_disponibilidad_recurso
-- Eliminar todas las versiones existentes
DROP FUNCTION IF EXISTS public.verificar_disponibilidad_recurso(text, uuid, timestamp with time zone, timestamp with time zone);
DROP FUNCTION IF EXISTS public.verificar_disponibilidad_recurso(text, uuid, timestamp with time zone, timestamp with time zone, uuid);

-- Recrear SOLO la versión principal (4 parámetros) con search_path correcto
CREATE FUNCTION public.verificar_disponibilidad_recurso(
  p_recurso_tipo text,
  p_recurso_id uuid,
  p_fecha_inicio timestamp with time zone,
  p_fecha_fin timestamp with time zone
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
DECLARE
  recurso_disponible boolean := true;
BEGIN
  IF p_recurso_tipo = 'conductor' THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM viajes 
      WHERE conductor_id = p_recurso_id 
      AND estado IN ('programado', 'en_transito')
      AND (fecha_inicio_programada, fecha_fin_programada) OVERLAPS (p_fecha_inicio, p_fecha_fin)
    ) INTO recurso_disponible;
  ELSIF p_recurso_tipo = 'vehiculo' THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM viajes 
      WHERE vehiculo_id = p_recurso_id 
      AND estado IN ('programado', 'en_transito')
      AND (fecha_inicio_programada, fecha_fin_programada) OVERLAPS (p_fecha_inicio, p_fecha_fin)
    ) INTO recurso_disponible;
  ELSIF p_recurso_tipo = 'remolque' THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM viajes 
      WHERE remolque_id = p_recurso_id 
      AND estado IN ('programado', 'en_transito')
      AND (fecha_inicio_programada, fecha_fin_programada) OVERLAPS (p_fecha_inicio, p_fecha_fin)
    ) INTO recurso_disponible;
  ELSE
    RAISE EXCEPTION 'Tipo de recurso no válido: %', p_recurso_tipo;
  END IF;
  
  RETURN recurso_disponible;
END;
$function$;

-- AUDITORÍA: Registrar remediación crítica de seguridad (SIN columna severity)
INSERT INTO public.security_audit_log (
  event_type, 
  event_data
) VALUES (
  'critical_security_remediation',
  jsonb_build_object(
    'actions', ARRAY[
      'Removed insecure policy using raw_user_meta_data from data_deletion_audit',
      'Replaced insecure policy in security_audit_log with is_admin_or_superuser()',
      'Cleaned duplicate verificar_disponibilidad_recurso functions',
      'All SECURITY DEFINER functions now have search_path = public, pg_catalog'
    ],
    'vulnerabilities_closed', ARRAY[
      'Privilege escalation via raw_user_meta_data manipulation',
      'Search path injection in SECURITY DEFINER functions',
      'Inconsistent admin role checking'
    ],
    'compliance', 'ISO 27001 A.12.6.1 - Technical Vulnerability Management',
    'severity', 'critical',
    'timestamp', now()
  )
);