-- ============================================
-- MIGRACIÓN: Corrección de 8 problemas del sistema de viajes
-- Fecha: 2025-11-22
-- ============================================

-- 1. Agregar campo serie_factura a configuracion_empresa
ALTER TABLE public.configuracion_empresa
ADD COLUMN IF NOT EXISTS serie_factura VARCHAR(10) DEFAULT 'ZS';

-- Actualizar registros existentes
UPDATE public.configuracion_empresa
SET serie_factura = 'ZS'
WHERE serie_factura IS NULL;

COMMENT ON COLUMN public.configuracion_empresa.serie_factura IS 'Serie para facturas de ingreso (diferente de serie_carta_porte)';

-- 2. Corregir función RPC get_viaje_con_relaciones
-- Cambiar m.unidad por m.clave_unidad
DROP FUNCTION IF EXISTS public.get_viaje_con_relaciones(uuid);

CREATE OR REPLACE FUNCTION public.get_viaje_con_relaciones(p_viaje_id uuid)
RETURNS json AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'viaje', json_build_object(
      'id', v.id,
      'origen', v.origen,
      'destino', v.destino,
      'estado', v.estado,
      'fecha_inicio_programada', v.fecha_inicio_programada,
      'fecha_fin_programada', v.fecha_fin_programada,
      'distancia_km', v.distancia_km,
      'tracking_data', v.tracking_data,
      'carta_porte_id', v.carta_porte_id,
      'factura_id', v.factura_id,
      'created_at', v.created_at,
      'observaciones', v.observaciones
    ),
    
    'conductor', CASE 
      WHEN c.id IS NOT NULL THEN json_build_object(
        'id', c.id,
        'nombre', c.nombre,
        'telefono', c.telefono,
        'email', c.email,
        'num_licencia', c.num_licencia
      ) ELSE NULL END,
    
    'vehiculo', CASE
      WHEN vh.id IS NOT NULL THEN json_build_object(
        'id', vh.id,
        'placa', vh.placa,
        'marca', vh.marca,
        'modelo', vh.modelo,
        'anio', vh.anio,
        'num_serie', vh.num_serie,
        'numero_serie_vin', vh.numero_serie_vin,
        'capacidad_carga', vh.capacidad_carga,
        'tipo_carroceria', vh.tipo_carroceria,
        'config_vehicular', vh.config_vehicular
      ) ELSE NULL END,
    
    'remolque', CASE
      WHEN r.id IS NOT NULL THEN json_build_object(
        'id', r.id,
        'placa', r.placa,
        'tipo_remolque', r.tipo_remolque,
        'capacidad_carga', r.capacidad_carga,
        'subtipo_rem', r.subtipo_rem,
        'estado', r.estado
      ) ELSE NULL END,
    
    'factura', CASE
      WHEN f.id IS NOT NULL THEN json_build_object(
        'id', f.id,
        'serie', f.serie,
        'folio', f.folio,
        'uuid_fiscal', f.uuid_fiscal,
        'status', f.status
      ) ELSE NULL END,
    
    'carta_porte', CASE
      WHEN cp.id IS NOT NULL THEN json_build_object(
        'id', cp.id,
        'uuid_fiscal', cp.uuid_fiscal,
        'status', cp.status
      ) ELSE NULL END,
    
    'mercancias', COALESCE(
      (SELECT json_agg(json_build_object(
        'id', m.id,
        'descripcion', m.descripcion,
        'bienes_transp', m.bienes_transp,
        'cantidad', m.cantidad,
        'clave_unidad', m.clave_unidad,
        'peso_kg', m.peso_kg,
        'valor_mercancia', m.valor_mercancia,
        'material_peligroso', m.material_peligroso,
        'moneda', m.moneda,
        'estado', m.estado
      ))
      FROM mercancias m
      WHERE m.viaje_id = v.id),
      '[]'::json
    )
  ) INTO v_result
  FROM viajes v
  LEFT JOIN conductores c ON c.id = v.conductor_id
  LEFT JOIN vehiculos vh ON vh.id = v.vehiculo_id
  LEFT JOIN remolques r ON r.id = v.remolque_id
  LEFT JOIN facturas f ON f.id = v.factura_id
  LEFT JOIN cartas_porte cp ON cp.id = v.carta_porte_id
  WHERE v.id = p_viaje_id AND v.user_id = auth.uid();
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_viaje_con_relaciones IS 'Obtiene un viaje con todas sus relaciones. CORREGIDO: usa m.clave_unidad en lugar de m.unidad';