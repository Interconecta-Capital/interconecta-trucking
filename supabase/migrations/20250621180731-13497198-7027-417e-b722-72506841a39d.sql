
-- Migración para añadir límite de almacenamiento a planes de suscripción
-- Esta columna permitirá definir límites de GB por plan (NULL = ilimitado)

ALTER TABLE public.planes_suscripcion 
ADD COLUMN limite_almacenamiento_gb INTEGER NULL;

-- Comentario explicativo de la columna
COMMENT ON COLUMN public.planes_suscripcion.limite_almacenamiento_gb 
IS 'Límite de almacenamiento en GB para el plan. NULL = ilimitado';

-- Actualizar planes existentes con valores por defecto según la estrategia de producto
UPDATE public.planes_suscripcion 
SET limite_almacenamiento_gb = CASE 
  WHEN nombre ILIKE '%operador%' OR nombre ILIKE '%básico%' THEN 1
  WHEN nombre ILIKE '%flota%' OR nombre ILIKE '%profesional%' THEN 10
  WHEN nombre ILIKE '%enterprise%' OR nombre ILIKE '%ilimitado%' THEN NULL
  ELSE 5 -- Valor por defecto para otros planes
END;

-- Crear tabla para trackear uso de almacenamiento por usuario
CREATE TABLE IF NOT EXISTS public.usuario_almacenamiento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bytes_utilizados BIGINT NOT NULL DEFAULT 0,
  archivos_count INTEGER NOT NULL DEFAULT 0,
  ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Habilitar RLS en la nueva tabla
ALTER TABLE public.usuario_almacenamiento ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuario_almacenamiento
CREATE POLICY "Users can view own storage usage" 
  ON public.usuario_almacenamiento 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own storage usage" 
  ON public.usuario_almacenamiento 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Función para calcular uso de almacenamiento de un usuario
CREATE OR REPLACE FUNCTION public.get_user_storage_usage(user_uuid UUID)
RETURNS TABLE(
  bytes_utilizados BIGINT,
  gb_utilizados NUMERIC,
  archivos_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ua.bytes_utilizados, 0) as bytes_utilizados,
    ROUND(COALESCE(ua.bytes_utilizados, 0) / 1073741824.0, 2) as gb_utilizados, -- Convertir bytes a GB
    COALESCE(ua.archivos_count, 0) as archivos_count
  FROM public.usuario_almacenamiento ua
  WHERE ua.user_id = user_uuid
  
  UNION ALL
  
  -- Si no existe registro, devolver 0s
  SELECT 0::BIGINT, 0.00::NUMERIC, 0::INTEGER
  WHERE NOT EXISTS (
    SELECT 1 FROM public.usuario_almacenamiento 
    WHERE user_id = user_uuid
  )
  LIMIT 1;
END;
$$;

-- Función para actualizar uso de almacenamiento
CREATE OR REPLACE FUNCTION public.update_user_storage_usage(
  user_uuid UUID, 
  bytes_delta BIGINT, 
  files_delta INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.usuario_almacenamiento (user_id, bytes_utilizados, archivos_count)
  VALUES (user_uuid, GREATEST(0, bytes_delta), GREATEST(0, files_delta))
  ON CONFLICT (user_id)
  DO UPDATE SET
    bytes_utilizados = GREATEST(0, usuario_almacenamiento.bytes_utilizados + bytes_delta),
    archivos_count = GREATEST(0, usuario_almacenamiento.archivos_count + files_delta),
    ultima_actualizacion = NOW();
END;
$$;

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_usuario_almacenamiento_user_id 
  ON public.usuario_almacenamiento(user_id);

CREATE INDEX IF NOT EXISTS idx_planes_suscripcion_almacenamiento 
  ON public.planes_suscripcion(limite_almacenamiento_gb) 
  WHERE limite_almacenamiento_gb IS NOT NULL;
