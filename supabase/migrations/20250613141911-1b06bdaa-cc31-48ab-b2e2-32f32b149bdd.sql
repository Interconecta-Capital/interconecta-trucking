
-- Fix infinite recursion in RLS policies for usuarios table
-- Create security definer functions to avoid recursion

-- Function to get current user's tenant_id safely
CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
RETURNS UUID AS $$
BEGIN
  -- Get tenant_id from profiles table instead of usuarios to avoid recursion
  RETURN (
    SELECT p.empresa 
    FROM public.profiles p 
    WHERE p.id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin role from profiles or other safe source
  RETURN (
    SELECT CASE 
      WHEN p.plan_type = 'enterprise' THEN true
      ELSE false
    END
    FROM public.profiles p 
    WHERE p.id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing problematic policies on usuarios table
DROP POLICY IF EXISTS "Users can view own data" ON public.usuarios;
DROP POLICY IF EXISTS "Users can update own data" ON public.usuarios;
DROP POLICY IF EXISTS "Users can insert own data" ON public.usuarios;

-- Create new safe policies using security definer functions
CREATE POLICY "Users can view own tenant data" 
  ON public.usuarios 
  FOR SELECT 
  USING (tenant_id = public.get_current_user_tenant_id() OR public.is_current_user_admin());

CREATE POLICY "Users can insert own tenant data" 
  ON public.usuarios 
  FOR INSERT 
  WITH CHECK (tenant_id = public.get_current_user_tenant_id());

CREATE POLICY "Users can update own tenant data" 
  ON public.usuarios 
  FOR UPDATE 
  USING (tenant_id = public.get_current_user_tenant_id());

-- Additional security enhancements
-- Ensure profiles table has proper RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing profile policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create secure profile policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Secure other critical tables
-- Ensure cartas_porte has proper tenant isolation
DROP POLICY IF EXISTS "Users can view own tenant cartas_porte" ON public.cartas_porte;
CREATE POLICY "Users can view own tenant cartas_porte" 
  ON public.cartas_porte 
  FOR SELECT 
  USING (tenant_id = public.get_current_user_tenant_id() OR public.is_current_user_admin());

-- Ensure conductores has proper user isolation
ALTER TABLE public.conductores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own conductores" ON public.conductores;
CREATE POLICY "Users can view own conductores" 
  ON public.conductores 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Ensure vehiculos has proper user isolation
ALTER TABLE public.vehiculos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own vehiculos" ON public.vehiculos;
CREATE POLICY "Users can view own vehiculos" 
  ON public.vehiculos 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Ensure socios has proper user isolation
ALTER TABLE public.socios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own socios" ON public.socios;
CREATE POLICY "Users can view own socios" 
  ON public.socios 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Secure sensitive audit tables
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view security logs" ON public.security_audit_log;
CREATE POLICY "Admins can view security logs" 
  ON public.security_audit_log 
  FOR SELECT 
  USING (public.is_current_user_admin());

-- Secure rate limiting table
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view rate limit logs" ON public.rate_limit_log;
CREATE POLICY "Admins can view rate limit logs" 
  ON public.rate_limit_log 
  FOR SELECT 
  USING (public.is_current_user_admin());

-- Function to safely check superuser status
CREATE OR REPLACE FUNCTION public.is_superuser_safe()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(u.rol_especial = 'superuser', false)
    FROM public.usuarios u 
    WHERE u.auth_user_id = auth.uid()
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update suscripciones with proper isolation
ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.suscripciones;
CREATE POLICY "Users can view own subscription" 
  ON public.suscripciones 
  FOR SELECT 
  USING (auth.uid() = user_id OR public.is_current_user_admin());

-- Secure bloqueos_usuario table
ALTER TABLE public.bloqueos_usuario ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own blocks" ON public.bloqueos_usuario;
CREATE POLICY "Users can view own blocks" 
  ON public.bloqueos_usuario 
  FOR SELECT 
  USING (auth.uid() = user_id OR public.is_current_user_admin());

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_current_user_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_superuser_safe() TO authenticated;
