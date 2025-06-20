
-- Función para asignar trial automáticamente a usuarios sin suscripción (corregida)
CREATE OR REPLACE FUNCTION assign_missing_trials()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insertar suscripciones de trial para usuarios que no tienen ninguna
  INSERT INTO public.suscripciones (
    user_id, 
    plan_id, 
    status, 
    fecha_fin_prueba,
    fecha_vencimiento
  ) 
  SELECT DISTINCT
    p.id,
    (SELECT id FROM public.planes_suscripcion WHERE nombre = 'Plan Esencial SAT' LIMIT 1),
    'trial'::subscription_status_enum,
    CASE 
      WHEN p.created_at + INTERVAL '14 days' > NOW() 
      THEN p.created_at + INTERVAL '14 days'
      ELSE NOW() + INTERVAL '1 day'  -- Dar un día extra si ya expiró
    END,
    CASE 
      WHEN p.created_at + INTERVAL '14 days' > NOW() 
      THEN p.created_at + INTERVAL '14 days'
      ELSE NOW() + INTERVAL '1 day'
    END
  FROM public.profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM public.suscripciones s WHERE s.user_id = p.id
  );

  -- Sincronizar trial_end_date en profiles con suscripciones
  UPDATE public.profiles 
  SET trial_end_date = s.fecha_fin_prueba
  FROM public.suscripciones s
  WHERE profiles.id = s.user_id 
    AND s.status = 'trial'::subscription_status_enum
    AND profiles.trial_end_date IS NULL;
END;
$$;

-- Función mejorada para handle_new_user que siempre asigne trial (corregida)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  plan_basico_id UUID;
BEGIN
  -- Obtener el ID del plan básico
  SELECT id INTO plan_basico_id 
  FROM public.planes_suscripcion 
  WHERE nombre = 'Plan Esencial SAT' 
  LIMIT 1;

  -- Crear profile primero
  INSERT INTO public.profiles (id, nombre, email, empresa, rfc, telefono, trial_end_date)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.email,
    NEW.raw_user_meta_data->>'empresa',
    NEW.raw_user_meta_data->>'rfc',
    NEW.raw_user_meta_data->>'telefono',
    NOW() + INTERVAL '14 days'
  );
  
  -- Crear entrada en usuarios
  INSERT INTO public.usuarios (
    auth_user_id,
    nombre,
    email,
    tenant_id
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.email,
    NEW.id
  );

  -- Crear suscripción de trial automáticamente
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
  
  RETURN NEW;
END;
$$;

-- Trigger mejorado para transición automática de trial a plan pagado (corregido)
CREATE OR REPLACE FUNCTION public.handle_subscription_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si cambia de trial a active, limpiar fechas de trial
  IF OLD.status = 'trial'::subscription_status_enum AND NEW.status = 'active'::subscription_status_enum THEN
    -- Actualizar profile para remover trial_end_date
    UPDATE public.profiles 
    SET trial_end_date = NULL,
        plan_type = CASE 
          WHEN NEW.plan_id IS NOT NULL THEN 'paid'
          ELSE 'trial'
        END
    WHERE id = NEW.user_id;
    
    -- Crear notificación de bienvenida al plan
    INSERT INTO public.notificaciones (
      user_id,
      tipo,
      titulo,
      mensaje,
      urgente
    ) VALUES (
      NEW.user_id,
      'success',
      '¡Bienvenido a tu nuevo plan!',
      'Tu suscripción ha sido activada exitosamente. Ya tienes acceso a todas las funciones de tu plan.',
      false
    );
  END IF;

  -- Sincronizar trial_end_date cuando se actualiza fecha_fin_prueba
  IF NEW.status = 'trial'::subscription_status_enum AND NEW.fecha_fin_prueba IS NOT NULL THEN
    UPDATE public.profiles 
    SET trial_end_date = NEW.fecha_fin_prueba
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger para transición de suscripciones
DROP TRIGGER IF EXISTS on_subscription_status_change ON public.suscripciones;
CREATE TRIGGER on_subscription_status_change
  BEFORE UPDATE ON public.suscripciones
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_subscription_transition();

-- Ejecutar la función para corregir usuarios existentes
SELECT assign_missing_trials();
