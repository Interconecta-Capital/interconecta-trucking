
-- Fase 1: Limpiar y simplificar las políticas RLS
-- Eliminar todas las políticas existentes problemáticas y recrear con lógica simple

-- Limpiar políticas de cartas_porte
DROP POLICY IF EXISTS "cartas_porte_user_access" ON public.cartas_porte;
CREATE POLICY "cartas_porte_user_access" ON public.cartas_porte
FOR ALL USING (auth.uid() = usuario_id);

-- Limpiar políticas de vehiculos
DROP POLICY IF EXISTS "Users can access own vehiculos" ON public.vehiculos;
DROP POLICY IF EXISTS "vehiculos_user_access" ON public.vehiculos;
CREATE POLICY "vehiculos_user_access" ON public.vehiculos
FOR ALL USING (auth.uid() = user_id);

-- Limpiar políticas de conductores
DROP POLICY IF EXISTS "Users can access own conductores" ON public.conductores;
DROP POLICY IF EXISTS "conductores_user_access" ON public.conductores;
CREATE POLICY "conductores_user_access" ON public.conductores
FOR ALL USING (auth.uid() = user_id);

-- Limpiar políticas de socios
DROP POLICY IF EXISTS "Users can access own socios" ON public.socios;
DROP POLICY IF EXISTS "socios_user_access" ON public.socios;
CREATE POLICY "socios_user_access" ON public.socios
FOR ALL USING (auth.uid() = user_id);

-- Crear políticas para ubicaciones
DROP POLICY IF EXISTS "ubicaciones_carta_porte_access" ON public.ubicaciones;
CREATE POLICY "ubicaciones_user_access" ON public.ubicaciones
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.cartas_porte cp 
    WHERE cp.id = ubicaciones.carta_porte_id 
    AND cp.usuario_id = auth.uid()
  )
);

-- Crear políticas para mercancias
DROP POLICY IF EXISTS "mercancias_carta_porte_access" ON public.mercancias;
CREATE POLICY "mercancias_user_access" ON public.mercancias
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.cartas_porte cp 
    WHERE cp.id = mercancias.carta_porte_id 
    AND cp.usuario_id = auth.uid()
  )
);

-- Crear políticas para usuarios
DROP POLICY IF EXISTS "Users can access own data only" ON public.usuarios;
CREATE POLICY "usuarios_user_access" ON public.usuarios
FOR ALL USING (auth.uid() = auth_user_id);

-- Crear políticas para profiles
DROP POLICY IF EXISTS "profiles_user_access" ON public.profiles;
CREATE POLICY "profiles_user_access" ON public.profiles
FOR ALL USING (auth.uid() = id);

-- Habilitar RLS en todas las tablas necesarias
ALTER TABLE public.cartas_porte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conductores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.socios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ubicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mercancias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Crear trigger mejorado para handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Crear profile primero
  INSERT INTO public.profiles (id, nombre, email, empresa, rfc, telefono)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.email,
    NEW.raw_user_meta_data->>'empresa',
    NEW.raw_user_meta_data->>'rfc',
    NEW.raw_user_meta_data->>'telefono'
  );
  
  -- Crear entrada en usuarios
  INSERT INTO public.usuarios (
    auth_user_id,
    nombre,
    email,
    tenant_id
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.email,
    NEW.id -- Usar el mismo user_id como tenant_id para simplicidad
  );
  
  RETURN NEW;
END;
$function$;

-- Recrear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
