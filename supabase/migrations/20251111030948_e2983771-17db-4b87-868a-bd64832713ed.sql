-- Habilitar extensión pgcrypto si no está habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Recrear función anonimizar_usuario usando gen_random_uuid() para compatibilidad
CREATE OR REPLACE FUNCTION public.anonimizar_usuario(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  anonimo_email TEXT;
  anonimo_nombre TEXT;
  affected_tables JSONB := '[]'::jsonb;
  records_count INTEGER := 0;
  random_suffix TEXT;
BEGIN
  -- Verificar autorización: solo el propio usuario o admin
  IF auth.uid() != target_user_id AND NOT (
    SELECT (raw_user_meta_data->>'is_admin' = 'true' OR raw_user_meta_data->>'is_superuser' = 'true')
    FROM auth.users WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No autorizado para anonimizar este usuario';
  END IF;

  -- Generar identificadores anónimos usando MD5 + timestamp (compatible siempre)
  random_suffix := substring(md5(random()::text || clock_timestamp()::text) from 1 for 16);
  anonimo_email := 'deleted_' || random_suffix || '@anonimizado.local';
  anonimo_nombre := 'Usuario Eliminado ' || substring(md5(random()::text) from 1 for 8);

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
    licencia_numero = 'ANON' || substring(md5(random()::text) from 1 for 8),
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
    event_data
  ) VALUES (
    target_user_id,
    'user_anonymized',
    jsonb_build_object(
      'affected_tables', affected_tables,
      'anonymized_at', now(),
      'executed_by', auth.uid()
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'affected_tables', affected_tables,
    'message', 'Usuario anonimizado correctamente'
  );
END;
$function$;

-- Recrear función eliminar_datos_usuario
CREATE OR REPLACE FUNCTION public.eliminar_datos_usuario(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
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
    event_data
  ) VALUES (
    target_user_id,
    'user_deletion_completed',
    jsonb_build_object(
      'audit_id', audit_record,
      'result', result,
      'completed_at', now()
    )
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
    IF audit_record IS NOT NULL THEN
      UPDATE public.data_deletion_audit
      SET 
        status = 'failed',
        error_message = SQLERRM,
        updated_at = now()
      WHERE id = audit_record;
    END IF;
    
    RAISE;
END;
$function$;