
-- Paso 1: Corregir fechas incorrectas en suscripciones y sincronizar trial system

-- Primero, actualizar las fechas de trial_end_date en profiles basándose en created_at + 14 días
UPDATE public.profiles 
SET trial_end_date = created_at + INTERVAL '14 days'
WHERE trial_end_date IS NULL OR trial_end_date > created_at + INTERVAL '30 days';

-- Corregir suscripciones con fechas incorrectas (como la que vence en 2125)
UPDATE public.suscripciones 
SET 
  fecha_vencimiento = CASE 
    WHEN fecha_vencimiento > NOW() + INTERVAL '1 year' THEN NOW() + INTERVAL '14 days'
    ELSE fecha_vencimiento
  END,
  fecha_fin_prueba = CASE 
    WHEN fecha_fin_prueba > NOW() + INTERVAL '1 year' THEN NOW() + INTERVAL '14 days'
    ELSE fecha_fin_prueba
  END
WHERE fecha_vencimiento > NOW() + INTERVAL '1 year' OR fecha_fin_prueba > NOW() + INTERVAL '1 year';

-- Sincronizar trial_end_date de profiles con fecha_fin_prueba de suscripciones
UPDATE public.profiles 
SET trial_end_date = s.fecha_fin_prueba
FROM public.suscripciones s 
WHERE profiles.id = s.user_id 
  AND s.status = 'trial' 
  AND s.fecha_fin_prueba IS NOT NULL;

-- Crear trigger para mantener sincronizadas las fechas de trial
CREATE OR REPLACE FUNCTION sync_trial_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Cuando se actualiza suscripción, sincronizar con profile
  IF NEW.status = 'trial' AND NEW.fecha_fin_prueba IS NOT NULL THEN
    UPDATE public.profiles 
    SET trial_end_date = NEW.fecha_fin_prueba
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_trial_dates ON public.suscripciones;
CREATE TRIGGER trigger_sync_trial_dates
  AFTER UPDATE ON public.suscripciones
  FOR EACH ROW
  EXECUTE FUNCTION sync_trial_dates();

-- Función para procesar trials expirados automáticamente
CREATE OR REPLACE FUNCTION process_expired_trials()
RETURNS void AS $$
BEGIN
  -- Mover trials expirados a grace period
  UPDATE public.suscripciones 
  SET 
    status = 'grace_period',
    grace_period_start = NOW(),
    grace_period_end = NOW() + INTERVAL '90 days',
    cleanup_warning_sent = FALSE,
    final_warning_sent = FALSE
  WHERE status = 'trial' 
    AND (fecha_fin_prueba < NOW() OR fecha_vencimiento < NOW());

  -- Crear notificaciones para trials que vencen en 3 días
  INSERT INTO public.notificaciones (user_id, tipo, titulo, mensaje, urgente)
  SELECT 
    s.user_id,
    'warning',
    'Tu período de prueba termina pronto',
    'Tu período de prueba de 14 días termina en ' || 
    EXTRACT(days FROM s.fecha_fin_prueba - NOW()) || ' días. Adquiere un plan para continuar.',
    true
  FROM public.suscripciones s
  WHERE s.status = 'trial'
    AND s.fecha_fin_prueba BETWEEN NOW() AND NOW() + INTERVAL '3 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.notificaciones n 
      WHERE n.user_id = s.user_id 
        AND n.titulo = 'Tu período de prueba termina pronto'
        AND n.created_at > NOW() - INTERVAL '24 hours'
    );

  -- Crear notificaciones para grace period que termina pronto
  INSERT INTO public.notificaciones (user_id, tipo, titulo, mensaje, urgente)
  SELECT 
    s.user_id,
    'error',
    'Período de gracia: Datos serán eliminados pronto',
    'Tu período de gracia termina en ' || 
    EXTRACT(days FROM s.grace_period_end - NOW()) || ' días. Todos tus datos serán eliminados permanentemente.',
    true
  FROM public.suscripciones s
  WHERE s.status = 'grace_period'
    AND s.grace_period_end BETWEEN NOW() AND NOW() + INTERVAL '7 days'
    AND s.final_warning_sent = FALSE;

  -- Marcar notificaciones de grace period como enviadas
  UPDATE public.suscripciones 
  SET final_warning_sent = TRUE
  WHERE status = 'grace_period'
    AND grace_period_end BETWEEN NOW() AND NOW() + INTERVAL '7 days'
    AND final_warning_sent = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Programar limpieza automática de notificaciones antiguas (retener solo 30 días)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.notificaciones 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Crear notificaciones para documentos próximos a vencer
CREATE OR REPLACE FUNCTION check_document_expiration()
RETURNS void AS $$
BEGIN
  -- Notificar documentos que vencen en 30 días
  INSERT INTO public.notificaciones (user_id, tipo, titulo, mensaje, urgente, metadata)
  SELECT DISTINCT
    de.user_id,
    'warning',
    'Documento próximo a vencer',
    'El documento ' || de.tipo_documento || ' de ' || 
    CASE de.entidad_tipo 
      WHEN 'vehiculo' THEN 'vehículo'
      WHEN 'conductor' THEN 'conductor' 
      ELSE de.entidad_tipo 
    END || ' vence el ' || TO_CHAR(de.fecha_vencimiento, 'DD/MM/YYYY'),
    false,
    jsonb_build_object(
      'documento_id', de.id,
      'entidad_tipo', de.entidad_tipo,
      'entidad_id', de.entidad_id,
      'fecha_vencimiento', de.fecha_vencimiento
    )
  FROM public.documentos_entidades de
  WHERE de.fecha_vencimiento IS NOT NULL
    AND de.fecha_vencimiento BETWEEN NOW() AND NOW() + INTERVAL '30 days'
    AND de.activo = true
    AND NOT EXISTS (
      SELECT 1 FROM public.notificaciones n 
      WHERE n.user_id = de.user_id 
        AND n.metadata->>'documento_id' = de.id::text
        AND n.created_at > NOW() - INTERVAL '7 days'
    );
END;
$$ LANGUAGE plpgsql;

-- Función para procesar todas las tareas automáticas
CREATE OR REPLACE FUNCTION run_automated_tasks()
RETURNS void AS $$
BEGIN
  PERFORM process_expired_trials();
  PERFORM cleanup_old_notifications();
  PERFORM check_document_expiration();
END;
$$ LANGUAGE plpgsql;
