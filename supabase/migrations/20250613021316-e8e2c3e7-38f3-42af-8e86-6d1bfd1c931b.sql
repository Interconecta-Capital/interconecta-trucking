
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
