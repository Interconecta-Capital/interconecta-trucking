
-- Actualizar precio_cobrado para los 7 viajes que no lo tienen
UPDATE public.viajes 
SET precio_cobrado = CASE 
  WHEN distancia_km IS NOT NULL AND distancia_km > 0 THEN 
    -- Precio base de $15 por km + factor aleatorio
    ROUND((distancia_km * 15) + (RANDOM() * 5000) + 10000)
  ELSE 
    -- Precio por defecto si no hay distancia
    ROUND(25000 + (RANDOM() * 15000))
END
WHERE precio_cobrado IS NULL OR precio_cobrado = 0;

-- Actualizar costos_viaje con el precio final cobrado
UPDATE public.costos_viaje 
SET 
  precio_final_cobrado = (
    SELECT v.precio_cobrado 
    FROM public.viajes v 
    WHERE v.id = costos_viaje.viaje_id
  ),
  precio_cotizado = (
    SELECT v.precio_cobrado 
    FROM public.viajes v 
    WHERE v.id = costos_viaje.viaje_id
  ),
  margen_real = (
    SELECT v.precio_cobrado - COALESCE(costos_viaje.costo_total_estimado, 0)
    FROM public.viajes v 
    WHERE v.id = costos_viaje.viaje_id
  )
WHERE precio_final_cobrado IS NULL OR precio_final_cobrado = 0;

-- Crear registros de análisis para viajes que no los tienen
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
  public.generar_hash_ruta(
    COALESCE(v.origen, 'Origen Desconocido'), 
    COALESCE(v.destino, 'Destino Desconocido')
  ),
  COALESCE(v.fecha_inicio_real::date, v.fecha_inicio_programada::date, v.created_at::date),
  v.precio_cobrado,
  COALESCE(cv.costo_total_estimado, 3000),
  COALESCE(cv.costo_total_real, cv.costo_total_estimado, 3000),
  COALESCE(v.tiempo_estimado_horas * 60, 480), -- Convertir a minutos
  COALESCE(v.tiempo_real_horas * 60, v.tiempo_estimado_horas * 60, 480),
  COALESCE(cv.margen_real, v.precio_cobrado - COALESCE(cv.costo_total_estimado, 3000)),
  COALESCE(veh.tipo, 'Carga General')
FROM public.viajes v
LEFT JOIN public.costos_viaje cv ON v.id = cv.viaje_id
LEFT JOIN public.vehiculos veh ON v.vehiculo_id = veh.id
LEFT JOIN public.analisis_viajes av ON v.id = av.viaje_id
WHERE av.viaje_id IS NULL
  AND v.precio_cobrado IS NOT NULL;

-- Verificar resultados
SELECT 
  (SELECT COUNT(*) FROM public.viajes WHERE precio_cobrado IS NOT NULL AND precio_cobrado > 0) as viajes_con_precio,
  (SELECT COUNT(*) FROM public.costos_viaje WHERE precio_final_cobrado IS NOT NULL AND precio_final_cobrado > 0) as costos_con_precio,
  (SELECT COUNT(*) FROM public.analisis_viajes) as total_analisis,
  (SELECT COUNT(*) FROM public.viajes) as total_viajes;
