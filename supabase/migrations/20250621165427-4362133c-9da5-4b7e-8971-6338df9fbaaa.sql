
-- =====================================================
-- FASE 1: LA GRAN UNIFICACIÓN - LIMPIEZA Y OPTIMIZACIÓN
-- Fecha: 2025-06-21
-- Propósito: Eliminar redundancia y crear políticas RLS optimizadas
-- =====================================================

-- 1. AUDITORÍA Y LIMPIEZA DE ÍNDICES DUPLICADOS
-- Eliminar índices redundantes identificados en los logs

-- Limpiar índices duplicados en conductores
DROP INDEX IF EXISTS idx_conductores_user_id_optimized;
DROP INDEX IF EXISTS idx_conductores_user_id_active;
DROP INDEX IF EXISTS idx_conductores_user_id_unified;

-- Limpiar índices duplicados en vehiculos
DROP INDEX IF EXISTS idx_vehiculos_user_id_optimized;
DROP INDEX IF EXISTS idx_vehiculos_user_id_active;
DROP INDEX IF EXISTS idx_vehiculos_user_id_unified;

-- Limpiar índices duplicados en socios
DROP INDEX IF EXISTS idx_socios_user_id_optimized;
DROP INDEX IF EXISTS idx_socios_user_id_active;
DROP INDEX IF EXISTS idx_socios_user_id_unified;

-- Limpiar índices duplicados en cartas_porte
DROP INDEX IF EXISTS idx_cartas_porte_usuario_id_optimized;
DROP INDEX IF EXISTS idx_cartas_porte_usuario_id_active;
DROP INDEX IF EXISTS idx_cartas_porte_usuario_id_unified;

-- Limpiar índices duplicados en usuarios
DROP INDEX IF EXISTS idx_usuarios_auth_user_id_optimized;
DROP INDEX IF EXISTS idx_usuarios_auth_user_id_active;
DROP INDEX IF EXISTS idx_usuarios_auth_user_id_unified;

-- 2. CREAR ÍNDICES OPTIMIZADOS ÚNICOS (solo los necesarios)
-- Un solo índice eficiente por tabla para consultas de usuario

CREATE INDEX IF NOT EXISTS idx_conductores_user_lookup ON public.conductores(user_id) WHERE user_id IS NOT NULL AND activo = true;
CREATE INDEX IF NOT EXISTS idx_vehiculos_user_lookup ON public.vehiculos(user_id) WHERE user_id IS NOT NULL AND activo = true;
CREATE INDEX IF NOT EXISTS idx_socios_user_lookup ON public.socios(user_id) WHERE user_id IS NOT NULL AND activo = true;
CREATE INDEX IF NOT EXISTS idx_cartas_porte_user_lookup ON public.cartas_porte(usuario_id) WHERE usuario_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_lookup ON public.usuarios(auth_user_id) WHERE auth_user_id IS NOT NULL;

-- 3. DEMOLICIÓN CONTROLADA DE POLÍTICAS REDUNDANTES
-- Eliminar todas las políticas actuales para empezar desde cero

-- Usuarios
DROP POLICY IF EXISTS "usuarios_acceso_directo" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_direct_access" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_safe_access" ON public.usuarios;
DROP POLICY IF EXISTS "Users can access own data only" ON public.usuarios;

-- Conductores
DROP POLICY IF EXISTS "conductores_acceso_directo" ON public.conductores;
DROP POLICY IF EXISTS "conductores_direct_access" ON public.conductores;
DROP POLICY IF EXISTS "conductores_safe_access" ON public.conductores;
DROP POLICY IF EXISTS "conductores_user_access" ON public.conductores;
DROP POLICY IF EXISTS "Users can access own conductores" ON public.conductores;

-- Vehiculos
DROP POLICY IF EXISTS "vehiculos_acceso_directo" ON public.vehiculos;
DROP POLICY IF EXISTS "vehiculos_direct_access" ON public.vehiculos;
DROP POLICY IF EXISTS "vehiculos_safe_access" ON public.vehiculos;
DROP POLICY IF EXISTS "vehiculos_user_access" ON public.vehiculos;
DROP POLICY IF EXISTS "Users can access own vehiculos" ON public.vehiculos;

-- Socios
DROP POLICY IF EXISTS "socios_acceso_directo" ON public.socios;
DROP POLICY IF EXISTS "socios_direct_access" ON public.socios;
DROP POLICY IF EXISTS "socios_safe_access" ON public.socios;
DROP POLICY IF EXISTS "socios_user_access" ON public.socios;
DROP POLICY IF EXISTS "Users can access own socios" ON public.socios;

-- Cartas Porte
DROP POLICY IF EXISTS "cartas_porte_acceso_directo" ON public.cartas_porte;
DROP POLICY IF EXISTS "cartas_porte_direct_access" ON public.cartas_porte;
DROP POLICY IF EXISTS "cartas_porte_safe_access" ON public.cartas_porte;
DROP POLICY IF EXISTS "cartas_porte_user_access" ON public.cartas_porte;

-- Notificaciones
DROP POLICY IF EXISTS "notificaciones_acceso_directo" ON public.notificaciones;
DROP POLICY IF EXISTS "notificaciones_safe_access" ON public.notificaciones;

-- 4. RECONSTRUCCIÓN CON POLÍTICAS SIMPLES Y DE ALTO RENDIMIENTO
-- Implementar la plantilla SQL definitiva con máximo rendimiento

-- Función optimizada para verificar superusuario (sin RLS)
CREATE OR REPLACE FUNCTION public.is_superuser_optimized()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT raw_user_meta_data->>'is_superuser' = 'true' 
     FROM auth.users 
     WHERE id = auth.uid()), 
    false
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- USUARIOS: Política unificada optimizada
CREATE POLICY "usuarios_unificados"
ON public.usuarios
FOR ALL
USING ((SELECT auth.uid()) = auth_user_id OR public.is_superuser_optimized())
WITH CHECK ((SELECT auth.uid()) = auth_user_id OR public.is_superuser_optimized());

-- CONDUCTORES: Política unificada optimizada
CREATE POLICY "conductores_unificados"
ON public.conductores
FOR ALL
USING ((SELECT auth.uid()) = user_id OR public.is_superuser_optimized())
WITH CHECK ((SELECT auth.uid()) = user_id OR public.is_superuser_optimized());

-- VEHICULOS: Política unificada optimizada
CREATE POLICY "vehiculos_unificados"
ON public.vehiculos
FOR ALL
USING ((SELECT auth.uid()) = user_id OR public.is_superuser_optimized())
WITH CHECK ((SELECT auth.uid()) = user_id OR public.is_superuser_optimized());

-- SOCIOS: Política unificada optimizada
CREATE POLICY "socios_unificados"
ON public.socios
FOR ALL
USING ((SELECT auth.uid()) = user_id OR public.is_superuser_optimized())
WITH CHECK ((SELECT auth.uid()) = user_id OR public.is_superuser_optimized());

-- CARTAS PORTE: Política unificada optimizada
CREATE POLICY "cartas_porte_unificados"
ON public.cartas_porte
FOR ALL
USING ((SELECT auth.uid()) = usuario_id OR public.is_superuser_optimized())
WITH CHECK ((SELECT auth.uid()) = usuario_id OR public.is_superuser_optimized());

-- NOTIFICACIONES: Política unificada optimizada
CREATE POLICY "notificaciones_unificadas"
ON public.notificaciones
FOR ALL
USING ((SELECT auth.uid()) = user_id OR public.is_superuser_optimized())
WITH CHECK ((SELECT auth.uid()) = user_id OR public.is_superuser_optimized());

-- 5. OPTIMIZACIÓN DE TABLAS SECUNDARIAS
-- Políticas para ubicaciones (via carta_porte)
DROP POLICY IF EXISTS "ubicaciones_acceso_via_carta_porte" ON public.ubicaciones;
CREATE POLICY "ubicaciones_unificadas"
ON public.ubicaciones
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.cartas_porte cp 
    WHERE cp.id = ubicaciones.carta_porte_id 
    AND ((SELECT auth.uid()) = cp.usuario_id OR public.is_superuser_optimized())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cartas_porte cp 
    WHERE cp.id = ubicaciones.carta_porte_id 
    AND ((SELECT auth.uid()) = cp.usuario_id OR public.is_superuser_optimized())
  )
);

-- Políticas para mercancías (via carta_porte)
DROP POLICY IF EXISTS "mercancias_acceso_via_carta_porte" ON public.mercancias;
CREATE POLICY "mercancias_unificadas"
ON public.mercancias
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.cartas_porte cp 
    WHERE cp.id = mercancias.carta_porte_id 
    AND ((SELECT auth.uid()) = cp.usuario_id OR public.is_superuser_optimized())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cartas_porte cp 
    WHERE cp.id = mercancias.carta_porte_id 
    AND ((SELECT auth.uid()) = cp.usuario_id OR public.is_superuser_optimized())
  )
);

-- 6. LIMPIEZA FINAL Y OPTIMIZACIÓN
-- Limpiar logs antiguos para mejorar rendimiento
DELETE FROM public.rate_limit_log WHERE created_at < now() - interval '1 hour';

-- Crear tabla para auditoría de la unificación
CREATE TABLE IF NOT EXISTS public.unificacion_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fase TEXT NOT NULL,
  accion TEXT NOT NULL,
  detalles JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registrar finalización de Fase 1
INSERT INTO public.unificacion_audit (fase, accion, detalles)
VALUES ('fase_1', 'unificacion_completada', jsonb_build_object(
  'descripcion', 'Políticas RLS unificadas y optimizadas',
  'politicas_eliminadas', 'Todas las políticas redundantes eliminadas',
  'politicas_creadas', 'Políticas unificadas usando (SELECT auth.uid())',
  'indices_optimizados', 'Índices duplicados eliminados, índices únicos creados',
  'performance_improvement', 'Eliminación de reevaluaciones innecesarias de auth.uid()',
  'timestamp', NOW()
));
