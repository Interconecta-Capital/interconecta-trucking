-- ============================================================
-- CORRECCIÓN DE DATOS FISCALES PARA USUARIO ACTUAL
-- ============================================================
-- Objetivo: Alinear datos con fuente oficial del SAT
-- Usuario: b2c1cc60-6a63-453e-910d-69f66bd0f66f
-- RFC: EKU9003173C9 (Prueba SAT)
-- Fecha: 2025-11-24
-- ============================================================

-- PASO 1: Actualizar configuracion_empresa con datos oficiales del SAT
-- Fuente: rfc_pruebas_sat (datos oficiales del SAT para pruebas)
UPDATE configuracion_empresa
SET 
  razon_social = 'ESCUELA KEMPER URGATE',
  validado_sat = true,
  fecha_ultima_validacion = NOW()
WHERE user_id = 'b2c1cc60-6a63-453e-910d-69f66bd0f66f'
  AND rfc_emisor = 'EKU9003173C9'
  AND modo_pruebas = true;

-- PASO 2: Actualizar TODAS las facturas del usuario con datos correctos
-- Esto asegura que facturas existentes y nuevas usen datos oficiales
UPDATE facturas
SET 
  nombre_emisor = 'ESCUELA KEMPER URGATE',
  rfc_emisor = 'EKU9003173C9',
  regimen_fiscal_emisor = '601'
WHERE user_id = 'b2c1cc60-6a63-453e-910d-69f66bd0f66f';

-- PASO 3: Verificar que la corrección se aplicó correctamente
-- Este SELECT mostrará los datos actualizados
DO $$
DECLARE
  v_config_count INTEGER;
  v_facturas_count INTEGER;
BEGIN
  -- Contar configuraciones actualizadas
  SELECT COUNT(*) INTO v_config_count
  FROM configuracion_empresa
  WHERE user_id = 'b2c1cc60-6a63-453e-910d-69f66bd0f66f'
    AND razon_social = 'ESCUELA KEMPER URGATE';
  
  -- Contar facturas actualizadas
  SELECT COUNT(*) INTO v_facturas_count
  FROM facturas
  WHERE user_id = 'b2c1cc60-6a63-453e-910d-69f66bd0f66f'
    AND nombre_emisor = 'ESCUELA KEMPER URGATE';
  
  RAISE NOTICE '✅ Corrección completada:';
  RAISE NOTICE '   Configuraciones actualizadas: %', v_config_count;
  RAISE NOTICE '   Facturas actualizadas: %', v_facturas_count;
  
  IF v_config_count = 0 THEN
    RAISE WARNING '⚠️ No se encontró configuración para actualizar';
  END IF;
  
  IF v_facturas_count = 0 THEN
    RAISE WARNING '⚠️ No se encontraron facturas para actualizar';
  END IF;
END $$;