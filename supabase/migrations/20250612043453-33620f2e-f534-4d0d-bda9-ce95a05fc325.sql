
-- Crear tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  empresa VARCHAR,
  rfc VARCHAR,
  telefono VARCHAR,
  avatar_url VARCHAR,
  configuracion_calendario JSONB DEFAULT '{}',
  timezone VARCHAR DEFAULT 'America/Mexico_City',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Crear función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, email, empresa, rfc, telefono)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.email,
    NEW.raw_user_meta_data->>'empresa',
    NEW.raw_user_meta_data->>'rfc',
    NEW.raw_user_meta_data->>'telefono'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para nuevos usuarios
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Crear tabla para eventos del calendario
CREATE TABLE public.eventos_calendario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo VARCHAR NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  tipo_evento VARCHAR NOT NULL DEFAULT 'viaje',
  carta_porte_id UUID REFERENCES public.cartas_porte(id) ON DELETE CASCADE,
  ubicacion_origen VARCHAR,
  ubicacion_destino VARCHAR,
  google_event_id VARCHAR,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en eventos_calendario
ALTER TABLE public.eventos_calendario ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para eventos_calendario
CREATE POLICY "Users can manage own events" ON public.eventos_calendario
  FOR ALL USING (auth.uid() = user_id);

-- Crear tabla para notificaciones
CREATE TABLE public.notificaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo VARCHAR NOT NULL,
  titulo VARCHAR NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  urgente BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en notificaciones
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para notificaciones
CREATE POLICY "Users can manage own notifications" ON public.notificaciones
  FOR ALL USING (auth.uid() = user_id);

-- Actualizar tabla de usuarios existente para incluir relación con auth
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Actualizar políticas RLS existentes para usuarios
DROP POLICY IF EXISTS "Users can manage own data" ON public.usuarios;
CREATE POLICY "Users can manage own data" ON public.usuarios
  FOR ALL USING (auth.uid() = auth_user_id);
