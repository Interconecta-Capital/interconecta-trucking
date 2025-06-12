
-- Crear tabla para la relación many-to-many entre vehículos y conductores
CREATE TABLE public.vehiculo_conductores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehiculo_id UUID NOT NULL REFERENCES public.vehiculos(id) ON DELETE CASCADE,
  conductor_id UUID NOT NULL REFERENCES public.conductores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  fecha_asignacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  activo BOOLEAN NOT NULL DEFAULT true,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vehiculo_id, conductor_id)
);

-- Habilitar RLS
ALTER TABLE public.vehiculo_conductores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para vehiculo_conductores
CREATE POLICY "Users can view their own vehiculo_conductores" 
  ON public.vehiculo_conductores 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vehiculo_conductores" 
  ON public.vehiculo_conductores 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehiculo_conductores" 
  ON public.vehiculo_conductores 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehiculo_conductores" 
  ON public.vehiculo_conductores 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_vehiculo_conductores_vehiculo_id ON public.vehiculo_conductores(vehiculo_id);
CREATE INDEX idx_vehiculo_conductores_conductor_id ON public.vehiculo_conductores(conductor_id);
CREATE INDEX idx_vehiculo_conductores_user_id ON public.vehiculo_conductores(user_id);
