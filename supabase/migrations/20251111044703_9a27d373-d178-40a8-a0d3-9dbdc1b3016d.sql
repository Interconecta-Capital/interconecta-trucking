-- Funciones SQL auxiliares para sistema de cifrado E2E (sin severity)

-- Función para obtener documentos pendientes de migración
CREATE OR REPLACE FUNCTION public.get_documents_for_migration(
  p_table_name TEXT
) RETURNS TABLE(
  record_id UUID,
  column_name TEXT,
  url_value TEXT,
  is_encrypted BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF p_table_name = 'conductores' THEN
    RETURN QUERY
    SELECT 
      id as record_id,
      'foto_licencia' as column_name,
      foto_licencia_url as url_value,
      (foto_licencia_encrypted IS NOT NULL) as is_encrypted
    FROM conductores
    WHERE foto_licencia_url IS NOT NULL 
      AND foto_licencia_encrypted IS NULL
      AND activo = true
    UNION ALL
    SELECT 
      id as record_id,
      'foto_identificacion' as column_name,
      foto_identificacion_url as url_value,
      (foto_identificacion_encrypted IS NOT NULL) as is_encrypted
    FROM conductores
    WHERE foto_identificacion_url IS NOT NULL 
      AND foto_identificacion_encrypted IS NULL
      AND activo = true;
      
  ELSIF p_table_name = 'vehiculos' THEN
    RETURN QUERY
    SELECT 
      id as record_id,
      'tarjeta_circulacion' as column_name,
      tarjeta_circulacion_url as url_value,
      (tarjeta_circulacion_encrypted IS NOT NULL) as is_encrypted
    FROM vehiculos
    WHERE tarjeta_circulacion_url IS NOT NULL 
      AND tarjeta_circulacion_encrypted IS NULL
      AND activo = true
    UNION ALL
    SELECT 
      id as record_id,
      'poliza_seguro' as column_name,
      poliza_seguro_url as url_value,
      (poliza_seguro_encrypted IS NOT NULL) as is_encrypted
    FROM vehiculos
    WHERE poliza_seguro_url IS NOT NULL 
      AND poliza_seguro_encrypted IS NULL
      AND activo = true;
      
  ELSIF p_table_name = 'remolques' THEN
    RETURN QUERY
    SELECT 
      id as record_id,
      'tarjeta_circulacion' as column_name,
      tarjeta_circulacion_url as url_value,
      (tarjeta_circulacion_encrypted IS NOT NULL) as is_encrypted
    FROM remolques
    WHERE tarjeta_circulacion_url IS NOT NULL 
      AND tarjeta_circulacion_encrypted IS NULL
      AND activo = true;
      
  ELSIF p_table_name = 'socios' THEN
    RETURN QUERY
    SELECT 
      id as record_id,
      'constancia_fiscal' as column_name,
      constancia_fiscal_url as url_value,
      (constancia_fiscal_encrypted IS NOT NULL) as is_encrypted
    FROM socios
    WHERE constancia_fiscal_url IS NOT NULL 
      AND constancia_fiscal_encrypted IS NULL
      AND activo = true
    UNION ALL
    SELECT 
      id as record_id,
      'identificacion' as column_name,
      identificacion_url as url_value,
      (identificacion_encrypted IS NOT NULL) as is_encrypted
    FROM socios
    WHERE identificacion_url IS NOT NULL 
      AND identificacion_encrypted IS NULL
      AND activo = true;
  END IF;
END;
$$;

-- Función para obtener estadísticas de cifrado
CREATE OR REPLACE FUNCTION public.get_encryption_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'conductores', jsonb_build_object(
      'total', (SELECT COUNT(*) * 2 FROM conductores WHERE activo = true),
      'encrypted', (
        SELECT COUNT(*) FROM (
          SELECT 1 FROM conductores WHERE foto_licencia_encrypted IS NOT NULL AND activo = true
          UNION ALL
          SELECT 1 FROM conductores WHERE foto_identificacion_encrypted IS NOT NULL AND activo = true
        ) t
      )
    ),
    'vehiculos', jsonb_build_object(
      'total', (SELECT COUNT(*) * 2 FROM vehiculos WHERE activo = true),
      'encrypted', (
        SELECT COUNT(*) FROM (
          SELECT 1 FROM vehiculos WHERE tarjeta_circulacion_encrypted IS NOT NULL AND activo = true
          UNION ALL
          SELECT 1 FROM vehiculos WHERE poliza_seguro_encrypted IS NOT NULL AND activo = true
        ) t
      )
    ),
    'remolques', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM remolques WHERE activo = true),
      'encrypted', (SELECT COUNT(*) FROM remolques WHERE tarjeta_circulacion_encrypted IS NOT NULL AND activo = true)
    ),
    'socios', jsonb_build_object(
      'total', (SELECT COUNT(*) * 2 FROM socios WHERE activo = true),
      'encrypted', (
        SELECT COUNT(*) FROM (
          SELECT 1 FROM socios WHERE constancia_fiscal_encrypted IS NOT NULL AND activo = true
          UNION ALL
          SELECT 1 FROM socios WHERE identificacion_encrypted IS NOT NULL AND activo = true
        ) t
      )
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$;

-- Función para verificar integridad de documento cifrado
CREATE OR REPLACE FUNCTION public.verify_document_integrity(
  p_table_name TEXT,
  p_record_id UUID,
  p_column_name TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  encrypted_data TEXT;
  can_decrypt BOOLEAN := false;
  result JSONB;
BEGIN
  EXECUTE format('SELECT %I FROM %I WHERE id = $1', p_column_name, p_table_name)
  INTO encrypted_data
  USING p_record_id;
  
  IF encrypted_data IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'can_decrypt', false,
      'error', 'Documento no encontrado o no cifrado'
    );
  END IF;
  
  BEGIN
    PERFORM decrypt_document(p_table_name, p_record_id, p_column_name);
    can_decrypt := true;
  EXCEPTION
    WHEN OTHERS THEN
      can_decrypt := false;
  END;
  
  RETURN jsonb_build_object(
    'valid', true,
    'can_decrypt', can_decrypt,
    'encrypted_size', length(encrypted_data)
  );
END;
$$;

-- Registrar en audit log (sin severity)
INSERT INTO public.security_audit_log (
  event_type,
  event_data
) VALUES (
  'encryption_functions_created',
  jsonb_build_object(
    'functions', ARRAY['get_documents_for_migration', 'get_encryption_stats', 'verify_document_integrity'],
    'created_at', now(),
    'version', '1.0'
  )
);