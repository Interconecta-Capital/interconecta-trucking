-- Corregir función de población de datos y agregar datos faltantes a viajes existentes
CREATE OR REPLACE FUNCTION public.poblar_datos_viajes_existentes_mejorado()
RETURNS TEXT AS $$
DECLARE
  viaje_record RECORD;
  costos_count INTEGER := 0;
  analisis_count INTEGER := 0;
  result_text TEXT := '';
  combustible_est NUMERIC;
  peajes_est NUMERIC;
  salario_est NUMERIC;
  mantenimiento_est NUMERIC;
BEGIN
  -- Primero, actualizar viajes existentes con datos faltantes
  UPDATE public.viajes 
  SET 
    distancia_km = CASE WHEN distancia_km IS NULL THEN 
      CASE 
        WHEN lower(origen) LIKE '%cdmx%' AND lower(destino) LIKE '%guadalajara%' THEN 540
        WHEN lower(origen) LIKE '%mexico%' AND lower(destino) LIKE '%monterrey%' THEN 920
        WHEN lower(origen) LIKE '%guadalajara%' AND lower(destino) LIKE '%tijuana%' THEN 2100
        ELSE 300 + (random() * 500)::INTEGER
      END
      ELSE distancia_km 
    END,
    tiempo_estimado_horas = CASE WHEN tiempo_estimado_horas IS NULL THEN 
      CASE 
        WHEN distancia_km > 1000 THEN 14 + (random() * 4)::INTEGER
        WHEN distancia_km > 500 THEN 8 + (random() * 4)::INTEGER
        ELSE 4 + (random() * 4)::INTEGER
      END
      ELSE tiempo_estimado_horas 
    END,
    precio_cobrado = CASE WHEN precio_cobrado IS NULL THEN 
      15000 + (random() * 20000)::INTEGER
      ELSE precio_cobrado 
    END
  WHERE distancia_km IS NULL OR tiempo_estimado_horas IS NULL OR precio_cobrado IS NULL;

  -- Procesar cada viaje existente que no tenga costos
  FOR viaje_record IN 
    SELECT v.* FROM public.viajes v 
    LEFT JOIN public.costos_viaje cv ON v.id = cv.viaje_id 
    WHERE cv.viaje_id IS NULL
  LOOP
    -- Calcular costos estimados
    combustible_est := COALESCE(viaje_record.distancia_km * 2.5, 1000);
    peajes_est := COALESCE(viaje_record.distancia_km * 0.8, 400);
    salario_est := COALESCE(viaje_record.tiempo_estimado_horas * 150, 1200);
    mantenimiento_est := COALESCE(viaje_record.distancia_km * 0.3, 200);

    -- Insertar costos directamente
    INSERT INTO public.costos_viaje (
      viaje_id,
      user_id,
      combustible_estimado,
      peajes_estimados,
      casetas_estimadas,
      salario_conductor_estimado,
      mantenimiento_estimado,
      costo_total_estimado,
      margen_estimado,
      precio_cotizado
    ) VALUES (
      viaje_record.id,
      viaje_record.user_id,
      combustible_est,
      peajes_est,
      peajes_est * 0.5,
      salario_est,
      mantenimiento_est,
      combustible_est + peajes_est + (peajes_est * 0.5) + salario_est + mantenimiento_est,
      COALESCE(viaje_record.precio_cobrado, 15000) - (combustible_est + peajes_est + (peajes_est * 0.5) + salario_est + mantenimiento_est),
      COALESCE(viaje_record.precio_cobrado, 15000)
    );
    
    costos_count := costos_count + 1;
    result_text := result_text || 'Creados costos para viaje: ' || viaje_record.id || E'\n';
  END LOOP;
  
  -- Procesar viajes completados sin análisis
  FOR viaje_record IN 
    SELECT v.* FROM public.viajes v 
    LEFT JOIN public.analisis_viajes av ON v.id = av.viaje_id 
    WHERE av.viaje_id IS NULL AND v.estado = 'completado'
  LOOP
    -- Insertar análisis directamente
    INSERT INTO public.analisis_viajes (
      viaje_id,
      user_id,
      ruta_hash,
      fecha_viaje,
      precio_cobrado,
      costo_estimado,
      costo_real,
      tiempo_estimado,
      tiempo_real,
      margen_real,
      vehiculo_tipo
    ) VALUES (
      viaje_record.id,
      viaje_record.user_id,
      public.generar_hash_ruta(viaje_record.origen, viaje_record.destino),
      COALESCE(viaje_record.fecha_inicio_real::date, viaje_record.fecha_inicio_programada::date),
      COALESCE(viaje_record.precio_cobrado, 15000),
      (SELECT COALESCE(costo_total_estimado, 8000) FROM public.costos_viaje WHERE viaje_id = viaje_record.id),
      (SELECT COALESCE(costo_total_real, costo_total_estimado, 8000) FROM public.costos_viaje WHERE viaje_id = viaje_record.id),
      COALESCE(viaje_record.tiempo_estimado_horas * 60, 480),
      COALESCE(viaje_record.tiempo_real_horas * 60, viaje_record.tiempo_estimado_horas * 60, 480),
      COALESCE(viaje_record.precio_cobrado, 15000) - (SELECT COALESCE(costo_total_real, costo_total_estimado, 8000) FROM public.costos_viaje WHERE viaje_id = viaje_record.id),
      'Tractocamión'
    );
    
    analisis_count := analisis_count + 1;
    result_text := result_text || 'Creado análisis para viaje: ' || viaje_record.id || E'\n';
  END LOOP;
  
  result_text := result_text || 'Total costos creados: ' || costos_count || E'\n';
  result_text := result_text || 'Total análisis creados: ' || analisis_count || E'\n';
  
  RETURN result_text;
END;
$$ LANGUAGE plpgsql;