-- ================================================================
-- FASE 1: CORRECCIÓN DE POLÍTICAS RLS PELIGROSAS (CORREGIDO)
-- ================================================================

-- 1. SUSCRIPCIONES: Eliminar política peligrosa si existe
DROP POLICY IF EXISTS "System can manage all subscriptions" ON public.suscripciones;

-- 2. PAGOS: Limpiar y recrear políticas
DROP POLICY IF EXISTS "System can manage all payments" ON public.pagos;
DROP POLICY IF EXISTS "Users can view their own payments" ON public.pagos;
DROP POLICY IF EXISTS "Users can create their own payments" ON public.pagos;

CREATE POLICY "Users can view their own payments"
ON public.pagos
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
ON public.pagos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. BLOQUEOS_USUARIO: Limpiar y recrear política
DROP POLICY IF EXISTS "System can manage all blocks" ON public.bloqueos_usuario;
DROP POLICY IF EXISTS "Users can view only their own blocks" ON public.bloqueos_usuario;

CREATE POLICY "Users can view only their own blocks"
ON public.bloqueos_usuario
FOR SELECT
USING (auth.uid() = user_id);

-- 4. TRACKING_CARTA_PORTE: Limpiar y recrear política
DROP POLICY IF EXISTS "Allow all operations on tracking_carta_porte" ON public.tracking_carta_porte;
DROP POLICY IF EXISTS "Users can manage their own tracking data" ON public.tracking_carta_porte;

CREATE POLICY "Users can manage their own tracking data"
ON public.tracking_carta_porte
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.cartas_porte cp
    WHERE cp.id = tracking_carta_porte.carta_porte_id
    AND cp.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cartas_porte cp
    WHERE cp.id = tracking_carta_porte.carta_porte_id
    AND cp.usuario_id = auth.uid()
  )
);

-- Comentarios de auditoría
COMMENT ON POLICY "Users can view their own payments" ON public.pagos IS 
'Security fix: Restricts payment data access to owner only';

COMMENT ON POLICY "Users can view only their own blocks" ON public.bloqueos_usuario IS 
'Security fix: Restricts block status visibility to affected user only';

COMMENT ON POLICY "Users can manage their own tracking data" ON public.tracking_carta_porte IS 
'Security fix: Restricts GPS tracking access to carta porte owner only';