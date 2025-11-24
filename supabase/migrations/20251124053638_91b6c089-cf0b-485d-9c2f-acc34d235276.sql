
-- Fix remaining SECURITY INVOKER functions without search_path
-- Using ALTER FUNCTION to add search_path without changing function logic
-- This is safer than recreating functions

-- ============================================================
-- ALTER FUNCTION to add search_path (preserves existing logic)
-- ============================================================

-- Trigger functions
ALTER FUNCTION public.trigger_refresh_dashboard() 
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.update_data_deletion_audit_updated_at() 
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.update_facturas_updated_at() 
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.update_remolques_updated_at() 
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.update_rutas_frecuentes_updated_at() 
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.validate_fauna_silvestre() 
  SET search_path = public, pg_catalog;

-- Regular functions (need to specify parameter types)
ALTER FUNCTION public.validate_carta_porte_v31(jsonb) 
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.poblar_datos_viajes_existentes() 
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.poblar_datos_viajes_existentes_mejorado() 
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.sync_carta_porte_fields() 
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.sync_carta_porte_fields_enhanced() 
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.send_cleanup_warnings() 
  SET search_path = public, pg_catalog;

-- ============================================================
-- Log completion
-- ============================================================
INSERT INTO public.security_audit_log (
  user_id,
  event_type,
  event_data
) VALUES (
  NULL,
  'security_hardening',
  jsonb_build_object(
    'action', 'fix_all_function_search_paths',
    'method', 'ALTER FUNCTION',
    'functions_secured', ARRAY[
      'trigger_refresh_dashboard',
      'update_data_deletion_audit_updated_at',
      'update_facturas_updated_at',
      'update_remolques_updated_at',
      'update_rutas_frecuentes_updated_at',
      'validate_carta_porte_v31',
      'validate_fauna_silvestre',
      'poblar_datos_viajes_existentes',
      'poblar_datos_viajes_existentes_mejorado',
      'sync_carta_porte_fields',
      'sync_carta_porte_fields_enhanced',
      'send_cleanup_warnings'
    ],
    'total_functions_secured', 12,
    'timestamp', now(),
    'compliance', 'Supabase Linter: function_search_path_mutable - ALL functions now have search_path'
  )
);
