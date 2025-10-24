-- Tabla para almacenar esquemas XML de referencia SAT
CREATE TABLE IF NOT EXISTS public.esquemas_xml_sat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_documento TEXT NOT NULL, -- 'ingreso', 'traslado'
  tipo_transporte TEXT NOT NULL, -- 'autotransporte', 'ferroviario', 'aereo', 'maritimo'
  tipo_operacion TEXT, -- 'nacional', 'extranjero', 'internacional_aduanero'
  version_carta_porte TEXT NOT NULL DEFAULT '3.1',
  version_cfdi TEXT NOT NULL DEFAULT '4.0',
  xml_ejemplo TEXT NOT NULL,
  descripcion TEXT,
  campos_requeridos JSONB, -- Estructura de campos requeridos para validación
  campos_opcionales JSONB, -- Estructura de campos opcionales
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tipo_documento, tipo_transporte, tipo_operacion, version_carta_porte)
);

-- Tabla para logs de validación XML
CREATE TABLE IF NOT EXISTS public.validaciones_xml_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carta_porte_id UUID REFERENCES public.cartas_porte(id) ON DELETE CASCADE,
  esquema_id UUID REFERENCES public.esquemas_xml_sat(id),
  xml_generado TEXT,
  resultado_validacion JSONB, -- {success: boolean, errors: [], warnings: []}
  puntaje_conformidad DECIMAL(5,2), -- 0-100 score de qué tan bien cumple el esquema
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public.esquemas_xml_sat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validaciones_xml_log ENABLE ROW LEVEL SECURITY;

-- Los esquemas son públicos de lectura
CREATE POLICY "Esquemas XML son visibles para todos"
  ON public.esquemas_xml_sat
  FOR SELECT
  USING (true);

-- Solo admins pueden modificar esquemas
CREATE POLICY "Solo admins modifican esquemas"
  ON public.esquemas_xml_sat
  FOR ALL
  USING (false);

-- Usuarios ven sus propias validaciones
CREATE POLICY "Usuarios ven sus validaciones"
  ON public.validaciones_xml_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp
      WHERE cp.id = validaciones_xml_log.carta_porte_id
      AND cp.usuario_id = auth.uid()
    )
  );

-- Usuarios pueden insertar validaciones de sus cartas
CREATE POLICY "Usuarios insertan validaciones"
  ON public.validaciones_xml_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cartas_porte cp
      WHERE cp.id = validaciones_xml_log.carta_porte_id
      AND cp.usuario_id = auth.uid()
    )
  );

-- Índices para mejor performance
CREATE INDEX idx_esquemas_tipo ON public.esquemas_xml_sat(tipo_documento, tipo_transporte);
CREATE INDEX idx_validaciones_carta ON public.validaciones_xml_log(carta_porte_id);
CREATE INDEX idx_validaciones_fecha ON public.validaciones_xml_log(created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_esquemas_xml_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER esquemas_xml_updated_at
  BEFORE UPDATE ON public.esquemas_xml_sat
  FOR EACH ROW
  EXECUTE FUNCTION update_esquemas_xml_updated_at();