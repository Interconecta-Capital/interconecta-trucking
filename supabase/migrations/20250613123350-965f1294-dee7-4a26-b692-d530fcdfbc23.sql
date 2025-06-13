
-- Fix infinite recursion in RLS policies for usuarios table
-- First, drop the problematic policy
DROP POLICY IF EXISTS "Safe user data access" ON public.usuarios;

-- Create improved security definer functions that don't cause recursion
CREATE OR REPLACE FUNCTION public.get_user_tenant_safe(user_uuid uuid)
RETURNS UUID AS $$
BEGIN
  -- Use auth.users directly to avoid recursion
  RETURN (
    SELECT COALESCE(
      (raw_user_meta_data->>'tenant_id')::uuid, 
      '00000000-0000-0000-0000-000000000000'::uuid
    )
    FROM auth.users 
    WHERE id = user_uuid
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN '00000000-0000-0000-0000-000000000000'::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create function to check if user is superuser without recursion
CREATE OR REPLACE FUNCTION public.check_superuser_safe(user_uuid uuid)
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

-- Create simple, non-recursive RLS policies
CREATE POLICY "Users can access own data only" 
  ON public.usuarios 
  FOR ALL 
  USING (
    auth.uid() = auth_user_id OR 
    public.check_superuser_safe(auth.uid())
  )
  WITH CHECK (
    auth.uid() = auth_user_id OR 
    public.check_superuser_safe(auth.uid())
  );

-- Fix conductores policies to avoid recursion
DROP POLICY IF EXISTS "Safe conductores access" ON public.conductores;
CREATE POLICY "Users can access own conductores" 
  ON public.conductores 
  FOR ALL 
  USING (
    auth.uid() = user_id OR 
    public.check_superuser_safe(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    public.check_superuser_safe(auth.uid())
  );

-- Fix vehiculos policies
DROP POLICY IF EXISTS "Safe vehiculos access" ON public.vehiculos;
CREATE POLICY "Users can access own vehiculos" 
  ON public.vehiculos 
  FOR ALL 
  USING (
    auth.uid() = user_id OR 
    public.check_superuser_safe(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    public.check_superuser_safe(auth.uid())
  );

-- Fix socios policies
DROP POLICY IF EXISTS "Safe socios access" ON public.socios;
CREATE POLICY "Users can access own socios" 
  ON public.socios 
  FOR ALL 
  USING (
    auth.uid() = user_id OR 
    public.check_superuser_safe(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    public.check_superuser_safe(auth.uid())
  );

-- Clean up rate limiting logs older than 24 hours to improve performance
DELETE FROM public.rate_limit_log WHERE created_at < now() - interval '24 hours';
