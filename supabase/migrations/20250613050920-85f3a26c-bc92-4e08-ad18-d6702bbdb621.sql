
-- Eliminar políticas problemáticas existentes
DROP POLICY IF EXISTS "Users can view own tenant data" ON public.usuarios;
DROP POLICY IF EXISTS "Users can insert own tenant data" ON public.usuarios;
DROP POLICY IF EXISTS "Users can update own tenant data" ON public.usuarios;

-- Eliminar funciones existentes si existen
DROP FUNCTION IF EXISTS public.get_current_user_tenant_id();
DROP FUNCTION IF EXISTS public.is_current_user_admin();

-- Crear función segura para obtener tenant_id del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(user_uuid uuid)
RETURNS UUID AS $$
BEGIN
  -- Obtener tenant_id desde profiles para evitar recursión
  RETURN (
    SELECT COALESCE(p.empresa::uuid, '00000000-0000-0000-0000-000000000000'::uuid)
    FROM public.profiles p 
    WHERE p.id = user_uuid
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN '00000000-0000-0000-0000-000000000000'::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Crear función segura para verificar si usuario es admin/superuser
CREATE OR REPLACE FUNCTION public.is_user_admin(user_uuid uuid)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar desde profiles si es admin o enterprise
  RETURN (
    SELECT COALESCE(p.plan_type = 'enterprise', false)
    FROM public.profiles p 
    WHERE p.id = user_uuid
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Crear función para verificar superusuario
CREATE OR REPLACE FUNCTION public.is_superuser(user_uuid uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(u.rol_especial = 'superuser', false)
    FROM public.usuarios u 
    WHERE u.auth_user_id = user_uuid
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Crear políticas RLS seguras para usuarios
CREATE POLICY "Safe user data access" 
  ON public.usuarios 
  FOR ALL 
  USING (
    auth.uid() = auth_user_id OR 
    public.is_superuser(auth.uid()) OR 
    public.is_user_admin(auth.uid())
  )
  WITH CHECK (
    auth.uid() = auth_user_id OR 
    public.is_superuser(auth.uid()) OR 
    public.is_user_admin(auth.uid())
  );

-- Actualizar políticas para otras tablas críticas
DROP POLICY IF EXISTS "Users can view own data" ON public.conductores;
DROP POLICY IF EXISTS "Users can update own data" ON public.conductores;
DROP POLICY IF EXISTS "Users can insert own data" ON public.conductores;

CREATE POLICY "Safe conductores access" 
  ON public.conductores 
  FOR ALL 
  USING (
    auth.uid() = user_id OR 
    public.is_superuser(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    public.is_superuser(auth.uid())
  );

-- Políticas similares para vehículos
DROP POLICY IF EXISTS "Users can view own data" ON public.vehiculos;
DROP POLICY IF EXISTS "Users can update own data" ON public.vehiculos;
DROP POLICY IF EXISTS "Users can insert own data" ON public.vehiculos;

CREATE POLICY "Safe vehiculos access" 
  ON public.vehiculos 
  FOR ALL 
  USING (
    auth.uid() = user_id OR 
    public.is_superuser(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    public.is_superuser(auth.uid())
  );

-- Políticas para socios
DROP POLICY IF EXISTS "Users can view own data" ON public.socios;
DROP POLICY IF EXISTS "Users can update own data" ON public.socios;
DROP POLICY IF EXISTS "Users can insert own data" ON public.socios;

CREATE POLICY "Safe socios access" 
  ON public.socios 
  FOR ALL 
  USING (
    auth.uid() = user_id OR 
    public.is_superuser(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    public.is_superuser(auth.uid())
  );

-- Crear tabla para gestión de roles si no existe
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role character varying NOT NULL,
  assigned_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

-- RLS para user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superusers can manage all roles" 
  ON public.user_roles 
  FOR ALL 
  USING (public.is_superuser(auth.uid()))
  WITH CHECK (public.is_superuser(auth.uid()));

CREATE POLICY "Users can view own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);
