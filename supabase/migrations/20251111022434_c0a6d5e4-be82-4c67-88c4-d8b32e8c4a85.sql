-- ============================================================================
-- MIGRACIÓN: Corregir exportar_datos_usuario y agregar consentimientos default
-- Fecha: 2025-11-11
-- Propósito: 
--   1. Corregir columna usuario_id en exportar_datos_usuario
--   2. Agregar consentimientos por defecto a usuarios existentes
-- ============================================================================

-- ============================================================================
-- PARTE 1: Corregir función exportar_datos_usuario
-- ============================================================================

CREATE OR REPLACE FUNCTION public.exportar_datos_usuario(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  export_data JSONB := '{}'::jsonb;
  profile_data JSONB;
  conductores_data JSONB;
  vehiculos_data JSONB;
  viajes_data JSONB;
  cartas_porte_data JSONB;
  consents_data JSONB;
  socios_data JSONB;
  borradores_data JSONB;
  calendar_data JSONB;
  suscripcion_data JSONB;
BEGIN
  -- Verificar autorización
  IF auth.uid() != target_user_id AND NOT (
    SELECT (raw_user_meta_data->>'is_admin' = 'true' OR raw_user_meta_data->>'is_superuser' = 'true')
    FROM auth.users WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No autorizado para exportar datos de este usuario';
  END IF;

  -- Exportar perfil
  SELECT to_jsonb(p.*) INTO profile_data
  FROM public.profiles p
  WHERE p.id = target_user_id;

  -- Exportar conductores
  SELECT jsonb_agg(to_jsonb(c.*)) INTO conductores_data
  FROM public.conductores c
  WHERE c.user_id = target_user_id;

  -- Exportar vehículos
  SELECT jsonb_agg(to_jsonb(v.*)) INTO vehiculos_data
  FROM public.vehiculos v
  WHERE v.user_id = target_user_id;

  -- Exportar viajes (últimos 1000)
  SELECT jsonb_agg(to_jsonb(vi.*)) INTO viajes_data
  FROM (
    SELECT * FROM public.viajes
    WHERE user_id = target_user_id
    ORDER BY created_at DESC
    LIMIT 1000
  ) vi;

  -- Exportar cartas porte (últimas 1000) - CORREGIDO: usuario_id en lugar de user_id
  SELECT jsonb_agg(to_jsonb(cp.*)) INTO cartas_porte_data
  FROM (
    SELECT * FROM public.cartas_porte
    WHERE usuario_id = target_user_id
    ORDER BY created_at DESC
    LIMIT 1000
  ) cp;

  -- Exportar consentimientos
  SELECT jsonb_agg(to_jsonb(uc.*)) INTO consents_data
  FROM public.user_consents uc
  WHERE uc.user_id = target_user_id;

  -- Exportar socios
  SELECT jsonb_agg(to_jsonb(s.*)) INTO socios_data
  FROM public.socios s
  WHERE s.user_id = target_user_id;

  -- Exportar borradores de carta porte
  SELECT jsonb_agg(to_jsonb(b.*)) INTO borradores_data
  FROM public.borradores_carta_porte b
  WHERE b.user_id = target_user_id;

  -- Exportar eventos de calendario
  SELECT jsonb_agg(to_jsonb(ce.*)) INTO calendar_data
  FROM public.calendar_events ce
  WHERE ce.user_id = target_user_id;

  -- Exportar información de suscripción
  SELECT to_jsonb(sub.*) INTO suscripcion_data
  FROM public.suscripciones sub
  WHERE sub.user_id = target_user_id;

  -- Construir objeto de exportación
  export_data := jsonb_build_object(
    'export_date', now(),
    'user_id', target_user_id,
    'profile', COALESCE(profile_data, '{}'::jsonb),
    'conductores', COALESCE(conductores_data, '[]'::jsonb),
    'vehiculos', COALESCE(vehiculos_data, '[]'::jsonb),
    'viajes', COALESCE(viajes_data, '[]'::jsonb),
    'cartas_porte', COALESCE(cartas_porte_data, '[]'::jsonb),
    'consents', COALESCE(consents_data, '[]'::jsonb),
    'socios', COALESCE(socios_data, '[]'::jsonb),
    'borradores_carta_porte', COALESCE(borradores_data, '[]'::jsonb),
    'calendar_events', COALESCE(calendar_data, '[]'::jsonb),
    'suscripcion', COALESCE(suscripcion_data, '{}'::jsonb),
    'metadata', jsonb_build_object(
      'gdpr_compliance', 'Art. 15 - Right to access',
      'lfpdppp_compliance', 'Art. 23 - Derecho de acceso (ARCO)',
      'export_version', '2.0'
    )
  );

  -- Registrar acceso en auditoría (sin columna severity)
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data
  ) VALUES (
    target_user_id,
    'data_export_requested',
    jsonb_build_object(
      'export_size_kb', (length(export_data::text) / 1024)::INTEGER,
      'exported_at', now(),
      'exported_by', auth.uid()
    )
  );

  RETURN export_data;
END;
$$;

-- ============================================================================
-- PARTE 2: Agregar consentimientos por defecto a usuarios existentes
-- ============================================================================

-- Insertar consentimientos de Política de Privacidad para usuarios sin consentimientos
-- Excluir superusuarios
INSERT INTO public.user_consents (
  user_id,
  consent_type,
  version,
  consented_at,
  ip_address,
  user_agent
)
SELECT 
  au.id,
  'privacy_policy',
  '1.0',
  au.created_at,
  '0.0.0.0', -- IP no disponible para registros históricos
  'Sistema - Consentimiento retroactivo'
FROM auth.users au
WHERE 
  -- Usuario no es superusuario
  (au.raw_user_meta_data->>'is_superuser' IS NULL OR au.raw_user_meta_data->>'is_superuser' != 'true')
  -- Usuario no tiene ya un consentimiento de privacy_policy
  AND NOT EXISTS (
    SELECT 1 FROM public.user_consents uc 
    WHERE uc.user_id = au.id 
    AND uc.consent_type = 'privacy_policy'
  );

-- Insertar consentimientos de Términos de Servicio para usuarios sin consentimientos
-- Excluir superusuarios
INSERT INTO public.user_consents (
  user_id,
  consent_type,
  version,
  consented_at,
  ip_address,
  user_agent
)
SELECT 
  au.id,
  'terms_of_service',
  '1.0',
  au.created_at,
  '0.0.0.0', -- IP no disponible para registros históricos
  'Sistema - Consentimiento retroactivo'
FROM auth.users au
WHERE 
  -- Usuario no es superusuario
  (au.raw_user_meta_data->>'is_superuser' IS NULL OR au.raw_user_meta_data->>'is_superuser' != 'true')
  -- Usuario no tiene ya un consentimiento de terms_of_service
  AND NOT EXISTS (
    SELECT 1 FROM public.user_consents uc 
    WHERE uc.user_id = au.id 
    AND uc.consent_type = 'terms_of_service'
  );

-- Registrar en auditoría (sin columna severity)
INSERT INTO public.security_audit_log (
  user_id,
  event_type,
  event_data
) 
SELECT 
  au.id,
  'retroactive_consent_granted',
  jsonb_build_object(
    'consent_types', ARRAY['privacy_policy', 'terms_of_service'],
    'version', '1.0',
    'reason', 'Consentimiento retroactivo para usuarios existentes pre-GDPR',
    'granted_at', now()
  )
FROM auth.users au
WHERE 
  (au.raw_user_meta_data->>'is_superuser' IS NULL OR au.raw_user_meta_data->>'is_superuser' != 'true')
  AND EXISTS (
    SELECT 1 FROM public.user_consents uc 
    WHERE uc.user_id = au.id 
    AND uc.ip_address = '0.0.0.0'
  );

-- ============================================================================
-- COMENTARIOS
-- ============================================================================
COMMENT ON FUNCTION public.exportar_datos_usuario(UUID) IS 
'Exporta todos los datos de un usuario (v2.0) - GDPR Art. 15 + LFPDPPP Art. 23. 
Corregido: usa usuario_id para cartas_porte. Incluye: profile, conductores, vehículos, 
viajes, cartas_porte, consentimientos, socios, borradores, calendario y suscripción.';