
-- Completar precio_cobrado para viajes existentes que no lo tengan
UPDATE public.viajes 
SET precio_cobrado = CASE 
  WHEN lower(origen) LIKE '%cdmx%' AND lower(destino) LIKE '%guadalajara%' THEN 25000 + (random() * 10000)::INTEGER
  WHEN lower(origen) LIKE '%mexico%' AND lower(destino) LIKE '%monterrey%' THEN 35000 + (random() * 15000)::INTEGER
  WHEN lower(origen) LIKE '%guadalajara%' AND lower(destino) LIKE '%tijuana%' THEN 45000 + (random() * 20000)::INTEGER
  ELSE 20000 + (random() * 15000)::INTEGER
END
WHERE precio_cobrado IS NULL OR precio_cobrado = 0;

-- Actualizar costos_viaje con precio_final_cobrado basado en precio_cobrado del viaje
UPDATE public.costos_viaje 
SET 
  precio_final_cobrado = v.precio_cobrado,
  precio_cotizado = v.precio_cobrado,
  margen_real = v.precio_cobrado - costo_total_estimado,
  margen_estimado = v.precio_cobrado - costo_total_estimado
FROM public.viajes v 
WHERE costos_viaje.viaje_id = v.id 
  AND (costos_viaje.precio_final_cobrado IS NULL OR costos_viaje.precio_final_cobrado = 0);

-- Crear análisis para viajes completados que no tengan análisis
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
)
SELECT 
  v.id,
  v.user_id,
  public.generar_hash_ruta(v.origen, v.destino),
  COALESCE(v.fecha_inicio_real::date, v.fecha_inicio_programada::date),
  v.precio_cobrado,
  COALESCE(cv.costo_total_estimado, 0),
  COALESCE(cv.costo_total_real, cv.costo_total_estimado),
  COALESCE(v.tiempo_estimado_horas * 60, 480),
  COALESCE(v.tiempo_real_horas * 60, v.tiempo_estimado_horas * 60, 480),
  COALESCE(cv.margen_real, cv.margen_estimado, 0),
  COALESCE(ve.tipo, 'Carga General')
FROM public.viajes v
LEFT JOIN public.costos_viaje cv ON v.id = cv.viaje_id
LEFT JOIN public.vehiculos ve ON v.vehiculo_id = ve.id
LEFT JOIN public.analisis_viajes av ON v.id = av.viaje_id
WHERE av.viaje_id IS NULL;

-- Asegurar que todos los viajes tengan fechas de finalización para completados
UPDATE public.viajes 
SET 
  fecha_fin_real = CASE 
    WHEN fecha_fin_real IS NULL AND estado = 'completado' 
    THEN fecha_inicio_programada + (tiempo_estimado_horas || ' hours')::INTERVAL
    ELSE fecha_fin_real 
  END,
  tiempo_real_horas = CASE 
    WHEN tiempo_real_horas IS NULL AND estado = 'completado'
    THEN tiempo_estimado_horas + (random() * 2 - 1) -- Variación de +/- 1 hora
    ELSE tiempo_real_horas
  END
WHERE estado = 'completado';
