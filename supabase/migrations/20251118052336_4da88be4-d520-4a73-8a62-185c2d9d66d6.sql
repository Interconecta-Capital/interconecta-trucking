
-- ============================================
-- FASE 1: VINCULAR VIAJES CON FACTURAS
-- ============================================

-- 1. Agregar viaje_id a facturas
ALTER TABLE public.facturas
ADD COLUMN IF NOT EXISTS viaje_id UUID REFERENCES public.viajes(id) ON DELETE SET NULL;

-- 2. Agregar factura_id a viajes  
ALTER TABLE public.viajes
ADD COLUMN IF NOT EXISTS factura_id UUID REFERENCES public.facturas(id) ON DELETE SET NULL;

-- 3. Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_facturas_viaje_id ON public.facturas(viaje_id);
CREATE INDEX IF NOT EXISTS idx_viajes_factura_id ON public.viajes(factura_id);

-- 4. Comentarios para documentación
COMMENT ON COLUMN public.facturas.viaje_id IS 'ID del viaje que generó esta factura (trazabilidad completa)';
COMMENT ON COLUMN public.viajes.factura_id IS 'ID de la factura asociada a este viaje (si tipo_servicio = flete_pagado)';

-- 5. Actualizar RLS policies para facturas
DROP POLICY IF EXISTS "Users can view facturas from their viajes" ON public.facturas;
CREATE POLICY "Users can view facturas from their viajes"
ON public.facturas FOR SELECT
USING (
  auth.uid() = user_id OR
  viaje_id IN (SELECT id FROM public.viajes WHERE user_id = auth.uid())
);

-- 6. Agregar función para obtener datos completos del viaje
CREATE OR REPLACE FUNCTION get_viaje_completo(p_viaje_id UUID)
RETURNS TABLE (
  viaje_data JSONB,
  factura_data JSONB,
  carta_porte_data JSONB,
  conductor_data JSONB,
  vehiculo_data JSONB,
  socio_data JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_jsonb(v.*) as viaje_data,
    to_jsonb(f.*) as factura_data,
    to_jsonb(cp.*) as carta_porte_data,
    to_jsonb(c.*) as conductor_data,
    to_jsonb(vh.*) as vehiculo_data,
    to_jsonb(s.*) as socio_data
  FROM viajes v
  LEFT JOIN facturas f ON f.id = v.factura_id
  LEFT JOIN cartas_porte cp ON cp.viaje_id = v.id
  LEFT JOIN conductores c ON c.id = v.conductor_id
  LEFT JOIN vehiculos vh ON vh.id = v.vehiculo_id
  LEFT JOIN socios s ON s.id = v.socio_id
  WHERE v.id = p_viaje_id
  AND v.user_id = auth.uid();
END;
$$;

COMMENT ON FUNCTION get_viaje_completo IS 'Obtiene todos los datos relacionados a un viaje en una sola consulta optimizada';
