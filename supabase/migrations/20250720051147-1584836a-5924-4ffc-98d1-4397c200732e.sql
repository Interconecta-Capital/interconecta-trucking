-- Actualización más simple sin triggers problemáticos
UPDATE public.viajes 
SET precio_cobrado = 25000 + (random() * 15000)::INTEGER
WHERE precio_cobrado IS NULL OR precio_cobrado = 0;

-- Actualizar costos con precios
UPDATE public.costos_viaje 
SET 
  precio_final_cobrado = (SELECT v.precio_cobrado FROM public.viajes v WHERE v.id = costos_viaje.viaje_id),
  precio_cotizado = (SELECT v.precio_cobrado FROM public.viajes v WHERE v.id = costos_viaje.viaje_id)
WHERE precio_final_cobrado IS NULL OR precio_final_cobrado = 0;