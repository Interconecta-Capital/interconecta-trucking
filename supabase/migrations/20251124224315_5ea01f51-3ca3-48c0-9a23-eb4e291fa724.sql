-- ========================================
-- MIGRACIÓN: Correcciones de Datos y Validaciones (Corregida)
-- ========================================

-- 1. NORMALIZAR PAÍS A CÓDIGO SAT EN SOCIOS - direccion_fiscal
UPDATE socios 
SET direccion_fiscal = jsonb_set(
  COALESCE(direccion_fiscal, '{}'::jsonb),
  '{pais}', 
  '"MEX"'::jsonb
)
WHERE 
  direccion_fiscal IS NOT NULL 
  AND (
    direccion_fiscal->>'pais' IS NULL 
    OR direccion_fiscal->>'pais' = ''
    OR direccion_fiscal->>'pais' ILIKE '%méx%'
    OR direccion_fiscal->>'pais' ILIKE '%mex%'
    OR direccion_fiscal->>'pais' = 'Mexico'
    OR direccion_fiscal->>'pais' = 'México'
  );

-- 2. NORMALIZAR PAÍS EN DIRECCIÓN GENERAL DE SOCIOS
UPDATE socios 
SET direccion = jsonb_set(
  COALESCE(direccion, '{}'::jsonb),
  '{pais}', 
  '"MEX"'::jsonb
)
WHERE 
  direccion IS NOT NULL 
  AND (
    direccion->>'pais' IS NULL 
    OR direccion->>'pais' = ''
    OR direccion->>'pais' ILIKE '%méx%'
    OR direccion->>'pais' ILIKE '%mex%'
  );

-- 3. NORMALIZAR PAÍS EN CONFIGURACIÓN EMPRESA
UPDATE configuracion_empresa
SET domicilio_fiscal = jsonb_set(
  COALESCE(domicilio_fiscal, '{}'::jsonb),
  '{pais}', 
  '"MEX"'::jsonb
)
WHERE 
  domicilio_fiscal IS NOT NULL 
  AND (
    domicilio_fiscal->>'pais' IS NULL 
    OR domicilio_fiscal->>'pais' = ''
    OR domicilio_fiscal->>'pais' ILIKE '%méx%'
    OR domicilio_fiscal->>'pais' ILIKE '%mex%'
  );

-- 4. NORMALIZAR PAÍS EN CONDUCTORES (direccion JSONB)
UPDATE conductores
SET direccion = jsonb_set(
  COALESCE(direccion, '{}'::jsonb),
  '{pais}', 
  '"MEX"'::jsonb
)
WHERE 
  direccion IS NOT NULL 
  AND (
    direccion->>'pais' IS NULL 
    OR direccion->>'pais' = ''
    OR direccion->>'pais' ILIKE '%méx%'
    OR direccion->>'pais' ILIKE '%mex%'
  );

-- 5. FUNCIÓN DE VALIDACIÓN PARA CURP (solo para personas físicas)
CREATE OR REPLACE FUNCTION validar_curp_persona_fisica()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo aplicar validación si tiene tipo_persona
  IF TG_TABLE_NAME = 'socios' AND NEW.tipo_persona IS NOT NULL THEN
    -- Si es persona física, CURP es obligatorio
    IF NEW.tipo_persona = 'fisica' AND (NEW.curp IS NULL OR NEW.curp = '') THEN
      RAISE EXCEPTION 'El CURP es obligatorio para personas físicas';
    END IF;
    
    -- Si hay CURP, validar formato (18 caracteres)
    IF NEW.curp IS NOT NULL AND NEW.curp != '' AND LENGTH(NEW.curp) != 18 THEN
      RAISE EXCEPTION 'El CURP debe tener exactamente 18 caracteres';
    END IF;
  END IF;
  
  -- Para conductores, CURP siempre es obligatorio (son personas físicas)
  IF TG_TABLE_NAME = 'conductores' THEN
    IF NEW.curp IS NULL OR NEW.curp = '' THEN
      RAISE EXCEPTION 'El CURP es obligatorio para conductores';
    END IF;
    
    IF LENGTH(NEW.curp) != 18 THEN
      RAISE EXCEPTION 'El CURP debe tener exactamente 18 caracteres';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. TRIGGER PARA VALIDAR CURP EN SOCIOS
DROP TRIGGER IF EXISTS trg_validar_curp_socios ON socios;
CREATE TRIGGER trg_validar_curp_socios
  BEFORE INSERT OR UPDATE ON socios
  FOR EACH ROW
  EXECUTE FUNCTION validar_curp_persona_fisica();

-- 7. TRIGGER PARA VALIDAR CURP EN CONDUCTORES
DROP TRIGGER IF EXISTS trg_validar_curp_conductores ON conductores;
CREATE TRIGGER trg_validar_curp_conductores
  BEFORE INSERT OR UPDATE ON conductores
  FOR EACH ROW
  EXECUTE FUNCTION validar_curp_persona_fisica();

-- 8. ÍNDICES PARA BÚSQUEDAS DE PAÍS
CREATE INDEX IF NOT EXISTS idx_socios_direccion_fiscal_pais 
ON socios USING btree ((direccion_fiscal->>'pais'));

CREATE INDEX IF NOT EXISTS idx_socios_direccion_pais 
ON socios USING btree ((direccion->>'pais'));

CREATE INDEX IF NOT EXISTS idx_conductores_direccion_pais 
ON conductores USING btree ((direccion->>'pais'));

-- 9. COMENTARIOS EXPLICATIVOS
COMMENT ON COLUMN socios.direccion_fiscal IS 'Domicilio fiscal del socio. Campo "pais" debe usar códigos SAT de 3 letras (MEX, USA, CAN)';
COMMENT ON COLUMN socios.direccion IS 'Domicilio general del socio. Campo "pais" debe usar códigos SAT de 3 letras (MEX, USA, CAN)';
COMMENT ON COLUMN socios.curp IS 'CURP - Obligatorio para personas físicas, 18 caracteres';
COMMENT ON COLUMN conductores.curp IS 'CURP del conductor - Obligatorio, 18 caracteres';
COMMENT ON COLUMN conductores.direccion IS 'Domicilio del conductor. Campo "pais" debe usar códigos SAT de 3 letras (MEX, USA, CAN)';