-- FASE 5: Corrección inmediata de datos en configuracion_empresa
-- Actualizar con los datos oficiales del SAT para sandbox

-- Primero, verificar registros existentes
DO $$ 
DECLARE
  registros_encontrados INTEGER;
BEGIN
  SELECT COUNT(*) INTO registros_encontrados
  FROM configuracion_empresa
  WHERE rfc_emisor = 'EKU9003173C9' 
    AND modo_pruebas = true;
  
  RAISE NOTICE 'Registros encontrados con RFC EKU9003173C9 en modo pruebas: %', registros_encontrados;
END $$;

-- Actualizar configuración con datos oficiales del SAT
UPDATE configuracion_empresa
SET 
  razon_social = 'ESCUELA KEMPER URGATE',
  validado_sat = true,
  fecha_ultima_validacion = NOW()
WHERE rfc_emisor = 'EKU9003173C9'
  AND modo_pruebas = true;

-- Log de auditoría
INSERT INTO security_audit_log (
  user_id,
  event_type,
  event_data
) VALUES (
  NULL,
  'config_empresa_correccion',
  jsonb_build_object(
    'accion', 'actualizacion_datos_sat',
    'rfc', 'EKU9003173C9',
    'razon_social_nueva', 'ESCUELA KEMPER URGATE',
    'timestamp', NOW(),
    'motivo', 'Corrección para prevenir error CFDI40139'
  )
);

-- Verificar el resultado
DO $$ 
DECLARE
  config_record RECORD;
BEGIN
  FOR config_record IN 
    SELECT user_id, rfc_emisor, razon_social, validado_sat
    FROM configuracion_empresa
    WHERE rfc_emisor = 'EKU9003173C9'
  LOOP
    RAISE NOTICE 'Usuario: %, RFC: %, Razón Social: %, Validado: %', 
      config_record.user_id, 
      config_record.rfc_emisor, 
      config_record.razon_social,
      config_record.validado_sat;
  END LOOP;
END $$;
