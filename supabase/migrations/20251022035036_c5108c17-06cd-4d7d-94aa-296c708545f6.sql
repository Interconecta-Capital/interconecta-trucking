-- FASE 4 PRE-CORRECCIÓN: Migrar carta_porte_id a UUID (estrategia simple)

-- Paso 1: Crear nueva columna UUID
ALTER TABLE viajes 
  ADD COLUMN carta_porte_id_uuid UUID;

-- Paso 2: Copiar datos válidos a nueva columna
UPDATE viajes 
SET carta_porte_id_uuid = carta_porte_id::UUID
WHERE carta_porte_id IS NOT NULL 
  AND carta_porte_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND EXISTS (
    SELECT 1 FROM cartas_porte 
    WHERE id::TEXT = viajes.carta_porte_id
  );

-- Paso 3: Eliminar columna antigua
ALTER TABLE viajes DROP COLUMN carta_porte_id;

-- Paso 4: Renombrar nueva columna
ALTER TABLE viajes RENAME COLUMN carta_porte_id_uuid TO carta_porte_id;

-- Paso 5: Agregar foreign key
ALTER TABLE viajes
  ADD CONSTRAINT fk_viajes_carta_porte
  FOREIGN KEY (carta_porte_id) 
  REFERENCES cartas_porte(id)
  ON DELETE SET NULL;

-- Paso 6: Crear índice
CREATE INDEX IF NOT EXISTS idx_viajes_carta_porte_id ON viajes(carta_porte_id);

COMMENT ON CONSTRAINT fk_viajes_carta_porte ON viajes IS 'Foreign key para garantizar integridad referencial entre viajes y cartas porte';