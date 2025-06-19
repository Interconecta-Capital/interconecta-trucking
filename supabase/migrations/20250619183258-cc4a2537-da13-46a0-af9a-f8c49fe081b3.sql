
-- Crear tabla para gestionar borradores de cartas porte
CREATE TABLE public.borradores_carta_porte (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_borrador VARCHAR(255) NOT NULL DEFAULT 'Borrador sin título',
  datos_formulario JSONB NOT NULL DEFAULT '{}'::jsonb,
  auto_saved BOOLEAN NOT NULL DEFAULT false,
  ultima_edicion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  version_formulario VARCHAR(10) NOT NULL DEFAULT '3.1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para gestionar documentos generados de cartas porte
CREATE TABLE public.carta_porte_documentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  carta_porte_id UUID NOT NULL REFERENCES public.cartas_porte(id) ON DELETE CASCADE,
  tipo_documento VARCHAR(50) NOT NULL CHECK (tipo_documento IN ('xml', 'pdf', 'xml_firmado', 'xml_timbrado')),
  version_documento VARCHAR(10) NOT NULL DEFAULT 'v1.0',
  contenido_path TEXT,
  contenido_blob TEXT,
  metadatos JSONB DEFAULT '{}'::jsonb,
  fecha_generacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Modificar tabla cartas_porte para mejorar la gestión
ALTER TABLE public.cartas_porte 
  ADD COLUMN IF NOT EXISTS borrador_origen_id UUID REFERENCES public.borradores_carta_porte(id),
  ADD COLUMN IF NOT EXISTS version_documento VARCHAR(10) DEFAULT 'v1.0',
  ADD COLUMN IF NOT EXISTS nombre_documento VARCHAR(255),
  ADD COLUMN IF NOT EXISTS es_plantilla BOOLEAN DEFAULT false;

-- Asegurar que id_ccp sea único cuando no sea nulo
CREATE UNIQUE INDEX IF NOT EXISTS idx_cartas_porte_id_ccp_unique 
  ON public.cartas_porte(id_ccp) 
  WHERE id_ccp IS NOT NULL;

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_borradores_user_id ON public.borradores_carta_porte(user_id);
CREATE INDEX IF NOT EXISTS idx_borradores_ultima_edicion ON public.borradores_carta_porte(ultima_edicion DESC);
CREATE INDEX IF NOT EXISTS idx_carta_porte_documentos_carta_id ON public.carta_porte_documentos(carta_porte_id);
CREATE INDEX IF NOT EXISTS idx_carta_porte_documentos_tipo ON public.carta_porte_documentos(tipo_documento);

-- Políticas RLS para borradores_carta_porte
ALTER TABLE public.borradores_carta_porte ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own borradores" 
  ON public.borradores_carta_porte 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own borradores" 
  ON public.borradores_carta_porte 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own borradores" 
  ON public.borradores_carta_porte 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own borradores" 
  ON public.borradores_carta_porte 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para carta_porte_documentos
ALTER TABLE public.carta_porte_documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents of their own cartas" 
  ON public.carta_porte_documentos 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.cartas_porte 
    WHERE cartas_porte.id = carta_porte_documentos.carta_porte_id 
    AND cartas_porte.usuario_id = auth.uid()
  ));

CREATE POLICY "Users can create documents for their own cartas" 
  ON public.carta_porte_documentos 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cartas_porte 
    WHERE cartas_porte.id = carta_porte_documentos.carta_porte_id 
    AND cartas_porte.usuario_id = auth.uid()
  ));

CREATE POLICY "Users can update documents of their own cartas" 
  ON public.carta_porte_documentos 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.cartas_porte 
    WHERE cartas_porte.id = carta_porte_documentos.carta_porte_id 
    AND cartas_porte.usuario_id = auth.uid()
  ));

-- Función para actualizar ultima_edicion automáticamente
CREATE OR REPLACE FUNCTION public.update_borrador_ultima_edicion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ultima_edicion = now();
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar ultima_edicion en borradores
CREATE TRIGGER update_borradores_ultima_edicion
  BEFORE UPDATE ON public.borradores_carta_porte
  FOR EACH ROW
  EXECUTE FUNCTION public.update_borrador_ultima_edicion();

-- Función para generar IdCCP único
CREATE OR REPLACE FUNCTION public.generar_id_ccp_unico()
RETURNS TEXT AS $$
DECLARE
  nuevo_id_ccp TEXT;
  existe BOOLEAN;
BEGIN
  LOOP
    -- Generar UUID y convertir a formato IdCCP
    nuevo_id_ccp := REPLACE(gen_random_uuid()::text, '-', '');
    nuevo_id_ccp := UPPER(SUBSTR(nuevo_id_ccp, 1, 36));
    
    -- Verificar que no exista
    SELECT EXISTS(
      SELECT 1 FROM public.cartas_porte 
      WHERE id_ccp = nuevo_id_ccp
    ) INTO existe;
    
    -- Si no existe, retornar
    IF NOT existe THEN
      RETURN nuevo_id_ccp;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
