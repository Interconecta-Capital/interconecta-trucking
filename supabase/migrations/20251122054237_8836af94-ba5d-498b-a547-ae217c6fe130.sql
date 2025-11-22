-- ============================================
-- CORRECCIÓN: Expandir campos de factura en RPC get_viaje_con_relaciones
-- ============================================
-- Agregar TODOS los campos necesarios para FacturaPreviewModal
-- ISO 27001 A.14.2.5 - Secure development lifecycle

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
      'tipo_servicio', v.tipo_servicio
    ),
    
    'conductor', CASE 
      WHEN c.id IS NOT NULL THEN json_build_object(
        'id', c.id,
        'nombre', c.nombre,
        'telefono', c.telefono,
        'email', c.email,
        'num_licencia', c.num_licencia,
        'tipo_licencia', c.tipo_licencia,
        'vigencia_licencia', c.vigencia_licencia,
        'estado', c.estado
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
        'config_vehicular', vh.config_vehicular,
        'estado', vh.estado
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
        'status', f.status,
        'rfc_emisor', f.rfc_emisor,
        'nombre_emisor', f.nombre_emisor,
        'regimen_fiscal_emisor', f.regimen_fiscal_emisor,
        'rfc_receptor', f.rfc_receptor,
        'nombre_receptor', f.nombre_receptor,
        'regimen_fiscal_receptor', f.regimen_fiscal_receptor,
        'uso_cfdi', f.uso_cfdi,
        'tipo_comprobante', f.tipo_comprobante,
        'fecha_expedicion', f.fecha_expedicion,
        'moneda', f.moneda,
        'subtotal', f.subtotal,
        'total', f.total,
        'total_impuestos_trasladados', f.total_impuestos_trasladados,
        'forma_pago', f.forma_pago,
        'metodo_pago', f.metodo_pago,
        'tiene_carta_porte', f.tiene_carta_porte,
        'carta_porte_id', f.carta_porte_id
      ) ELSE NULL END,
    
    'carta_porte', CASE
      WHEN cp.id IS NOT NULL THEN json_build_object(
        'id', cp.id,
        'uuid_fiscal', cp.uuid_fiscal,
        'status', cp.status,
        'folio', cp.folio,
        'fecha_timbrado', cp.fecha_timbrado
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
$$;