
-- Corregir cuenta específica de jahirfto@icloud.com con RFC válido
DO $$
DECLARE
  plan_basico_id UUID;
  user_auth_id UUID;
  user_created_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Obtener plan básico
  SELECT id INTO plan_basico_id 
  FROM public.planes_suscripcion 
  WHERE nombre = 'Plan Esencial SAT' 
  LIMIT 1;

  -- Obtener datos del usuario de auth.users
  SELECT id, created_at 
  INTO user_auth_id, user_created_at
  FROM auth.users 
  WHERE email = 'jahirfto@icloud.com';

  -- Crear o actualizar profile con RFC válido de 12 caracteres
  INSERT INTO public.profiles (id, nombre, email, empresa, rfc, telefono, trial_end_date)
  VALUES (
    user_auth_id,
    'Jahir FTO',
    'jahirfto@icloud.com',
    'Interconecta Trucking',
    'SOMA0112212A1',  -- RFC válido de 12 caracteres
    NULL,
    '2025-06-26 00:00:00-06'::timestamp with time zone
  )
  ON CONFLICT (id) DO UPDATE SET
    rfc = 'SOMA0112212A1',
    trial_end_date = '2025-06-26 00:00:00-06'::timestamp with time zone,
    empresa = 'Interconecta Trucking';

  -- Crear tenant si no existe
  INSERT INTO public.tenants (id, nombre_empresa, rfc_empresa)
  VALUES (
    user_auth_id,
    'Interconecta Trucking',
    'SOMA0112212A1'
  )
  ON CONFLICT (id) DO UPDATE SET
    rfc_empresa = 'SOMA0112212A1',
    nombre_empresa = 'Interconecta Trucking';

  -- Crear entrada en usuarios si no existe
  INSERT INTO public.usuarios (
    auth_user_id,
    nombre,
    email,
    tenant_id
  ) VALUES (
    user_auth_id,
    'Jahir FTO',
    'jahirfto@icloud.com',
    user_auth_id
  )
  ON CONFLICT (auth_user_id) DO NOTHING;

  -- Crear suscripción de trial
  INSERT INTO public.suscripciones (
    user_id, 
    plan_id, 
    status, 
    fecha_inicio,
    fecha_fin_prueba,
    fecha_vencimiento
  ) VALUES (
    user_auth_id,
    plan_basico_id,
    'trial'::subscription_status_enum,
    user_created_at,
    '2025-06-26 00:00:00-06'::timestamp with time zone,
    '2025-06-26 00:00:00-06'::timestamp with time zone
  )
  ON CONFLICT (user_id) DO UPDATE SET
    status = 'trial'::subscription_status_enum,
    fecha_inicio = user_created_at,
    fecha_fin_prueba = '2025-06-26 00:00:00-06'::timestamp with time zone,
    fecha_vencimiento = '2025-06-26 00:00:00-06'::timestamp with time zone,
    plan_id = plan_basico_id;

  -- Eliminar cualquier bloqueo existente
  DELETE FROM public.bloqueos_usuario WHERE user_id = user_auth_id;

  RAISE NOTICE 'Usuario % corregido exitosamente con RFC: SOMA0112212A1', user_auth_id;

END $$;
