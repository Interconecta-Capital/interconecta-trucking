
-- Crear tabla de conductores por usuario
CREATE TABLE public.conductores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nombre VARCHAR NOT NULL,
  rfc VARCHAR,
  curp VARCHAR,
  num_licencia VARCHAR,
  tipo_licencia VARCHAR,
  vigencia_licencia DATE,
  telefono VARCHAR,
  email VARCHAR,
  direccion JSONB,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de vehículos por usuario
CREATE TABLE public.vehiculos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  placa VARCHAR NOT NULL,
  marca VARCHAR,
  modelo VARCHAR,
  anio INTEGER,
  num_serie VARCHAR,
  config_vehicular VARCHAR,
  poliza_seguro VARCHAR,
  vigencia_seguro DATE,
  verificacion_vigencia DATE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de socios por usuario
CREATE TABLE public.socios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nombre_razon_social VARCHAR NOT NULL,
  rfc VARCHAR NOT NULL,
  tipo_persona VARCHAR, -- 'fisica' o 'moral'
  email VARCHAR,
  telefono VARCHAR,
  direccion JSONB,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para todas las tablas
ALTER TABLE public.conductores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.socios ENABLE ROW LEVEL SECURITY;

-- Políticas para conductores
CREATE POLICY "Users can view their own conductores" 
  ON public.conductores 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conductores" 
  ON public.conductores 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conductores" 
  ON public.conductores 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conductores" 
  ON public.conductores 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para vehículos
CREATE POLICY "Users can view their own vehiculos" 
  ON public.vehiculos 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vehiculos" 
  ON public.vehiculos 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehiculos" 
  ON public.vehiculos 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehiculos" 
  ON public.vehiculos 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para socios
CREATE POLICY "Users can view their own socios" 
  ON public.socios 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own socios" 
  ON public.socios 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own socios" 
  ON public.socios 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own socios" 
  ON public.socios 
  FOR DELETE 
  USING (auth.uid() = user_id);
