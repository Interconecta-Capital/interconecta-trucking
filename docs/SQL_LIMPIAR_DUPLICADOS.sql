-- ============================================
-- Script de Limpieza de Cartas Porte Duplicadas
-- ============================================
-- Fecha: 2025-01-24
-- Propósito: Identificar y limpiar cartas porte duplicadas
--           generadas por el bug de conversión prematura
-- 
-- ⚠️ IMPORTANTE: Revisar los resultados antes de ejecutar DELETE
-- ============================================

-- PASO 1: Identificar borradores y cartas del mismo viaje
-- Este query muestra si hay múltiples documentos para un viaje
SELECT 
  v.id as viaje_id,
  v.origen,
  v.destino,
  v.created_at as viaje_creado,
  b.id as borrador_id,
  b.nombre_borrador,
  b.created_at as borrador_creado,
  cp.id as carta_porte_id,
  cp.id_ccp,
  cp.status as carta_status,
  cp.uuid_fiscal,
  cp.created_at as carta_creada
FROM viajes v
LEFT JOIN borradores_carta_porte b ON b.viaje_id = v.id
LEFT JOIN cartas_porte cp ON cp.viaje_id = v.id
WHERE v.user_id = auth.uid()
  AND v.created_at >= '2025-01-20' -- Ajustar fecha según necesites
ORDER BY v.created_at DESC, b.created_at, cp.created_at;

-- PASO 2: Identificar cartas porte VACÍAS (sin datos completos)
-- Estas son cartas que se activaron prematuramente sin 80% de completitud
SELECT 
  cp.id,
  cp.id_ccp,
  cp.status,
  cp.rfc_emisor,
  cp.rfc_receptor,
  cp.nombre_emisor,
  cp.nombre_receptor,
  cp.borrador_origen_id,
  cp.uuid_fiscal,
  cp.created_at,
  -- Verificar si tiene datos mínimos
  CASE 
    WHEN cp.rfc_emisor IS NULL THEN 'VACIA: Sin RFC emisor'
    WHEN cp.rfc_receptor IS NULL THEN 'VACIA: Sin RFC receptor'
    WHEN cp.datos_formulario IS NULL THEN 'VACIA: Sin datos formulario'
    WHEN cp.uuid_fiscal IS NULL AND cp.status = 'active' THEN 'ACTIVA SIN TIMBRAR'
    ELSE 'COMPLETA'
  END as estado_datos
FROM cartas_porte cp
WHERE cp.usuario_id = auth.uid()
  AND cp.created_at >= '2025-01-20'
ORDER BY cp.created_at DESC;

-- PASO 3: Identificar posibles duplicados
-- Cartas porte que tienen el mismo viaje_id y fueron creadas el mismo día
WITH cartas_agrupadas AS (
  SELECT 
    viaje_id,
    DATE(created_at) as fecha_creacion,
    COUNT(*) as cantidad_cartas,
    ARRAY_AGG(id) as ids_cartas,
    ARRAY_AGG(status) as estados,
    ARRAY_AGG(uuid_fiscal IS NOT NULL) as tiene_uuid
  FROM cartas_porte
  WHERE usuario_id = auth.uid()
    AND viaje_id IS NOT NULL
  GROUP BY viaje_id, DATE(created_at)
  HAVING COUNT(*) > 1
)
SELECT 
  ca.*,
  v.origen,
  v.destino
FROM cartas_agrupadas ca
JOIN viajes v ON v.id = ca.viaje_id
ORDER BY ca.fecha_creacion DESC;

-- ============================================
-- ELIMINACIÓN SEGURA DE DUPLICADOS
-- ============================================

-- ⚠️ PASO 4A: PREVIEW - Ver qué se eliminará (NO ELIMINA NADA)
-- Cartas porte en estado 'active' sin timbrar y sin datos completos
SELECT 
  cp.id,
  cp.id_ccp,
  cp.status,
  cp.rfc_emisor,
  cp.rfc_receptor,
  cp.borrador_origen_id,
  cp.created_at,
  'SERIA ELIMINADA' as accion
FROM cartas_porte cp
WHERE cp.usuario_id = auth.uid()
  AND cp.status = 'active'
  AND cp.uuid_fiscal IS NULL -- No ha sido timbrada
  AND (
    cp.rfc_emisor IS NULL OR
    cp.rfc_receptor IS NULL OR
    cp.datos_formulario IS NULL
  )
  AND cp.created_at >= '2025-01-20'; -- Ajustar fecha

-- ⚠️ PASO 4B: ELIMINAR cartas vacías (SOLO SI VERIFICASTE EN 4A)
-- DESCOMENTAR LA SIGUIENTE LÍNEA SOLO DESPUÉS DE REVISAR 4A
/*
DELETE FROM cartas_porte
WHERE id IN (
  SELECT cp.id
  FROM cartas_porte cp
  WHERE cp.usuario_id = auth.uid()
    AND cp.status = 'active'
    AND cp.uuid_fiscal IS NULL
    AND (
      cp.rfc_emisor IS NULL OR
      cp.rfc_receptor IS NULL OR
      cp.datos_formulario IS NULL
    )
    AND cp.created_at >= '2025-01-20'
);
*/

-- ⚠️ PASO 5: Verificar borradores huérfanos (sin viaje asociado)
SELECT 
  b.id,
  b.nombre_borrador,
  b.viaje_id,
  b.created_at,
  b.auto_saved,
  'BORRADOR HUERFANO' as tipo
FROM borradores_carta_porte b
WHERE b.user_id = auth.uid()
  AND b.viaje_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM viajes v 
    WHERE v.id = b.viaje_id
  );

-- ⚠️ PASO 6: Eliminar borradores huérfanos (OPCIONAL)
-- DESCOMENTAR SOLO SI VERIFICASTE QUE SON BASURA
/*
DELETE FROM borradores_carta_porte
WHERE id IN (
  SELECT b.id
  FROM borradores_carta_porte b
  WHERE b.user_id = auth.uid()
    AND b.viaje_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM viajes v 
      WHERE v.id = b.viaje_id
    )
);
*/

-- ============================================
-- VERIFICACIÓN POST-LIMPIEZA
-- ============================================

-- PASO 7: Verificar integridad después de limpiar
SELECT 
  'viajes' as tabla,
  COUNT(*) as total
FROM viajes
WHERE user_id = auth.uid()

UNION ALL

SELECT 
  'borradores_carta_porte' as tabla,
  COUNT(*) as total
FROM borradores_carta_porte
WHERE user_id = auth.uid()

UNION ALL

SELECT 
  'cartas_porte' as tabla,
  COUNT(*) as total
FROM cartas_porte
WHERE usuario_id = auth.uid()

UNION ALL

SELECT 
  'cartas_porte_timbradas' as tabla,
  COUNT(*) as total
FROM cartas_porte
WHERE usuario_id = auth.uid()
  AND uuid_fiscal IS NOT NULL;

-- PASO 8: Verificar que cada viaje tenga máximo 1 borrador y 1 carta
SELECT 
  v.id as viaje_id,
  v.origen,
  v.destino,
  COUNT(DISTINCT b.id) as cantidad_borradores,
  COUNT(DISTINCT cp.id) as cantidad_cartas_porte,
  CASE 
    WHEN COUNT(DISTINCT b.id) > 1 THEN '⚠️ MÚLTIPLES BORRADORES'
    WHEN COUNT(DISTINCT cp.id) > 1 THEN '⚠️ MÚLTIPLES CARTAS'
    WHEN COUNT(DISTINCT b.id) = 1 AND COUNT(DISTINCT cp.id) <= 1 THEN '✅ OK'
    ELSE '⚠️ REVISAR'
  END as estado
FROM viajes v
LEFT JOIN borradores_carta_porte b ON b.viaje_id = v.id
LEFT JOIN cartas_porte cp ON cp.viaje_id = v.id
WHERE v.user_id = auth.uid()
GROUP BY v.id, v.origen, v.destino
HAVING COUNT(DISTINCT b.id) > 1 OR COUNT(DISTINCT cp.id) > 1
ORDER BY v.created_at DESC;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 
-- 1. SIEMPRE ejecuta los queries de PREVIEW (PASO 4A, 5) antes de eliminar
-- 2. NUNCA elimines cartas con uuid_fiscal (están timbradas)
-- 3. Si una carta tiene status='timbrada', está legalmente válida
-- 4. Los borradores son seguros de eliminar si no tienen datos importantes
-- 5. Después de limpiar, invalida el cache del frontend:
--    - Recarga la página
--    - O ejecuta: queryClient.invalidateQueries()
-- 
-- RESPALDO RECOMENDADO:
-- Antes de ejecutar DELETE, exporta los registros:
-- 
-- COPY (
--   SELECT * FROM cartas_porte 
--   WHERE usuario_id = auth.uid()
-- ) TO '/tmp/backup_cartas_porte.csv' CSV HEADER;
-- 
-- ============================================
