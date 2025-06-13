
-- Primero, eliminar las políticas problemáticas que están causando recursión infinita
DROP POLICY IF EXISTS "Simple usuarios access" ON public.usuarios;

-- Crear una nueva política simple y segura que no cause recursión
CREATE POLICY "usuarios_simple_access" 
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

-- Asegurar que la función de seguridad funcione correctamente
CREATE OR REPLACE FUNCTION public.check_superuser_safe_v2(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
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
$$;
