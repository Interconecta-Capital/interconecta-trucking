-- ============================================
-- SCRIPT DE AUDITORÍA: CARTAS PORTE
-- Fecha: 2025-11-24
-- Propósito: Identificar inconsistencias en borradores y cartas porte
-- ============================================

-- ==========================================
-- 1. AUDITORÍA: Borradores sin IdCCP
-- ==========================================
-- Identificar borradores que no tienen IdCCP en datos_formulario
-- Esto puede causar que aparezca "🔄 Generando..." permanentemente

SELECT 
  id,
  nombre_borrador,
  viaje_id,
  datos_formulario->'idCCP' as id_ccp_actual,
  datos_formulario->'configuracion'->'rfcEmisor' as rfc_emisor,
  datos_formulario->'configuracion'->'rfcReceptor' as rfc_receptor,
  created_at,
  updated_at
FROM borradores_carta_porte
WHERE datos_formulario->>'idCCP' IS NULL
ORDER BY created_at DESC;

-- ==========================================
-- 2. AUDITORÍA: Viajes con múltiples borradores
-- ==========================================
-- Identificar viajes que tienen más de un borrador de carta porte
-- Esto puede causar confusión sobre cuál borrador usar

SELECT 
  viaje_id,
  COUNT(*) as cantidad_borradores,
  array_agg(id) as ids_borradores,
  array_agg(nombre_borrador) as nombres_borradores
FROM borradores_carta_porte
WHERE viaje_id IS NOT NULL
GROUP BY viaje_id
HAVING COUNT(*) > 1
ORDER BY cantidad_borradores DESC;

-- ==========================================
-- 3. AUDITORÍA: Cartas porte sin viaje_id
-- ==========================================
-- Identificar cartas porte que no están vinculadas a ningún viaje
-- Estas pueden ser "huérfanas" o creadas manualmente

SELECT 
  id,
  id_ccp,
  status,
  nombre_documento,
  rfc_emisor,
  rfc_receptor,
  viaje_id,
  created_at
FROM cartas_porte
WHERE viaje_id IS NULL
ORDER BY created_at DESC;

-- ==========================================
-- 4. AUDITORÍA: Borradores con progreso < 80%
-- ==========================================
-- Identificar borradores que no cumplen el requisito mínimo
-- para ser activados (80% de completitud)

SELECT 
  id,
  nombre_borrador,
  viaje_id,
  datos_formulario->'idCCP' as id_ccp,
  -- Calcular progreso
  (
    CASE WHEN datos_formulario->>'rfcEmisor' IS NOT NULL AND datos_formulario->>'rfcReceptor' IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN jsonb_array_length(datos_formulario->'ubicaciones') >= 2 THEN 1 ELSE 0 END +
    CASE WHEN jsonb_array_length(datos_formulario->'mercancias') > 0 THEN 1 ELSE 0 END +
    CASE WHEN datos_formulario->'autotransporte'->>'placa_vm' IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN jsonb_array_length(datos_formulario->'figuras') > 0 THEN 1 ELSE 0 END
  ) * 20 as progreso_porcentaje,
  created_at,
  ultima_edicion
FROM borradores_carta_porte
ORDER BY ultima_edicion DESC;

-- ==========================================
-- 5. AUDITORÍA: Facturas con carta porte duplicada
-- ==========================================
-- Identificar facturas que tienen tanto un borrador
-- como una carta porte activa vinculada al mismo viaje

SELECT 
  f.id as factura_id,
  f.serie,
  f.folio,
  f.viaje_id,
  f.tiene_carta_porte,
  b.id as borrador_id,
  b.nombre_borrador,
  cp.id as carta_porte_id,
  cp.id_ccp,
  cp.status as cp_status
FROM facturas f
LEFT JOIN borradores_carta_porte b ON b.viaje_id = f.viaje_id
LEFT JOIN cartas_porte cp ON cp.viaje_id = f.viaje_id
WHERE f.tiene_carta_porte = true
  AND b.id IS NOT NULL
  AND cp.id IS NOT NULL
ORDER BY f.created_at DESC;

-- ==========================================
-- 6. RESUMEN EJECUTIVO
-- ==========================================
-- Vista consolidada del estado del sistema

SELECT 
  'Borradores sin IdCCP' as categoria,
  COUNT(*) as cantidad
FROM borradores_carta_porte
WHERE datos_formulario->>'idCCP' IS NULL

UNION ALL

SELECT 
  'Viajes con múltiples borradores' as categoria,
  COUNT(DISTINCT viaje_id) as cantidad
FROM (
  SELECT viaje_id
  FROM borradores_carta_porte
  WHERE viaje_id IS NOT NULL
  GROUP BY viaje_id
  HAVING COUNT(*) > 1
) sub

UNION ALL

SELECT 
  'Cartas porte huérfanas' as categoria,
  COUNT(*) as cantidad
FROM cartas_porte
WHERE viaje_id IS NULL

UNION ALL

SELECT 
  'Borradores con progreso < 80%' as categoria,
  COUNT(*) as cantidad
FROM borradores_carta_porte
WHERE (
  CASE WHEN datos_formulario->>'rfcEmisor' IS NOT NULL AND datos_formulario->>'rfcReceptor' IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN jsonb_array_length(datos_formulario->'ubicaciones') >= 2 THEN 1 ELSE 0 END +
  CASE WHEN jsonb_array_length(datos_formulario->'mercancias') > 0 THEN 1 ELSE 0 END +
  CASE WHEN datos_formulario->'autotransporte'->>'placa_vm' IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN jsonb_array_length(datos_formulario->'figuras') > 0 THEN 1 ELSE 0 END
) * 20 < 80;

-- ==========================================
-- 7. SCRIPT DE REPARACIÓN (EJECUTAR CON PRECAUCIÓN)
-- ==========================================
-- Este script regenera IdCCP para borradores que no lo tienen
-- IMPORTANTE: Revisar resultados de auditoría antes de ejecutar

-- DESCOMENTAR PARA EJECUTAR:
/*
DO $$
DECLARE
  borrador_record RECORD;
  nuevo_idccp TEXT;
BEGIN
  FOR borrador_record IN 
    SELECT id, datos_formulario 
    FROM borradores_carta_porte 
    WHERE datos_formulario->>'idCCP' IS NULL
  LOOP
    -- Generar nuevo UUID (32 caracteres sin guiones en mayúsculas)
    nuevo_idccp := UPPER(REPLACE(gen_random_uuid()::text, '-', ''));
    
    -- Actualizar datos_formulario con el nuevo idCCP
    UPDATE borradores_carta_porte
    SET datos_formulario = jsonb_set(
      datos_formulario, 
      '{idCCP}', 
      to_jsonb(nuevo_idccp)
    )
    WHERE id = borrador_record.id;
    
    RAISE NOTICE 'Borrador % actualizado con IdCCP: %', borrador_record.id, nuevo_idccp;
  END LOOP;
END $$;
*/

-- Verificar resultados del script de reparación
SELECT 
  id,
  nombre_borrador,
  datos_formulario->>'idCCP' as id_ccp_nuevo,
  created_at
FROM borradores_carta_porte
WHERE datos_formulario->>'idCCP' IS NOT NULL
ORDER BY created_at DESC
LIMIT 20;
