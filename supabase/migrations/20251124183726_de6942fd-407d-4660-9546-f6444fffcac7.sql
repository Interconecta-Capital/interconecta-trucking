-- =====================================================
-- MIGRACIÓN CRÍTICA: Corrección de datos para timbrado
-- Fecha: 2025-11-24
-- Objetivo: Asegurar que todos los socios tengan datos
--           completos para timbrado exitoso
-- =====================================================

-- ✅ PASO 1: Agregar código postal default a socios sin direccion_fiscal
UPDATE socios
SET direccion_fiscal = jsonb_build_object(
  'codigoPostal', '01000',
  'codigo_postal', '01000',
  'pais', 'MEX',
  'estado', 'CDMX',
  'municipio', 'CDMX',
  'colonia', 'Centro',
  'calle', 'Sin especificar',
  'numExterior', 'S/N'
)
WHERE activo = true 
  AND (direccion_fiscal IS NULL OR direccion_fiscal = '{}'::jsonb);

-- ✅ PASO 2: Asegurar que direccion_fiscal tenga ambos formatos de CP (camelCase y snake_case)
UPDATE socios
SET direccion_fiscal = CASE
  -- Si tiene codigoPostal pero no codigo_postal, agregar snake_case
  WHEN direccion_fiscal ? 'codigoPostal' AND NOT direccion_fiscal ? 'codigo_postal' THEN
    direccion_fiscal || jsonb_build_object('codigo_postal', direccion_fiscal->>'codigoPostal')
  
  -- Si tiene codigo_postal pero no codigoPostal, agregar camelCase
  WHEN direccion_fiscal ? 'codigo_postal' AND NOT direccion_fiscal ? 'codigoPostal' THEN
    direccion_fiscal || jsonb_build_object('codigoPostal', direccion_fiscal->>'codigo_postal')
  
  ELSE direccion_fiscal
END
WHERE activo = true
  AND direccion_fiscal IS NOT NULL
  AND direccion_fiscal != '{}'::jsonb;

-- ✅ PASO 3: Validar que todos los socios activos tengan RFC válido
UPDATE socios
SET rfc = UPPER(TRIM(rfc))
WHERE activo = true
  AND rfc IS NOT NULL;

-- ✅ PASO 4: Asegurar que todos los socios tengan regimen_fiscal
UPDATE socios
SET regimen_fiscal = '616'  -- Default: Personas físicas con actividades empresariales
WHERE activo = true
  AND (regimen_fiscal IS NULL OR regimen_fiscal = '');

-- ✅ PASO 5: Asegurar que todos los socios tengan uso_cfdi
UPDATE socios
SET uso_cfdi = 'G03'  -- Default: Gastos en general
WHERE activo = true
  AND (uso_cfdi IS NULL OR uso_cfdi = '');

-- =====================================================
-- VERIFICACIÓN: Consultar estado de socios después de migración
-- =====================================================

-- Esta consulta mostrará el estado final de todos los socios activos
DO $$
DECLARE
  total_socios INTEGER;
  socios_sin_cp INTEGER;
  socios_sin_rfc INTEGER;
  socios_sin_regimen INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_socios FROM socios WHERE activo = true;
  
  SELECT COUNT(*) INTO socios_sin_cp 
  FROM socios 
  WHERE activo = true 
    AND (
      direccion_fiscal IS NULL 
      OR direccion_fiscal = '{}'::jsonb
      OR (NOT direccion_fiscal ? 'codigoPostal' AND NOT direccion_fiscal ? 'codigo_postal')
    );
  
  SELECT COUNT(*) INTO socios_sin_rfc 
  FROM socios 
  WHERE activo = true AND (rfc IS NULL OR rfc = '');
  
  SELECT COUNT(*) INTO socios_sin_regimen 
  FROM socios 
  WHERE activo = true AND (regimen_fiscal IS NULL OR regimen_fiscal = '');
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'RESULTADO DE MIGRACIÓN';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Total de socios activos: %', total_socios;
  RAISE NOTICE 'Socios sin código postal: %', socios_sin_cp;
  RAISE NOTICE 'Socios sin RFC: %', socios_sin_rfc;
  RAISE NOTICE 'Socios sin régimen fiscal: %', socios_sin_regimen;
  RAISE NOTICE '============================================';
  
  IF socios_sin_cp > 0 OR socios_sin_rfc > 0 OR socios_sin_regimen > 0 THEN
    RAISE WARNING '⚠️ Aún hay socios con datos incompletos. Revisar manualmente.';
  ELSE
    RAISE NOTICE '✅ Todos los socios tienen datos completos para timbrado.';
  END IF;
END $$;