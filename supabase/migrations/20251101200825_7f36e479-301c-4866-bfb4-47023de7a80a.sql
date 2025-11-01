-- ============================================
-- FASE 1 y 2: Corregir función handle_new_user y habilitar trigger
-- ============================================

-- Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recrear función handle_new_user con lógica corregida
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  plan_basico_id UUID;
  new_tenant_id UUID;
BEGIN
  -- Log para debugging
  RAISE NOTICE 'handle_new_user triggered for user: %', NEW.id;
  
  -- Obtener el plan básico
  SELECT id INTO plan_basico_id 
  FROM public.planes_suscripcion 
  WHERE nombre = 'Plan Esencial SAT' 
  LIMIT 1;

  -- PASO 1: Crear TENANT primero
  INSERT INTO public.tenants (
    nombre_empresa,
    rfc_empresa
  ) VALUES (
    COALESCE(NEW.raw_user_meta_data->>'empresa', 'Empresa de ' || COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email)),
    COALESCE(NEW.raw_user_meta_data->>'rfc', 'XAXX010101000')
  )
  RETURNING id INTO new_tenant_id;

  RAISE NOTICE 'Tenant created with id: %', new_tenant_id;

  -- PASO 2: Crear PROFILE
  INSERT INTO public.profiles (
    id,
    nombre,
    email,
    empresa,
    rfc,
    telefono,
    trial_end_date
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.email,
    NEW.raw_user_meta_data->>'empresa',
    NEW.raw_user_meta_data->>'rfc',
    NEW.raw_user_meta_data->>'telefono',
    NOW() + INTERVAL '14 days'
  );

  RAISE NOTICE 'Profile created for user: %', NEW.id;

  -- PASO 3: Crear USUARIO (SIN telefono/empresa, solo con tenant_id correcto)
  INSERT INTO public.usuarios (
    auth_user_id,
    nombre,
    email,
    tenant_id,
    rol
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.email,
    new_tenant_id,
    'admin'
  );

  RAISE NOTICE 'Usuario created for user: % with tenant: %', NEW.id, new_tenant_id;

  -- PASO 4: Crear SUSCRIPCIÓN
  INSERT INTO public.suscripciones (
    user_id, 
    plan_id, 
    status, 
    fecha_fin_prueba,
    fecha_vencimiento
  ) VALUES (
    NEW.id,
    plan_basico_id,
    'trial'::subscription_status_enum,
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '14 days'
  );

  RAISE NOTICE 'Subscription created for user: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    -- No lanzar error para evitar bloquear el signup
    RETURN NEW;
END;
$function$;

-- Crear trigger HABILITADO
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FASE 4: Simplificar políticas RLS de usuarios
-- ============================================

-- Eliminar políticas antiguas restrictivas
DROP POLICY IF EXISTS "usuarios_unificados" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_simple" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_unified_access" ON public.usuarios;

-- Crear política unificada que permite auto-registro
CREATE POLICY "usuarios_full_access"
ON public.usuarios
FOR ALL
USING (
  auth.uid() = auth_user_id OR is_admin_user()
)
WITH CHECK (
  auth.uid() = auth_user_id OR is_admin_user()
);