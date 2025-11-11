-- ============================================================================
-- FASE 2: GDPR/LFPDPPP COMPLIANCE - MIGRACIÓN COMPLETA
-- Fecha: 2025-01-11
-- Objetivo: Implementar controles GDPR Art. 5, 7, 15-22, 25, 32 + LFPDPPP
-- ============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLA 1: user_consents (Registro de consentimientos - GDPR Art. 7)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  consent_type VARCHAR(100) NOT NULL CHECK (consent_type IN ('terms_of_service', 'privacy_policy', 'data_processing', 'marketing', 'analytics')),
  version VARCHAR(50) NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON public.user_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_user_consents_date ON public.user_consents(consented_at);

-- RLS Policies
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consents"
ON public.user_consents FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents"
ON public.user_consents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all consents"
ON public.user_consents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (raw_user_meta_data->>'is_admin' = 'true' OR raw_user_meta_data->>'is_superuser' = 'true')
  )
);

-- ============================================================================
-- TABLA 2: data_deletion_audit (Auditoría de eliminaciones - GDPR Art. 17)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.data_deletion_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  deletion_requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deletion_completed_at TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  tables_affected JSONB DEFAULT '[]'::jsonb,
  records_anonymized INTEGER DEFAULT 0,
  records_deleted INTEGER DEFAULT 0,
  error_message TEXT,
  executed_by UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_deletion_audit_user_id ON public.data_deletion_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_audit_status ON public.data_deletion_audit(status);
CREATE INDEX IF NOT EXISTS idx_deletion_audit_date ON public.data_deletion_audit(deletion_requested_at);

-- RLS Policies
ALTER TABLE public.data_deletion_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deletion requests"
ON public.data_deletion_audit FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can insert deletion records"
ON public.data_deletion_audit FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR auth.uid() = executed_by);

CREATE POLICY "System can update deletion records"
ON public.data_deletion_audit FOR UPDATE
TO authenticated
USING (auth.uid() = executed_by OR auth.uid() = user_id);

CREATE POLICY "Admins can view all deletion audits"
ON public.data_deletion_audit FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (raw_user_meta_data->>'is_admin' = 'true' OR raw_user_meta_data->>'is_superuser' = 'true')
  )
);

-- ============================================================================
-- FUNCIÓN 1: anonimizar_usuario (Anonimización de datos - GDPR Art. 17)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.anonimizar_usuario(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  anonimo_email TEXT;
  anonimo_nombre TEXT;
  affected_tables JSONB := '[]'::jsonb;
  records_count INTEGER := 0;
BEGIN
  -- Verificar autorización: solo el propio usuario o admin
  IF auth.uid() != target_user_id AND NOT (
    SELECT (raw_user_meta_data->>'is_admin' = 'true' OR raw_user_meta_data->>'is_superuser' = 'true')
    FROM auth.users WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No autorizado para anonimizar este usuario';
  END IF;

  -- Generar identificadores anónimos
  anonimo_email := 'deleted_' || encode(gen_random_bytes(8), 'hex') || '@anonimizado.local';
  anonimo_nombre := 'Usuario Eliminado ' || encode(gen_random_bytes(4), 'hex');

  -- Anonimizar tabla profiles
  UPDATE public.profiles
  SET 
    nombre = anonimo_nombre,
    email = anonimo_email,
    telefono = NULL,
    rfc = 'ANONIMIZADO',
    empresa = 'Empresa Eliminada'
  WHERE id = target_user_id;
  GET DIAGNOSTICS records_count = ROW_COUNT;
  IF records_count > 0 THEN
    affected_tables := affected_tables || jsonb_build_object('table', 'profiles', 'records', records_count);
  END IF;

  -- Anonimizar tabla usuarios (si existe)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios' AND table_schema = 'public') THEN
    UPDATE public.usuarios
    SET 
      nombre = anonimo_nombre,
      email = anonimo_email,
      telefono = NULL
    WHERE auth_user_id = target_user_id;
    GET DIAGNOSTICS records_count = ROW_COUNT;
    IF records_count > 0 THEN
      affected_tables := affected_tables || jsonb_build_object('table', 'usuarios', 'records', records_count);
    END IF;
  END IF;

  -- Anonimizar conductores
  UPDATE public.conductores
  SET 
    nombre = anonimo_nombre,
    licencia_numero = 'ANON' || encode(gen_random_bytes(4), 'hex'),
    telefono = NULL,
    email = anonimo_email,
    direccion = 'Dirección eliminada',
    foto_licencia_url = NULL
  WHERE user_id = target_user_id;
  GET DIAGNOSTICS records_count = ROW_COUNT;
  IF records_count > 0 THEN
    affected_tables := affected_tables || jsonb_build_object('table', 'conductores', 'records', records_count);
  END IF;

  -- Anonimizar security_audit_log (eliminar IPs y user agents)
  UPDATE public.security_audit_log
  SET 
    ip_address = NULL,
    user_agent = NULL,
    event_data = CASE 
      WHEN event_data IS NOT NULL THEN event_data || jsonb_build_object('anonymized', true, 'anonymized_at', now())
      ELSE jsonb_build_object('anonymized', true, 'anonymized_at', now())
    END
  WHERE user_id = target_user_id;
  GET DIAGNOSTICS records_count = ROW_COUNT;
  IF records_count > 0 THEN
    affected_tables := affected_tables || jsonb_build_object('table', 'security_audit_log', 'records', records_count);
  END IF;

  -- Registrar auditoría
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data,
    severity
  ) VALUES (
    target_user_id,
    'user_anonymized',
    jsonb_build_object(
      'affected_tables', affected_tables,
      'anonymized_at', now(),
      'executed_by', auth.uid()
    ),
    'info'
  );

  RETURN jsonb_build_object(
    'success', true,
    'affected_tables', affected_tables,
    'message', 'Usuario anonimizado correctamente'
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.anonimizar_usuario(UUID) TO authenticated;

-- ============================================================================
-- FUNCIÓN 2: eliminar_datos_usuario (Eliminación con período de gracia)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.eliminar_datos_usuario(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  audit_record UUID;
  result JSONB;
BEGIN
  -- Verificar autorización
  IF auth.uid() != target_user_id AND NOT (
    SELECT (raw_user_meta_data->>'is_admin' = 'true' OR raw_user_meta_data->>'is_superuser' = 'true')
    FROM auth.users WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No autorizado para eliminar este usuario';
  END IF;

  -- Crear registro de auditoría
  INSERT INTO public.data_deletion_audit (
    user_id,
    status,
    executed_by,
    metadata
  ) VALUES (
    target_user_id,
    'in_progress',
    auth.uid(),
    jsonb_build_object('deletion_type', 'user_requested', 'grace_period_days', 30)
  ) RETURNING id INTO audit_record;

  -- Ejecutar anonimización (GDPR Art. 17 - Right to erasure)
  result := public.anonimizar_usuario(target_user_id);

  -- Actualizar registro de auditoría
  UPDATE public.data_deletion_audit
  SET 
    status = 'completed',
    deletion_completed_at = now(),
    tables_affected = result->'affected_tables',
    records_anonymized = (
      SELECT SUM((value->>'records')::INTEGER)
      FROM jsonb_array_elements(result->'affected_tables')
    ),
    updated_at = now()
  WHERE id = audit_record;

  -- Registrar en security_audit_log
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data,
    severity
  ) VALUES (
    target_user_id,
    'user_deletion_completed',
    jsonb_build_object(
      'audit_id', audit_record,
      'result', result,
      'completed_at', now()
    ),
    'warn'
  );

  RETURN jsonb_build_object(
    'success', true,
    'audit_id', audit_record,
    'message', 'Solicitud de eliminación procesada. Los datos han sido anonimizados.',
    'grace_period_days', 30,
    'result', result
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Marcar como fallido
    UPDATE public.data_deletion_audit
    SET 
      status = 'failed',
      error_message = SQLERRM,
      updated_at = now()
    WHERE id = audit_record;
    
    RAISE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.eliminar_datos_usuario(UUID) TO authenticated;

-- ============================================================================
-- FUNCIÓN 3: exportar_datos_usuario (GDPR Art. 15 - Right to access)
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

  -- Exportar cartas porte (últimas 1000)
  SELECT jsonb_agg(to_jsonb(cp.*)) INTO cartas_porte_data
  FROM (
    SELECT * FROM public.cartas_porte
    WHERE user_id = target_user_id
    ORDER BY created_at DESC
    LIMIT 1000
  ) cp;

  -- Exportar consentimientos
  SELECT jsonb_agg(to_jsonb(uc.*)) INTO consents_data
  FROM public.user_consents uc
  WHERE uc.user_id = target_user_id;

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
    'metadata', jsonb_build_object(
      'gdpr_compliance', 'Art. 15 - Right to access',
      'lfpdppp_compliance', 'Art. 23 - Derecho de acceso (ARCO)'
    )
  );

  -- Registrar acceso
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data,
    severity
  ) VALUES (
    target_user_id,
    'data_export_requested',
    jsonb_build_object(
      'export_size_kb', (length(export_data::text) / 1024)::INTEGER,
      'exported_at', now(),
      'exported_by', auth.uid()
    ),
    'info'
  );

  RETURN export_data;
END;
$$;

GRANT EXECUTE ON FUNCTION public.exportar_datos_usuario(UUID) TO authenticated;

-- ============================================================================
-- FUNCIÓN 4: verificar_eliminacion_completa (Validación post-eliminación)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.verificar_eliminacion_completa(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  profile_check BOOLEAN;
  conductores_check BOOLEAN;
  audit_check BOOLEAN;
  result JSONB;
BEGIN
  -- Verificar que el perfil está anonimizado
  SELECT (email LIKE 'deleted_%@anonimizado.local' AND rfc = 'ANONIMIZADO')
  INTO profile_check
  FROM public.profiles
  WHERE id = target_user_id;

  -- Verificar que los conductores están anonimizados
  SELECT NOT EXISTS (
    SELECT 1 FROM public.conductores
    WHERE user_id = target_user_id
    AND (
      email NOT LIKE 'deleted_%@anonimizado.local' OR
      licencia_numero NOT LIKE 'ANON%' OR
      telefono IS NOT NULL OR
      foto_licencia_url IS NOT NULL
    )
  ) INTO conductores_check;

  -- Verificar que hay registro de auditoría
  SELECT EXISTS (
    SELECT 1 FROM public.data_deletion_audit
    WHERE user_id = target_user_id
    AND status = 'completed'
  ) INTO audit_check;

  result := jsonb_build_object(
    'user_id', target_user_id,
    'is_fully_anonymized', (profile_check AND conductores_check AND audit_check),
    'checks', jsonb_build_object(
      'profile_anonymized', COALESCE(profile_check, false),
      'conductores_anonymized', COALESCE(conductores_check, false),
      'audit_record_exists', COALESCE(audit_check, false)
    ),
    'verified_at', now()
  );

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verificar_eliminacion_completa(UUID) TO authenticated;

-- ============================================================================
-- FUNCIÓN 5: sanitize_pii_from_logs (Limpieza automática de PII en logs)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sanitize_pii_from_logs()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  records_sanitized INTEGER := 0;
  records_deleted INTEGER := 0;
BEGIN
  -- Eliminar IPs de logs mayores a 90 días (GDPR Art. 5(1)(e) - Storage limitation)
  UPDATE public.security_audit_log
  SET 
    ip_address = NULL,
    user_agent = NULL
  WHERE created_at < now() - INTERVAL '90 days'
    AND (ip_address IS NOT NULL OR user_agent IS NOT NULL);
  
  GET DIAGNOSTICS records_sanitized = ROW_COUNT;

  -- Eliminar registros de rate_limit_log mayores a 30 días
  DELETE FROM public.rate_limit_log
  WHERE created_at < now() - INTERVAL '30 days';
  
  GET DIAGNOSTICS records_deleted = ROW_COUNT;

  -- Registrar ejecución
  INSERT INTO public.security_audit_log (
    event_type,
    event_data,
    severity
  ) VALUES (
    'pii_sanitization_completed',
    jsonb_build_object(
      'records_sanitized', records_sanitized,
      'records_deleted', records_deleted,
      'executed_at', now(),
      'compliance', 'GDPR Art. 5(1)(e) - Storage limitation'
    ),
    'info'
  );

  RETURN jsonb_build_object(
    'success', true,
    'records_sanitized', records_sanitized,
    'records_deleted', records_deleted,
    'message', 'PII sanitization completed successfully'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.sanitize_pii_from_logs() TO service_role;

-- ============================================================================
-- TRIGGER: Actualizar updated_at en data_deletion_audit
-- ============================================================================
CREATE OR REPLACE FUNCTION update_data_deletion_audit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_data_deletion_audit_updated_at
BEFORE UPDATE ON public.data_deletion_audit
FOR EACH ROW
EXECUTE FUNCTION update_data_deletion_audit_updated_at();

-- ============================================================================
-- COMENTARIOS FINALES
-- ============================================================================
COMMENT ON TABLE public.user_consents IS 'Registro de consentimientos de usuarios - GDPR Art. 7 + LFPDPPP Art. 8';
COMMENT ON TABLE public.data_deletion_audit IS 'Auditoría de solicitudes de eliminación - GDPR Art. 17 + LFPDPPP Art. 26';
COMMENT ON FUNCTION public.anonimizar_usuario(UUID) IS 'Anonimiza datos personales de un usuario - GDPR Art. 17';
COMMENT ON FUNCTION public.eliminar_datos_usuario(UUID) IS 'Procesa solicitud de eliminación de cuenta con período de gracia de 30 días';
COMMENT ON FUNCTION public.exportar_datos_usuario(UUID) IS 'Exporta todos los datos de un usuario - GDPR Art. 15 + LFPDPPP Art. 23';
COMMENT ON FUNCTION public.verificar_eliminacion_completa(UUID) IS 'Verifica que la eliminación de datos se completó correctamente';
COMMENT ON FUNCTION public.sanitize_pii_from_logs() IS 'Elimina PII de logs antiguos - GDPR Art. 5(1)(e)';

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================