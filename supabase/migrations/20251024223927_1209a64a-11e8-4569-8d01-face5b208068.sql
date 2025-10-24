-- FASE 2: Agregar soporte para validaciones pre-timbrado y logging

-- 1. Agregar columna plan_suscripcion a profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan_suscripcion TEXT DEFAULT 'free' CHECK (plan_suscripcion IN ('free', 'basic', 'pro', 'enterprise'));

-- 2. Crear tabla para logging de timbrados
CREATE TABLE IF NOT EXISTS public.timbrados_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_documento TEXT NOT NULL,
  ambiente TEXT NOT NULL CHECK (ambiente IN ('sandbox', 'production')),
  uuid TEXT,
  exitoso BOOLEAN NOT NULL DEFAULT false,
  error_mensaje TEXT,
  pac TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para mejorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_timbrados_log_user_id ON public.timbrados_log(user_id);
CREATE INDEX IF NOT EXISTS idx_timbrados_log_created_at ON public.timbrados_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timbrados_log_exitoso ON public.timbrados_log(exitoso);

-- Enable RLS
ALTER TABLE public.timbrados_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies para timbrados_log
CREATE POLICY "Users can view own timbrado logs"
  ON public.timbrados_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert timbrado logs"
  ON public.timbrados_log
  FOR INSERT
  WITH CHECK (true);

-- Comentarios
COMMENT ON TABLE public.timbrados_log IS 'Registro de intentos de timbrado (exitosos y fallidos)';
COMMENT ON COLUMN public.profiles.plan_suscripcion IS 'Plan de suscripción del usuario (free, basic, pro, enterprise)';
