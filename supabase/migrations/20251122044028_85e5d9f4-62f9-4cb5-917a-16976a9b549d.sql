-- ============================================
-- FASE 1: CORREGIR FUNCIÓN RPC get_viaje_con_relaciones
-- ============================================

-- Eliminar función existente si existe
DROP FUNCTION IF EXISTS public.get_viaje_con_relaciones(uuid);

-- Crear función corregida con columnas correctas para remolques y agregando mercancías
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
      'fecha_inicio_real', v.fecha_inicio_real,
      'fecha_fin_real', v.fecha_fin_real,
      'distancia_km', v.distancia_km,
      'tiempo_estimado_horas', v.tiempo_estimado_horas,
      'tracking_data', v.tracking_data,
      'carta_porte_id', v.carta_porte_id,
      'factura_id', v.factura_id,
      'observaciones', v.observaciones,
      'precio_cobrado', v.precio_cobrado,
      'costo_estimado', v.costo_estimado,
      'margen_estimado', v.margen_estimado
    ),
    
    'conductor', CASE 
      WHEN c.id IS NOT NULL THEN json_build_object(
        'id', c.id,
        'nombre', c.nombre,
        'telefono', c.telefono,
        'email', c.email,
        'num_licencia', c.num_licencia,
        'tipo_licencia', c.tipo_licencia,
        'rfc', c.rfc
      ) ELSE NULL END,
    
    'vehiculo', CASE
      WHEN vh.id IS NOT NULL THEN json_build_object(
        'id', vh.id,
        'placa', vh.placa,
        'marca', vh.marca,
        'modelo', vh.modelo,
        'anio', vh.anio,
        'num_serie', vh.num_serie,
        'capacidad_carga', vh.capacidad_carga,
        'tipo_vehiculo', vh.tipo_vehiculo,
        'estado', vh.estado
      ) ELSE NULL END,
    
    -- ✅ CORREGIDO: Usar columnas correctas de remolques (placa, capacidad_carga, tipo_remolque)
    'remolque', CASE
      WHEN r.id IS NOT NULL THEN json_build_object(
        'id', r.id,
        'placa', r.placa,
        'tipo_remolque', r.tipo_remolque,
        'capacidad_carga', r.capacidad_carga,
        'estado', r.estado
      ) ELSE NULL END,
    
    'factura', CASE
      WHEN f.id IS NOT NULL THEN json_build_object(
        'id', f.id,
        'serie', f.serie,
        'folio', f.folio,
        'uuid_fiscal', f.uuid_fiscal,
        'status', f.status,
        'total', f.total,
        'subtotal', f.subtotal,
        'fecha_expedicion', f.fecha_expedicion
      ) ELSE NULL END,
    
    'carta_porte', CASE
      WHEN cp.id IS NOT NULL THEN json_build_object(
        'id', cp.id,
        'uuid_fiscal', cp.uuid_fiscal,
        'status', cp.status,
        'folio', cp.folio,
        'fecha_timbrado', cp.fecha_timbrado
      ) ELSE NULL END,
    
    -- ✅ NUEVO: Agregar mercancías de la carta porte
    'mercancias', COALESCE(
      (SELECT json_agg(json_build_object(
        'id', m.id,
        'descripcion', m.descripcion,
        'bienes_transp', m.bienes_transp,
        'cantidad', m.cantidad,
        'clave_unidad', m.clave_unidad,
        'unidad', m.unidad,
        'peso_kg', m.peso_kg,
        'valor_mercancia', m.valor_mercancia,
        'material_peligroso', m.material_peligroso,
        'moneda', m.moneda,
        'embalaje', m.embalaje,
        'fraccion_arancelaria', m.fraccion_arancelaria
      ))
      FROM mercancias m
      WHERE m.carta_porte_id = v.carta_porte_id),
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

-- Agregar comentario
COMMENT ON FUNCTION public.get_viaje_con_relaciones(uuid) IS 'Obtiene un viaje completo con todas sus relaciones: conductor, vehículo, remolque, factura, carta porte y mercancías';