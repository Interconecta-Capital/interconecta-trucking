-- ================================================================
-- FASE 2: ARQUITECTURA DE ROLES SEGURA (ADAPTADO A ESTRUCTURA EXISTENTE)
-- ================================================================

-- La tabla user_roles ya existe, solo necesitamos las funciones y políticas

-- 1. Función para verificar roles (acepta TEXT)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles
    WHERE user_id = _user_id 
      AND role = _role
  );
END;
$$;

-- 2. Función para verificar admin o superuser
CREATE OR REPLACE FUNCTION public.is_admin_or_superuser(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles
    WHERE user_id = _user_id 
      AND role IN ('admin', 'superuser')
  );
END;
$$;

-- 3. Función optimizada para superuser check
CREATE OR REPLACE FUNCTION public.is_superuser_secure(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles
    WHERE user_id = _user_id 
      AND role = 'superuser'
  );
END;
$$;

-- 4. Migrar datos existentes desde usuarios tabla
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
  auth_user_id,
  CASE 
    WHEN rol_especial = 'superuser' THEN 'superuser'
    WHEN rol = 'admin' THEN 'admin'
    ELSE 'user'
  END,
  COALESCE(created_at, now())
FROM public.usuarios
WHERE auth_user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = usuarios.auth_user_id
  )
ON CONFLICT DO NOTHING;

-- 5. RLS Policies para user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superusers can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superusers can manage roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Superusers can manage all roles"
ON public.user_roles
FOR ALL
USING (public.is_superuser_secure(auth.uid()))
WITH CHECK (public.is_superuser_secure(auth.uid()));

-- 6. Actualizar política de bloqueos_usuario
DROP POLICY IF EXISTS "Admins can manage all blocks" ON public.bloqueos_usuario;

CREATE POLICY "Admins can manage all blocks"
ON public.bloqueos_usuario
FOR ALL
USING (public.is_admin_or_superuser(auth.uid()))
WITH CHECK (public.is_admin_or_superuser(auth.uid()));

-- Comentarios
COMMENT ON FUNCTION public.has_role IS 
'SECURITY DEFINER function to check user role without RLS recursion';

COMMENT ON FUNCTION public.is_superuser_secure IS 
'Secure server-side superuser check - replaces client-side metadata checks';

COMMENT ON FUNCTION public.is_admin_or_superuser IS 
'Check if user has admin or superuser role for elevated permissions';