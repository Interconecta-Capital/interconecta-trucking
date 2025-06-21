
-- =====================================================
-- FASE 1: ELIMINACIÓN DE POLÍTICAS PROBLEMÁTICAS
-- Fecha: 2025-06-21
-- Propósito: Eliminar políticas que causan recursión infinita
-- =====================================================

-- 1. Registrar inicio de Fase 1
INSERT INTO public.rls_refactor_audit (fase, accion, detalles)
VALUES ('fase_1', 'inicio_eliminacion', jsonb_build_object(
  'descripcion', 'Eliminando políticas problemáticas que causan recursión infinita',
  'strategy', 'Reemplazar con políticas directas usando auth.uid()',
  'timestamp', NOW()
));

-- 2. ELIMINAR POLÍTICAS PROBLEMÁTICAS EN USUARIOS
-- Estas políticas usan funciones que causan recursión
DROP POLICY IF EXISTS "usuarios_safe_access" ON public.usuarios;
DROP POLICY IF EXISTS "Safe user data access" ON public.usuarios;
DROP POLICY IF EXISTS "Users can access own data only" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_direct_access" ON public.usuarios;

-- 3. ELIMINAR POLÍTICAS PROBLEMÁTICAS EN CONDUCTORES
DROP POLICY IF EXISTS "conductores_safe_access" ON public.conductores;
DROP POLICY IF EXISTS "Safe conductores access" ON public.conductores;
DROP POLICY IF EXISTS "Users can access own conductores" ON public.conductores;
DROP POLICY IF EXISTS "conductores_direct_access" ON public.conductores;
DROP POLICY IF EXISTS "conductores_user_access" ON public.conductores;

-- 4. ELIMINAR POLÍTICAS PROBLEMÁTICAS EN VEHICULOS
DROP POLICY IF EXISTS "vehiculos_safe_access" ON public.vehiculos;
DROP POLICY IF EXISTS "Safe vehiculos access" ON public.vehiculos;
DROP POLICY IF EXISTS "Users can access own vehiculos" ON public.vehiculos;
DROP POLICY IF EXISTS "vehiculos_direct_access" ON public.vehiculos;
DROP POLICY IF EXISTS "vehiculos_user_access" ON public.vehiculos;

-- 5. ELIMINAR POLÍTICAS PROBLEMÁTICAS EN SOCIOS
DROP POLICY IF EXISTS "socios_safe_access" ON public.socios;
DROP POLICY IF EXISTS "Safe socios access" ON public.socios;
DROP POLICY IF EXISTS "Users can access own socios" ON public.socios;
DROP POLICY IF EXISTS "socios_direct_access" ON public.socios;
DROP POLICY IF EXISTS "socios_user_access" ON public.socios;

-- 6. ELIMINAR POLÍTICAS PROBLEMÁTICAS EN CARTAS_PORTE
DROP POLICY IF EXISTS "cartas_porte_safe_access" ON public.cartas_porte;
DROP POLICY IF EXISTS "cartas_porte_user_access" ON public.cartas_porte;
DROP POLICY IF EXISTS "cartas_porte_direct_access" ON public.cartas_porte;

-- 7. ELIMINAR POLÍTICAS PROBLEMÁTICAS EN TABLAS SECUNDARIAS
DROP POLICY IF EXISTS "ubicaciones_safe_access" ON public.ubicaciones;
DROP POLICY IF EXISTS "ubicaciones_carta_porte_access" ON public.ubicaciones;
DROP POLICY IF EXISTS "mercancias_safe_access" ON public.mercancias;
DROP POLICY IF EXISTS "mercancias_carta_porte_access" ON public.mercancias;
DROP POLICY IF EXISTS "figuras_transporte_safe_access" ON public.figuras_transporte;
DROP POLICY IF EXISTS "autotransporte_safe_access" ON public.autotransporte;
DROP POLICY IF EXISTS "notificaciones_safe_access" ON public.notificaciones;

-- 8. CREAR POLÍTICAS DIRECTAS Y SEGURAS (SIN RECURSIÓN)
-- Política simple para usuarios - acceso directo por auth_user_id
CREATE POLICY "usuarios_acceso_directo" 
  ON public.usuarios 
  FOR ALL 
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Políticas simples para entidades principales - acceso directo por user_id
CREATE POLICY "conductores_acceso_directo" 
  ON public.conductores 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "vehiculos_acceso_directo" 
  ON public.vehiculos 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "socios_acceso_directo" 
  ON public.socios 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política simple para cartas de porte
CREATE POLICY "cartas_porte_acceso_directo" 
  ON public.cartas_porte 
  FOR ALL 
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- Políticas para tablas secundarias - acceso a través de carta_porte
CREATE POLICY "ubicaciones_acceso_via_carta_porte" 
  ON public.ubicaciones 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp 
      WHERE cp.id = ubicaciones.carta_porte_id 
      AND cp.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp 
      WHERE cp.id = ubicaciones.carta_porte_id 
      AND cp.usuario_id = auth.uid()
    )
  );

CREATE POLICY "mercancias_acceso_via_carta_porte" 
  ON public.mercancias 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp 
      WHERE cp.id = mercancias.carta_porte_id 
      AND cp.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp 
      WHERE cp.id = mercancias.carta_porte_id 
      AND cp.usuario_id = auth.uid()
    )
  );

CREATE POLICY "figuras_transporte_acceso_via_carta_porte" 
  ON public.figuras_transporte 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp 
      WHERE cp.id = figuras_transporte.carta_porte_id 
      AND cp.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp 
      WHERE cp.id = figuras_transporte.carta_porte_id 
      AND cp.usuario_id = auth.uid()
    )
  );

CREATE POLICY "autotransporte_acceso_via_carta_porte" 
  ON public.autotransporte 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp 
      WHERE cp.id = autotransporte.carta_porte_id 
      AND cp.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp 
      WHERE cp.id = autotransporte.carta_porte_id 
      AND cp.usuario_id = auth.uid()
    )
  );

-- Política simple para notificaciones
CREATE POLICY "notificaciones_acceso_directo" 
  ON public.notificaciones 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. LIMPIAR FUNCIONES PROBLEMÁTICAS (OPCIONAL - solo si causan problemas)
-- Estas funciones pueden estar causando recursión, las eliminaremos si existen
DROP FUNCTION IF EXISTS public.check_superuser_safe_v2(uuid);
DROP FUNCTION IF EXISTS public.check_superuser_safe(uuid);
DROP FUNCTION IF EXISTS public.get_user_tenant_safe(uuid);
DROP FUNCTION IF EXISTS public.is_user_admin(uuid);

-- 10. CREAR FUNCIÓN SIMPLE PARA SUPERUSUARIO (SIN RECURSIÓN)
-- Esta función NO usa tablas con RLS, solo auth.users
CREATE OR REPLACE FUNCTION public.is_superuser_simple(user_uuid uuid)
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

-- 11. OPTIMIZAR ÍNDICES PARA MEJORAR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id_active ON public.usuarios(auth_user_id) WHERE auth_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conductores_user_id_active ON public.conductores(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehiculos_user_id_active ON public.vehiculos(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_socios_user_id_active ON public.socios(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cartas_porte_usuario_id_active ON public.cartas_porte(usuario_id) WHERE usuario_id IS NOT NULL;

-- 12. LIMPIAR LOGS ANTIGUOS PARA MEJORAR RENDIMIENTO
DELETE FROM public.rate_limit_log WHERE created_at < now() - interval '2 hours';

-- 13. REGISTRAR FINALIZACIÓN DE FASE 1
INSERT INTO public.rls_refactor_audit (fase, accion, detalles)
VALUES ('fase_1', 'eliminacion_completada', jsonb_build_object(
  'descripcion', 'Políticas problemáticas eliminadas y reemplazadas',
  'politicas_eliminadas', 'Todas las políticas *_safe_access eliminadas',
  'politicas_creadas', 'Políticas directas usando auth.uid() creadas',
  'funciones_limpias', 'Funciones problemáticas eliminadas',
  'indices_optimizados', 'Índices activos creados para mejor rendimiento',
  'timestamp', NOW()
));
