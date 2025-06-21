
-- FASE 3: Corrección de errores de seguridad (Versión corregida)

-- Paso 1: Crear primero la función de verificación de superusuario
CREATE OR REPLACE FUNCTION public.check_superuser_safe_v2(user_uuid uuid)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar directamente desde auth.users metadata (sin RLS)
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Paso 2: Habilitar RLS en tablas de auditoría y backup que no lo tienen
ALTER TABLE public.rls_policies_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indices_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rls_refactor_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unificacion_audit ENABLE ROW LEVEL SECURITY;

-- Paso 3: Crear políticas RLS para estas tablas (solo superusuarios pueden acceder)
CREATE POLICY "Only superusers can access rls_policies_backup" 
  ON public.rls_policies_backup 
  FOR ALL 
  USING (public.check_superuser_safe_v2(auth.uid()))
  WITH CHECK (public.check_superuser_safe_v2(auth.uid()));

CREATE POLICY "Only superusers can access indices_backup" 
  ON public.indices_backup 
  FOR ALL 
  USING (public.check_superuser_safe_v2(auth.uid()))
  WITH CHECK (public.check_superuser_safe_v2(auth.uid()));

CREATE POLICY "Only superusers can access rls_refactor_audit" 
  ON public.rls_refactor_audit 
  FOR ALL 
  USING (public.check_superuser_safe_v2(auth.uid()))
  WITH CHECK (public.check_superuser_safe_v2(auth.uid()));

CREATE POLICY "Only superusers can access unificacion_audit" 
  ON public.unificacion_audit 
  FOR ALL 
  USING (public.check_superuser_safe_v2(auth.uid()))
  WITH CHECK (public.check_superuser_safe_v2(auth.uid()));

-- Paso 4: Eliminar vista problemática con SECURITY DEFINER si existe
DROP VIEW IF EXISTS public.rls_analysis_view;

-- Paso 5: Limpiar logs antiguos para optimizar rendimiento
DELETE FROM public.rate_limit_log WHERE created_at < now() - interval '2 hours';

-- Comentario: Corrección de errores de seguridad para permitir implementación V2
-- Se crea primero la función de seguridad, luego se habilita RLS y se crean políticas
-- Las tablas de auditoría ahora tienen RLS habilitado con acceso solo para superusuarios
