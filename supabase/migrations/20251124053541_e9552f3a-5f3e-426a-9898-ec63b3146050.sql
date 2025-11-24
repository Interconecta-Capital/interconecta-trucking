
-- Fix remaining SECURITY DEFINER functions without search_path
-- Addresses: Supabase Linter Warning - Function Search Path Mutable
-- Priority: HIGH - SECURITY DEFINER functions without search_path can be exploited

-- ============================================================
-- 1. get_recursos_viaje_wizard - Fixed to include search_path
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_recursos_viaje_wizard(p_user_id uuid)
RETURNS TABLE(conductores_disponibles jsonb, vehiculos_disponibles jsonb, remolques_disponibles jsonb)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'id', c.id,
        'nombre', c.nombre,
        'estado', c.estado,
        'telefono', c.telefono,
        'vigencia_licencia', c.vigencia_licencia,
        'num_licencia', c.num_licencia,
        'tipo_licencia', c.tipo_licencia
      ) ORDER BY c.created_at DESC
    ) FROM conductores c 
    WHERE c.user_id = p_user_id 
      AND c.activo = true 
      AND c.estado = 'disponible'
    LIMIT 100) AS conductores_disponibles,
    
    (SELECT JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'id', v.id,
        'placa', v.placa,
        'marca', v.marca,
        'modelo', v.modelo,
        'estado', v.estado,
        'capacidad_carga', v.capacidad_carga,
        'config_vehicular', v.config_vehicular,
        'tipo_carroceria', v.tipo_carroceria
      ) ORDER BY v.created_at DESC
    ) FROM vehiculos v 
    WHERE v.user_id = p_user_id 
      AND v.activo = true 
      AND v.estado = 'disponible'
    LIMIT 100) AS vehiculos_disponibles,
    
    (SELECT JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'id', r.id,
        'placa', r.placa,
        'tipo_remolque', r.tipo_remolque,
        'estado', r.estado,
        'capacidad_carga', r.capacidad_carga
      ) ORDER BY r.created_at DESC
    ) FROM remolques r 
    WHERE r.user_id = p_user_id 
      AND r.activo = true 
      AND r.estado = 'disponible'
    LIMIT 50) AS remolques_disponibles;
END;
$function$;

-- ============================================================
-- 2. get_viaje_completo - Fixed to include search_path
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_viaje_completo(p_viaje_id uuid)
RETURNS TABLE(viaje_data jsonb, factura_data jsonb, carta_porte_data jsonb, conductor_data jsonb, vehiculo_data jsonb, socio_data jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    to_jsonb(v.*) as viaje_data,
    to_jsonb(f.*) as factura_data,
    to_jsonb(cp.*) as carta_porte_data,
    to_jsonb(c.*) as conductor_data,
    to_jsonb(vh.*) as vehiculo_data,
    to_jsonb(s.*) as socio_data
  FROM viajes v
  LEFT JOIN facturas f ON f.id = v.factura_id
  LEFT JOIN cartas_porte cp ON cp.viaje_id = v.id
  LEFT JOIN conductores c ON c.id = v.conductor_id
  LEFT JOIN vehiculos vh ON vh.id = v.vehiculo_id
  LEFT JOIN socios s ON s.id = v.socio_id
  WHERE v.id = p_viaje_id
  AND v.user_id = auth.uid();
END;
$function$;

-- ============================================================
-- 3. mi_funcion_que_necesita_pac - Fixed to include search_path
-- ============================================================
CREATE OR REPLACE FUNCTION public.mi_funcion_que_necesita_pac()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
DECLARE
  token TEXT;
BEGIN
  SELECT get_pac_token() INTO token;
END;
$function$;

-- ============================================================
-- 4. refresh_viajes_dashboard - Fixed to include search_path
-- ============================================================
CREATE OR REPLACE FUNCTION public.refresh_viajes_dashboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_viajes_dashboard;
END;
$function$;

-- ============================================================
-- Log the security hardening in audit log
-- ============================================================
INSERT INTO public.security_audit_log (
  user_id,
  event_type,
  event_data
) VALUES (
  NULL,
  'security_hardening',
  jsonb_build_object(
    'action', 'fix_function_search_path',
    'functions_secured', ARRAY[
      'get_recursos_viaje_wizard',
      'get_viaje_completo',
      'mi_funcion_que_necesita_pac',
      'refresh_viajes_dashboard'
    ],
    'security_level', 'SECURITY DEFINER',
    'timestamp', now(),
    'compliance', 'Supabase Linter: function_search_path_mutable'
  )
);
