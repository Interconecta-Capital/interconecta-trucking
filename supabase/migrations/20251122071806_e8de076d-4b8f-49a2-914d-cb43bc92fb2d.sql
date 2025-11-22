-- Crear índices para mejorar rendimiento de consultas de Documentos Fiscales
-- ISO 27001 A.12.6: Control de vulnerabilidades técnicas

-- Índices para borradores_carta_porte
CREATE INDEX IF NOT EXISTS idx_borradores_carta_porte_user_updated 
ON public.borradores_carta_porte(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_borradores_carta_porte_auto_saved 
ON public.borradores_carta_porte(user_id, auto_saved, updated_at DESC);

-- Índices para cartas_porte
CREATE INDEX IF NOT EXISTS idx_cartas_porte_usuario_created 
ON public.cartas_porte(usuario_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cartas_porte_status 
ON public.cartas_porte(usuario_id, status, created_at DESC);

-- Índices para facturas
CREATE INDEX IF NOT EXISTS idx_facturas_user_created 
ON public.facturas(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_facturas_status 
ON public.facturas(user_id, status, created_at DESC);

-- Índices para viajes (optimizar joins)
CREATE INDEX IF NOT EXISTS idx_viajes_factura 
ON public.viajes(factura_id) WHERE factura_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_viajes_carta_porte 
ON public.viajes(carta_porte_id) WHERE carta_porte_id IS NOT NULL;

-- Comentarios de auditoría
COMMENT ON INDEX idx_borradores_carta_porte_user_updated IS 'Optimiza búsqueda de borradores por usuario';
COMMENT ON INDEX idx_cartas_porte_usuario_created IS 'Optimiza listado de cartas porte por usuario';
COMMENT ON INDEX idx_facturas_user_created IS 'Optimiza listado de facturas por usuario';
