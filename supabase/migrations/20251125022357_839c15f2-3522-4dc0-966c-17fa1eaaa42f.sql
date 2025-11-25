-- FASE 2: Actualizar bucket de certificados para permitir todos los tipos MIME
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'application/x-x509-ca-cert',
  'application/pkix-cert',  
  'application/octet-stream',
  'application/x-iwork-keynote-sffkey',
  'application/pkcs8',
  'application/x-pem-file',
  'application/x-x509-user-cert'
]
WHERE id = 'certificados';

-- Agregar columna modo_pruebas si no existe
ALTER TABLE certificados_digitales 
ADD COLUMN IF NOT EXISTS modo_pruebas BOOLEAN DEFAULT FALSE;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_certificados_user_activo 
ON certificados_digitales(user_id, activo) 
WHERE activo = true;