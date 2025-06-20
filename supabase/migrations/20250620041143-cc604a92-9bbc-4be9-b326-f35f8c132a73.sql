
-- LIMPIEZA Y UNIFICACIÓN COMPLETA DE POLÍTICAS RLS - VERSIÓN CORREGIDA
-- Paso 1: Eliminar TODAS las políticas dependientes primero

-- Eliminar políticas que dependen de funciones que vamos a eliminar
DROP POLICY IF EXISTS "Admins can view security logs" ON public.security_audit_log;
DROP POLICY IF EXISTS "Admins can view rate limit logs" ON public.rate_limit_log;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.suscripciones;
DROP POLICY IF EXISTS "Users can view own blocks" ON public.bloqueos_usuario;

-- Eliminar el resto de políticas en suscripciones (todas las duplicadas)
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.suscripciones;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.suscripciones;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.suscripciones;
DROP POLICY IF EXISTS "Authenticated users can view subscriptions" ON public.suscripciones;
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON public.suscripciones;
DROP POLICY IF EXISTS "Users can view subscriptions" ON public.suscripciones;

-- Eliminar políticas conflictivas en otras tablas principales
DROP POLICY IF EXISTS "usuarios_safe_access" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_direct_access" ON public.usuarios;
DROP POLICY IF EXISTS "Users can access own data only" ON public.usuarios;
DROP POLICY IF EXISTS "Safe user data access" ON public.usuarios;
DROP POLICY IF EXISTS "Users can view own tenant data" ON public.usuarios;
DROP POLICY IF EXISTS "Users can insert own tenant data" ON public.usuarios;
DROP POLICY IF EXISTS "Users can update own tenant data" ON public.usuarios;

DROP POLICY IF EXISTS "conductores_safe_access" ON public.conductores;
DROP POLICY IF EXISTS "conductores_direct_access" ON public.conductores;
DROP POLICY IF EXISTS "Users can access own conductores" ON public.conductores;
DROP POLICY IF EXISTS "Safe conductores access" ON public.conductores;

DROP POLICY IF EXISTS "vehiculos_safe_access" ON public.vehiculos;
DROP POLICY IF EXISTS "vehiculos_direct_access" ON public.vehiculos;
DROP POLICY IF EXISTS "Users can access own vehiculos" ON public.vehiculos;
DROP POLICY IF EXISTS "Safe vehiculos access" ON public.vehiculos;

DROP POLICY IF EXISTS "socios_safe_access" ON public.socios;
DROP POLICY IF EXISTS "socios_direct_access" ON public.socios;
DROP POLICY IF EXISTS "Users can access own socios" ON public.socios;
DROP POLICY IF EXISTS "Safe socios access" ON public.socios;

DROP POLICY IF EXISTS "cartas_porte_safe_access" ON public.cartas_porte;
DROP POLICY IF EXISTS "cartas_porte_direct_access" ON public.cartas_porte;
DROP POLICY IF EXISTS "Users can view own tenant cartas_porte" ON public.cartas_porte;

-- Eliminar políticas en planes
DROP POLICY IF EXISTS "Authenticated users can view all plans" ON public.planes_suscripcion;
DROP POLICY IF EXISTS "Public plans access" ON public.planes_suscripcion;

-- Paso 2: Ahora sí podemos limpiar funciones de seguridad conflictivas
DROP FUNCTION IF EXISTS public.check_superuser_safe(uuid);
DROP FUNCTION IF EXISTS public.check_superuser_safe_v2(uuid);
DROP FUNCTION IF EXISTS public.get_user_tenant_safe(uuid);
DROP FUNCTION IF EXISTS public.is_superuser_safe();
DROP FUNCTION IF EXISTS public.is_current_user_admin();

-- Crear función de seguridad unificada y simple
CREATE OR REPLACE FUNCTION public.check_user_access(user_uuid uuid)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar acceso directo del usuario autenticado
  RETURN COALESCE(auth.uid() = user_uuid, false);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Función para verificar admin/superuser desde metadata de auth.users
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT raw_user_meta_data->>'is_admin' = 'true' OR raw_user_meta_data->>'is_superuser' = 'true'
     FROM auth.users 
     WHERE id = auth.uid()), 
    false
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Paso 3: Crear políticas RLS UNIFICADAS y CONSISTENTES

-- Políticas para usuarios (tabla principal)
CREATE POLICY "users_unified_access" 
  ON public.usuarios 
  FOR ALL 
  USING (
    public.check_user_access(auth_user_id) OR 
    public.is_admin_user()
  )
  WITH CHECK (
    public.check_user_access(auth_user_id) OR 
    public.is_admin_user()
  );

-- Políticas para conductores
CREATE POLICY "conductores_unified_access" 
  ON public.conductores 
  FOR ALL 
  USING (
    public.check_user_access(user_id) OR 
    public.is_admin_user()
  )
  WITH CHECK (
    public.check_user_access(user_id) OR 
    public.is_admin_user()
  );

-- Políticas para vehículos
CREATE POLICY "vehiculos_unified_access" 
  ON public.vehiculos 
  FOR ALL 
  USING (
    public.check_user_access(user_id) OR 
    public.is_admin_user()
  )
  WITH CHECK (
    public.check_user_access(user_id) OR 
    public.is_admin_user()
  );

-- Políticas para socios
CREATE POLICY "socios_unified_access" 
  ON public.socios 
  FOR ALL 
  USING (
    public.check_user_access(user_id) OR 
    public.is_admin_user()
  )
  WITH CHECK (
    public.check_user_access(user_id) OR 
    public.is_admin_user()
  );

-- Políticas para cartas de porte
CREATE POLICY "cartas_porte_unified_access" 
  ON public.cartas_porte 
  FOR ALL 
  USING (
    public.check_user_access(usuario_id) OR 
    public.is_admin_user()
  )
  WITH CHECK (
    public.check_user_access(usuario_id) OR 
    public.is_admin_user()
  );

-- Políticas CRÍTICAS para suscripciones (acceso propio únicamente)
CREATE POLICY "suscripciones_user_access" 
  ON public.suscripciones 
  FOR SELECT 
  USING (public.check_user_access(user_id));

CREATE POLICY "suscripciones_user_insert" 
  ON public.suscripciones 
  FOR INSERT 
  WITH CHECK (public.check_user_access(user_id));

CREATE POLICY "suscripciones_user_update" 
  ON public.suscripciones 
  FOR UPDATE 
  USING (public.check_user_access(user_id))
  WITH CHECK (public.check_user_access(user_id));

-- Políticas para planes de suscripción (lectura pública para usuarios autenticados)
CREATE POLICY "planes_public_read" 
  ON public.planes_suscripcion 
  FOR SELECT 
  TO authenticated 
  USING (activo = true);

-- Recrear políticas para tablas de auditoría y logs
CREATE POLICY "audit_logs_admin_access" 
  ON public.security_audit_log 
  FOR ALL 
  USING (public.is_admin_user());

CREATE POLICY "rate_limit_logs_admin_access" 
  ON public.rate_limit_log 
  FOR ALL 
  USING (public.is_admin_user());

-- Políticas para bloqueos de usuario
CREATE POLICY "bloqueos_user_view" 
  ON public.bloqueos_usuario 
  FOR SELECT 
  USING (
    public.check_user_access(user_id) OR 
    public.is_admin_user()
  );

-- Paso 4: Asegurar que RLS esté habilitado en todas las tablas críticas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conductores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.socios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartas_porte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planes_suscripcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloqueos_usuario ENABLE ROW LEVEL SECURITY;

-- Paso 5: Crear índices optimizados para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id_unified ON public.usuarios(auth_user_id) WHERE auth_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conductores_user_id_unified ON public.conductores(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehiculos_user_id_unified ON public.vehiculos(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_socios_user_id_unified ON public.socios(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cartas_porte_usuario_id_unified ON public.cartas_porte(usuario_id) WHERE usuario_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_suscripciones_user_id_unified ON public.suscripciones(user_id) WHERE user_id IS NOT NULL;

-- Paso 6: Limpiar logs antiguos para mejorar rendimiento
DELETE FROM public.rate_limit_log WHERE created_at < now() - interval '24 hours';
