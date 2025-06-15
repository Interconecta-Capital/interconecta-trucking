
-- FASE 2: Optimización de Tablas Secundarias
-- Optimizar políticas RLS en cartas_porte, ubicaciones, mercancias

-- Paso 1: Optimizar políticas en ubicaciones
DROP POLICY IF EXISTS "Users can access own ubicaciones" ON public.ubicaciones;
DROP POLICY IF EXISTS "Users can view own ubicaciones" ON public.ubicaciones;
DROP POLICY IF EXISTS "Users can insert ubicaciones" ON public.ubicaciones;
DROP POLICY IF EXISTS "Users can update ubicaciones" ON public.ubicaciones;

CREATE POLICY "ubicaciones_safe_access" 
  ON public.ubicaciones 
  FOR ALL 
  USING (
    -- Acceso a través de carta_porte asociada
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp 
      WHERE cp.id = ubicaciones.carta_porte_id 
      AND (cp.usuario_id = auth.uid() OR public.check_superuser_safe_v2(auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp 
      WHERE cp.id = ubicaciones.carta_porte_id 
      AND (cp.usuario_id = auth.uid() OR public.check_superuser_safe_v2(auth.uid()))
    )
  );

-- Paso 2: Optimizar políticas en mercancias
DROP POLICY IF EXISTS "Users can access own mercancias" ON public.mercancias;
DROP POLICY IF EXISTS "Users can view own mercancias" ON public.mercancias;
DROP POLICY IF EXISTS "Users can insert mercancias" ON public.mercancias;
DROP POLICY IF EXISTS "Users can update mercancias" ON public.mercancias;

CREATE POLICY "mercancias_safe_access" 
  ON public.mercancias 
  FOR ALL 
  USING (
    -- Acceso a través de carta_porte asociada
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp 
      WHERE cp.id = mercancias.carta_porte_id 
      AND (cp.usuario_id = auth.uid() OR public.check_superuser_safe_v2(auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp 
      WHERE cp.id = mercancias.carta_porte_id 
      AND (cp.usuario_id = auth.uid() OR public.check_superuser_safe_v2(auth.uid()))
    )
  );

-- Paso 3: Optimizar políticas en figuras_transporte
DROP POLICY IF EXISTS "Users can access own figuras" ON public.figuras_transporte;
DROP POLICY IF EXISTS "Users can view own figuras" ON public.figuras_transporte;

CREATE POLICY "figuras_transporte_safe_access" 
  ON public.figuras_transporte 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp 
      WHERE cp.id = figuras_transporte.carta_porte_id 
      AND (cp.usuario_id = auth.uid() OR public.check_superuser_safe_v2(auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp 
      WHERE cp.id = figuras_transporte.carta_porte_id 
      AND (cp.usuario_id = auth.uid() OR public.check_superuser_safe_v2(auth.uid()))
    )
  );

-- Paso 4: Optimizar políticas en autotransporte
DROP POLICY IF EXISTS "Users can access own autotransporte" ON public.autotransporte;

CREATE POLICY "autotransporte_safe_access" 
  ON public.autotransporte 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp 
      WHERE cp.id = autotransporte.carta_porte_id 
      AND (cp.usuario_id = auth.uid() OR public.check_superuser_safe_v2(auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp 
      WHERE cp.id = autotransporte.carta_porte_id 
      AND (cp.usuario_id = auth.uid() OR public.check_superuser_safe_v2(auth.uid()))
    )
  );

-- Paso 5: Crear índices adicionales para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_ubicaciones_carta_porte_id ON public.ubicaciones(carta_porte_id);
CREATE INDEX IF NOT EXISTS idx_mercancias_carta_porte_id ON public.mercancias(carta_porte_id);
CREATE INDEX IF NOT EXISTS idx_figuras_transporte_carta_porte_id ON public.figuras_transporte(carta_porte_id);
CREATE INDEX IF NOT EXISTS idx_autotransporte_carta_porte_id ON public.autotransporte(carta_porte_id);

-- Paso 6: Optimizar tabla de notificaciones
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notificaciones;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notificaciones;

CREATE POLICY "notificaciones_safe_access" 
  ON public.notificaciones 
  FOR ALL 
  USING (
    auth.uid() = user_id OR 
    public.check_superuser_safe_v2(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    public.check_superuser_safe_v2(auth.uid())
  );

-- Paso 7: Limpiar registros antiguos para optimizar rendimiento
DELETE FROM public.notificaciones WHERE created_at < now() - interval '30 days' AND leida = true;
DELETE FROM public.tracking_carta_porte WHERE created_at < now() - interval '90 days';

-- Paso 8: Crear índices para optimizar consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_notificaciones_user_id_leida ON public.notificaciones(user_id, leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_created_at ON public.notificaciones(created_at);
CREATE INDEX IF NOT EXISTS idx_tracking_carta_porte_uuid ON public.tracking_carta_porte(uuid_fiscal);
CREATE INDEX IF NOT EXISTS idx_cartas_porte_status ON public.cartas_porte(status);
CREATE INDEX IF NOT EXISTS idx_cartas_porte_created_at ON public.cartas_porte(created_at);
