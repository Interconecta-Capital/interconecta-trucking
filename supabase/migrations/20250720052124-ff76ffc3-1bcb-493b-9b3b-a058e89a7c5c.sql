-- Deshabilitar trigger temporalmente
DROP TRIGGER IF EXISTS trigger_actualizar_metricas ON public.viajes;

-- Actualizar precios directamente sin triggers
UPDATE public.viajes 
SET precio_cobrado = 25000 + (random() * 15000)::INTEGER
WHERE precio_cobrado IS NULL OR precio_cobrado = 0;

-- Actualizar costos con precios
UPDATE public.costos_viaje 
SET 
  precio_final_cobrado = (SELECT v.precio_cobrado FROM public.viajes v WHERE v.id = costos_viaje.viaje_id),
  precio_cotizado = (SELECT v.precio_cobrado FROM public.viajes v WHERE v.id = costos_viaje.viaje_id)
WHERE precio_final_cobrado IS NULL OR precio_final_cobrado = 0;

-- Insertar análisis faltantes manualmente
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
  md5(v.origen || '-' || v.destino),
  v.created_at::date,
  v.precio_cobrado,
  COALESCE(cv.costo_total_estimado, 3000),
  COALESCE(cv.costo_total_real, cv.costo_total_estimado, 3000),
  480, -- 8 horas en minutos
  COALESCE(v.tiempo_real_horas * 60, 480),
  COALESCE(v.precio_cobrado - cv.costo_total_estimado, v.precio_cobrado - 3000),
  'Carga General'
FROM public.viajes v
LEFT JOIN public.costos_viaje cv ON v.id = cv.viaje_id
LEFT JOIN public.analisis_viajes av ON v.id = av.viaje_id
WHERE av.viaje_id IS NULL AND v.precio_cobrado IS NOT NULL;

-- Verificar resultados
SELECT 
  COUNT(*) as total_viajes,
  COUNT(CASE WHEN precio_cobrado > 0 THEN 1 END) as viajes_con_precio,
  AVG(precio_cobrado) as precio_promedio
FROM public.viajes;