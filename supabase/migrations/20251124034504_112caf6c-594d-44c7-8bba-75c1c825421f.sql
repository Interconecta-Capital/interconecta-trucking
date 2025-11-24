-- =====================================================
-- TABLA DE CACHE DE RFCs VALIDADOS CONTRA EL SAT
-- Reduce llamadas al SAT y mejora performance
-- =====================================================

CREATE TABLE IF NOT EXISTS public.rfc_validados_sat (
  rfc TEXT PRIMARY KEY,
  razon_social_sat TEXT NOT NULL,
  razon_social_normalizada TEXT NOT NULL,
  regimen_fiscal TEXT,
  situacion TEXT DEFAULT 'Activo',
  fecha_validacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_expiracion TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  ambiente TEXT NOT NULL CHECK (ambiente IN ('sandbox', 'produccion')),
  numero_validaciones INT DEFAULT 1,
  ultima_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_rfc_ambiente ON public.rfc_validados_sat(rfc, ambiente);
CREATE INDEX IF NOT EXISTS idx_expiracion ON public.rfc_validados_sat(fecha_expiracion);
CREATE INDEX IF NOT EXISTS idx_situacion ON public.rfc_validados_sat(situacion);

-- RLS: Lectura pública (cache compartido)
ALTER TABLE public.rfc_validados_sat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cache de RFCs es de lectura pública"
  ON public.rfc_validados_sat
  FOR SELECT
  USING (true);

CREATE POLICY "Solo funciones pueden escribir en cache"
  ON public.rfc_validados_sat
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Solo funciones pueden actualizar cache"
  ON public.rfc_validados_sat
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Función para limpiar cache expirado (ejecutar diariamente)
CREATE OR REPLACE FUNCTION public.limpiar_cache_rfcs_expirado()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rfc_validados_sat
  WHERE fecha_expiracion < NOW();
  
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data
  ) VALUES (
    NULL,
    'cache_cleanup',
    jsonb_build_object(
      'tabla', 'rfc_validados_sat',
      'timestamp', NOW()
    )
  );
END;
$$;

-- Insertar RFCs de prueba del SAT en el cache
INSERT INTO public.rfc_validados_sat (
  rfc, 
  razon_social_sat, 
  razon_social_normalizada, 
  regimen_fiscal,
  situacion,
  ambiente,
  fecha_expiracion
) VALUES 
  ('EKU9003173C9', 'ESCUELA KEMPER URGATE', 'ESCUELA KEMPER URGATE', '601', 'Activo', 'sandbox', NOW() + INTERVAL '365 days'),
  ('LAN7008173R5', 'LOPEZ ARZATE NAVOR', 'LOPEZ ARZATE NAVOR', '612', 'Activo', 'sandbox', NOW() + INTERVAL '365 days'),
  ('XAXX010101000', 'PUBLICO EN GENERAL', 'PUBLICO EN GENERAL', '616', 'Activo', 'sandbox', NOW() + INTERVAL '365 days')
ON CONFLICT (rfc) DO NOTHING;

COMMENT ON TABLE public.rfc_validados_sat IS 'Cache de RFCs validados contra el SAT para reducir llamadas API';
COMMENT ON COLUMN public.rfc_validados_sat.razon_social_normalizada IS 'Nombre normalizado para timbrado (mayúsculas, sin acentos)';
COMMENT ON COLUMN public.rfc_validados_sat.numero_validaciones IS 'Contador de uso para analytics';