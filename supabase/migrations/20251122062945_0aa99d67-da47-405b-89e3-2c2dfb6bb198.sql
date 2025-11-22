-- ============================================
-- FASE 2: Configuración de Documentos Fiscales
-- ISO 27001 A.18.1.4: Protección de registros
-- ============================================

-- Agregar campos para configuración de facturas
ALTER TABLE configuracion_empresa 
ADD COLUMN IF NOT EXISTS serie_factura VARCHAR(10) DEFAULT 'F',
ADD COLUMN IF NOT EXISTS folio_inicial_factura INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS folio_actual_factura INTEGER DEFAULT 1;

-- Renombrar columnas existentes para claridad (si no existen ya)
DO $$
BEGIN
  -- Verificar y renombrar serie_carta_porte si la columna original existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'configuracion_empresa' 
    AND column_name = 'serie_carta_porte'
  ) THEN
    -- Ya existe, no hacer nada
  ELSE
    -- Agregar si no existe
    ALTER TABLE configuracion_empresa 
    ADD COLUMN IF NOT EXISTS serie_carta_porte VARCHAR(10) DEFAULT 'CP';
  END IF;

  -- Agregar folio_inicial_carta_porte si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'configuracion_empresa' 
    AND column_name = 'folio_inicial_carta_porte'
  ) THEN
    ALTER TABLE configuracion_empresa 
    ADD COLUMN folio_inicial_carta_porte INTEGER DEFAULT 1;
  END IF;

  -- Agregar folio_actual_carta_porte si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'configuracion_empresa' 
    AND column_name = 'folio_actual_carta_porte'
  ) THEN
    ALTER TABLE configuracion_empresa 
    ADD COLUMN folio_actual_carta_porte INTEGER DEFAULT 1;
  END IF;
END $$;

-- Índices para optimización de búsqueda (ISO 27001 A.12.1.3)
CREATE INDEX IF NOT EXISTS idx_configuracion_empresa_user_id 
ON configuracion_empresa(user_id);

-- Comentarios de auditoría
COMMENT ON COLUMN configuracion_empresa.serie_factura IS 'Serie para facturas - ISO 27001 A.18.1.4';
COMMENT ON COLUMN configuracion_empresa.folio_inicial_factura IS 'Folio inicial para facturas';
COMMENT ON COLUMN configuracion_empresa.folio_actual_factura IS 'Folio actual para facturas (incrementa automáticamente)';
COMMENT ON COLUMN configuracion_empresa.serie_carta_porte IS 'Serie para Carta Porte - ISO 27001 A.18.1.4';
COMMENT ON COLUMN configuracion_empresa.folio_inicial_carta_porte IS 'Folio inicial para Carta Porte';
COMMENT ON COLUMN configuracion_empresa.folio_actual_carta_porte IS 'Folio actual para Carta Porte (incrementa automáticamente)';
