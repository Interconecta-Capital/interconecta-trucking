
-- Fix infinite recursion in RLS policies for usuarios table
-- First, drop the problematic policy
DROP POLICY IF EXISTS "Users can access own data only" ON public.usuarios;

-- Create improved security definer functions that don't cause recursion
CREATE OR REPLACE FUNCTION public.get_user_tenant_safe_v2(user_uuid uuid)
RETURNS UUID AS $$
BEGIN
  -- Use auth.users directly to avoid recursion
  RETURN (
    SELECT COALESCE(
      (raw_user_meta_data->>'tenant_id')::uuid, 
      user_uuid -- Use user_id as tenant_id fallback
    )
    FROM auth.users 
    WHERE id = user_uuid
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create function to check if user is superuser without recursion
CREATE OR REPLACE FUNCTION public.check_superuser_safe_v2(user_uuid uuid)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check directly from auth metadata to avoid recursion
  RETURN COALESCE(
    (SELECT raw_user_meta_data->>'is_superuser' = 'true' 
     FROM auth.users 
     WHERE id = user_uuid), 
    false
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create simple, non-recursive RLS policies for usuarios
CREATE POLICY "Simple usuarios access" 
  ON public.usuarios 
  FOR ALL 
  USING (
    auth.uid() = auth_user_id OR 
    public.check_superuser_safe_v2(auth.uid())
  )
  WITH CHECK (
    auth.uid() = auth_user_id OR 
    public.check_superuser_safe_v2(auth.uid())
  );

-- Fix cartas_porte policies to prevent 500 errors
DROP POLICY IF EXISTS "cartas_porte_user_access" ON public.cartas_porte;
CREATE POLICY "cartas_porte_simple_access" ON public.cartas_porte
FOR ALL USING (
  auth.uid() = usuario_id OR 
  public.check_superuser_safe_v2(auth.uid())
);

-- Simplify other problematic policies
DROP POLICY IF EXISTS "conductores_user_access" ON public.conductores;
CREATE POLICY "conductores_simple_access" ON public.conductores
FOR ALL USING (
  auth.uid() = user_id OR 
  public.check_superuser_safe_v2(auth.uid())
);

DROP POLICY IF EXISTS "vehiculos_user_access" ON public.vehiculos;
CREATE POLICY "vehiculos_simple_access" ON public.vehiculos
FOR ALL USING (
  auth.uid() = user_id OR 
  public.check_superuser_safe_v2(auth.uid())
);

DROP POLICY IF EXISTS "socios_user_access" ON public.socios;
CREATE POLICY "socios_simple_access" ON public.socios
FOR ALL USING (
  auth.uid() = user_id OR 
  public.check_superuser_safe_v2(auth.uid())
);

-- Clean up old rate limiting logs to improve performance
DELETE FROM public.rate_limit_log WHERE created_at < now() - interval '2 hours';
