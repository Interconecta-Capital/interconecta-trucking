-- Fix Security Issue #1: Restrict rol_especial modifications on usuarios table

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can access their own data" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_simple" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_unificados" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_unified_access" ON public.usuarios;

-- Create restrictive policies for usuarios table
CREATE POLICY "Users can read their own usuario data"
ON public.usuarios
FOR SELECT
USING (auth.uid() = auth_user_id OR is_superuser_secure(auth.uid()));

CREATE POLICY "Users can update their own data"
ON public.usuarios
FOR UPDATE
USING (auth.uid() = auth_user_id OR is_superuser_secure(auth.uid()))
WITH CHECK (auth.uid() = auth_user_id OR is_superuser_secure(auth.uid()));

CREATE POLICY "Superusers can insert usuarios"
ON public.usuarios
FOR INSERT
WITH CHECK (is_superuser_secure(auth.uid()));

CREATE POLICY "Superusers can delete usuarios"
ON public.usuarios
FOR DELETE
USING (is_superuser_secure(auth.uid()));

-- Create trigger function to prevent regular users from modifying rol_especial
CREATE OR REPLACE FUNCTION public.prevent_rol_especial_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
BEGIN
  -- Allow superusers to modify rol_especial
  IF is_superuser_secure(auth.uid()) THEN
    RETURN NEW;
  END IF;
  
  -- Prevent regular users from changing rol_especial
  IF OLD.rol_especial IS DISTINCT FROM NEW.rol_especial THEN
    RAISE EXCEPTION 'Only superusers can modify rol_especial field';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce rol_especial protection
DROP TRIGGER IF EXISTS protect_rol_especial ON public.usuarios;
CREATE TRIGGER protect_rol_especial
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_rol_especial_modification();

-- Create secure RPC function for superuser promotion
CREATE OR REPLACE FUNCTION public.promote_user_to_superuser(
  target_user_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
DECLARE
  result_data jsonb;
BEGIN
  -- Verify caller is superuser
  IF NOT public.is_superuser_secure(auth.uid()) THEN
    RAISE EXCEPTION 'Only superusers can promote users';
  END IF;
  
  -- Log security event
  PERFORM public.log_security_event(
    auth.uid(),
    'privilege_escalation',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'action', 'promote_to_superuser',
      'timestamp', now()
    )
  );
  
  -- Insert role into user_roles table
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (target_user_id, 'superuser', auth.uid())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Update usuarios table
  UPDATE public.usuarios
  SET rol_especial = 'superuser'
  WHERE auth_user_id = target_user_id;
  
  -- Return success
  SELECT jsonb_build_object(
    'success', true,
    'message', 'User promoted to superuser',
    'user_id', target_user_id
  ) INTO result_data;
  
  RETURN result_data;
END;
$$;