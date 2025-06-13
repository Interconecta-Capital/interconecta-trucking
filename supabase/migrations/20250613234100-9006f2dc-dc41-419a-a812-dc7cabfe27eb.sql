
-- Actualizar sistema de trial a 14 días con período de gracia de 90 días
-- Agregar campos necesarios para el nuevo sistema

-- Actualizar tabla de suscripciones para soportar período de gracia
ALTER TABLE public.suscripciones 
ADD COLUMN IF NOT EXISTS grace_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cleanup_warning_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS final_warning_sent BOOLEAN DEFAULT FALSE;

-- Actualizar planes para trial de 14 días
UPDATE public.planes_suscripcion 
SET dias_prueba = 14 
WHERE dias_prueba = 7;

-- Crear enum para status de suscripción si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status_enum') THEN
        -- Crear el enum
        CREATE TYPE subscription_status_enum AS ENUM ('trial', 'active', 'past_due', 'canceled', 'suspended', 'grace_period');
        
        -- Primero quitar el default
        ALTER TABLE public.suscripciones ALTER COLUMN status DROP DEFAULT;
        
        -- Cambiar el tipo de la columna
        ALTER TABLE public.suscripciones 
        ALTER COLUMN status TYPE subscription_status_enum 
        USING status::subscription_status_enum;
        
        -- Restaurar el default
        ALTER TABLE public.suscripciones ALTER COLUMN status SET DEFAULT 'trial'::subscription_status_enum;
    ELSE
        -- Si existe el enum, agregar el nuevo valor si no está presente
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_status_enum') AND enumlabel = 'grace_period') THEN
            ALTER TYPE subscription_status_enum ADD VALUE 'grace_period';
        END IF;
    END IF;
END $$;

-- Función para manejar transición a período de gracia
CREATE OR REPLACE FUNCTION public.handle_trial_expiry()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el trial expira, mover a período de gracia
    IF OLD.status = 'trial' AND NEW.status = 'past_due' THEN
        NEW.status = 'grace_period';
        NEW.grace_period_start = NOW();
        NEW.grace_period_end = NOW() + INTERVAL '90 days';
        NEW.cleanup_warning_sent = FALSE;
        NEW.final_warning_sent = FALSE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para manejar expiración de trial
DROP TRIGGER IF EXISTS trial_expiry_trigger ON public.suscripciones;
CREATE TRIGGER trial_expiry_trigger
    BEFORE UPDATE ON public.suscripciones
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_trial_expiry();

-- Función para enviar notificaciones de limpieza
CREATE OR REPLACE FUNCTION public.send_cleanup_warnings()
RETURNS void AS $$
BEGIN
    -- Enviar primera advertencia (7 días antes)
    INSERT INTO public.notificaciones (user_id, tipo, titulo, mensaje, urgente)
    SELECT 
        s.user_id,
        'warning',
        'Tu período de gracia termina pronto',
        'Tu período de gracia de 90 días termina en 7 días. Adquiere un plan para mantener tus datos.',
        true
    FROM public.suscripciones s
    WHERE s.status = 'grace_period'
      AND s.grace_period_end <= NOW() + INTERVAL '7 days'
      AND s.grace_period_end > NOW()
      AND s.cleanup_warning_sent = FALSE;
    
    -- Marcar como enviado
    UPDATE public.suscripciones 
    SET cleanup_warning_sent = TRUE
    WHERE status = 'grace_period'
      AND grace_period_end <= NOW() + INTERVAL '7 days'
      AND grace_period_end > NOW()
      AND cleanup_warning_sent = FALSE;
    
    -- Enviar advertencia final (1 día antes)
    INSERT INTO public.notificaciones (user_id, tipo, titulo, mensaje, urgente)
    SELECT 
        s.user_id,
        'error',
        'ÚLTIMO DÍA: Tu cuenta será limpiada mañana',
        'Este es tu último día del período de gracia. Todos tus datos serán eliminados mañana si no adquieres un plan.',
        true
    FROM public.suscripciones s
    WHERE s.status = 'grace_period'
      AND s.grace_period_end <= NOW() + INTERVAL '1 day'
      AND s.grace_period_end > NOW()
      AND s.final_warning_sent = FALSE;
    
    -- Marcar advertencia final como enviada
    UPDATE public.suscripciones 
    SET final_warning_sent = TRUE
    WHERE status = 'grace_period'
      AND grace_period_end <= NOW() + INTERVAL '1 day'
      AND grace_period_end > NOW()
      AND final_warning_sent = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar datos de usuarios en período de gracia vencido
CREATE OR REPLACE FUNCTION public.cleanup_expired_grace_users()
RETURNS void AS $$
BEGIN
    -- Eliminar datos de usuarios cuyo período de gracia ha vencido
    WITH expired_users AS (
        SELECT user_id 
        FROM public.suscripciones 
        WHERE status = 'grace_period' 
          AND grace_period_end < NOW()
    )
    DELETE FROM public.cartas_porte 
    WHERE usuario_id IN (SELECT user_id FROM expired_users);
    
    WITH expired_users AS (
        SELECT user_id 
        FROM public.suscripciones 
        WHERE status = 'grace_period' 
          AND grace_period_end < NOW()
    )
    DELETE FROM public.vehiculos 
    WHERE user_id IN (SELECT user_id FROM expired_users);
    
    WITH expired_users AS (
        SELECT user_id 
        FROM public.suscripciones 
        WHERE status = 'grace_period' 
          AND grace_period_end < NOW()
    )
    DELETE FROM public.conductores 
    WHERE user_id IN (SELECT user_id FROM expired_users);
    
    WITH expired_users AS (
        SELECT user_id 
        FROM public.suscripciones 
        WHERE status = 'grace_period' 
          AND grace_period_end < NOW()
    )
    DELETE FROM public.socios 
    WHERE user_id IN (SELECT user_id FROM expired_users);
    
    -- Notificar que la limpieza se completó
    INSERT INTO public.notificaciones (user_id, tipo, titulo, mensaje)
    SELECT 
        s.user_id,
        'info',
        'Datos eliminados',
        'Tu período de gracia ha terminado y tus datos han sido eliminados. Puedes crear una nueva cuenta cuando gustes.',
        false
    FROM public.suscripciones s
    WHERE s.status = 'grace_period' 
      AND s.grace_period_end < NOW();
    
    -- Actualizar suscripciones a canceled
    UPDATE public.suscripciones 
    SET status = 'canceled'
    WHERE status = 'grace_period' 
      AND grace_period_end < NOW();
END;
$$ LANGUAGE plpgsql;

-- Actualizar función de verificación de suscripciones
CREATE OR REPLACE FUNCTION public.check_subscription_expiry()
RETURNS void AS $$
BEGIN
    -- Mover trials expirados a período de gracia
    UPDATE public.suscripciones 
    SET status = 'grace_period',
        grace_period_start = NOW(),
        grace_period_end = NOW() + INTERVAL '90 days',
        cleanup_warning_sent = FALSE,
        final_warning_sent = FALSE
    WHERE status = 'trial' 
      AND fecha_vencimiento < NOW();
    
    -- Enviar advertencias de limpieza
    PERFORM public.send_cleanup_warnings();
    
    -- Limpiar usuarios con período de gracia vencido
    PERFORM public.cleanup_expired_grace_users();
    
    -- Bloquear usuarios con suscripciones vencidas (solo activas)
    INSERT INTO public.bloqueos_usuario (user_id, motivo, mensaje_bloqueo)
    SELECT 
        s.user_id,
        'falta_pago',
        'Su suscripción ha vencido. Para continuar usando la plataforma, realice el pago correspondiente.'
    FROM public.suscripciones s
    WHERE s.fecha_vencimiento < NOW()
      AND s.status = 'past_due'
      AND NOT EXISTS (
        SELECT 1 FROM public.bloqueos_usuario b 
        WHERE b.user_id = s.user_id AND b.activo = true
      );
END;
$$ LANGUAGE plpgsql;
