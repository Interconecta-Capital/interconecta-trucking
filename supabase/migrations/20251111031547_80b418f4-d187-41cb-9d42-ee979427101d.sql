-- Corregir función anonimizar_usuario para manejar campos NULL y eliminar error de telefono
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
  random_suffix TEXT;
BEGIN
  -- Verificar autorización: solo el propio usuario o admin
  IF auth.uid() != target_user_id AND NOT (
    SELECT (raw_user_meta_data->>'is_admin' = 'true' OR raw_user_meta_data->>'is_superuser' = 'true')
    FROM auth.users WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No autorizado para anonimizar este usuario';
  END IF;

  -- Generar identificadores anónimos usando MD5 + timestamp
  random_suffix := substring(md5(random()::text || clock_timestamp()::text) from 1 for 16);
  anonimo_email := 'deleted_' || random_suffix || '@anonimizado.local';
  anonimo_nombre := 'Usuario Eliminado ' || substring(md5(random()::text) from 1 for 8);

  -- 1. Anonimizar tabla profiles (incluye telefono)
  UPDATE public.profiles
  SET 
    nombre = anonimo_nombre,
    email = anonimo_email,
    telefono = NULL,
    rfc = 'ANONIMIZADO',
    empresa = 'Empresa Eliminada',
    avatar_url = NULL
  WHERE id = target_user_id;
  GET DIAGNOSTICS records_count = ROW_COUNT;
  IF records_count > 0 THEN
    affected_tables := affected_tables || jsonb_build_object('table', 'profiles', 'records', records_count);
  END IF;

  -- 2. Anonimizar tabla usuarios (SIN telefono - columna no existe aquí)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios' AND table_schema = 'public') THEN
    UPDATE public.usuarios
    SET 
      nombre = anonimo_nombre,
      email = anonimo_email
    WHERE auth_user_id = target_user_id;
    GET DIAGNOSTICS records_count = ROW_COUNT;
    IF records_count > 0 THEN
      affected_tables := affected_tables || jsonb_build_object('table', 'usuarios', 'records', records_count);
    END IF;
  END IF;

  -- 3. Anonimizar conductores
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

  -- 4. Anonimizar socios (si tienen datos personales)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'socios' AND table_schema = 'public') THEN
    UPDATE public.socios
    SET 
      nombre = anonimo_nombre,
      rfc = 'ANONIMIZADO',
      correo = anonimo_email,
      telefono = NULL,
      direccion_fiscal = NULL
    WHERE user_id = target_user_id;
    GET DIAGNOSTICS records_count = ROW_COUNT;
    IF records_count > 0 THEN
      affected_tables := affected_tables || jsonb_build_object('table', 'socios', 'records', records_count);
    END IF;
  END IF;

  -- 5. Limpiar security_audit_log (IPs y user agents)
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

  -- 6. Registrar auditoría de anonimización
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
$$;