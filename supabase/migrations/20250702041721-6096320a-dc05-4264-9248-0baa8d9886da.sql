
-- Create table for trip analysis and AI predictions
CREATE TABLE public.analisis_viajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viaje_id UUID REFERENCES viajes(id) ON DELETE CASCADE,
  ruta_hash VARCHAR(64) NOT NULL, -- hash de origen+destino
  costo_estimado DECIMAL(10,2),
  costo_real DECIMAL(10,2),
  precio_cobrado DECIMAL(10,2),
  margen_real DECIMAL(5,2),
  tiempo_estimado INTEGER, -- minutos
  tiempo_real INTEGER,
  fecha_viaje DATE NOT NULL,
  vehiculo_tipo VARCHAR(20),
  cliente_id UUID,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.analisis_viajes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own trip analysis"
  ON public.analisis_viajes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trip analysis"
  ON public.analisis_viajes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trip analysis"
  ON public.analisis_viajes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trip analysis"
  ON public.analisis_viajes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_analisis_viajes_user_id ON public.analisis_viajes(user_id);
CREATE INDEX idx_analisis_viajes_ruta_hash ON public.analisis_viajes(ruta_hash);
CREATE INDEX idx_analisis_viajes_fecha ON public.analisis_viajes(fecha_viaje);
CREATE INDEX idx_analisis_viajes_cliente ON public.analisis_viajes(cliente_id);

-- Create function to generate route hash
CREATE OR REPLACE FUNCTION public.generar_hash_ruta(origen TEXT, destino TEXT)
RETURNS VARCHAR(64)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN encode(sha256((lower(trim(origen)) || '|' || lower(trim(destino)))::bytea), 'hex');
END;
$$;

-- Create function to analyze route precision
CREATE OR REPLACE FUNCTION public.calcular_precision_ruta(p_user_id UUID, p_ruta_hash VARCHAR(64))
RETURNS TABLE(
  exactitud_costo NUMERIC,
  exactitud_tiempo NUMERIC,
  factor_correccion_costo NUMERIC,
  factor_correccion_tiempo NUMERIC,
  total_viajes INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(
      100 - (AVG(ABS(a.costo_real - a.costo_estimado) / NULLIF(a.costo_estimado, 0)) * 100), 
      0
    )::NUMERIC as exactitud_costo,
    COALESCE(
      100 - (AVG(ABS(a.tiempo_real - a.tiempo_estimado) / NULLIF(a.tiempo_estimado, 0)) * 100), 
      0
    )::NUMERIC as exactitud_tiempo,
    COALESCE(AVG(a.costo_real / NULLIF(a.costo_estimado, 0)), 1)::NUMERIC as factor_correccion_costo,
    COALESCE(AVG(a.tiempo_real / NULLIF(a.tiempo_estimado, 0)), 1)::NUMERIC as factor_correccion_tiempo,
    COUNT(*)::INTEGER as total_viajes
  FROM public.analisis_viajes a
  WHERE a.user_id = p_user_id 
    AND a.ruta_hash = p_ruta_hash
    AND a.costo_real IS NOT NULL 
    AND a.costo_estimado IS NOT NULL
    AND a.tiempo_real IS NOT NULL 
    AND a.tiempo_estimado IS NOT NULL
    AND a.fecha_viaje >= CURRENT_DATE - INTERVAL '6 months';
END;
$$;

-- Create function to get market analysis
CREATE OR REPLACE FUNCTION public.analizar_mercado_ruta(p_user_id UUID, p_ruta_hash VARCHAR(64))
RETURNS TABLE(
  precio_promedio NUMERIC,
  precio_minimo NUMERIC,
  precio_maximo NUMERIC,
  margen_promedio NUMERIC,
  total_cotizaciones INTEGER,
  tendencia TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  precio_mes_actual NUMERIC;
  precio_mes_anterior NUMERIC;
BEGIN
  -- Get current month average
  SELECT AVG(precio_cobrado) INTO precio_mes_actual
  FROM public.analisis_viajes
  WHERE user_id = p_user_id 
    AND ruta_hash = p_ruta_hash
    AND fecha_viaje >= DATE_TRUNC('month', CURRENT_DATE);
    
  -- Get previous month average
  SELECT AVG(precio_cobrado) INTO precio_mes_anterior
  FROM public.analisis_viajes
  WHERE user_id = p_user_id 
    AND ruta_hash = p_ruta_hash
    AND fecha_viaje >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
    AND fecha_viaje < DATE_TRUNC('month', CURRENT_DATE);

  RETURN QUERY
  SELECT 
    COALESCE(AVG(a.precio_cobrado), 0)::NUMERIC as precio_promedio,
    COALESCE(MIN(a.precio_cobrado), 0)::NUMERIC as precio_minimo,
    COALESCE(MAX(a.precio_cobrado), 0)::NUMERIC as precio_maximo,
    COALESCE(AVG(a.margen_real), 0)::NUMERIC as margen_promedio,
    COUNT(*)::INTEGER as total_cotizaciones,
    CASE 
      WHEN precio_mes_actual > precio_mes_anterior * 1.05 THEN 'subida'
      WHEN precio_mes_actual < precio_mes_anterior * 0.95 THEN 'bajada'
      ELSE 'estable'
    END::TEXT as tendencia
  FROM public.analisis_viajes a
  WHERE a.user_id = p_user_id 
    AND a.ruta_hash = p_ruta_hash
    AND a.precio_cobrado IS NOT NULL
    AND a.fecha_viaje >= CURRENT_DATE - INTERVAL '6 months';
END;
$$;
