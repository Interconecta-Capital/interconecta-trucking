-- ============================================
-- MIGRACIÓN: Corrección de tipos de comprobante
-- Fecha: 2025-11-24
-- Objetivo: Corregir tipo_comprobante e importes según regla SAT CFDI40109
-- ============================================

-- FASE 1: Actualizar facturas con tipo incorrecto
-- Facturas con importes > 0 DEBEN ser tipo "I" (Ingreso)
UPDATE facturas 
SET tipo_comprobante = 'I'
WHERE tipo_comprobante IS NULL 
  OR (tipo_comprobante = 'T' AND (subtotal > 0 OR total > 0));

-- FASE 2: Actualizar cartas porte sin tipo especificado
-- CartaPorte sin factura asociada = tipo "Traslado"
UPDATE cartas_porte
SET tipo_cfdi = 'Traslado'
WHERE tipo_cfdi IS NULL
  AND factura_id IS NULL;

-- FASE 3: Corregir cartas porte con factura = tipo "Ingreso"
UPDATE cartas_porte
SET tipo_cfdi = 'Ingreso'
WHERE factura_id IS NOT NULL;

-- FASE 4: Corregir borradores con inconsistencias
-- Usar jsonb_set para actualizar el campo 'tipoCfdi' en el JSON
UPDATE borradores_carta_porte
SET datos_formulario = jsonb_set(
  datos_formulario,
  '{tipoCfdi}',
  '"Traslado"'::jsonb
)
WHERE datos_formulario->>'tipoCfdi' IS NULL
  OR datos_formulario->>'tipoCfdi' = 'N/A';

-- FASE 5: Crear índices para mejorar consultas de auditoría
CREATE INDEX IF NOT EXISTS idx_facturas_tipo_comprobante 
ON facturas(tipo_comprobante);

CREATE INDEX IF NOT EXISTS idx_cartas_porte_tipo_cfdi 
ON cartas_porte(tipo_cfdi);

-- FASE 6: Agregar constraint para prevenir futuros errores
-- Facturas solo pueden ser tipo I o E (no T)
ALTER TABLE facturas 
DROP CONSTRAINT IF EXISTS chk_tipo_comprobante_valido;

ALTER TABLE facturas 
ADD CONSTRAINT chk_tipo_comprobante_valido 
CHECK (tipo_comprobante IN ('I', 'E', 'P', 'N'));

-- FASE 7: Log de auditoría
-- Crear tabla de auditoría si no existe
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla VARCHAR(100),
  accion VARCHAR(50),
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar registro de migración
INSERT INTO audit_log (tabla, accion, descripcion)
VALUES (
  'facturas, cartas_porte, borradores_carta_porte',
  'MIGRACIÓN',
  'Corrección de tipo_comprobante según regla SAT CFDI40109. Facturas con importes ahora son tipo I, CartaPorte sin factura son tipo Traslado.'
);