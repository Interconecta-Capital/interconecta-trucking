
-- SOLUCIÓN DEFINITIVA: Eliminar todas las políticas problemáticas y crear políticas seguras
-- Este error está causando la recursión infinita y debe corregirse inmediatamente

-- Paso 1: Eliminar todas las políticas problemáticas en usuarios
DROP POLICY IF EXISTS "usuarios_safe_access" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_direct_access" ON public.usuarios;
DROP POLICY IF EXISTS "Users can access own data only" ON public.usuarios;

-- Paso 2: Crear política simple y segura para usuarios
CREATE POLICY "usuarios_basic_access" 
  ON public.usuarios 
  FOR ALL 
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Paso 3: Asegurar que las políticas de cartas_porte sean compatibles
DROP POLICY IF EXISTS "cartas_porte_safe_access" ON public.cartas_porte;
DROP POLICY IF EXISTS "cartas_porte_direct_access" ON public.cartas_porte;

CREATE POLICY "cartas_porte_basic_access" 
  ON public.cartas_porte 
  FOR ALL 
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- Paso 4: Limpiar logs antiguos para mejorar rendimiento
DELETE FROM public.rate_limit_log WHERE created_at < now() - interval '2 hours';
