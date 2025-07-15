-- Corrección manual de estados desincronizados

-- Actualizar vehículo con el viaje correcto (en_transito)
UPDATE public.vehiculos 
SET 
  estado = 'en_viaje',
  viaje_actual_id = '8961c9a4-0f59-4099-9202-ae335cc7ae11',
  fecha_proxima_disponibilidad = '2025-07-17 21:14:00+00'
WHERE id = '7a4da547-db9f-4c04-96eb-4dcf9b2a1fc1';

-- Actualizar conductor con el viaje correcto (en_transito) 
UPDATE public.conductores 
SET 
  estado = 'en_viaje',
  viaje_actual_id = '8961c9a4-0f59-4099-9202-ae335cc7ae11',
  fecha_proxima_disponibilidad = '2025-07-17 21:14:00+00'
WHERE id = 'b1ad8df2-f2a0-458a-9a8f-1a695dcc9529';