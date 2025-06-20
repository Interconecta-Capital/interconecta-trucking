
-- Agregar las columnas faltantes a la tabla vehiculos
ALTER TABLE public.vehiculos 
ADD COLUMN IF NOT EXISTS numero_ejes integer;

ALTER TABLE public.vehiculos 
ADD COLUMN IF NOT EXISTS numero_llantas integer;

-- Agregar columnas que podrían estar faltando también
ALTER TABLE public.vehiculos 
ADD COLUMN IF NOT EXISTS asegura_resp_civil character varying;

ALTER TABLE public.vehiculos 
ADD COLUMN IF NOT EXISTS poliza_resp_civil character varying;

ALTER TABLE public.vehiculos 
ADD COLUMN IF NOT EXISTS asegura_med_ambiente character varying;

ALTER TABLE public.vehiculos 
ADD COLUMN IF NOT EXISTS poliza_med_ambiente character varying;
