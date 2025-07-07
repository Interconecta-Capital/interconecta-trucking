
-- Create table for report configurations
CREATE TABLE public.configuraciones_reportes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR NOT NULL,
  tipo VARCHAR NOT NULL CHECK (tipo IN ('diario', 'semanal', 'mensual', 'personalizado')),
  destinatarios JSONB NOT NULL DEFAULT '[]'::jsonb,
  formato VARCHAR NOT NULL CHECK (formato IN ('pdf', 'excel', 'email_html')),
  secciones JSONB NOT NULL DEFAULT '[]'::jsonb,
  horario JSONB NOT NULL DEFAULT '{}'::jsonb,
  filtros JSONB NOT NULL DEFAULT '{}'::jsonb,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for generated reports
CREATE TABLE public.reportes_generados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  configuracion_id UUID NOT NULL REFERENCES configuraciones_reportes(id) ON DELETE CASCADE,
  fecha_generacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  tipo VARCHAR NOT NULL,
  formato VARCHAR NOT NULL,
  archivo_url TEXT,
  estado VARCHAR NOT NULL CHECK (estado IN ('generando', 'completado', 'error')),
  error_mensaje TEXT,
  destinatarios_enviados JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.configuraciones_reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes_generados ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for configuraciones_reportes
CREATE POLICY "Users can manage their own report configurations"
  ON public.configuraciones_reportes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for reportes_generados
CREATE POLICY "Users can manage their own generated reports"
  ON public.reportes_generados
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_configuraciones_reportes_user_id ON configuraciones_reportes(user_id);
CREATE INDEX idx_configuraciones_reportes_activo ON configuraciones_reportes(activo);
CREATE INDEX idx_reportes_generados_user_id ON reportes_generados(user_id);
CREATE INDEX idx_reportes_generados_configuracion_id ON reportes_generados(configuracion_id);
CREATE INDEX idx_reportes_generados_fecha ON reportes_generados(fecha_generacion);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_configuraciones_reportes_updated_at
    BEFORE UPDATE ON configuraciones_reportes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
