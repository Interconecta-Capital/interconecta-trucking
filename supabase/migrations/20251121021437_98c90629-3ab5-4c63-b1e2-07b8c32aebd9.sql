-- ===================================
-- FASE 2: OPTIMIZACIÓN BASE DE DATOS + FIX CRÍTICO REMOLQUES
-- Agregar user_id a remolques + Índices faltantes
-- ===================================

-- 1. AGREGAR COLUMNAS FALTANTES A REMOLQUES
ALTER TABLE remolques 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS estado VARCHAR DEFAULT 'disponible',
ADD COLUMN IF NOT EXISTS tipo_remolque VARCHAR,
ADD COLUMN IF NOT EXISTS capacidad_carga NUMERIC,
ADD COLUMN IF NOT EXISTS viaje_actual_id UUID,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 2. POBLAR user_id DE REGISTROS EXISTENTES
-- Estrategia: remolques -> autotransporte -> cartas_porte -> usuario_id
UPDATE remolques r
SET user_id = (
  SELECT cp.usuario_id 
  FROM autotransporte a
  JOIN cartas_porte cp ON cp.id = a.carta_porte_id
  WHERE a.id = r.autotransporte_id
  LIMIT 1
)
WHERE r.user_id IS NULL AND r.autotransporte_id IS NOT NULL;

-- 3. COPIAR subtipo_rem a tipo_remolque para compatibilidad
UPDATE remolques 
SET tipo_remolque = subtipo_rem
WHERE tipo_remolque IS NULL AND subtipo_rem IS NOT NULL;

-- 4. CREAR ÍNDICE DE SEGURIDAD PARA REMOLQUES
CREATE INDEX IF NOT EXISTS idx_remolques_user_id
ON remolques(user_id)
WHERE user_id IS NOT NULL;

-- 5. ÍNDICE PARA REMOLQUES DISPONIBLES (usado en ViajeWizard)
CREATE INDEX IF NOT EXISTS idx_remolques_disponibles
ON remolques(user_id, estado, tipo_remolque)
WHERE activo = true AND estado = 'disponible';

-- 6. CREAR POLÍTICA RLS PARA REMOLQUES
DROP POLICY IF EXISTS remolques_user_access ON remolques;
CREATE POLICY remolques_user_access ON remolques
  FOR ALL
  USING (auth.uid() = user_id OR is_superuser_secure(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR is_superuser_secure(auth.uid()));

-- 7. HABILITAR RLS EN REMOLQUES
ALTER TABLE remolques ENABLE ROW LEVEL SECURITY;

-- 8. ÍNDICES FALTANTES PARA VEHÍCULOS (de Fase 2 original)
CREATE INDEX IF NOT EXISTS idx_vehiculos_disponibles 
ON vehiculos(user_id, estado, config_vehicular) 
WHERE activo = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_vehiculos_placa_user 
ON vehiculos(user_id, UPPER(TRIM(placa))) 
WHERE activo = true;

-- 9. ÍNDICES FALTANTES PARA VIAJES (columnas corregidas)
CREATE INDEX IF NOT EXISTS idx_viajes_activos 
ON viajes(user_id, estado, created_at DESC) 
WHERE estado IN ('programado', 'en_transito', 'retrasado');

CREATE INDEX IF NOT EXISTS idx_viajes_conductor_fecha 
ON viajes(conductor_id, fecha_inicio_programada DESC) 
WHERE conductor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_viajes_vehiculo_fecha 
ON viajes(vehiculo_id, fecha_inicio_programada DESC) 
WHERE vehiculo_id IS NOT NULL;

-- 10. ÍNDICES FALTANTES PARA FACTURAS
CREATE INDEX IF NOT EXISTS idx_facturas_pendientes 
ON facturas(user_id, status, created_at DESC)
WHERE status IN ('draft', 'pending');

-- 11. OPTIMIZAR GIN INDEX DE TRACKING_DATA
DROP INDEX IF EXISTS idx_viajes_tracking_data;
CREATE INDEX idx_viajes_tracking_data 
ON viajes USING GIN (tracking_data jsonb_path_ops);

-- 12. ACTUALIZAR ESTADÍSTICAS PARA QUERY PLANNER
ANALYZE conductores;
ANALYZE vehiculos;
ANALYZE viajes;
ANALYZE remolques;
ANALYZE facturas;

-- 13. COMENTARIOS DE DOCUMENTACIÓN
COMMENT ON COLUMN remolques.user_id IS 
'Usuario propietario del remolque - agregado para seguridad RLS';

COMMENT ON INDEX idx_remolques_user_id IS 
'Índice de seguridad para filtrar remolques por usuario';

COMMENT ON INDEX idx_remolques_disponibles IS 
'Optimiza búsqueda de remolques disponibles en ViajeWizard Paso 3';

COMMENT ON INDEX idx_vehiculos_disponibles IS 
'Optimiza búsqueda de vehículos disponibles en ViajeWizard Paso 3';

COMMENT ON INDEX idx_viajes_activos IS 
'Índice parcial para dashboard de viajes activos (programado, en_transito, retrasado)';

-- 14. TRIGGER PARA ACTUALIZAR updated_at EN REMOLQUES
CREATE OR REPLACE FUNCTION update_remolques_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS remolques_updated_at ON remolques;
CREATE TRIGGER remolques_updated_at
  BEFORE UPDATE ON remolques
  FOR EACH ROW
  EXECUTE FUNCTION update_remolques_updated_at();