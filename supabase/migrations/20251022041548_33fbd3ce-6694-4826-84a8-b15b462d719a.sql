-- ================================================================
-- RLS POLICIES PARA TABLAS FALTANTES
-- ================================================================

-- 1. COSTOS_VIAJE: Tabla principal con user_id directo
-- ================================================================
CREATE POLICY "Users can view their own trip costs"
ON public.costos_viaje
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trip costs"
ON public.costos_viaje
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trip costs"
ON public.costos_viaje
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trip costs"
ON public.costos_viaje
FOR DELETE
USING (auth.uid() = user_id);

-- 2. DOCUMENTACION_ADUANERA: Acceso a través de mercancia → carta_porte
-- ================================================================
CREATE POLICY "Users can access customs docs through their cartas"
ON public.documentacion_aduanera
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.mercancias m
    JOIN public.cartas_porte cp ON cp.id = m.carta_porte_id
    WHERE m.id = documentacion_aduanera.mercancia_id
      AND cp.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.mercancias m
    JOIN public.cartas_porte cp ON cp.id = m.carta_porte_id
    WHERE m.id = documentacion_aduanera.mercancia_id
      AND cp.usuario_id = auth.uid()
  )
);

-- 3. PERMISOS_SEMARNAT: Acceso a través de mercancia → carta_porte
-- ================================================================
CREATE POLICY "Users can access SEMARNAT permits through their cartas"
ON public.permisos_semarnat
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.mercancias m
    JOIN public.cartas_porte cp ON cp.id = m.carta_porte_id
    WHERE m.id = permisos_semarnat.mercancia_id
      AND cp.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.mercancias m
    JOIN public.cartas_porte cp ON cp.id = m.carta_porte_id
    WHERE m.id = permisos_semarnat.mercancia_id
      AND cp.usuario_id = auth.uid()
  )
);

-- 4. REGIMENES_ADUANEROS: Acceso directo a través de carta_porte_id
-- ================================================================
CREATE POLICY "Users can access customs regimes through their cartas"
ON public.regimenes_aduaneros
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.cartas_porte cp
    WHERE cp.id = regimenes_aduaneros.carta_porte_id
      AND cp.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.cartas_porte cp
    WHERE cp.id = regimenes_aduaneros.carta_porte_id
      AND cp.usuario_id = auth.uid()
  )
);

-- 5. REMOLQUES_CCP: Acceso a través de autotransporte → carta_porte
-- ================================================================
CREATE POLICY "Users can access trailers through their cartas"
ON public.remolques_ccp
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.autotransporte a
    JOIN public.cartas_porte cp ON cp.id = a.carta_porte_id
    WHERE a.id = remolques_ccp.autotransporte_id
      AND cp.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.autotransporte a
    JOIN public.cartas_porte cp ON cp.id = a.carta_porte_id
    WHERE a.id = remolques_ccp.autotransporte_id
      AND cp.usuario_id = auth.uid()
  )
);

-- ================================================================
-- COMENTARIOS SOBRE LAS POLÍTICAS
-- ================================================================

COMMENT ON POLICY "Users can view their own trip costs" ON public.costos_viaje IS 
'Permite a los usuarios ver solo los costos de sus propios viajes';

COMMENT ON POLICY "Users can access customs docs through their cartas" ON public.documentacion_aduanera IS 
'Permite acceso a documentación aduanera solo si el usuario es dueño de la carta porte relacionada';

COMMENT ON POLICY "Users can access SEMARNAT permits through their cartas" ON public.permisos_semarnat IS 
'Permite acceso a permisos SEMARNAT solo si el usuario es dueño de la carta porte relacionada';

COMMENT ON POLICY "Users can access customs regimes through their cartas" ON public.regimenes_aduaneros IS 
'Permite acceso a regímenes aduaneros solo si el usuario es dueño de la carta porte relacionada';

COMMENT ON POLICY "Users can access trailers through their cartas" ON public.remolques_ccp IS 
'Permite acceso a remolques solo si el usuario es dueño de la carta porte relacionada';