-- Corrección RPC get_viaje_con_relaciones: acceso a tipo_servicio en JSONB
DROP FUNCTION IF EXISTS public.get_viaje_con_relaciones(uuid);

CREATE OR REPLACE FUNCTION public.get_viaje_con_relaciones(p_viaje_id uuid)
RETURNS json 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
      'observaciones', v.observaciones,
      'tipo_servicio', v.tracking_data->>'tipo_servicio'
    ),
    'conductor', CASE 
      WHEN c.id IS NOT NULL THEN json_build_object(
        'id', c.id, 'nombre', c.nombre, 'telefono', c.telefono, 'email', c.email,
        'num_licencia', c.num_licencia, 'tipo_licencia', c.tipo_licencia,
        'vigencia_licencia', c.vigencia_licencia, 'estado', c.estado
      ) ELSE NULL END,
    'vehiculo', CASE
      WHEN vh.id IS NOT NULL THEN json_build_object(
        'id', vh.id, 'placa', vh.placa, 'marca', vh.marca, 'modelo', vh.modelo,
        'anio', vh.anio, 'capacidad_carga', vh.capacidad_carga,
        'tipo_carroceria', vh.tipo_carroceria, 'config_vehicular', vh.config_vehicular,
        'estado', vh.estado
      ) ELSE NULL END,
    'remolque', CASE
      WHEN r.id IS NOT NULL THEN json_build_object(
        'id', r.id, 'placa', r.placa, 'tipo_remolque', r.tipo_remolque,
        'capacidad_carga', r.capacidad_carga, 'estado', r.estado
      ) ELSE NULL END,
    'factura', CASE
      WHEN f.id IS NOT NULL THEN json_build_object(
        'id', f.id, 'serie', f.serie, 'folio', f.folio,
        'uuid_fiscal', f.uuid_fiscal, 'status', f.status,
        'rfc_emisor', COALESCE(f.rfc_emisor, ''),
        'nombre_emisor', COALESCE(f.nombre_emisor, 'Sin nombre'),
        'regimen_fiscal_emisor', COALESCE(f.regimen_fiscal_emisor, 'N/A'),
        'rfc_receptor', COALESCE(f.rfc_receptor, ''),
        'nombre_receptor', COALESCE(f.nombre_receptor, 'Sin nombre'),
        'regimen_fiscal_receptor', COALESCE(f.regimen_fiscal_receptor, 'N/A'),
        'uso_cfdi', COALESCE(f.uso_cfdi, 'N/A'),
        'tipo_comprobante', COALESCE(f.tipo_comprobante, 'I'),
        'fecha_expedicion', COALESCE(f.fecha_expedicion::text, NOW()::text),
        'moneda', COALESCE(f.moneda, 'MXN'),
        'subtotal', COALESCE(f.subtotal, 0),
        'total', COALESCE(f.total, 0),
        'total_impuestos_trasladados', COALESCE(f.total_impuestos_trasladados, 0),
        'tiene_carta_porte', COALESCE(f.tiene_carta_porte, false)
      ) ELSE NULL END,
    'carta_porte', CASE
      WHEN cp.id IS NOT NULL THEN json_build_object(
        'id', cp.id, 'uuid_fiscal', cp.uuid_fiscal, 'status', cp.status,
        'folio', cp.folio, 'fecha_timbrado', cp.fecha_timbrado
      ) ELSE NULL END,
    'mercancias', COALESCE(
      (SELECT json_agg(json_build_object(
        'id', m.id, 'descripcion', m.descripcion, 'cantidad', m.cantidad,
        'peso_kg', m.peso_kg, 'valor_mercancia', m.valor_mercancia
      )) FROM mercancias m WHERE m.viaje_id = v.id), '[]'::json
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
$$;