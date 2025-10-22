-- ================================================================
-- FASE 3: SOPORTE PARA VAULT EN CERTIFICADOS DIGITALES
-- Agregar columna para almacenar referencias a secrets en Vault
-- ================================================================

-- Agregar columna para vault_id
ALTER TABLE public.certificados_digitales 
ADD COLUMN IF NOT EXISTS password_vault_id UUID;

-- Índice para búsquedas
CREATE INDEX IF NOT EXISTS idx_certificados_vault_id 
ON public.certificados_digitales(password_vault_id);

-- Comentario explicativo
COMMENT ON COLUMN public.certificados_digitales.password_vault_id IS 
'Reference to Supabase Vault secret containing encrypted certificate password. Replaces insecure Base64 encoding.';