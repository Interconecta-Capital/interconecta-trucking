-- Fix remaining trigger functions without fixed search_path
-- These are the 9 trigger functions identified by the Supabase linter

-- 1. actualizar_metricas_tiempo_real_v2
CREATE OR REPLACE FUNCTION public.actualizar_metricas_tiempo_real_v2()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  -- Existing function logic preserved
  INSERT INTO metricas_tiempo_real (
    user_id,
    viajes_activos,
    viajes_completados_hoy,
    conductores_disponibles,
    alertas_pendientes,
    updated_at
  )
  SELECT
    NEW.user_id,
    (SELECT COUNT(*) FROM viajes WHERE user_id = NEW.user_id AND estado = 'en_curso'),
    (SELECT COUNT(*) FROM viajes WHERE user_id = NEW.user_id AND estado = 'completado' AND DATE(updated_at) = CURRENT_DATE),
    (SELECT COUNT(*) FROM conductores WHERE user_id = NEW.user_id AND estado = 'disponible'),
    0,
    now()
  ON CONFLICT (user_id) DO UPDATE SET
    viajes_activos = EXCLUDED.viajes_activos,
    viajes_completados_hoy = EXCLUDED.viajes_completados_hoy,
    conductores_disponibles = EXCLUDED.conductores_disponibles,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- 2. update_esquemas_xml_updated_at
CREATE OR REPLACE FUNCTION public.update_esquemas_xml_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. update_creditos_usuarios_updated_at
CREATE OR REPLACE FUNCTION public.update_creditos_usuarios_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 4. create_trial_subscription
CREATE OR REPLACE FUNCTION public.create_trial_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO subscriptions (
    user_id,
    plan_id,
    status,
    fecha_inicio,
    fecha_fin,
    is_trial,
    trial_ends_at
  )
  SELECT
    NEW.id,
    p.id,
    'trial',
    now(),
    now() + interval '7 days',
    true,
    now() + interval '7 days'
  FROM planes p
  WHERE p.nombre = 'Básico'
  LIMIT 1;
  
  RETURN NEW;
END;
$$;

-- 5. enforce_single_active_certificate
CREATE OR REPLACE FUNCTION public.enforce_single_active_certificate()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NEW.activo = true THEN
    UPDATE certificados_digitales
    SET activo = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND activo = true;
  END IF;
  RETURN NEW;
END;
$$;

-- 6. registrar_cambio_estado_cotizacion
CREATE OR REPLACE FUNCTION public.registrar_cambio_estado_cotizacion()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO historial_cotizaciones (
      cotizacion_id,
      estado_anterior,
      estado_nuevo,
      fecha_cambio,
      user_id
    ) VALUES (
      NEW.id,
      OLD.estado,
      NEW.estado,
      now(),
      NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- 7. sync_trial_dates
CREATE OR REPLACE FUNCTION public.sync_trial_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NEW.is_trial = true AND NEW.trial_ends_at IS NOT NULL THEN
    NEW.fecha_fin = NEW.trial_ends_at;
  END IF;
  RETURN NEW;
END;
$$;

-- 8. update_taller_rating
CREATE OR REPLACE FUNCTION public.update_taller_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
DECLARE
  avg_rating numeric;
  total_count integer;
BEGIN
  SELECT AVG(calificacion), COUNT(*)
  INTO avg_rating, total_count
  FROM resenas_talleres
  WHERE taller_id = COALESCE(NEW.taller_id, OLD.taller_id);
  
  UPDATE talleres_mecanicos
  SET 
    calificacion_promedio = COALESCE(avg_rating, 0),
    total_resenas = total_count,
    updated_at = now()
  WHERE id = COALESCE(NEW.taller_id, OLD.taller_id);
  
  RETURN NEW;
END;
$$;

-- 9. update_borrador_ultima_edicion
CREATE OR REPLACE FUNCTION public.update_borrador_ultima_edicion()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.ultima_edicion = now();
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;