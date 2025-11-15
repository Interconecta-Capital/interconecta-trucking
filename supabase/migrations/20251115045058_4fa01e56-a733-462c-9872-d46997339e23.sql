-- ============================================
-- FASE 1.1: Corregir error de remolques_ccp.user_id
-- ============================================

-- Agregar columna user_id a remolques_ccp
ALTER TABLE remolques_ccp 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Poblar datos existentes basándose en la relación autotransporte -> carta_porte
UPDATE remolques_ccp r
SET user_id = cp.usuario_id
FROM autotransporte a
JOIN cartas_porte cp ON cp.id = a.carta_porte_id
WHERE r.autotransporte_id = a.id
  AND r.user_id IS NULL;

-- Habilitar RLS
ALTER TABLE remolques_ccp ENABLE ROW LEVEL SECURITY;

-- Crear política de acceso
DROP POLICY IF EXISTS "remolques_ccp_user_access" ON remolques_ccp;

CREATE POLICY "remolques_ccp_user_access" ON remolques_ccp
FOR ALL 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE auth_user_id = auth.uid() 
    AND rol = 'admin'
  )
);

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_remolques_ccp_user_id ON remolques_ccp(user_id);
CREATE INDEX IF NOT EXISTS idx_remolques_ccp_autotransporte_id ON remolques_ccp(autotransporte_id);

-- ============================================
-- FASE 3.1: Índices de rendimiento
-- ============================================

-- Índices para facturas
CREATE INDEX IF NOT EXISTS idx_facturas_user_status ON facturas(user_id, status);
CREATE INDEX IF NOT EXISTS idx_facturas_uuid_fiscal ON facturas(uuid_fiscal) WHERE uuid_fiscal IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_facturas_fecha_timbrado ON facturas(fecha_timbrado DESC) WHERE fecha_timbrado IS NOT NULL;

-- Índices para cartas_porte
CREATE INDEX IF NOT EXISTS idx_cartas_porte_usuario_status ON cartas_porte(usuario_id, status);
CREATE INDEX IF NOT EXISTS idx_cartas_porte_uuid ON cartas_porte(uuid_fiscal) WHERE uuid_fiscal IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cartas_porte_fecha_timbrado ON cartas_porte(fecha_timbrado DESC) WHERE fecha_timbrado IS NOT NULL;

-- Índices para relaciones
CREATE INDEX IF NOT EXISTS idx_mercancias_carta_porte ON mercancias(carta_porte_id);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_carta_porte ON ubicaciones(carta_porte_id);
CREATE INDEX IF NOT EXISTS idx_autotransporte_carta_porte ON autotransporte(carta_porte_id);

-- Índices para seguridad
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_timestamp ON security_audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limit_log_identifier_timestamp ON rate_limit_log(identifier, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_certificados_digitales_user_activo ON certificados_digitales(user_id, activo) WHERE activo = true;