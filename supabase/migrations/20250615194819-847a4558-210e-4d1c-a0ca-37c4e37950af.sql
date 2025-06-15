
-- CORRECCIÓN URGENTE: Eliminar recursión infinita en políticas RLS
-- Paso 1: Eliminar políticas problemáticas que causan recursión

-- Eliminar políticas problemáticas en usuarios
DROP POLICY IF EXISTS "Users can view own tenant data" ON public.usuarios;
DROP POLICY IF EXISTS "Users can insert own tenant data" ON public.usuarios;
DROP POLICY IF EXISTS "Users can update own tenant data" ON public.usuarios;
DROP POLICY IF EXISTS "Users can access own data only" ON public.usuarios;
DROP POLICY IF EXISTS "Safe user data access" ON public.usuarios;

-- Eliminar políticas problemáticas en otras tablas críticas
DROP POLICY IF EXISTS "Users can access own conductores" ON public.conductores;
DROP POLICY IF EXISTS "Users can access own vehiculos" ON public.vehiculos;
DROP POLICY IF EXISTS "Users can access own socios" ON public.socios;

-- Paso 2: Crear políticas optimizadas SIN recursión usando funciones seguras existentes

-- Política unificada para usuarios (sin recursión)
CREATE POLICY "usuarios_safe_access" 
  ON public.usuarios 
  FOR ALL 
  USING (
    auth.uid() = auth_user_id OR 
    public.check_superuser_safe_v2(auth.uid())
  )
  WITH CHECK (
    auth.uid() = auth_user_id OR 
    public.check_superuser_safe_v2(auth.uid())
  );

-- Políticas optimizadas para tablas críticas (sin recursión)
CREATE POLICY "conductores_safe_access" 
  ON public.conductores 
  FOR ALL 
  USING (
    auth.uid() = user_id OR 
    public.check_superuser_safe_v2(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    public.check_superuser_safe_v2(auth.uid())
  );

CREATE POLICY "vehiculos_safe_access" 
  ON public.vehiculos 
  FOR ALL 
  USING (
    auth.uid() = user_id OR 
    public.check_superuser_safe_v2(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    public.check_superuser_safe_v2(auth.uid())
  );

CREATE POLICY "socios_safe_access" 
  ON public.socios 
  FOR ALL 
  USING (
    auth.uid() = user_id OR 
    public.check_superuser_safe_v2(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    public.check_superuser_safe_v2(auth.uid())
  );

-- Paso 3: Optimizar políticas en cartas_porte para evitar problemas similares
DROP POLICY IF EXISTS "Users can view own tenant cartas_porte" ON public.cartas_porte;
CREATE POLICY "cartas_porte_safe_access" 
  ON public.cartas_porte 
  FOR ALL 
  USING (
    auth.uid() = usuario_id OR 
    public.check_superuser_safe_v2(auth.uid())
  )
  WITH CHECK (
    auth.uid() = usuario_id OR 
    public.check_superuser_safe_v2(auth.uid())
  );

-- Paso 4: Limpiar logs de rate limiting antiguos para mejorar rendimiento
DELETE FROM public.rate_limit_log WHERE created_at < now() - interval '24 hours';

-- Paso 5: Crear índices para mejorar rendimiento en funciones seguras
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id ON public.usuarios(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_conductores_user_id ON public.conductores(user_id);
CREATE INDEX IF NOT EXISTS idx_vehiculos_user_id ON public.vehiculos(user_id);
CREATE INDEX IF NOT EXISTS idx_socios_user_id ON public.socios(user_id);
CREATE INDEX IF NOT EXISTS idx_cartas_porte_usuario_id ON public.cartas_porte(usuario_id);
