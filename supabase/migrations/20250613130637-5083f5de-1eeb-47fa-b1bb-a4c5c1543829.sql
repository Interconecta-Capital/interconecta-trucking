
-- Fix postal code field inconsistencies across all tables
-- Update ubicaciones table to standardize postal code field name
ALTER TABLE public.ubicaciones 
ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(5);

-- Update existing data if domicilio contains codigoPostal
UPDATE public.ubicaciones 
SET codigo_postal = domicilio->>'codigoPostal'
WHERE domicilio->>'codigoPostal' IS NOT NULL AND codigo_postal IS NULL;

-- Update ubicaciones_frecuentes table
ALTER TABLE public.ubicaciones_frecuentes
ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(5);

UPDATE public.ubicaciones_frecuentes
SET codigo_postal = domicilio->>'codigoPostal'
WHERE domicilio->>'codigoPostal' IS NOT NULL AND codigo_postal IS NULL;

-- Add index for better performance on postal code lookups
CREATE INDEX IF NOT EXISTS idx_ubicaciones_codigo_postal ON public.ubicaciones(codigo_postal);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_frecuentes_codigo_postal ON public.ubicaciones_frecuentes(codigo_postal);

-- Create optimized RLS policies to prevent recursion and reduce 500 errors
DROP POLICY IF EXISTS "Users can access own vehiculos" ON public.vehiculos;
CREATE POLICY "vehiculos_user_access" ON public.vehiculos
FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can access own conductores" ON public.conductores;  
CREATE POLICY "conductores_user_access" ON public.conductores
FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can access own socios" ON public.socios;
CREATE POLICY "socios_user_access" ON public.socios  
FOR ALL USING (auth.uid() = user_id);

-- Add simple policies for carta porte related tables to prevent 500s
ALTER TABLE public.cartas_porte ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cartas_porte_user_access" ON public.cartas_porte;
CREATE POLICY "cartas_porte_user_access" ON public.cartas_porte
FOR ALL USING (auth.uid() = usuario_id);

ALTER TABLE public.ubicaciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ubicaciones_carta_porte_access" ON public.ubicaciones;
CREATE POLICY "ubicaciones_carta_porte_access" ON public.ubicaciones
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.cartas_porte cp 
    WHERE cp.id = ubicaciones.carta_porte_id 
    AND cp.usuario_id = auth.uid()
  )
);

ALTER TABLE public.mercancias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mercancias_carta_porte_access" ON public.mercancias;
CREATE POLICY "mercancias_carta_porte_access" ON public.mercancias
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.cartas_porte cp 
    WHERE cp.id = mercancias.carta_porte_id 
    AND cp.usuario_id = auth.uid()
  )
);

-- Clean up old rate limiting logs to improve performance
DELETE FROM public.rate_limit_log WHERE created_at < now() - interval '1 hour';
