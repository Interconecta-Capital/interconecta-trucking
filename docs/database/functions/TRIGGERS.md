# Triggers y Automatizaciones

## Triggers de Usuario

### handle_new_user

Crea automáticamente el perfil y registros asociados cuando se registra un usuario.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  -- Crear perfil
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Crear registro de créditos
  INSERT INTO public.creditos_usuarios (user_id, balance_disponible)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
END;
$$;

-- Trigger en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

### create_trial_subscription

Crea suscripción de prueba automáticamente.

```sql
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

CREATE TRIGGER trg_create_trial
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_trial_subscription();
```

---

## Triggers de Timestamps

### update_updated_at_column

Trigger genérico para actualizar `updated_at`.

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Aplicar a múltiples tablas
CREATE TRIGGER trg_viajes_updated_at
  BEFORE UPDATE ON viajes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_conductores_updated_at
  BEFORE UPDATE ON conductores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- etc...
```

---

### update_borrador_ultima_edicion

Actualiza la fecha de última edición de borradores.

```sql
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

CREATE TRIGGER trg_borrador_ultima_edicion
  BEFORE UPDATE ON borradores_carta_porte
  FOR EACH ROW
  EXECUTE FUNCTION update_borrador_ultima_edicion();
```

---

## Triggers de Suscripción

### sync_trial_dates

Sincroniza fechas de trial con fecha_fin.

```sql
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

CREATE TRIGGER trg_sync_trial_dates
  BEFORE INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_trial_dates();
```

---

## Triggers de Certificados

### enforce_single_active_certificate

Asegura que solo haya un certificado activo por usuario.

```sql
CREATE OR REPLACE FUNCTION public.enforce_single_active_certificate()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NEW.activo = true THEN
    -- Desactivar otros certificados del usuario
    UPDATE certificados_digitales
    SET activo = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND activo = true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_single_certificate
  BEFORE INSERT OR UPDATE ON certificados_digitales
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_active_certificate();
```

---

## Triggers de Métricas

### actualizar_metricas_tiempo_real_v2

Actualiza métricas en tiempo real cuando cambian los viajes.

```sql
CREATE OR REPLACE FUNCTION public.actualizar_metricas_tiempo_real_v2()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
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
    (SELECT COUNT(*) FROM viajes WHERE user_id = NEW.user_id AND estado = 'completado' 
     AND DATE(updated_at) = CURRENT_DATE),
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

CREATE TRIGGER trg_actualizar_metricas
  AFTER INSERT OR UPDATE ON viajes
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_metricas_tiempo_real_v2();
```

---

## Triggers de Calificaciones

### update_taller_rating

Actualiza el rating promedio de un taller mecánico.

```sql
CREATE OR REPLACE FUNCTION public.update_taller_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
DECLARE
  avg_rating NUMERIC;
  total_count INTEGER;
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

CREATE TRIGGER trg_update_taller_rating
  AFTER INSERT OR UPDATE OR DELETE ON resenas_talleres
  FOR EACH ROW
  EXECUTE FUNCTION update_taller_rating();
```

---

## Triggers de Cotizaciones

### registrar_cambio_estado_cotizacion

Registra cambios de estado en cotizaciones.

```sql
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

CREATE TRIGGER trg_historial_cotizacion
  AFTER UPDATE ON cotizaciones
  FOR EACH ROW
  EXECUTE FUNCTION registrar_cambio_estado_cotizacion();
```

---

## Lista de Triggers por Tabla

| Tabla | Trigger | Función | Evento |
|-------|---------|---------|--------|
| auth.users | on_auth_user_created | handle_new_user | AFTER INSERT |
| profiles | trg_create_trial | create_trial_subscription | AFTER INSERT |
| viajes | trg_viajes_updated_at | update_updated_at_column | BEFORE UPDATE |
| viajes | trg_actualizar_metricas | actualizar_metricas_tiempo_real_v2 | AFTER INSERT/UPDATE |
| conductores | trg_conductores_updated_at | update_updated_at_column | BEFORE UPDATE |
| vehiculos | trg_vehiculos_updated_at | update_updated_at_column | BEFORE UPDATE |
| cartas_porte | trg_verify_config | verificar_config_fiscal_antes_carta_porte | BEFORE INSERT |
| borradores_carta_porte | trg_borrador_ultima_edicion | update_borrador_ultima_edicion | BEFORE UPDATE |
| certificados_digitales | trg_enforce_single_certificate | enforce_single_active_certificate | BEFORE INSERT/UPDATE |
| subscriptions | trg_sync_trial_dates | sync_trial_dates | BEFORE INSERT/UPDATE |
| cotizaciones | trg_historial_cotizacion | registrar_cambio_estado_cotizacion | AFTER UPDATE |
| resenas_talleres | trg_update_taller_rating | update_taller_rating | AFTER INSERT/UPDATE/DELETE |
