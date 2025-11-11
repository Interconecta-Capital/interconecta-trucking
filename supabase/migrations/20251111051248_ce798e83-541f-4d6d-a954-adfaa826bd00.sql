-- ============================================================================
-- MIGRACIÓN DE SEGURIDAD CRÍTICA: Arreglar verificación de roles (VERSIÓN 2)
-- ============================================================================
-- Descripción: Elimina funciones inseguras y actualiza TODAS las políticas RLS
-- Fecha: 2025-11-11
-- Riesgo: CRÍTICO - Previene escalación de privilegios
-- ============================================================================

-- PASO 1: Actualizar/Eliminar TODAS las políticas que usan funciones inseguras

-- Tabla: cartas_porte
DROP POLICY IF EXISTS "Superusers pueden ver todas" ON public.cartas_porte;
DROP POLICY IF EXISTS "Superusers pueden insertar" ON public.cartas_porte;
DROP POLICY IF EXISTS "Superusers pueden actualizar" ON public.cartas_porte;
DROP POLICY IF EXISTS "Superusers pueden eliminar" ON public.cartas_porte;
DROP POLICY IF EXISTS "cartas_porte_unificados" ON public.cartas_porte;

CREATE POLICY "Superusers full access" ON public.cartas_porte
  FOR ALL USING (is_superuser_secure(auth.uid()));

-- Tabla: mercancias
DROP POLICY IF EXISTS "Superuser access mercancias" ON public.mercancias;
DROP POLICY IF EXISTS "mercancias_unificadas" ON public.mercancias;

CREATE POLICY "Superusers full access mercancias" ON public.mercancias
  FOR ALL USING (is_superuser_secure(auth.uid()));

-- Tabla: ubicaciones
DROP POLICY IF EXISTS "Superuser access ubicaciones" ON public.ubicaciones;
DROP POLICY IF EXISTS "ubicaciones_unificadas" ON public.ubicaciones;

CREATE POLICY "Superusers full access ubicaciones" ON public.ubicaciones
  FOR ALL USING (is_superuser_secure(auth.uid()));

-- Tabla: creditos_usuarios
DROP POLICY IF EXISTS "Superusers pueden gestionar créditos" ON public.creditos_usuarios;
DROP POLICY IF EXISTS "usuarios_ver_propios_creditos" ON public.creditos_usuarios;

CREATE POLICY "Usuarios ven propios creditos" ON public.creditos_usuarios
  FOR SELECT USING (auth.uid() = user_id OR is_superuser_secure(auth.uid()));

CREATE POLICY "Superusers gestionan creditos" ON public.creditos_usuarios
  FOR ALL USING (is_superuser_secure(auth.uid()));

-- Tabla: transacciones_creditos
DROP POLICY IF EXISTS "Superusers pueden ver transacciones" ON public.transacciones_creditos;
DROP POLICY IF EXISTS "Superusers pueden crear transacciones" ON public.transacciones_creditos;
DROP POLICY IF EXISTS "usuarios_ver_propias_transacciones" ON public.transacciones_creditos;

CREATE POLICY "Usuarios ven propias transacciones" ON public.transacciones_creditos
  FOR SELECT USING (auth.uid() = user_id OR is_superuser_secure(auth.uid()));

CREATE POLICY "Superusers gestionan transacciones" ON public.transacciones_creditos
  FOR ALL USING (is_superuser_secure(auth.uid()));

-- Tabla: indices_backup
DROP POLICY IF EXISTS "Superusers have full access to indices_backup" ON public.indices_backup;

CREATE POLICY "Superusers manage indices_backup" ON public.indices_backup
  FOR ALL USING (is_superuser_secure(auth.uid()));

-- Tabla: rls_policies_backup
DROP POLICY IF EXISTS "Superusers have full access to rls_policies_backup" ON public.rls_policies_backup;

CREATE POLICY "Superusers manage rls_policies_backup" ON public.rls_policies_backup
  FOR ALL USING (is_superuser_secure(auth.uid()));

-- Tabla: restricciones_urbanas
DROP POLICY IF EXISTS "Admin users can manage restricciones_urbanas" ON public.restricciones_urbanas;

CREATE POLICY "Admins manage restricciones_urbanas" ON public.restricciones_urbanas
  FOR ALL USING (is_admin_or_superuser(auth.uid()));

-- Tabla: talleres
DROP POLICY IF EXISTS "Admins pueden gestionar talleres" ON public.talleres;

CREATE POLICY "Admins manage talleres" ON public.talleres
  FOR ALL USING (is_admin_or_superuser(auth.uid()));

-- Tabla: rate_limit_log
DROP POLICY IF EXISTS "Admins pueden ver rate_limit_log" ON public.rate_limit_log;

CREATE POLICY "Admins view rate_limit_log" ON public.rate_limit_log
  FOR SELECT USING (is_admin_or_superuser(auth.uid()));

-- Tabla: data_deletion_audit
DROP POLICY IF EXISTS "Admins pueden ver audit" ON public.data_deletion_audit;

CREATE POLICY "Admins view deletion audit" ON public.data_deletion_audit
  FOR SELECT USING (is_admin_or_superuser(auth.uid()));

-- PASO 2: Ahora SÍ podemos eliminar funciones inseguras
DROP FUNCTION IF EXISTS public.is_superuser_optimized() CASCADE;
DROP FUNCTION IF EXISTS public.is_superuser_simple(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_superuser_safe_v2(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_user() CASCADE;

-- PASO 3: Agregar search_path a funciones SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.update_esquemas_xml_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_creditos_usuarios_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.enforce_single_active_certificate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog
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

CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
BEGIN
  DELETE FROM public.notificaciones 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$function$;

CREATE OR REPLACE FUNCTION public.run_automated_tasks()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
BEGIN
  PERFORM process_expired_trials();
  PERFORM cleanup_old_notifications();
  PERFORM check_document_expiration();
END;
$function$;

CREATE OR REPLACE FUNCTION public.registrar_cambio_estado_cotizacion()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO public.historial_cotizaciones (
      cotizacion_id, estado_anterior, estado_nuevo, cambiado_por
    ) VALUES (NEW.id, OLD.estado, NEW.estado, NEW.user_id);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.process_expired_trials()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
BEGIN
  UPDATE public.suscripciones 
  SET status = 'grace_period', grace_period_start = NOW(), 
      grace_period_end = NOW() + INTERVAL '90 days',
      cleanup_warning_sent = FALSE, final_warning_sent = FALSE
  WHERE status = 'trial' 
    AND (fecha_fin_prueba < NOW() OR fecha_vencimiento < NOW());
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_trial_dates()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog
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

CREATE OR REPLACE FUNCTION public.update_taller_rating()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
BEGIN
  UPDATE public.talleres 
  SET calificacion_promedio = (
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

CREATE OR REPLACE FUNCTION public.update_borrador_ultima_edicion()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
BEGIN
  NEW.ultima_edicion = now();
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- PASO 4: Auditoría
INSERT INTO public.security_audit_log (event_type, event_data)
VALUES ('security_migration_complete', jsonb_build_object(
  'date', now(),
  'changes', 'Dropped insecure role functions, updated RLS policies, added search_path'
));