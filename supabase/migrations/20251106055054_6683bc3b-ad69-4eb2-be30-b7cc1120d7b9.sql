-- Harden remaining trigger functions with fixed search_path
-- Defense-in-depth: Add SET search_path to prevent search_path manipulation attacks

-- 1. actualizar_metricas_tiempo_real_v2 (trigger function)
CREATE OR REPLACE FUNCTION public.actualizar_metricas_tiempo_real_v2()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  -- Actualizar conductor: usar estados válidos del CHECK constraint
  IF NEW.conductor_id IS NOT NULL THEN
    UPDATE public.conductores 
    SET viaje_actual_id = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN NEW.id 
      ELSE NULL 
    END,
    estado = CASE 
      WHEN NEW.estado = 'en_transito' THEN 'en_viaje'
      WHEN NEW.estado = 'programado' THEN 'disponible'
      WHEN NEW.estado IN ('completado', 'cancelado') THEN 'disponible'
      ELSE estado
    END,
    fecha_proxima_disponibilidad = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN NEW.fecha_fin_programada
      ELSE NULL
    END
    WHERE id = NEW.conductor_id;
  END IF;
  
  -- Actualizar vehículo
  IF NEW.vehiculo_id IS NOT NULL THEN
    UPDATE public.vehiculos 
    SET estado = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN 'en_viaje'
      WHEN NEW.estado IN ('completado', 'cancelado') THEN 'disponible'
      ELSE estado
    END,
    viaje_actual_id = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN NEW.id 
      ELSE NULL 
    END,
    fecha_proxima_disponibilidad = CASE 
      WHEN NEW.estado IN ('programado', 'en_transito') THEN NEW.fecha_fin_programada
      ELSE NULL
    END
    WHERE id = NEW.vehiculo_id;
  END IF;
  
  -- Actualizar remolque
  IF NEW.remolque_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'remolques' 
      AND column_name = 'viaje_actual_id'
    ) THEN
      UPDATE public.remolques 
      SET viaje_actual_id = CASE 
        WHEN NEW.estado IN ('programado', 'en_transito') THEN NEW.id 
        ELSE NULL 
      END
      WHERE id = NEW.remolque_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 2. enforce_single_active_certificate (trigger function)
CREATE OR REPLACE FUNCTION public.enforce_single_active_certificate()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  IF NEW.activo = true THEN
    UPDATE public.certificados_digitales 
    SET activo = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
    
    INSERT INTO public.certificados_activos (user_id, certificado_id)
    VALUES (NEW.user_id, NEW.id)
    ON CONFLICT (user_id) 
    DO UPDATE SET certificado_id = NEW.id, updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. registrar_cambio_estado_cotizacion (trigger function)
CREATE OR REPLACE FUNCTION public.registrar_cambio_estado_cotizacion()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO public.historial_cotizaciones (
      cotizacion_id, 
      estado_anterior, 
      estado_nuevo, 
      cambiado_por
    ) VALUES (
      NEW.id, 
      OLD.estado, 
      NEW.estado, 
      NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- 4. sync_trial_dates (trigger function)
CREATE OR REPLACE FUNCTION public.sync_trial_dates()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  IF NEW.status = 'trial' AND NEW.fecha_fin_prueba IS NOT NULL THEN
    UPDATE public.profiles 
    SET trial_end_date = NEW.fecha_fin_prueba
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 5. update_taller_rating (trigger function)
CREATE OR REPLACE FUNCTION public.update_taller_rating()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  UPDATE public.talleres 
  SET 
    calificacion_promedio = (
      SELECT AVG(calificacion)::DECIMAL(3,2) 
      FROM public.reviews_talleres 
      WHERE taller_id = COALESCE(NEW.taller_id, OLD.taller_id)
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM public.reviews_talleres 
      WHERE taller_id = COALESCE(NEW.taller_id, OLD.taller_id)
    )
  WHERE id = COALESCE(NEW.taller_id, OLD.taller_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 6. update_borrador_ultima_edicion (trigger function)
CREATE OR REPLACE FUNCTION public.update_borrador_ultima_edicion()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  NEW.ultima_edicion = now();
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;