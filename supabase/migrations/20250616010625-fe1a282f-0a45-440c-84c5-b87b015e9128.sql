

-- CORRECCIÓN CRÍTICA: Eliminar recursión infinita en políticas RLS
-- Este error está causando cientos de errores por segundo y afectando el rendimiento

-- Paso 1: Eliminar todas las políticas problemáticas que causan recursión
DROP POLICY IF EXISTS "usuarios_safe_access" ON public.usuarios;
DROP POLICY IF EXISTS "conductores_safe_access" ON public.conductores;
DROP POLICY IF EXISTS "vehiculos_safe_access" ON public.vehiculos;
DROP POLICY IF EXISTS "socios_safe_access" ON public.socios;
DROP POLICY IF EXISTS "cartas_porte_safe_access" ON public.cartas_porte;

-- Paso 2: Crear políticas simplificadas SIN recursión usando auth.uid() directamente
-- Estas políticas son seguras y no causan recursión

-- Política para usuarios - acceso directo sin funciones que puedan causar recursión
CREATE POLICY "usuarios_direct_access" 
  ON public.usuarios 
  FOR ALL 
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Políticas para entidades principales - usando user_id directo
CREATE POLICY "conductores_direct_access" 
  ON public.conductores 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "vehiculos_direct_access" 
  ON public.vehiculos 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "socios_direct_access" 
  ON public.socios 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para cartas de porte usando usuario_id directo
CREATE POLICY "cartas_porte_direct_access" 
  ON public.cartas_porte 
  FOR ALL 
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- Paso 3: Limpiar logs de rate limiting antiguos para mejorar rendimiento
DELETE FROM public.rate_limit_log WHERE created_at < now() - interval '1 hour';

-- Paso 4: Optimizar índices para mejorar rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id_optimized ON public.usuarios(auth_user_id) WHERE auth_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conductores_user_id_optimized ON public.conductores(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehiculos_user_id_optimized ON public.vehiculos(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_socios_user_id_optimized ON public.socios(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cartas_porte_usuario_id_optimized ON public.cartas_porte(usuario_id) WHERE usuario_id IS NOT NULL;

