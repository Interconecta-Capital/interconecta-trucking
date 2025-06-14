-- Crear tabla rutas_frecuentes para almacenar rutas comunes de los usuarios
CREATE TABLE IF NOT EXISTS public.rutas_frecuentes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nombre_ruta TEXT NOT NULL,
  origen JSONB NOT NULL,
  destino JSONB NOT NULL,
  paradas JSONB,
  uso_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en rutas_frecuentes
ALTER TABLE public.rutas_frecuentes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para rutas_frecuentes
DROP POLICY IF EXISTS "Users can manage their own rutas" ON public.rutas_frecuentes;
CREATE POLICY "Users can manage their own rutas" ON public.rutas_frecuentes
  FOR ALL USING (auth.uid() = user_id);
