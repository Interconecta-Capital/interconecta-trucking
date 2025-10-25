-- CORRECCIÓN COMPLETA: Foreign Keys y Índices para Viajes
-- FASE 5 y 6: Limpiar foreign keys duplicadas y agregar índices

-- ===================================================================
-- FASE 5: Limpiar Foreign Keys Duplicadas
-- ===================================================================

-- Eliminar foreign keys antiguas sin ON DELETE SET NULL
ALTER TABLE viajes DROP CONSTRAINT IF EXISTS viajes_conductor_id_fkey;
ALTER TABLE viajes DROP CONSTRAINT IF EXISTS viajes_vehiculo_id_fkey;
ALTER TABLE viajes DROP CONSTRAINT IF EXISTS viajes_remolque_id_fkey;

-- Las constraints correctas ya existen con ON DELETE SET NULL:
-- - fk_viajes_conductor
-- - fk_viajes_vehiculo  
-- - fk_viajes_remolque
-- - fk_viajes_carta_porte

-- ===================================================================
-- FASE 6: Agregar Índices para Mejor Performance
-- ===================================================================

-- Índices para foreign keys
CREATE INDEX IF NOT EXISTS idx_viajes_carta_porte_id 
  ON viajes(carta_porte_id) 
  WHERE carta_porte_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_viajes_conductor_id 
  ON viajes(conductor_id) 
  WHERE conductor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_viajes_vehiculo_id 
  ON viajes(vehiculo_id) 
  WHERE vehiculo_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_viajes_remolque_id 
  ON viajes(remolque_id) 
  WHERE remolque_id IS NOT NULL;

-- Índice compuesto para consultas comunes
CREATE INDEX IF NOT EXISTS idx_viajes_user_estado 
  ON viajes(user_id, estado);

-- Índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_viajes_fecha_inicio 
  ON viajes(fecha_inicio_programada) 
  WHERE fecha_inicio_programada IS NOT NULL;

-- ===================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ===================================================================

COMMENT ON INDEX idx_viajes_carta_porte_id IS 'Índice para relación viajes → cartas_porte';
COMMENT ON INDEX idx_viajes_conductor_id IS 'Índice para relación viajes → conductores';
COMMENT ON INDEX idx_viajes_vehiculo_id IS 'Índice para relación viajes → vehiculos';
COMMENT ON INDEX idx_viajes_remolque_id IS 'Índice para relación viajes → remolques';
COMMENT ON INDEX idx_viajes_user_estado IS 'Índice compuesto para consultas por usuario y estado';
COMMENT ON INDEX idx_viajes_fecha_inicio IS 'Índice para ordenar y filtrar viajes por fecha de inicio';