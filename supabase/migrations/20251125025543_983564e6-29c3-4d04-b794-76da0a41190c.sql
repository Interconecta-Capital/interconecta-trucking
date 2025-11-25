-- ========================================
-- CORRECCIÓN: Search Path Mutable
-- ========================================

-- Recrear función con search_path seguro
CREATE OR REPLACE FUNCTION normalizar_ubicaciones_tracking()
RETURNS TABLE(
  viaje_id uuid,
  estado_anterior text,
  estado_nuevo text,
  normalizado boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_viaje RECORD;
  v_tracking jsonb;
  v_ubicaciones jsonb;
  v_origen jsonb;
  v_destino jsonb;
  v_count integer := 0;
BEGIN
  RAISE NOTICE '🔧 Iniciando normalización de tracking_data.ubicaciones...';
  
  FOR v_viaje IN 
    SELECT id, tracking_data 
    FROM viajes 
    WHERE tracking_data IS NOT NULL 
      AND tracking_data ? 'ubicaciones'
  LOOP
    v_tracking := v_viaje.tracking_data;
    
    -- Verificar si ubicaciones es objeto en lugar de array
    IF jsonb_typeof(v_tracking->'ubicaciones') = 'object' 
       AND v_tracking->'ubicaciones' ? 'origen' 
       AND v_tracking->'ubicaciones' ? 'destino' THEN
      
      v_origen := v_tracking->'ubicaciones'->'origen';
      v_destino := v_tracking->'ubicaciones'->'destino';
      
      -- Asegurar que origen y destino tengan tipo_ubicacion
      IF NOT (v_origen ? 'tipo_ubicacion') THEN
        v_origen := jsonb_set(v_origen, '{tipo_ubicacion}', '"Origen"'::jsonb);
      END IF;
      
      IF NOT (v_destino ? 'tipo_ubicacion') THEN
        v_destino := jsonb_set(v_destino, '{tipo_ubicacion}', '"Destino"'::jsonb);
      END IF;
      
      -- Convertir a array
      v_ubicaciones := jsonb_build_array(v_origen, v_destino);
      
      -- Actualizar en la base de datos
      UPDATE viajes 
      SET tracking_data = jsonb_set(
        tracking_data, 
        '{ubicaciones}', 
        v_ubicaciones
      ),
      updated_at = now()
      WHERE id = v_viaje.id;
      
      v_count := v_count + 1;
      
      RAISE NOTICE '✅ Normalizado viaje %: % → %', 
        v_viaje.id, 
        'objeto {origen, destino}',
        'array [origen, destino]';
      
      -- Retornar resultado para este viaje
      viaje_id := v_viaje.id;
      estado_anterior := 'objeto';
      estado_nuevo := 'array';
      normalizado := true;
      RETURN NEXT;
      
    ELSE
      -- Ya está en formato array, reportar
      viaje_id := v_viaje.id;
      estado_anterior := 'array';
      estado_nuevo := 'array';
      normalizado := false;
      RETURN NEXT;
    END IF;
  END LOOP;
  
  RAISE NOTICE '🎉 Normalización completada: % viajes actualizados', v_count;
  
  RETURN;
END;
$$;

COMMENT ON FUNCTION normalizar_ubicaciones_tracking() IS 
'Normaliza tracking_data.ubicaciones de formato objeto {origen, destino} a array [origen, destino]. SECURITY DEFINER con search_path fijo para prevenir ataques de inyección.';
