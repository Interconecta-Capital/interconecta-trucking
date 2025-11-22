-- Corregir función get_viaje_con_relaciones con nombres correctos de columnas
CREATE OR REPLACE FUNCTION public.get_viaje_con_relaciones(p_viaje_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    -- Datos del viaje
    'viaje', json_build_object(
      'id', v.id,
      'origen', v.origen,
      'destino', v.destino,
      'estado', v.estado,
      'fecha_inicio_programada', v.fecha_inicio_programada,
      'fecha_fin_programada', v.fecha_fin_programada,
      'fecha_inicio_real', v.fecha_inicio_real,
      'fecha_fin_real', v.fecha_fin_real,
      'distancia_km', v.distancia_km,
      'tiempo_estimado_horas', v.tiempo_estimado_horas,
      'precio_cobrado', v.precio_cobrado,
      'costo_estimado', v.costo_estimado,
      'margen_estimado', v.margen_estimado,
      'observaciones', v.observaciones,
      'tracking_data', v.tracking_data,
      'created_at', v.created_at,
      'updated_at', v.updated_at,
      'carta_porte_id', v.carta_porte_id,
      'factura_id', v.factura_id
    ),
    
    -- Conductor con todos sus datos
    'conductor', CASE 
      WHEN c.id IS NOT NULL THEN json_build_object(
        'id', c.id,
        'nombre', c.nombre,
        'telefono', c.telefono,
        'email', c.email,
        'num_licencia', c.num_licencia,
        'tipo_licencia', c.tipo_licencia,
        'vigencia_licencia', c.vigencia_licencia,
        'estado', c.estado,
        'rfc', c.rfc,
        'curp', c.curp
      )
      ELSE NULL
    END,
    
    -- Vehículo con todos sus datos (CORREGIDO: num_serie en lugar de numero_serie)
    'vehiculo', CASE
      WHEN vh.id IS NOT NULL THEN json_build_object(
        'id', vh.id,
        'placa', vh.placa,
        'modelo', vh.modelo,
        'anio', vh.anio,
        'tipo_carroceria', vh.tipo_carroceria,
        'capacidad_carga', vh.capacidad_carga,
        'num_serie', vh.num_serie,
        'marca', vh.marca,
        'estado', vh.estado,
        'config_vehicular', vh.config_vehicular
      )
      ELSE NULL
    END,
    
    -- Remolque (CORREGIDO: num_serie en lugar de numero_serie)
    'remolque', CASE
      WHEN r.id IS NOT NULL THEN json_build_object(
        'id', r.id,
        'placa', r.placa,
        'num_serie', r.num_serie,
        'capacidad_carga_kg', r.capacidad_carga_kg,
        'tipo_remolque', r.tipo_remolque,
        'marca', r.marca,
        'modelo', r.modelo,
        'estado', r.estado
      )
      ELSE NULL
    END,
    
    -- Factura
    'factura', CASE
      WHEN f.id IS NOT NULL THEN json_build_object(
        'id', f.id,
        'serie', f.serie,
        'folio', f.folio,
        'uuid_fiscal', f.uuid_fiscal,
        'status', f.status,
        'fecha_expedicion', f.fecha_expedicion,
        'fecha_timbrado', f.fecha_timbrado,
        'subtotal', f.subtotal,
        'total', f.total,
        'rfc_emisor', f.rfc_emisor,
        'nombre_emisor', f.nombre_emisor,
        'rfc_receptor', f.rfc_receptor,
        'nombre_receptor', f.nombre_receptor
      )
      ELSE NULL
    END,
    
    -- Carta Porte
    'carta_porte', CASE
      WHEN cp.id IS NOT NULL THEN json_build_object(
        'id', cp.id,
        'id_ccp', cp.id_ccp,
        'uuid_fiscal', cp.uuid_fiscal,
        'status', cp.status,
        'fecha_timbrado', cp.fecha_timbrado,
        'xml_generado', cp.xml_generado,
        'version_carta_porte', cp.version_carta_porte,
        'rfc_emisor', cp.rfc_emisor,
        'rfc_receptor', cp.rfc_receptor
      )
      ELSE NULL
    END,
    
    -- Borrador Carta Porte
    'borrador_carta_porte', CASE
      WHEN bcp.id IS NOT NULL THEN json_build_object(
        'id', bcp.id,
        'nombre_borrador', bcp.nombre_borrador,
        'datos_formulario', bcp.datos_formulario,
        'ultima_edicion', bcp.ultima_edicion,
        'version_formulario', bcp.version_formulario
      )
      ELSE NULL
    END
    
  ) INTO v_result
  FROM viajes v
  LEFT JOIN conductores c ON c.id = v.conductor_id AND c.user_id = auth.uid()
  LEFT JOIN vehiculos vh ON vh.id = v.vehiculo_id AND vh.user_id = auth.uid()
  LEFT JOIN remolques r ON r.id = v.remolque_id AND r.user_id = auth.uid()
  LEFT JOIN facturas f ON f.id = v.factura_id AND f.user_id = auth.uid()
  LEFT JOIN cartas_porte cp ON cp.id = v.carta_porte_id AND cp.usuario_id = auth.uid()
  LEFT JOIN borradores_carta_porte bcp ON bcp.id = (v.tracking_data->>'borrador_carta_porte_id')::UUID AND bcp.user_id = auth.uid()
  WHERE v.id = p_viaje_id
    AND v.user_id = auth.uid();
  
  RETURN v_result;
END;
$function$;