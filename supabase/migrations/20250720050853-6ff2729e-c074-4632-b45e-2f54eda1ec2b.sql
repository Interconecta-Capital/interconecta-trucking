-- Ejecutar función para poblar datos mejorados
SELECT public.poblar_datos_viajes_existentes_mejorado();

-- Verificar el estado de los datos después
SELECT 
  COUNT(*) as total_viajes,
  COUNT(CASE WHEN precio_cobrado IS NOT NULL AND precio_cobrado > 0 THEN 1 END) as viajes_con_precio,
  AVG(precio_cobrado) as precio_promedio
FROM public.viajes;

-- Verificar costos
SELECT 
  COUNT(*) as total_costos,
  COUNT(CASE WHEN precio_final_cobrado IS NOT NULL AND precio_final_cobrado > 0 THEN 1 END) as costos_con_precio
FROM public.costos_viaje;

-- Verificar análisis  
SELECT COUNT(*) as total_analisis FROM public.analisis_viajes;