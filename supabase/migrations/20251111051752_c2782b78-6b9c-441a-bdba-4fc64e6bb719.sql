-- ============================================================================
-- ARREGLAR search_path EN FUNCIONES CRÍTICAS (V2)
-- ============================================================================

-- Primero eliminar las funciones existentes
DROP FUNCTION IF EXISTS public.restore_rls_policies_from_backup();
DROP FUNCTION IF EXISTS public.verificar_disponibilidad_recurso(text, uuid, timestamp with time zone, timestamp with time zone);

-- Recrear con search_path correcto

-- Función 1: restore_rls_policies_from_backup
CREATE FUNCTION public.restore_rls_policies_from_backup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
BEGIN
  RAISE NOTICE 'Restauración de políticas RLS - funcionalidad pendiente';
  INSERT INTO security_audit_log (event_type, event_data)
  VALUES ('rls_policies_restore_attempted', jsonb_build_object('timestamp', now(), 'status', 'not_implemented'));
END;
$function$;

-- Función 2: verificar_disponibilidad_recurso
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
      SELECT 1 FROM viajes WHERE conductor_id = p_recurso_id AND estado IN ('programado', 'en_transito')
      AND (fecha_inicio_programada, fecha_fin_programada) OVERLAPS (p_fecha_inicio, p_fecha_fin)
    ) INTO recurso_disponible;
  ELSIF p_recurso_tipo = 'vehiculo' THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM viajes WHERE vehiculo_id = p_recurso_id AND estado IN ('programado', 'en_transito')
      AND (fecha_inicio_programada, fecha_fin_programada) OVERLAPS (p_fecha_inicio, p_fecha_fin)
    ) INTO recurso_disponible;
  ELSIF p_recurso_tipo = 'remolque' THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM viajes WHERE remolque_id = p_recurso_id AND estado IN ('programado', 'en_transito')
      AND (fecha_inicio_programada, fecha_fin_programada) OVERLAPS (p_fecha_inicio, p_fecha_fin)
    ) INTO recurso_disponible;
  ELSE
    RAISE EXCEPTION 'Tipo de recurso no válido: %', p_recurso_tipo;
  END IF;
  RETURN recurso_disponible;
END;
$function$;

-- Auditoría
INSERT INTO security_audit_log (event_type, event_data)
VALUES ('search_path_fixed_critical_functions', jsonb_build_object(
  'functions', ARRAY['restore_rls_policies_from_backup', 'verificar_disponibilidad_recurso'],
  'timestamp', now()
));