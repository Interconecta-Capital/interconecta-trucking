-- ============================================================================
-- FASE 1B: SUPABASE VAULT - GESTIÓN SEGURA DE SECRETOS
-- ============================================================================
-- Control ISO: 27001 A.10.1 (Cryptographic Controls)
-- Objetivo: Migrar secretos críticos (PAC tokens, API keys) a Supabase Vault
-- ============================================================================

-- ============================================================================
-- 1. FUNCIONES PARA GESTIÓN DE SECRETOS DEL PAC
-- ============================================================================

-- Función para obtener el token del PAC de forma segura
-- Uso desde Edge Functions: SELECT get_pac_token('SW_TOKEN')
CREATE OR REPLACE FUNCTION public.get_pac_token(secret_name TEXT DEFAULT 'SW_TOKEN')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  secret_value TEXT;
BEGIN
  -- Verificar que el usuario esté autenticado
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  
  -- Obtener el secreto del Vault
  SELECT decrypted_secret INTO secret_value
  FROM vault.decrypted_secrets
  WHERE name = secret_name
  AND key_id = (SELECT id FROM vault.decryption_keys LIMIT 1)
  LIMIT 1;
  
  IF secret_value IS NULL THEN
    RAISE EXCEPTION 'Token del PAC no configurado. Contacte al administrador.';
  END IF;
  
  -- Registrar acceso al secreto (auditoría)
  INSERT INTO public.security_audit_log (
    user_id, 
    event_type, 
    event_data
  ) VALUES (
    auth.uid(),
    'secret_access',
    jsonb_build_object(
      'secret_name', secret_name,
      'timestamp', now(),
      'control', 'ISO 27001 A.10.1'
    )
  );
  
  RETURN secret_value;
END;
$$;

-- Función para obtener credenciales del PAC completas
CREATE OR REPLACE FUNCTION public.get_pac_credentials()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  credentials JSONB;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  
  SELECT jsonb_object_agg(name, decrypted_secret) INTO credentials
  FROM vault.decrypted_secrets
  WHERE name IN ('SW_TOKEN', 'SW_USER', 'SW_PASSWORD', 'SW_URL')
  AND key_id = (SELECT id FROM vault.decryption_keys LIMIT 1);
  
  IF credentials IS NULL OR jsonb_object_keys(credentials) IS NULL THEN
    RAISE EXCEPTION 'Credenciales del PAC no configuradas';
  END IF;
  
  INSERT INTO public.security_audit_log (
    user_id, 
    event_type, 
    event_data
  ) VALUES (
    auth.uid(),
    'pac_credentials_access',
    jsonb_build_object('timestamp', now(), 'control', 'ISO 27001 A.10.1')
  );
  
  RETURN credentials;
END;
$$;

-- ============================================================================
-- 2. FUNCIONES PARA OTROS SECRETOS (Fiscal API, Lovable, etc.)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_secret(secret_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  secret_value TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  
  SELECT decrypted_secret INTO secret_value
  FROM vault.decrypted_secrets
  WHERE name = secret_name
  AND key_id = (SELECT id FROM vault.decryption_keys LIMIT 1)
  LIMIT 1;
  
  IF secret_value IS NULL THEN
    RAISE WARNING 'Secreto "%" no encontrado en Vault', secret_name;
    RETURN NULL;
  END IF;
  
  INSERT INTO public.security_audit_log (
    user_id, 
    event_type, 
    event_data
  ) VALUES (
    auth.uid(),
    'secret_access',
    jsonb_build_object(
      'secret_name', secret_name,
      'timestamp', now()
    )
  );
  
  RETURN secret_value;
END;
$$;

-- ============================================================================
-- 3. FUNCIÓN DE ADMINISTRACIÓN (Solo para superusuarios)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admin_rotate_pac_token(
  new_token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  secret_id UUID;
BEGIN
  -- Solo superusuarios pueden rotar tokens
  IF NOT is_superuser_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Operación no autorizada. Solo superusuarios.';
  END IF;
  
  -- Obtener el ID del secreto actual
  SELECT id INTO secret_id
  FROM vault.secrets
  WHERE name = 'SW_TOKEN'
  LIMIT 1;
  
  -- Actualizar el secreto
  IF secret_id IS NOT NULL THEN
    -- Supabase Vault maneja el cifrado automáticamente
    UPDATE vault.secrets
    SET secret = new_token,
        updated_at = now()
    WHERE id = secret_id;
  ELSE
    -- Crear nuevo secreto si no existe
    INSERT INTO vault.secrets (name, secret)
    VALUES ('SW_TOKEN', new_token);
  END IF;
  
  -- Auditar rotación
  INSERT INTO public.security_audit_log (
    user_id, 
    event_type, 
    event_data
  ) VALUES (
    auth.uid(),
    'secret_rotation',
    jsonb_build_object(
      'secret_name', 'SW_TOKEN',
      'timestamp', now(),
      'control', 'ISO 27001 A.10.1.2'
    )
  );
  
  RETURN TRUE;
END;
$$;

-- ============================================================================
-- 4. TABLA DE CONFIGURACIÓN DE SECRETOS (Metadatos)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.secrets_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secret_name TEXT NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('pac_credential', 'api_key', 'encryption_key', 'certificate_password')),
  ultima_rotacion TIMESTAMPTZ DEFAULT now(),
  proxima_rotacion TIMESTAMPTZ,
  rotacion_requerida_dias INTEGER DEFAULT 90,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Registrar los secretos principales
INSERT INTO public.secrets_metadata (secret_name, descripcion, tipo, rotacion_requerida_dias) VALUES
  ('SW_TOKEN', 'Token de autenticación del PAC (SmartWeb/Fiscal API)', 'pac_credential', 90),
  ('SW_USER', 'Usuario del PAC', 'pac_credential', 180),
  ('SW_PASSWORD', 'Contraseña del PAC', 'pac_credential', 90),
  ('SW_URL', 'URL del endpoint del PAC', 'pac_credential', 0),
  ('FISCAL_API_KEY', 'API Key de Fiscal API', 'api_key', 365),
  ('LOVABLE_API_KEY', 'API Key de Lovable AI', 'api_key', 365),
  ('CERT_ENCRYPTION_KEY', 'Clave maestra para cifrar certificados .key', 'encryption_key', 180)
ON CONFLICT (secret_name) DO NOTHING;

-- RLS para secrets_metadata (solo superusuarios)
ALTER TABLE public.secrets_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo superusuarios pueden gestionar metadata de secretos"
ON public.secrets_metadata
FOR ALL
TO authenticated
USING (is_superuser_secure(auth.uid()))
WITH CHECK (is_superuser_secure(auth.uid()));

-- ============================================================================
-- 5. AUDITORÍA
-- ============================================================================

INSERT INTO public.rls_refactor_audit (fase, accion, tabla_afectada, detalles)
VALUES 
  ('fase_1_iso27001', 'vault_implementation', 'vault.secrets', '{"control": "ISO 27001 A.10.1", "descripcion": "Funciones SECURITY DEFINER para acceso seguro a secretos"}'::jsonb);

-- ============================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

COMMENT ON FUNCTION public.get_pac_token IS 
'Obtiene el token del PAC desde Supabase Vault de forma segura. 
Control ISO 27001: A.10.1 (Cryptographic Controls).
Uso: SELECT get_pac_token() o SELECT get_pac_token(''SW_TOKEN'')';

COMMENT ON FUNCTION public.get_pac_credentials IS
'Obtiene todas las credenciales del PAC (SW_TOKEN, SW_USER, SW_PASSWORD, SW_URL) en formato JSONB.
Uso desde Edge Functions para timbrado seguro.';

COMMENT ON FUNCTION public.get_secret IS
'Obtiene cualquier secreto del Vault. Uso genérico para FISCAL_API_KEY, LOVABLE_API_KEY, etc.
Ejemplo: SELECT get_secret(''FISCAL_API_KEY'')';

COMMENT ON FUNCTION public.admin_rotate_pac_token IS
'Rota el token del PAC (solo superusuarios). 
Uso: SELECT admin_rotate_pac_token(''nuevo_token_aqui'')';

COMMENT ON TABLE public.secrets_metadata IS
'Metadatos de secretos: tracking de rotaciones, tipo, descripción.
Control ISO 27001: A.10.1.2 (Key Management).';