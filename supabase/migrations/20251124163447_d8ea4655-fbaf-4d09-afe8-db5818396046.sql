-- ============================================
-- FASE 2: Poblar RFCs de Prueba del SAT (CORREGIDO v2)
-- ============================================
-- Fuente oficial: https://developers.sw.com.mx/knowledge-base/donde-encuentro-csd-de-pruebas-vigentes/
-- Estos RFCs son proporcionados por el SAT para pruebas en ambiente sandbox

-- Limpiar datos existentes
TRUNCATE TABLE public.rfc_pruebas_sat CASCADE;

-- Insertar RFCs oficiales de prueba del SAT
-- Usando valores válidos según constraint: 'fisica' o 'moral'
INSERT INTO public.rfc_pruebas_sat (
  rfc, 
  nombre, 
  tipo, 
  regimen_fiscal, 
  codigo_postal, 
  descripcion
) VALUES
  -- RFC Principal de pruebas (el más usado)
  (
    'EKU9003173C9', 
    'ESCUELA KEMPER URGATE', 
    'moral', 
    '601', 
    '86991', 
    'RFC de prueba oficial SAT - Persona Moral. RFC más utilizado en ambiente sandbox.'
  ),

  -- RFCs adicionales para pruebas
  (
    'CTO021007DZ8', 
    'COMERCIALIZADORA TINTO SA DE CV', 
    'moral', 
    '601', 
    '06470', 
    'RFC de prueba SAT - Comercializadora'
  ),
  (
    'LAN7008173R5', 
    'LUIS ALBERTO NAVARRO RODRIGUEZ', 
    'fisica', 
    '605', 
    '86000', 
    'RFC de prueba SAT - Persona Física con actividad empresarial'
  ),
  (
    'IIA040805DZ4', 
    'INNOVACION TECNOLOGICA S DE RL DE CV', 
    'moral', 
    '601', 
    '86000', 
    'RFC de prueba SAT - Sociedad de RL'
  ),

  -- RFC genérico (público en general) - clasificado como moral por ser genérico empresarial
  (
    'XAXX010101000', 
    'PUBLICO EN GENERAL', 
    'moral', 
    '616', 
    '86000', 
    'RFC público en general para operaciones sin RFC específico'
  ),
  (
    'XEXX010101000', 
    'PUBLICO EN GENERAL (EXTRANJERO)', 
    'moral', 
    '616', 
    '86000', 
    'RFC extranjero público en general'
  ),

  -- RFCs para casos específicos de CartaPorte
  (
    'AAD990814BP7', 
    'ALMACENADORA Y DISTRIBUIDORA SA DE CV', 
    'moral', 
    '601', 
    '01000', 
    'RFC de prueba para transportista - Uso en CartaPorte'
  ),
  (
    'ROCS810106PS4', 
    'ROSA CARMEN SANCHEZ PEREZ', 
    'fisica', 
    '612', 
    '03100', 
    'RFC de prueba para conductor - Uso en figuras de transporte'
  );

-- Registrar en auditoría
INSERT INTO public.security_audit_log (
  user_id,
  event_type,
  event_data
) VALUES (
  NULL,
  'rfc_pruebas_pobladas',
  jsonb_build_object(
    'total_rfcs', 8,
    'timestamp', now(),
    'fuente', 'documentacion_oficial_sat',
    'url_referencia', 'https://developers.sw.com.mx/knowledge-base/donde-encuentro-csd-de-pruebas-vigentes/',
    'fase', 'FASE_2_PLAN_IMPLEMENTACION',
    'rfcs_principales', jsonb_build_array(
      'EKU9003173C9 - ESCUELA KEMPER URGATE (Principal)',
      'CTO021007DZ8 - COMERCIALIZADORA TINTO',
      'LAN7008173R5 - LUIS ALBERTO NAVARRO',
      'IIA040805DZ4 - INNOVACION TECNOLOGICA',
      'XAXX010101000 - PUBLICO EN GENERAL',
      'XEXX010101000 - PUBLICO EN GENERAL EXTRANJERO',
      'AAD990814BP7 - ALMACENADORA (Transportista)',
      'ROCS810106PS4 - ROSA CARMEN (Conductor)'
    )
  )
);

-- Query de verificación y reporte
DO $$
DECLARE
  total_rfcs INTEGER;
  morales INTEGER;
  fisicas INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_rfcs FROM public.rfc_pruebas_sat;
  SELECT COUNT(*) INTO morales FROM public.rfc_pruebas_sat WHERE tipo = 'moral';
  SELECT COUNT(*) INTO fisicas FROM public.rfc_pruebas_sat WHERE tipo = 'fisica';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ FASE 2 COMPLETADA: RFCs de Prueba SAT';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total RFCs poblados: %', total_rfcs;
  RAISE NOTICE '  - Personas morales: %', morales;
  RAISE NOTICE '  - Personas físicas: %', fisicas;
  RAISE NOTICE '';
  RAISE NOTICE 'RFC PRINCIPAL PARA PRUEBAS:';
  RAISE NOTICE '  RFC: EKU9003173C9';
  RAISE NOTICE '  Nombre: ESCUELA KEMPER URGATE';
  RAISE NOTICE '  Tipo: Persona Moral';
  RAISE NOTICE '  Régimen: 601';
  RAISE NOTICE '  CP: 86991';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;