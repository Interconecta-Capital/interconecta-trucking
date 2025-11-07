-- ============================================================================
-- FASE 1A: MIGRACIÓN DE POLÍTICAS RLS SEGURAS
-- ============================================================================
-- Prioridad: CRÍTICA
-- Objetivo: Eliminar vulnerabilidad de escalada de privilegios
-- Impacto: 7 tablas con políticas inseguras
-- ============================================================================

-- 1. TABLA: conductores
DROP POLICY IF EXISTS "conductores_unificados" ON public.conductores;
DROP POLICY IF EXISTS "conductores_simple" ON public.conductores;
DROP POLICY IF EXISTS "conductores_unified_access" ON public.conductores;

CREATE POLICY "conductores_user_access"
ON public.conductores
FOR ALL
TO authenticated
USING (
  auth.uid() = user_id 
  OR is_superuser_secure(auth.uid())
)
WITH CHECK (
  auth.uid() = user_id 
  OR is_superuser_secure(auth.uid())
);

-- 2. TABLA: vehiculos
DROP POLICY IF EXISTS "vehiculos_unificados" ON public.vehiculos;
DROP POLICY IF EXISTS "vehiculos_simple" ON public.vehiculos;
DROP POLICY IF EXISTS "vehiculos_unified_access" ON public.vehiculos;

CREATE POLICY "vehiculos_user_access"
ON public.vehiculos
FOR ALL
TO authenticated
USING (
  auth.uid() = user_id 
  OR is_superuser_secure(auth.uid())
)
WITH CHECK (
  auth.uid() = user_id 
  OR is_superuser_secure(auth.uid())
);

-- 3. TABLA: socios
DROP POLICY IF EXISTS "socios_unificados" ON public.socios;
DROP POLICY IF EXISTS "socios_simple" ON public.socios;
DROP POLICY IF EXISTS "socios_unified_access" ON public.socios;

CREATE POLICY "socios_user_access"
ON public.socios
FOR ALL
TO authenticated
USING (
  auth.uid() = user_id 
  OR is_superuser_secure(auth.uid())
)
WITH CHECK (
  auth.uid() = user_id 
  OR is_superuser_secure(auth.uid())
);

-- 4. TABLA: cartas_porte
DROP POLICY IF EXISTS "cartas_porte_simple" ON public.cartas_porte;
DROP POLICY IF EXISTS "cartas_porte_tenant_isolation" ON public.cartas_porte;
DROP POLICY IF EXISTS "cartas_porte_acceso_via_tenant" ON public.cartas_porte;

CREATE POLICY "cartas_porte_user_access"
ON public.cartas_porte
FOR ALL
TO authenticated
USING (
  auth.uid() = usuario_id 
  OR is_superuser_secure(auth.uid())
)
WITH CHECK (
  auth.uid() = usuario_id 
  OR is_superuser_secure(auth.uid())
);

-- 5. TABLA: notificaciones
DROP POLICY IF EXISTS "notificaciones_simple" ON public.notificaciones;
DROP POLICY IF EXISTS "notificaciones_unificadas" ON public.notificaciones;

CREATE POLICY "notificaciones_user_access"
ON public.notificaciones
FOR ALL
TO authenticated
USING (
  auth.uid() = user_id 
  OR is_superuser_secure(auth.uid())
)
WITH CHECK (
  auth.uid() = user_id 
  OR is_superuser_secure(auth.uid())
);

-- 6. TABLA: ubicaciones
DROP POLICY IF EXISTS "ubicaciones_acceso_carta_porte" ON public.ubicaciones;
DROP POLICY IF EXISTS "ubicaciones_tenant_isolation" ON public.ubicaciones;

CREATE POLICY "ubicaciones_user_access"
ON public.ubicaciones
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cartas_porte cp
    WHERE cp.id = ubicaciones.carta_porte_id
    AND (cp.usuario_id = auth.uid() OR is_superuser_secure(auth.uid()))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cartas_porte cp
    WHERE cp.id = ubicaciones.carta_porte_id
    AND (cp.usuario_id = auth.uid() OR is_superuser_secure(auth.uid()))
  )
);

-- 7. TABLA: mercancias
DROP POLICY IF EXISTS "mercancias_acceso_carta_porte" ON public.mercancias;
DROP POLICY IF EXISTS "mercancias_tenant_isolation" ON public.mercancias;

CREATE POLICY "mercancias_user_access"
ON public.mercancias
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cartas_porte cp
    WHERE cp.id = mercancias.carta_porte_id
    AND (cp.usuario_id = auth.uid() OR is_superuser_secure(auth.uid()))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cartas_porte cp
    WHERE cp.id = mercancias.carta_porte_id
    AND (cp.usuario_id = auth.uid() OR is_superuser_secure(auth.uid()))
  )
);

-- ============================================================================
-- AUDITORÍA
-- ============================================================================
INSERT INTO public.rls_refactor_audit (fase, accion, tabla_afectada, detalles)
VALUES 
  ('fase_1_iso27001', 'migracion_rls_segura', 'conductores', '{"control": "ISO 27001 A.9.4"}'::jsonb),
  ('fase_1_iso27001', 'migracion_rls_segura', 'vehiculos', '{"control": "ISO 27001 A.9.4"}'::jsonb),
  ('fase_1_iso27001', 'migracion_rls_segura', 'socios', '{"control": "ISO 27001 A.9.4"}'::jsonb),
  ('fase_1_iso27001', 'migracion_rls_segura', 'cartas_porte', '{"control": "ISO 27001 A.9.4"}'::jsonb),
  ('fase_1_iso27001', 'migracion_rls_segura', 'notificaciones', '{"control": "ISO 27001 A.9.4"}'::jsonb),
  ('fase_1_iso27001', 'migracion_rls_segura', 'ubicaciones', '{"control": "ISO 27001 A.9.4"}'::jsonb),
  ('fase_1_iso27001', 'migracion_rls_segura', 'mercancias', '{"control": "ISO 27001 A.9.4"}'::jsonb);