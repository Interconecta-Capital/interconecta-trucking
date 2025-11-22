-- ============================================
-- FASE 3: Migración para corregir relación Viaje → Borrador Carta Porte
-- ============================================

-- ========== 1. VINCULAR viaje_id EN BORRADORES ==========
UPDATE borradores_carta_porte b
SET viaje_id = v.id
FROM viajes v
WHERE v.tracking_data->>'borrador_carta_porte_id' = b.id::text
  AND b.viaje_id IS NULL
  AND v.created_at > NOW() - INTERVAL '30 days';

-- ========== 2. ACTUALIZAR RFC EMISOR DESDE configuracion_empresa ==========
UPDATE borradores_carta_porte b
SET datos_formulario = jsonb_set(
  jsonb_set(
    COALESCE(b.datos_formulario, '{}'::jsonb),
    '{rfcEmisor}',
    to_jsonb(c.rfc_emisor::text)
  ),
  '{nombreEmisor}',
  to_jsonb(c.razon_social::text)
)
FROM configuracion_empresa c
WHERE b.user_id = c.user_id
  AND c.rfc_emisor IS NOT NULL
  AND c.razon_social IS NOT NULL
  AND (
    b.datos_formulario->>'rfcEmisor' IS NULL 
    OR b.datos_formulario->>'rfcEmisor' = ''
    OR b.datos_formulario->>'rfcEmisor' = 'N/A'
  )
  AND b.created_at > NOW() - INTERVAL '30 days';

-- ========== 3. ACTUALIZAR RFC RECEPTOR DESDE VIAJE ==========
UPDATE borradores_carta_porte b
SET datos_formulario = jsonb_set(
  jsonb_set(
    COALESCE(b.datos_formulario, '{}'::jsonb),
    '{rfcReceptor}',
    to_jsonb(COALESCE(v.tracking_data->'cliente'->>'rfc', 'XAXX010101000')::text)
  ),
  '{nombreReceptor}',
  to_jsonb(COALESCE(v.tracking_data->'cliente'->>'nombre_razon_social', 'Cliente General')::text)
)
FROM viajes v
WHERE b.viaje_id = v.id
  AND v.tracking_data->'cliente' IS NOT NULL
  AND (
    b.datos_formulario->>'rfcReceptor' IS NULL 
    OR b.datos_formulario->>'rfcReceptor' = ''
    OR b.datos_formulario->>'rfcReceptor' = 'N/A'
  )
  AND b.created_at > NOW() - INTERVAL '30 days';

-- ========== 4. ÍNDICE PARA MEJORAR PERFORMANCE ==========
CREATE INDEX IF NOT EXISTS idx_borradores_viaje_id 
ON borradores_carta_porte(viaje_id) 
WHERE viaje_id IS NOT NULL;