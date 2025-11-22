-- ============================================
-- MIGRACIÓN: UNIFICAR MERCANCÍAS - ELIMINAR DUPLICACIÓN
-- ============================================
-- Objetivo: UNA sola fuente de verdad para mercancías
-- Antes: tracking_data JSON + tabla mercancias (2 lugares)
-- Después: Solo tabla mercancias con viaje_id (1 lugar)

-- 1. Agregar columna viaje_id y estado a tabla mercancias
ALTER TABLE public.mercancias 
ADD COLUMN IF NOT EXISTS viaje_id UUID REFERENCES public.viajes(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'timbrada', 'cancelada'));

-- 2. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_mercancias_viaje_id ON public.mercancias(viaje_id);
CREATE INDEX IF NOT EXISTS idx_mercancias_estado ON public.mercancias(estado);
CREATE INDEX IF NOT EXISTS idx_mercancias_viaje_estado ON public.mercancias(viaje_id, estado);

-- 3. Migrar datos existentes de tracking_data a tabla mercancias
DO $$
DECLARE
  viaje_record RECORD;
  mercancia_json JSONB;
  tracking_mercancias JSONB;
BEGIN
  FOR viaje_record IN 
    SELECT id, tracking_data 
    FROM public.viajes 
    WHERE tracking_data IS NOT NULL 
      AND jsonb_typeof(tracking_data->'mercancias') = 'array'
      AND jsonb_array_length(tracking_data->'mercancias') > 0
  LOOP
    tracking_mercancias := viaje_record.tracking_data->'mercancias';
    
    FOR mercancia_json IN SELECT * FROM jsonb_array_elements(tracking_mercancias)
    LOOP
      -- Insertar si no existe ya
      INSERT INTO public.mercancias (
        viaje_id,
        bienes_transp,
        descripcion,
        cantidad,
        clave_unidad,
        peso_kg,
        valor_mercancia,
        material_peligroso,
        moneda,
        embalaje,
        estado
      ) VALUES (
        viaje_record.id,
        COALESCE(mercancia_json->>'bienes_transp', mercancia_json->>'claveProdServ', ''),
        COALESCE(mercancia_json->>'descripcion', ''),
        COALESCE((mercancia_json->>'cantidad')::numeric, 1),
        COALESCE(mercancia_json->>'clave_unidad', mercancia_json->>'claveUnidad', 'KGM'),
        COALESCE((mercancia_json->>'peso_kg')::numeric, (mercancia_json->>'pesoKg')::numeric, 0),
        COALESCE((mercancia_json->>'valor_mercancia')::numeric, (mercancia_json->>'valorMercancia')::numeric, 0),
        COALESCE((mercancia_json->>'material_peligroso')::boolean, false),
        COALESCE(mercancia_json->>'moneda', 'MXN'),
        mercancia_json->>'embalaje',
        'borrador'
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Migradas mercancías del viaje %', viaje_record.id;
  END LOOP;
END $$;

-- 4. Actualizar mercancias existentes para asociarlas con viajes
UPDATE public.mercancias m
SET viaje_id = cp.viaje_id,
    estado = CASE 
      WHEN cp.status = 'timbrada' THEN 'timbrada'
      ELSE 'borrador'
    END
FROM public.cartas_porte cp
WHERE m.carta_porte_id = cp.id
  AND m.viaje_id IS NULL
  AND cp.viaje_id IS NOT NULL;

-- 5. Comentarios para documentación
COMMENT ON COLUMN public.mercancias.viaje_id IS 'Relación directa con viaje - ÚNICA fuente de verdad';
COMMENT ON COLUMN public.mercancias.estado IS 'borrador=en viaje, timbrada=en carta porte timbrada';
COMMENT ON INDEX idx_mercancias_viaje_estado IS 'Índice compuesto para queries optimizadas: WHERE viaje_id = ? AND estado = ?';

-- 6. Crear vista materializada para métricas (opcional)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_mercancias_viaje AS
SELECT 
  viaje_id,
  COUNT(*) as total_mercancias,
  SUM(cantidad) as cantidad_total,
  SUM(peso_kg) as peso_total,
  SUM(valor_mercancia) as valor_total,
  COUNT(*) FILTER (WHERE material_peligroso = true) as mercancias_peligrosas,
  COUNT(*) FILTER (WHERE estado = 'timbrada') as mercancias_timbradas
FROM public.mercancias
WHERE viaje_id IS NOT NULL
GROUP BY viaje_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_mercancias_viaje_id 
ON mv_mercancias_viaje(viaje_id);

COMMENT ON MATERIALIZED VIEW mv_mercancias_viaje IS 'Vista materializada para métricas de mercancías por viaje - se actualiza con REFRESH';

-- 7. Función para refrescar vista materializada
CREATE OR REPLACE FUNCTION refresh_mercancias_viaje_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_mercancias_viaje;
END;
$$;

COMMENT ON FUNCTION refresh_mercancias_viaje_stats() IS 'Refresca estadísticas de mercancías - llamar después de inserts/updates masivos';