-- ============================================================================
-- FASE 4 - SPRINT 2 - PARTE 3: ESQUEMA DE CIFRADO MULTI-ENTIDAD
-- ============================================================================

-- AÑADIR COLUMNAS PARA DOCUMENTOS CIFRADOS
ALTER TABLE public.conductores 
ADD COLUMN IF NOT EXISTS foto_licencia_url TEXT,
ADD COLUMN IF NOT EXISTS foto_licencia_encrypted BYTEA,
ADD COLUMN IF NOT EXISTS foto_licencia_encrypted_at TIMESTAMPTZ;

ALTER TABLE public.vehiculos
ADD COLUMN IF NOT EXISTS tarjeta_circulacion_encrypted BYTEA,
ADD COLUMN IF NOT EXISTS poliza_seguro_encrypted BYTEA,
ADD COLUMN IF NOT EXISTS verificacion_encrypted BYTEA,
ADD COLUMN IF NOT EXISTS tarjeta_circulacion_encrypted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS poliza_seguro_encrypted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verificacion_encrypted_at TIMESTAMPTZ;

ALTER TABLE public.remolques
ADD COLUMN IF NOT EXISTS tarjeta_circulacion_encrypted BYTEA,
ADD COLUMN IF NOT EXISTS permiso_sct_encrypted BYTEA,
ADD COLUMN IF NOT EXISTS tarjeta_circulacion_encrypted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS permiso_sct_encrypted_at TIMESTAMPTZ;

ALTER TABLE public.socios
ADD COLUMN IF NOT EXISTS constancia_fiscal_encrypted BYTEA,
ADD COLUMN IF NOT EXISTS identificacion_encrypted BYTEA,
ADD COLUMN IF NOT EXISTS constancia_fiscal_encrypted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS identificacion_encrypted_at TIMESTAMPTZ;

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_conductores_foto_encrypted 
ON public.conductores(id) WHERE foto_licencia_encrypted IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vehiculos_docs_encrypted
ON public.vehiculos(id) WHERE tarjeta_circulacion_encrypted IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_remolques_docs_encrypted
ON public.remolques(id) WHERE tarjeta_circulacion_encrypted IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_socios_docs_encrypted
ON public.socios(id) WHERE constancia_fiscal_encrypted IS NOT NULL;

-- FUNCIÓN DE CIFRADO GENÉRICA
CREATE OR REPLACE FUNCTION public.encrypt_document(
  table_name TEXT,
  record_id UUID,
  column_name TEXT,
  document_data TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  encryption_key TEXT;
  user_column TEXT;
BEGIN
  encryption_key := public.get_secret('ENCRYPTION_KEY');
  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Clave de cifrado no configurada';
  END IF;

  user_column := CASE table_name
    WHEN 'conductores' THEN 'user_id'
    WHEN 'vehiculos' THEN 'user_id'
    WHEN 'remolques' THEN 'user_id'
    WHEN 'socios' THEN 'user_id'
    ELSE NULL
  END;

  IF user_column IS NULL THEN
    RAISE EXCEPTION 'Tabla no soportada para cifrado';
  END IF;

  EXECUTE format(
    'UPDATE public.%I SET %I = pgp_sym_encrypt($1, $2), %I = NOW() WHERE id = $3 AND %I = auth.uid()',
    table_name, column_name, column_name || '_encrypted_at', user_column
  ) USING document_data, encryption_key, record_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registro no encontrado o no autorizado';
  END IF;

  INSERT INTO public.security_audit_log (user_id, event_type, event_data)
  VALUES (auth.uid(), 'document_encrypted', 
    jsonb_build_object('table', table_name, 'record_id', record_id, 'column', column_name, 'timestamp', NOW()));

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.encrypt_document(TEXT, UUID, TEXT, TEXT) TO authenticated;

-- FUNCIÓN DE DESCIFRADO GENÉRICA
CREATE OR REPLACE FUNCTION public.decrypt_document(
  table_name TEXT,
  record_id UUID,
  column_name TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  encryption_key TEXT;
  decrypted_data TEXT;
  user_column TEXT;
  is_superuser BOOLEAN;
BEGIN
  is_superuser := public.is_superuser_secure(auth.uid());
  encryption_key := public.get_secret('ENCRYPTION_KEY');

  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Clave de descifrado no disponible';
  END IF;

  user_column := CASE table_name
    WHEN 'conductores' THEN 'user_id'
    WHEN 'vehiculos' THEN 'user_id'
    WHEN 'remolques' THEN 'user_id'
    WHEN 'socios' THEN 'user_id'
    ELSE NULL
  END;

  IF NOT is_superuser THEN
    EXECUTE format(
      'SELECT 1 FROM public.%I WHERE id = $1 AND %I = auth.uid()',
      table_name, user_column
    ) USING record_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'No autorizado';
    END IF;
  END IF;

  EXECUTE format(
    'SELECT pgp_sym_decrypt(%I, $1) FROM public.%I WHERE id = $2',
    column_name, table_name
  ) INTO decrypted_data USING encryption_key, record_id;

  IF decrypted_data IS NULL THEN
    RAISE EXCEPTION 'Documento no encontrado o no cifrado';
  END IF;

  INSERT INTO public.security_audit_log (user_id, event_type, event_data)
  VALUES (auth.uid(), 'document_decrypted',
    jsonb_build_object('table', table_name, 'record_id', record_id, 'column', column_name, 'is_superuser', is_superuser, 'timestamp', NOW()));

  RETURN decrypted_data;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrypt_document(TEXT, UUID, TEXT) TO authenticated;